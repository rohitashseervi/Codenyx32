const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const Match = require('../models/Match');
const NGO = require('../models/NGO');
const MentorNote = require('../models/MentorNote');
const Assessment = require('../models/Assessment');
const { authenticate, authorize } = require('../middleware/auth');
const { createMeetSession } = require('../services/meetService');
const { sendMentorAlert } = require('../services/gmailService');

/**
 * POST /api/mentor/register
 * Register as mentor
 */
router.post('/register', authenticate, async (req, res) => {
  try {
    const { expertSubjects, languagesSpoken, maxStudents, behavioralProfile, yearsExperience } = req.body;

    const mentor = new Mentor({
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.displayName,
      expertSubjects: expertSubjects || [],
      languagesSpoken: languagesSpoken || ['English'],
      maxStudents: maxStudents || 5,
      currentStudentCount: 0,
      behavioralProfile: behavioralProfile || {},
      yearsExperience: yearsExperience || 0,
      approved: false,
      createdAt: new Date()
    });

    await mentor.save();

    res.status(201).json({
      success: true,
      mentor: mentor,
      message: 'Mentor registered successfully'
    });
  } catch (error) {
    console.error('Error registering mentor:', error);
    res.status(500).json({
      success: false,
      error: `Failed to register mentor: ${error.message}`
    });
  }
});

/**
 * PUT /api/mentor/profile
 * Update mentor profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user.userId });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: 'Mentor profile not found'
      });
    }

    const { expertSubjects, languagesSpoken, maxStudents, behavioralProfile, yearsExperience } = req.body;

    if (expertSubjects) mentor.expertSubjects = expertSubjects;
    if (languagesSpoken) mentor.languagesSpoken = languagesSpoken;
    if (maxStudents) mentor.maxStudents = maxStudents;
    if (behavioralProfile) mentor.behavioralProfile = behavioralProfile;
    if (yearsExperience !== undefined) mentor.yearsExperience = yearsExperience;

    await mentor.save();

    res.json({
      success: true,
      mentor: mentor,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({
      success: false,
      error: `Failed to update profile: ${error.message}`
    });
  }
});

/**
 * GET /api/mentor/ngos
 * Browse available NGOs
 */
router.get('/ngos', authenticate, async (req, res) => {
  try {
    const ngos = await NGO.find().select('-admins').sort({ createdAt: -1 });

    res.json({
      success: true,
      ngos: ngos,
      total: ngos.length
    });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch NGOs: ${error.message}`
    });
  }
});

/**
 * POST /api/mentor/join/:ngoId
 * Request to join an NGO
 */
router.post('/join/:ngoId', authenticate, async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.ngoId);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    const mentor = await Mentor.findOne({ userId: req.user.userId });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: 'Mentor profile not found'
      });
    }

    if (mentor.ngoId && mentor.ngoId.toString() === req.params.ngoId) {
      return res.status(400).json({
        success: false,
        error: 'Already joined this NGO'
      });
    }

    mentor.ngoId = ngo._id;
    mentor.approved = false;
    await mentor.save();

    res.json({
      success: true,
      mentor: mentor,
      message: 'Join request submitted, pending NGO approval'
    });
  } catch (error) {
    console.error('Error joining NGO:', error);
    res.status(500).json({
      success: false,
      error: `Failed to join NGO: ${error.message}`
    });
  }
});

/**
 * GET /api/mentor/students
 * Get assigned students with progress
 */
router.get('/students', authenticate, async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user.userId });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: 'Mentor profile not found'
      });
    }

    const matches = await Match.find({
      mentorId: mentor._id,
      status: 'active'
    }).populate('studentId');

    const students = matches.map(match => ({
      ...match.studentId.toObject(),
      matchScore: match.matchScore,
      matchedAt: match.matchedAt
    }));

    res.json({
      success: true,
      students: students,
      total: students.length
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch students: ${error.message}`
    });
  }
});

/**
 * GET /api/mentor/student/:studentId/progress
 * Get detailed student progress
 */
router.get('/student/:studentId/progress', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const avgScore = student.assessmentHistory?.length > 0
      ? (student.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / student.assessmentHistory.length).toFixed(2)
      : 0;

    const recentTests = (student.assessmentHistory || []).slice(-5).reverse();

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        grade: student.grade,
        weakAreas: student.weakAreas
      },
      progress: {
        averageScore: parseFloat(avgScore),
        totalTests: student.assessmentHistory?.length || 0,
        recentTests: recentTests,
        badges: student.badges || [],
        currentStreak: student.currentStreak || 0
      }
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch student progress: ${error.message}`
    });
  }
});

/**
 * POST /api/mentor/student/:studentId/schedule-meet
 * Schedule 1-on-1 Meet session
 */
router.post('/student/:studentId/schedule-meet', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const mentor = await Mentor.findOne({ userId: req.user.userId });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: 'Mentor profile not found'
      });
    }

    const { topic, dateTime, duration } = req.body;
    if (!topic || !dateTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: topic, dateTime'
      });
    }

    try {
      const meetResult = await createMeetSession(
        topic,
        dateTime,
        duration || 30,
        [student.email]
      );

      const session = {
        topic: topic,
        mentorId: mentor._id,
        studentId: student._id,
        scheduledDate: new Date(dateTime),
        duration: duration || 30,
        meetLink: meetResult.meetLink,
        meetEventId: meetResult.eventId,
        status: 'scheduled',
        createdAt: new Date()
      };

      // Save to MentorNote or session tracking (depending on your model)
      // For now, we'll return the session details
      res.json({
        success: true,
        session: session,
        message: 'Meet session scheduled successfully',
        meetLink: meetResult.meetLink
      });
    } catch (meetError) {
      return res.status(400).json({
        success: false,
        error: `Failed to create Meet session: ${meetError.message}`
      });
    }
  } catch (error) {
    console.error('Error scheduling meet:', error);
    res.status(500).json({
      success: false,
      error: `Failed to schedule meet: ${error.message}`
    });
  }
});

/**
 * GET /api/mentor/alerts
 * Get weak performance alerts
 */
router.get('/alerts', authenticate, async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user.userId });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: 'Mentor profile not found'
      });
    }

    // Get all active matches for this mentor
    const matches = await Match.find({
      mentorId: mentor._id,
      status: 'active'
    }).populate('studentId');

    const alerts = [];

    // Check each student's recent performance
    for (const match of matches) {
      const student = match.studentId;
      const recentTests = (student.assessmentHistory || []).slice(-3);

      // Alert if any recent test score is below 60%
      const lowScores = recentTests.filter(test => test.score < 60);
      if (lowScores.length > 0) {
        alerts.push({
          studentId: student._id,
          studentName: student.name,
          alertType: 'low_score',
          severity: lowScores[0].score < 40 ? 'critical' : 'warning',
          recentScore: lowScores[0].score,
          topic: lowScores[0].subject,
          timestamp: new Date(lowScores[0].date)
        });
      }

      // Alert if student hasn't completed a test in 7 days
      const lastTest = recentTests[0];
      if (lastTest) {
        const daysSinceTest = (new Date() - new Date(lastTest.date)) / (1000 * 60 * 60 * 24);
        if (daysSinceTest > 7) {
          alerts.push({
            studentId: student._id,
            studentName: student.name,
            alertType: 'inactive',
            severity: 'info',
            daysSinceActivity: Math.round(daysSinceTest),
            timestamp: new Date()
          });
        }
      }
    }

    res.json({
      success: true,
      alerts: alerts,
      total: alerts.length
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch alerts: ${error.message}`
    });
  }
});

/**
 * POST /api/mentor/student/:studentId/notes
 * Add guidance notes
 */
router.post('/student/:studentId/notes', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const mentor = await Mentor.findOne({ userId: req.user.userId });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        error: 'Mentor profile not found'
      });
    }

    const { content, category } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Note content is required'
      });
    }

    const note = new MentorNote({
      mentorId: mentor._id,
      studentId: student._id,
      content: content,
      category: category || 'general',
      createdAt: new Date()
    });

    await note.save();

    res.status(201).json({
      success: true,
      note: note,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      error: `Failed to add note: ${error.message}`
    });
  }
});

module.exports = router;
