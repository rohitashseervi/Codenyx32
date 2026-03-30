const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Student = require('../models/Student');
const { authenticate } = require('../middleware/auth');
const { checkAndAwardBadges } = require('../services/badgeService');

/**
 * GET /api/test/:testId
 * Get test by testId (public with testId)
 */
router.get('/:testId', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.testId).select('-submissions');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    if (assessment.status !== 'published') {
      return res.status(403).json({
        success: false,
        error: 'Test is not available'
      });
    }

    res.json({
      success: true,
      test: {
        id: assessment._id,
        title: assessment.title,
        subject: assessment.subject,
        topic: assessment.topic,
        grade: assessment.grade,
        difficulty: assessment.difficulty,
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
 * POST /api/test/:testId/submit
 * Submit test (auth required)
 */
router.post('/:testId/submit', authenticate, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.testId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Answers array is required'
      });
    }

    if (answers.length !== assessment.questions.length) {
      return res.status(400).json({
        success: false,
        error: `Expected ${assessment.questions.length} answers, got ${answers.length}`
      });
    }

    // Check if already submitted
    const existingSubmission = assessment.submissions?.find(
      sub => sub.studentId.toString() === student._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted this test'
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
        question: question.question,
        studentAnswer: answer,
        correctAnswer: question.correctAnswer,
        options: question.options,
        isCorrect: isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctCount / assessment.questions.length) * 100);

    // Create submission record
    const submission = {
      studentId: student._id,
      studentName: student.name,
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

    // Update student's assessment history
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
      percentage: `${score}%`,
      detailedResults: detailedResults,
      newBadges: badgeResult.newBadges || [],
      message: `Test submitted successfully with score ${score}%`
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
 * GET /api/test/:testId/results
 * Get results (for volunteer/mentor/admin)
 */
router.get('/:testId/results', authenticate, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.testId).populate('submissions.studentId');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    const submissions = (assessment.submissions || []).map(sub => ({
      studentId: sub.studentId._id,
      studentName: sub.studentId.name,
      score: sub.score,
      correctAnswers: sub.detailedResults?.filter(r => r.isCorrect).length || 0,
      totalQuestions: sub.detailedResults?.length || 0,
      submittedAt: sub.submittedAt
    }));

    // Calculate statistics
    const scores = submissions.map(s => s.score);
    const averageScore = scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
      : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;

    res.json({
      success: true,
      assessment: {
        id: assessment._id,
        title: assessment.title,
        subject: assessment.subject,
        topic: assessment.topic,
        totalQuestions: assessment.totalQuestions
      },
      submissions: submissions,
      statistics: {
        totalSubmissions: submissions.length,
        averageScore: parseFloat(averageScore),
        maxScore: maxScore,
        minScore: minScore,
        passRate: `${((submissions.filter(s => s.score >= 60).length / submissions.length) * 100).toFixed(1)}%`
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch results: ${error.message}`
    });
  }
});

/**
 * GET /api/test/:testId/scorecard
 * Detailed scorecard
 */
router.get('/:testId/scorecard', authenticate, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.testId);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Test not found'
      });
    }

    // Find student's submission
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const submission = assessment.submissions?.find(
      sub => sub.studentId.toString() === student._id.toString()
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'No submission found for this student'
      });
    }

    const questionAnalysis = submission.detailedResults.map((result, idx) => ({
      questionNumber: idx + 1,
      question: assessment.questions[idx].question,
      yourAnswer: result.studentAnswer,
      correctAnswer: result.correctAnswer,
      isCorrect: result.isCorrect,
      explanation: result.explanation,
      options: assessment.questions[idx].options
    }));

    // Calculate performance by topic/section
    const correctBySection = {};
    const totalBySection = {};

    submission.detailedResults.forEach((result, idx) => {
      const section = assessment.questions[idx].section || 'General';
      if (!correctBySection[section]) {
        correctBySection[section] = 0;
        totalBySection[section] = 0;
      }
      if (result.isCorrect) correctBySection[section]++;
      totalBySection[section]++;
    });

    const sectionPerformance = Object.keys(correctBySection).map(section => ({
      section: section,
      correct: correctBySection[section],
      total: totalBySection[section],
      percentage: `${((correctBySection[section] / totalBySection[section]) * 100).toFixed(1)}%`
    }));

    res.json({
      success: true,
      scorecard: {
        testTitle: assessment.title,
        studentName: student.name,
        score: submission.score,
        correctAnswers: submission.detailedResults.filter(r => r.isCorrect).length,
        totalQuestions: submission.detailedResults.length,
        submittedAt: submission.submittedAt,
        questionAnalysis: questionAnalysis,
        sectionPerformance: sectionPerformance
      }
    });
  } catch (error) {
    console.error('Error fetching scorecard:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch scorecard: ${error.message}`
    });
  }
});

module.exports = router;
