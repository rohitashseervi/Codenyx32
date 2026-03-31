const express = require('express');
const router = express.Router();
const LearningPath = require('../models/LearningPath');
const ClassSession = require('../models/ClassSession');
const Assessment = require('../models/Assessment');
const Volunteer = require('../models/Volunteer');
const Student = require('../models/Student');
const courseModules = require('../data/courseModules');
const { authenticate } = require('../middleware/auth');
const { createAssessment } = require('../services/aiTestGenerator');

/**
 * GET /api/learning-path/courses
 * Get available course modules for a grade group and subject
 */
router.get('/courses', authenticate, async (req, res) => {
  try {
    const { gradeGroup, subject } = req.query;

    if (gradeGroup && subject) {
      const modules = courseModules[gradeGroup]?.[subject];
      if (!modules) {
        return res.json({ success: true, data: [], message: 'No modules found for this combination' });
      }
      return res.json({ success: true, data: modules });
    }

    // Return all available grade groups and subjects
    const available = {
      gradeGroups: ['1-3', '4-5'],
      subjectGroups: {
        A: ['Math', 'Science'],
        B: ['English', 'Social']
      }
    };

    res.json({ success: true, data: available });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/learning-path/setup
 * Volunteer sets up their learning path by choosing grade group + 2 subjects
 */
router.post('/setup', authenticate, async (req, res) => {
  try {
    const { gradeGroup, subjectA, subjectB } = req.body;

    if (!gradeGroup || !subjectA || !subjectB) {
      return res.status(400).json({
        success: false,
        error: 'Required: gradeGroup (1-3 or 4-5), subjectA (Math or Science), subjectB (English or Social)'
      });
    }

    // Validate selections
    if (!['1-3', '4-5'].includes(gradeGroup)) {
      return res.status(400).json({ success: false, error: 'gradeGroup must be "1-3" or "4-5"' });
    }
    if (!['Math', 'Science'].includes(subjectA)) {
      return res.status(400).json({ success: false, error: 'subjectA must be "Math" or "Science"' });
    }
    if (!['English', 'Social'].includes(subjectB)) {
      return res.status(400).json({ success: false, error: 'subjectB must be "English" or "Social"' });
    }

    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (!volunteer) {
      return res.status(404).json({ success: false, error: 'Volunteer profile not found' });
    }

    // Check for existing active learning path
    const existing = await LearningPath.findOne({
      volunteerId: volunteer._id,
      status: { $in: ['active', 'in_progress'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active learning path. Complete or reset it first.',
        existingPath: existing._id
      });
    }

    // Build modules from both subjects
    const modulesA = courseModules[gradeGroup][subjectA] || [];
    const modulesB = courseModules[gradeGroup][subjectB] || [];

    const startDate = new Date();
    const allModules = [];

    // Interleave subjects: Week 1 SubA, Week 1 SubB, Week 2 SubA, Week 2 SubB...
    for (let week = 0; week < 4; week++) {
      if (modulesA[week]) {
        const moduleDate = new Date(startDate);
        moduleDate.setDate(moduleDate.getDate() + (week * 7));

        // Create sessions for this module
        const sessions = [];
        for (let s = 0; s < modulesA[week].sessions.length; s++) {
          const sessionDate = new Date(moduleDate);
          sessionDate.setDate(sessionDate.getDate() + (s * 2)); // every 2 days

          const classSession = new ClassSession({
            volunteerId: volunteer._id,
            topic: modulesA[week].sessions[s].title,
            subject: subjectA,
            grade: gradeGroup,
            scheduledDate: sessionDate,
            duration: modulesA[week].sessions[s].duration,
            status: 'scheduled'
          });
          await classSession.save();
          sessions.push(classSession._id);
        }

        allModules.push({
          moduleName: modulesA[week].title,
          subject: subjectA,
          topic: modulesA[week].topic,
          description: modulesA[week].description,
          week: week + 1,
          scheduledDate: moduleDate,
          status: week === 0 ? 'current' : 'upcoming',
          sessions,
          learningOutcomes: modulesA[week].learningOutcomes
        });
      }

      if (modulesB[week]) {
        const moduleDate = new Date(startDate);
        moduleDate.setDate(moduleDate.getDate() + (week * 7) + 1); // offset by 1 day

        const sessions = [];
        for (let s = 0; s < modulesB[week].sessions.length; s++) {
          const sessionDate = new Date(moduleDate);
          sessionDate.setDate(sessionDate.getDate() + (s * 2));

          const classSession = new ClassSession({
            volunteerId: volunteer._id,
            topic: modulesB[week].sessions[s].title,
            subject: subjectB,
            grade: gradeGroup,
            scheduledDate: sessionDate,
            duration: modulesB[week].sessions[s].duration,
            status: 'scheduled'
          });
          await classSession.save();
          sessions.push(classSession._id);
        }

        allModules.push({
          moduleName: modulesB[week].title,
          subject: subjectB,
          topic: modulesB[week].topic,
          description: modulesB[week].description,
          week: week + 1,
          scheduledDate: moduleDate,
          status: week === 0 ? 'current' : 'upcoming',
          sessions,
          learningOutcomes: modulesB[week].learningOutcomes
        });
      }
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 28); // 4 weeks

    const learningPath = new LearningPath({
      volunteerId: volunteer._id,
      grade: gradeGroup,
      subject: `${subjectA}, ${subjectB}`,
      commitmentDuration: 4,
      startDate,
      endDate,
      modules: allModules,
      totalModules: allModules.length,
      completedModules: 0,
      status: 'active',
      createdAt: new Date()
    });

    await learningPath.save();

    // Link to volunteer
    volunteer.learningPath = learningPath._id;
    volunteer.subjects = [subjectA, subjectB];
    volunteer.gradeBand = [gradeGroup];
    await volunteer.save();

    res.status(201).json({
      success: true,
      data: learningPath,
      message: `Learning path created: ${subjectA} + ${subjectB} for Grades ${gradeGroup} (4 weeks)`
    });
  } catch (error) {
    console.error('Error setting up learning path:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/learning-path/my-path
 * Get current volunteer's learning path with session details
 */
router.get('/my-path', authenticate, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (!volunteer) {
      return res.json({ success: true, data: null, message: 'No learning path yet' });
    }

    const learningPath = await LearningPath.findOne({
      volunteerId: volunteer._id,
      status: { $in: ['active', 'in_progress'] }
    });

    if (!learningPath) {
      return res.json({ success: true, data: null, message: 'No active learning path. Set one up!' });
    }

    // Populate session details for each module
    const populatedModules = await Promise.all(
      learningPath.modules.map(async (mod) => {
        const sessions = await ClassSession.find({
          _id: { $in: mod.sessions || [] }
        }).populate('assessmentId');

        // Calculate session impact scores
        const sessionsWithScores = await Promise.all(sessions.map(async (s) => {
          let impactScore = null;
          if (s.assessmentId && s.status === 'completed') {
            const assessment = await Assessment.findById(s.assessmentId);
            if (assessment && assessment.submissions && assessment.submissions.length > 0) {
              const avgScore = assessment.submissions.reduce((sum, sub) => sum + (sub.score || 0), 0)
                / assessment.submissions.length;
              // Impact = weighted: 60% avg score + 20% participation rate + 20% completion
              const participationRate = Math.min(assessment.submissions.length / 5, 1); // assume 5 students expected
              impactScore = Math.round(avgScore * 0.6 + participationRate * 100 * 0.2 + 100 * 0.2);
            }
          }
          return {
            ...s.toObject(),
            impactScore
          };
        }));

        return {
          ...mod.toObject(),
          sessionDetails: sessionsWithScores
        };
      })
    );

    const result = {
      ...learningPath.toObject(),
      modules: populatedModules
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/learning-path/session/:sessionId/start
 * Start a session — generates a Meet link placeholder
 */
router.post('/session/:sessionId/start', authenticate, async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Generate a meet link (placeholder or real)
    let meetLink = `https://meet.google.com/gapzero-${session._id.toString().slice(-8)}`;

    try {
      const { createMeetSession } = require('../services/meetService');
      // Try to get students for this session's volunteer+grade
      const volunteer = await Volunteer.findById(session.volunteerId);
      const students = await Student.find({
        ngoId: volunteer?.ngoId,
        grade: { $gte: parseInt(session.grade?.split('-')[0]) || 1, $lte: parseInt(session.grade?.split('-')[1]) || 5 }
      });
      const studentEmails = students.map(s => s.email).filter(Boolean);

      const meetResult = await createMeetSession(
        session.topic,
        session.scheduledDate || new Date(),
        session.duration || 45,
        studentEmails
      );
      meetLink = meetResult.meetLink;
    } catch (e) {
      console.warn('Meet service unavailable, using placeholder link:', e.message);
    }

    session.status = 'in_progress';
    session.startedAt = new Date();
    session.meetLink = meetLink;
    await session.save();

    res.json({
      success: true,
      data: session,
      meetLink,
      message: 'Session started! Share the Meet link with your students.'
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/learning-path/session/:sessionId/complete
 * Mark session as completed
 */
router.post('/session/:sessionId/complete', authenticate, async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    // Check if all sessions in the module are completed
    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (volunteer) {
      const learningPath = await LearningPath.findOne({ volunteerId: volunteer._id, status: { $in: ['active', 'in_progress'] } });
      if (learningPath) {
        for (const mod of learningPath.modules) {
          if (mod.sessions && mod.sessions.some(s => s.toString() === session._id.toString())) {
            // Check if ALL sessions in this module are completed
            const moduleSessions = await ClassSession.find({ _id: { $in: mod.sessions } });
            const allCompleted = moduleSessions.every(s => s.status === 'completed');
            if (allCompleted) {
              mod.status = 'completed';
              mod.completedDate = new Date();
              learningPath.completedModules = (learningPath.completedModules || 0) + 1;

              // Unlock next module
              const nextModIdx = learningPath.modules.findIndex(m => m.status === 'upcoming');
              if (nextModIdx >= 0) {
                learningPath.modules[nextModIdx].status = 'current';
              }
            }
            break;
          }
        }
        learningPath.status = learningPath.completedModules >= learningPath.totalModules ? 'completed' : 'active';
        await learningPath.save();
      }
    }

    res.json({
      success: true,
      data: session,
      message: 'Session completed! You can now create a test for this topic.'
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/learning-path/session/:sessionId/create-test
 * Create AI-generated test after session completion
 */
router.post('/session/:sessionId/create-test', authenticate, async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({ success: false, error: 'Complete the session before creating a test' });
    }

    if (session.assessmentId) {
      const existing = await Assessment.findById(session.assessmentId);
      if (existing) {
        return res.json({ success: true, data: existing, message: 'Test already exists for this session' });
      }
    }

    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (!volunteer) {
      return res.status(404).json({ success: false, error: 'Volunteer not found' });
    }

    const { difficulty = 'medium', topic } = req.body;
    const testTopic = topic || session.topic;
    const grade = session.grade?.split('-')[0] || '3';

    const result = await createAssessment(
      testTopic,
      session.subject || 'Math',
      parseInt(grade),
      difficulty,
      10, // always 10 MCQs
      volunteer._id,
      null
    );

    // Link assessment to session
    session.assessmentId = result.assessment._id;
    await session.save();

    // Make the test available to students of this volunteer's NGO in the grade range
    // by storing ngoId and grade info on the assessment
    if (volunteer.ngoId) {
      result.assessment.ngoId = volunteer.ngoId;
      await result.assessment.save();
    }

    res.json({
      success: true,
      data: result.assessment,
      message: `Test created: ${result.assessment.totalQuestions} questions on "${testTopic}" (${difficulty})`
    });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/learning-path/session/:sessionId/results
 * Get test results for a session's assessment, including impact score
 */
router.get('/session/:sessionId/results', authenticate, async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.sessionId);
    if (!session || !session.assessmentId) {
      return res.json({ success: true, data: null, message: 'No test results for this session' });
    }

    const assessment = await Assessment.findById(session.assessmentId).populate('submissions.studentId');
    if (!assessment) {
      return res.json({ success: true, data: null, message: 'Assessment not found' });
    }

    const submissions = assessment.submissions || [];
    const scores = submissions.map(s => s.score || 0);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    // Session Impact Score: 60% avg score + 20% participation + 20% completion
    const participationRate = Math.min(submissions.length / 5, 1);
    const impactScore = Math.round(avgScore * 0.6 + participationRate * 100 * 0.2 + 100 * 0.2);

    res.json({
      success: true,
      data: {
        assessment: {
          _id: assessment._id,
          title: assessment.title,
          subject: assessment.subject,
          topic: assessment.topic,
          totalQuestions: assessment.totalQuestions,
          difficulty: assessment.difficulty
        },
        stats: {
          averageScore: Math.round(avgScore),
          highestScore,
          lowestScore,
          totalSubmissions: submissions.length,
          impactScore
        },
        submissions: submissions.map(s => ({
          studentName: s.studentId?.name || s.studentName || 'Student',
          score: s.score,
          submittedAt: s.submittedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/learning-path/module/:moduleIndex/complete
 * Mark entire module as completed
 */
router.post('/module/:moduleIndex/complete', authenticate, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (!volunteer) {
      return res.status(404).json({ success: false, error: 'Volunteer not found' });
    }

    const learningPath = await LearningPath.findOne({
      volunteerId: volunteer._id,
      status: { $in: ['active', 'in_progress'] }
    });

    if (!learningPath) {
      return res.status(404).json({ success: false, error: 'No active learning path' });
    }

    const idx = parseInt(req.params.moduleIndex);
    if (idx < 0 || idx >= learningPath.modules.length) {
      return res.status(400).json({ success: false, error: 'Invalid module index' });
    }

    // Mark all sessions in this module as completed
    const mod = learningPath.modules[idx];
    if (mod.sessions) {
      await ClassSession.updateMany(
        { _id: { $in: mod.sessions } },
        { $set: { status: 'completed', completedAt: new Date() } }
      );
    }

    mod.status = 'completed';
    mod.completedDate = new Date();
    learningPath.completedModules = learningPath.modules.filter(m => m.status === 'completed').length;

    // Unlock next module
    const nextMod = learningPath.modules.find(m => m.status === 'upcoming');
    if (nextMod) nextMod.status = 'current';

    learningPath.status = learningPath.completedModules >= learningPath.totalModules ? 'completed' : 'active';
    await learningPath.save();

    res.json({
      success: true,
      data: learningPath,
      message: `Module "${mod.moduleName}" marked as completed`
    });
  } catch (error) {
    console.error('Error completing module:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/learning-path/reset
 * Reset/delete current learning path so volunteer can start fresh
 */
router.delete('/reset', authenticate, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ userId: req.user.userId });
    if (!volunteer) {
      return res.status(404).json({ success: false, error: 'Volunteer not found' });
    }

    const deleted = await LearningPath.findOneAndDelete({
      volunteerId: volunteer._id,
      status: { $in: ['active', 'in_progress'] }
    });

    if (deleted) {
      // Clean up sessions
      const sessionIds = deleted.modules.flatMap(m => m.sessions || []);
      await ClassSession.deleteMany({ _id: { $in: sessionIds }, status: 'scheduled' });

      volunteer.learningPath = null;
      await volunteer.save();
    }

    res.json({ success: true, message: 'Learning path reset. You can set up a new one.' });
  } catch (error) {
    console.error('Error resetting learning path:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
