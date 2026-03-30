const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const ClassSession = require('../models/ClassSession');
const Assessment = require('../models/Assessment');
const Match = require('../models/Match');
const { authenticate } = require('../middleware/auth');
const { findMentorMatches, executeMatch } = require('../services/matchingAlgorithm');
const { checkAndAwardBadges, getStudentBadges } = require('../services/badgeService');
const { sendMentorAssignment } = require('../services/gmailService');

/**
 * GET /api/student/profile
 * Get student profile with progress
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const avgScore = student.assessmentHistory?.length > 0
      ? (student.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / student.assessmentHistory.length).toFixed(2)
      : 0;

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        grade: student.grade,
        language: student.language,
        weakAreas: student.weakAreas,
        currentMentorId: student.currentMentorId,
        averageScore: parseFloat(avgScore),
        totalTests: student.assessmentHistory?.length || 0,
        badges: (student.badges || []).length,
        createdAt: student.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch profile: ${error.message}`
    });
  }
});

/**
 * GET /api/student/classes
 * Get upcoming classes
 */
router.get('/classes', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const sessions = await ClassSession.find({
      classGroupId: student.classGroupId,
      scheduledDate: { $gte: new Date() }
    }).sort({ scheduledDate: 1 });

    res.json({
      success: true,
      sessions: sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch classes: ${error.message}`
    });
  }
});

/**
 * GET /api/student/mentor
 * Get assigned mentor info
 */
router.get('/mentor', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    if (!student.currentMentorId) {
      return res.json({
        success: true,
        mentor: null,
        message: 'No mentor assigned'
      });
    }

    const mentor = await Mentor.findById(student.currentMentorId).select('-currentStudentCount');
    if (!mentor) {
      return res.json({
        success: true,
        mentor: null,
        message: 'Mentor not found'
      });
    }

    res.json({
      success: true,
      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        expertSubjects: mentor.expertSubjects,
        yearsExperience: mentor.yearsExperience,
        languages: mentor.languagesSpoken
      }
    });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch mentor: ${error.message}`
    });
  }
});

/**
 * POST /api/student/request-mentor
 * Request mentor assignment (triggers matching)
 */
router.post('/request-mentor', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    if (student.currentMentorId) {
      return res.status(400).json({
        success: false,
        error: 'Already assigned a mentor'
      });
    }

    if (!student.ngoId) {
      return res.status(400).json({
        success: false,
        error: 'Student not enrolled in an NGO'
      });
    }

    // Find mentor matches
    const matchResult = await findMentorMatches(student._id, student.ngoId);

    if (matchResult.matches.length === 0) {
      return res.status(400).json({
        success: true,
        matches: [],
        message: 'No available mentors found'
      });
    }

    // Execute match with top mentor
    const topMatch = matchResult.matches[0];
    const executeResult = await executeMatch(student._id, topMatch.mentorId, student.ngoId);

    if (executeResult.success) {
      // Send notification to mentor
      try {
        await sendMentorAssignment(
          topMatch.mentorEmail || topMatch.mentorId.email,
          student.name,
          topMatch.matchScore
        );
      } catch (emailError) {
        console.warn('Failed to send mentor assignment email:', emailError);
      }

      return res.json({
        success: true,
        match: {
          mentorId: topMatch.mentorId,
          mentorName: topMatch.mentorName,
          matchScore: topMatch.matchScore
        },
        message: 'Mentor matched successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: executeResult.error || 'Failed to execute match'
      });
    }
  } catch (error) {
    console.error('Error requesting mentor:', error);
    res.status(500).json({
      success: false,
      error: `Failed to request mentor: ${error.message}`
    });
  }
});

/**
 * POST /api/student/change-mentor
 * Request mentor change
 */
router.post('/change-mentor', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    if (!student.currentMentorId) {
      return res.status(400).json({
        success: false,
        error: 'No current mentor to change'
      });
    }

    // End current match
    const endResult = await require('../services/matchingAlgorithm').endMatch(
      student._id,
      student.currentMentorId
    );

    // Request new mentor
    const matchResult = await findMentorMatches(student._id, student.ngoId);

    if (matchResult.matches.length === 0) {
      return res.status(400).json({
        success: true,
        message: 'Previous mentor unmatched, but no new mentors available'
      });
    }

    const topMatch = matchResult.matches[0];
    const executeResult = await executeMatch(student._id, topMatch.mentorId, student.ngoId);

    res.json({
      success: true,
      newMatch: {
        mentorId: topMatch.mentorId,
        mentorName: topMatch.mentorName,
        matchScore: topMatch.matchScore
      },
      message: 'Mentor changed successfully'
    });
  } catch (error) {
    console.error('Error changing mentor:', error);
    res.status(500).json({
      success: false,
      error: `Failed to change mentor: ${error.message}`
    });
  }
});

/**
 * GET /api/student/tests
 * Get pending tests
 */
router.get('/tests', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    // Get assessments for student's class
    const assessments = await Assessment.find({
      classGroupId: student.classGroupId,
      status: 'published'
    }).select('_id title subject topic grade difficulty totalQuestions createdAt');

    // Filter to only tests student hasn't completed
    const pendingTests = assessments.filter(test => {
      const submission = test.submissions?.find(sub => sub.studentId.toString() === student._id.toString());
      return !submission;
    });

    res.json({
      success: true,
      tests: pendingTests,
      total: pendingTests.length
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch tests: ${error.message}`
    });
  }
});

/**
 * GET /api/student/tests/:testId
 * Get specific test to take
 */
router.get('/tests/:testId', authenticate, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.testId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    res.json({
      success: true,
      test: {
        id: assessment._id,
        title: assessment.title,
        subject: assessment.subject,
        topic: assessment.topic,
        totalQuestions: assessment.totalQuestions,
        questions: assessment.questions
      }
    });
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch test: ${error.message}`
    });
  }
});

/**
 * POST /api/student/tests/:testId/submit
 * Submit test answers
 */
router.post('/tests/:testId/submit', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const assessment = await Assessment.findById(req.params.testId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers array is required'
      });
    }

    // Calculate score
    let correctCount = 0;
    const detailedResults = answers.map((answer, idx) => {
      const question = assessment.questions[idx];
      const isCorrect = answer === question.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionIndex: idx,
        studentAnswer: answer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctCount / assessment.questions.length) * 100);

    // Create submission
    const submission = {
      studentId: student._id,
      answers: answers,
      score: score,
      detailedResults: detailedResults,
      submittedAt: new Date()
    };

    if (!assessment.submissions) {
      assessment.submissions = [];
    }
    assessment.submissions.push(submission);
    await assessment.save();

    // Add to student's assessment history
    if (!student.assessmentHistory) {
      student.assessmentHistory = [];
    }
    student.assessmentHistory.push({
      assessmentId: assessment._id,
      subject: assessment.subject,
      topic: assessment.topic,
      score: score,
      date: new Date()
    });

    // Record activity
    if (!student.activityLog) {
      student.activityLog = [];
    }
    student.activityLog.push({
      type: 'test_submitted',
      date: new Date(),
      details: { testId: assessment._id, score: score }
    });

    await student.save();

    // Check and award badges
    const badgeResult = await checkAndAwardBadges(student._id, {
      testScore: score,
      subject: assessment.subject,
      assessmentId: assessment._id,
      classGroupId: student.classGroupId
    });

    res.json({
      success: true,
      score: score,
      correctAnswers: correctCount,
      totalQuestions: assessment.questions.length,
      detailedResults: detailedResults,
      newBadges: badgeResult.newBadges || [],
      message: `Test submitted with score ${score}%`
    });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({
      success: false,
      error: `Failed to submit test: ${error.message}`
    });
  }
});

/**
 * GET /api/student/progress
 * Get progress report (streaks, mastery, badges)
 */
router.get('/progress', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const tests = student.assessmentHistory || [];
    const avgScore = tests.length > 0
      ? (tests.reduce((sum, t) => sum + t.score, 0) / tests.length).toFixed(2)
      : 0;

    // Calculate current streak
    const activityDates = (student.activityLog || []).map(log => new Date(log.date).toDateString());
    const uniqueDates = [...new Set(activityDates)].sort();
    let currentStreak = 0;

    if (uniqueDates.length > 0) {
      let streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          streak++;
        } else if (dayDiff > 1) {
          break;
        }
      }
      currentStreak = streak;
    }

    // Subject mastery
    const subjectScores = {};
    tests.forEach(test => {
      if (!subjectScores[test.subject]) {
        subjectScores[test.subject] = [];
      }
      subjectScores[test.subject].push(test.score);
    });

    const subjectMastery = Object.entries(subjectScores).map(([subject, scores]) => ({
      subject: subject,
      averageScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
      testsCompleted: scores.length
    }));

    res.json({
      success: true,
      progress: {
        averageScore: parseFloat(avgScore),
        totalTests: tests.length,
        currentStreak: currentStreak,
        totalBadges: (student.badges || []).length,
        subjectMastery: subjectMastery,
        recentTests: (tests || []).slice(-5).reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch progress: ${error.message}`
    });
  }
});

/**
 * GET /api/student/badges
 * Get all earned badges
 */
router.get('/badges', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const result = await getStudentBadges(student._id);

    res.json({
      success: true,
      badges: result.badges,
      total: result.totalBadges
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch badges: ${error.message}`
    });
  }
});

module.exports = router;
