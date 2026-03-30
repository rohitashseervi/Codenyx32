const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const ClassGroup = require('../models/ClassGroup');
const ClassSession = require('../models/ClassSession');
const NGO = require('../models/NGO');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const { authenticate, authorize } = require('../middleware/auth');
const { createMeetSession } = require('../services/meetService');
const { generateTest, createAssessment } = require('../services/aiTestGenerator');
const { generateLearningPath } = require('../services/learningPathGenerator');

/**
 * POST /api/volunteer/register
 * Register as volunteer
 */
router.post('/register', authenticate, async (req, res) => {
  try {
    const { subjects, gradeBand, timeSlots, duration, languages, bio, qualifications } = req.body;

    const volunteer = new Volunteer({
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.displayName,
      subjects: subjects || [],
      gradeBand: gradeBand || [],
      timeSlots: timeSlots || [],
      duration: duration || 3,
      languages: languages || ['English'],
      bio: bio || '',
      qualifications: qualifications || [],
      approved: false,
      createdAt: new Date()
    });

    await volunteer.save();

    res.status(201).json({
      success: true,
      volunteer: volunteer,
      message: 'Volunteer registered successfully'
    });
  } catch (error) {
    console.error('Error registering volunteer:', error);
    res.status(500).json({
      success: false,
      error: `Failed to register volunteer: ${error.message}`
    });
  }
});

/**
 * PUT /api/volunteer/profile
 * Update volunteer profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer profile not found'
      });
    }

    const { subjects, gradeBand, timeSlots, duration, languages, bio, qualifications } = req.body;

    if (subjects) volunteer.subjects = subjects;
    if (gradeBand) volunteer.gradeBand = gradeBand;
    if (timeSlots) volunteer.timeSlots = timeSlots;
    if (duration) volunteer.duration = duration;
    if (languages) volunteer.languages = languages;
    if (bio) volunteer.bio = bio;
    if (qualifications) volunteer.qualifications = qualifications;

    await volunteer.save();

    res.json({
      success: true,
      volunteer: volunteer,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating volunteer profile:', error);
    res.status(500).json({
      success: false,
      error: `Failed to update profile: ${error.message}`
    });
  }
});

/**
 * GET /api/volunteer/ngos
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
 * POST /api/volunteer/join/:ngoId
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

    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer profile not found'
      });
    }

    // Check if already joined
    if (volunteer.ngoId && volunteer.ngoId.toString() === req.params.ngoId) {
      return res.status(400).json({
        success: false,
        error: 'Already joined this NGO'
      });
    }

    // Add volunteer to NGO
    volunteer.ngoId = ngo._id;
    volunteer.approved = false;
    await volunteer.save();

    res.json({
      success: true,
      volunteer: volunteer,
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
 * GET /api/volunteer/learning-path
 * Get assigned learning path
 */
router.get('/learning-path', authenticate, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user.userId }).populate('learningPath');
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer profile not found'
      });
    }

    res.json({
      success: true,
      learningPath: volunteer.learningPath || null,
      message: volunteer.learningPath ? 'Learning path found' : 'No learning path assigned'
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch learning path: ${error.message}`
    });
  }
});

/**
 * GET /api/volunteer/sessions
 * Get upcoming sessions
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer profile not found'
      });
    }

    const sessions = await ClassSession.find({
      volunteerId: volunteer._id,
      scheduledDate: { $gte: new Date() }
    }).sort({ scheduledDate: 1 });

    res.json({
      success: true,
      sessions: sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch sessions: ${error.message}`
    });
  }
});

/**
 * POST /api/volunteer/sessions/:sessionId/start
 * Start session and create Meet link
 */
router.post('/sessions/:sessionId/start', authenticate, async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.sessionId).populate('classGroupId');
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Session already completed'
      });
    }

    // Create Meet link using Google Calendar API
    const classGroup = session.classGroupId;
    const studentEmails = (classGroup.students || []).map(s => s.email);

    try {
      const meetResult = await createMeetSession(
        session.topic,
        session.scheduledDate,
        session.duration || 60,
        studentEmails
      );

      session.meetLink = meetResult.meetLink;
      session.meetEventId = meetResult.eventId;
      session.status = 'in_progress';
      session.startedAt = new Date();
      await session.save();

      return res.json({
        success: true,
        session: session,
        meetLink: meetResult.meetLink,
        message: 'Session started, Meet link created'
      });
    } catch (meetError) {
      console.warn('Failed to create Meet link:', meetError);
      // Continue with session without Meet link
      session.status = 'in_progress';
      session.startedAt = new Date();
      await session.save();

      return res.json({
        success: true,
        session: session,
        message: 'Session started (Meet link creation failed, continue manually)',
        warning: meetError.message
      });
    }
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      error: `Failed to start session: ${error.message}`
    });
  }
});

/**
 * POST /api/volunteer/sessions/:sessionId/complete
 * Mark session as complete
 */
router.post('/sessions/:sessionId/complete', authenticate, async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    res.json({
      success: true,
      session: session,
      message: 'Session marked as completed'
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({
      success: false,
      error: `Failed to complete session: ${error.message}`
    });
  }
});

/**
 * POST /api/volunteer/sessions/:sessionId/create-test
 * Generate AI test for session topic
 */
router.post('/sessions/:sessionId/create-test', authenticate, async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.sessionId).populate('classGroupId');
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer profile not found'
      });
    }

    const { difficulty = 'medium', numQuestions = 20 } = req.body;

    const assessmentResult = await createAssessment(
      session.topic,
      session.subject,
      session.classGroupId.grade,
      difficulty,
      numQuestions,
      volunteer._id,
      session.classGroupId._id
    );

    session.assessmentId = assessmentResult.assessment._id;
    await session.save();

    res.json({
      success: true,
      assessment: assessmentResult.assessment,
      message: assessmentResult.message
    });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({
      success: false,
      error: `Failed to create test: ${error.message}`
    });
  }
});

/**
 * GET /api/volunteer/students
 * Get students in volunteer's class groups
 */
router.get('/students', authenticate, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer profile not found'
      });
    }

    const classGroups = await ClassGroup.find({ volunteerId: volunteer._id }).populate('students');

    const allStudents = [];
    classGroups.forEach(group => {
      if (group.students) {
        allStudents.push(...group.students);
      }
    });

    res.json({
      success: true,
      students: allStudents,
      total: allStudents.length
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
 * GET /api/volunteer/test-results/:assessmentId
 * Get test results for an assessment
 */
router.get('/test-results/:assessmentId', authenticate, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.assessmentId).populate('submissions.studentId');
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      assessment: {
        title: assessment.title,
        subject: assessment.subject,
        topic: assessment.topic,
        totalQuestions: assessment.totalQuestions
      },
      submissions: assessment.submissions || [],
      total: (assessment.submissions || []).length
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch test results: ${error.message}`
    });
  }
});

module.exports = router;
