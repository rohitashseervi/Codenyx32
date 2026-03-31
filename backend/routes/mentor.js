const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const NGO = require('../models/NGO');
const MentorNote = require('../models/MentorNote');
const { authenticate, authorize } = require('../middleware/auth');

// Lazy-load optional services to avoid crashes if packages aren't installed
let Match;
try { Match = require('../models/Match'); } catch (e) { Match = null; }

// Helper: find mentor or return null
async function findMentor(userId) {
  return await Mentor.findOne({ userId });
}

/**
 * POST /api/mentor/register
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
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const mentor = await findMentor(req.user.userId);
    if (!mentor) {
      return res.status(404).json({ success: false, error: 'Mentor profile not found' });
    }

    const { expertSubjects, languagesSpoken, maxStudents, behavioralProfile, yearsExperience } = req.body;

    if (expertSubjects) mentor.expertSubjects = expertSubjects;
    if (languagesSpoken) mentor.languagesSpoken = languagesSpoken;
    if (maxStudents) mentor.maxStudents = maxStudents;
    if (behavioralProfile) mentor.behavioralProfile = behavioralProfile;
    if (yearsExperience !== undefined) mentor.yearsExperience = yearsExperience;

    await mentor.save();

    res.json({ success: true, mentor, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ success: false, error: `Failed to update profile: ${error.message}` });
  }
});

/**
 * GET /api/mentor/ngos
 * Browse available NGOs
 */
router.get('/ngos', authenticate, async (req, res) => {
  try {
    const ngos = await NGO.find().sort({ createdAt: -1 });

    // Get student and mentor counts for each NGO
    const ngoList = await Promise.all(ngos.map(async (ngo) => {
      const studentCount = await Student.countDocuments({ ngoId: ngo._id });
      const mentorCount = await Mentor.countDocuments({ ngoId: ngo._id, approved: true });

      return {
        id: ngo._id,
        _id: ngo._id,
        name: ngo.name,
        description: ngo.description || `${ngo.name} - empowering education for all`,
        city: ngo.location || ngo.city || '',
        focusAreas: ngo.focusAreas || ['Education', 'Youth Development'],
        studentCount,
        mentorCount,
        status: ngo.status || 'active'
      };
    }));

    res.json({
      success: true,
      ngos: ngoList,
      data: ngoList,
      total: ngoList.length
    });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    res.status(500).json({ success: false, error: `Failed to fetch NGOs: ${error.message}` });
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
      return res.status(404).json({ success: false, error: 'NGO not found' });
    }

    const mentor = await findMentor(req.user.userId);
    if (!mentor) {
      return res.status(404).json({ success: false, error: 'Mentor profile not found' });
    }

    if (mentor.ngoId && mentor.ngoId.toString() === req.params.ngoId) {
      return res.status(400).json({ success: false, error: 'Already joined this NGO' });
    }

    mentor.ngoId = ngo._id;
    mentor.approved = false;
    await mentor.save();

    res.json({
      success: true,
      mentor,
      message: 'Join request submitted, pending NGO approval'
    });
  } catch (error) {
    console.error('Error joining NGO:', error);
    res.status(500).json({ success: false, error: `Failed to join NGO: ${error.message}` });
  }
});

/**
 * GET /api/mentor/students
 * Get assigned students — returns empty array gracefully
 */
router.get('/students', authenticate, async (req, res) => {
  try {
    const mentor = await findMentor(req.user.userId);
    if (!mentor) {
      return res.json({
        success: true,
        data: [],
        students: [],
        total: 0,
        message: 'No students assigned yet. Join an NGO first.'
      });
    }

    // Try Match model if available, otherwise look for students directly assigned
    let students = [];

    if (Match) {
      try {
        const matches = await Match.find({
          mentorId: mentor._id,
          status: 'active'
        }).populate('studentId');

        students = matches
          .filter(m => m.studentId) // filter out any null refs
          .map(match => ({
            ...match.studentId.toObject(),
            matchScore: match.matchScore,
            matchedAt: match.matchedAt
          }));
      } catch (e) {
        console.warn('Match model query failed, falling back to direct student lookup:', e.message);
      }
    }

    // Fallback: find students directly assigned to this mentor
    if (students.length === 0) {
      const directStudents = await Student.find({ mentorId: mentor._id });
      students = directStudents.map(s => s.toObject());
    }

    res.json({
      success: true,
      data: students,
      students: students,
      total: students.length
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, error: `Failed to fetch students: ${error.message}` });
  }
});

/**
 * GET /api/mentor/students/:studentId/progress
 * Get detailed student progress
 */
router.get('/students/:studentId/progress', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
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
        recentTests,
        badges: student.badges || [],
        currentStreak: student.consistencyStreak || 0
      }
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    res.status(500).json({ success: false, error: `Failed to fetch student progress: ${error.message}` });
  }
});

/**
 * POST /api/mentor/schedule-meet
 * Schedule a mentoring session
 */
router.post('/schedule-meet', authenticate, async (req, res) => {
  try {
    const mentor = await findMentor(req.user.userId);
    if (!mentor) {
      return res.status(404).json({ success: false, error: 'Mentor profile not found' });
    }

    const { studentId, topic, dateTime, duration, notes } = req.body;
    if (!studentId || !topic || !dateTime) {
      return res.status(400).json({ success: false, error: 'Missing required fields: studentId, topic, dateTime' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Try to create a Meet link if service is available
    let meetLink = null;
    try {
      const { createMeetSession } = require('../services/meetService');
      const meetResult = await createMeetSession(
        topic,
        dateTime,
        duration || 30,
        [student.email]
      );
      meetLink = meetResult.meetLink;
    } catch (meetError) {
      console.warn('Meet session creation failed (service may not be configured):', meetError.message);
    }

    const session = {
      topic,
      mentorId: mentor._id,
      studentId: student._id,
      studentName: student.name,
      scheduledDate: new Date(dateTime),
      duration: duration || 30,
      meetLink,
      notes: notes || '',
      status: 'scheduled',
      createdAt: new Date()
    };

    res.json({
      success: true,
      data: session,
      session,
      meetLink,
      message: meetLink ? 'Session scheduled with Meet link' : 'Session scheduled (Meet link unavailable)'
    });
  } catch (error) {
    console.error('Error scheduling meet:', error);
    res.status(500).json({ success: false, error: `Failed to schedule meet: ${error.message}` });
  }
});

/**
 * GET /api/mentor/alerts
 * Get weak performance alerts — returns empty array gracefully
 */
router.get('/alerts', authenticate, async (req, res) => {
  try {
    const mentor = await findMentor(req.user.userId);
    if (!mentor) {
      return res.json({
        success: true,
        data: [],
        alerts: [],
        total: 0,
        message: 'No alerts. Join an NGO and get students assigned first.'
      });
    }

    const alerts = [];

    // Try using Match model if available
    let students = [];
    if (Match) {
      try {
        const matches = await Match.find({
          mentorId: mentor._id,
          status: 'active'
        }).populate('studentId');
        students = matches.filter(m => m.studentId).map(m => m.studentId);
      } catch (e) {
        console.warn('Match query failed in alerts:', e.message);
      }
    }

    // Fallback to direct student lookup
    if (students.length === 0) {
      students = await Student.find({ mentorId: mentor._id });
    }

    // Check each student's recent performance
    for (const student of students) {
      const recentTests = (student.assessmentHistory || []).slice(-3);

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

      const lastTest = recentTests[recentTests.length - 1];
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
      data: alerts,
      alerts,
      total: alerts.length
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: `Failed to fetch alerts: ${error.message}` });
  }
});

/**
 * POST /api/mentor/students/:studentId/notes
 * Add guidance notes
 */
router.post('/students/:studentId/notes', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const mentor = await findMentor(req.user.userId);
    if (!mentor) {
      return res.status(404).json({ success: false, error: 'Mentor profile not found' });
    }

    const { content, category } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, error: 'Note content is required' });
    }

    const note = new MentorNote({
      mentorId: mentor._id,
      studentId: student._id,
      content,
      category: category || 'general',
      createdAt: new Date()
    });

    await note.save();

    res.status(201).json({ success: true, note, message: 'Note added successfully' });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ success: false, error: `Failed to add note: ${error.message}` });
  }
});

/**
 * GET /api/mentor/notes
 * Get all notes by this mentor
 */
router.get('/notes', authenticate, async (req, res) => {
  try {
    const mentor = await findMentor(req.user.userId);
    if (!mentor) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        message: 'No notes yet.'
      });
    }

    const notes = await MentorNote.find({ mentorId: mentor._id })
      .populate('studentId', 'name grade')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notes,
      total: notes.length
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ success: false, error: `Failed to fetch notes: ${error.message}` });
  }
});

module.exports = router;
