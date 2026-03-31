const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const Mentor = require('../models/Mentor');
const Assessment = require('../models/Assessment');
const Session = require('../models/Session');
const NGO = require('../models/NGO');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * GET /api/dashboard/:ngoId/overview
 * KPI overview for an NGO
 */
router.get('/:ngoId/overview', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.params;

    const totalStudents = await Student.countDocuments({ ngoId });
    const activeVolunteers = await Volunteer.countDocuments({ ngoId, approved: true });
    const activeMentors = await Mentor.countDocuments({ ngoId, approved: true });

    // Calculate average mastery from assessment history
    const students = await Student.find({ ngoId });
    let totalAvgScore = 0;
    let studentsWithTests = 0;
    let atRiskCount = 0;
    let onTrackCount = 0;
    let developingCount = 0;

    students.forEach(student => {
      if (student.assessmentHistory && student.assessmentHistory.length > 0) {
        const avgScore = student.assessmentHistory.reduce((sum, a) => sum + (a.score || 0), 0) / student.assessmentHistory.length;
        totalAvgScore += avgScore;
        studentsWithTests++;

        if (avgScore >= 75) onTrackCount++;
        else if (avgScore >= 50) developingCount++;
        else atRiskCount++;
      }
    });

    const avgMasteryScore = studentsWithTests > 0 ? totalAvgScore / studentsWithTests : 0;

    // Session completion rate
    const totalSessions = await Session.countDocuments({ ngoId }).catch(() => 0);
    const completedSessions = await Session.countDocuments({ ngoId, status: 'completed' }).catch(() => 0);
    const sessionCompletionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    res.json({
      totalStudents,
      activeVolunteers,
      activeMentors,
      avgMasteryScore,
      atRiskStudents: atRiskCount,
      onTrackStudents: onTrackCount,
      developingStudents: developingCount,
      sessionCompletionRate
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: `Failed to fetch overview: ${error.message}` });
  }
});

/**
 * GET /api/dashboard/:ngoId/trends
 * Mastery trends over time
 */
router.get('/:ngoId/trends', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const students = await Student.find({ ngoId });
    const dailyScores = {};

    // Generate date range
    const now = new Date();
    for (let i = days; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyScores[key] = { scores: [], date: key };
    }

    students.forEach(student => {
      (student.assessmentHistory || []).forEach(test => {
        const testDate = new Date(test.date).toISOString().split('T')[0];
        if (dailyScores[testDate]) {
          dailyScores[testDate].scores.push(test.score || 0);
        }
      });
    });

    // Build cumulative trend
    let lastAvg = 0;
    const trends = Object.values(dailyScores).map(day => {
      if (day.scores.length > 0) {
        lastAvg = day.scores.reduce((a, b) => a + b, 0) / day.scores.length;
      }
      return {
        date: day.date,
        avgMastery: parseFloat(lastAvg.toFixed(1))
      };
    });

    res.json(trends);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: `Failed to fetch trends: ${error.message}` });
  }
});

/**
 * GET /api/dashboard/:ngoId/subjects
 * Subject-wise performance breakdown
 */
router.get('/:ngoId/subjects', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.params;
    const students = await Student.find({ ngoId });
    const subjectScores = {};

    students.forEach(student => {
      (student.assessmentHistory || []).forEach(test => {
        const subject = test.subject || 'Unknown';
        if (!subjectScores[subject]) {
          subjectScores[subject] = [];
        }
        subjectScores[subject].push(test.score || 0);
      });
    });

    const subjects = Object.entries(subjectScores).map(([subject, scores]) => ({
      subject,
      avgScore: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
      totalTests: scores.length
    }));

    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: `Failed to fetch subjects: ${error.message}` });
  }
});

/**
 * GET /api/dashboard/:ngoId/at-risk
 * At-risk students list
 */
router.get('/:ngoId/at-risk', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.params;
    const students = await Student.find({ ngoId });

    const atRisk = students
      .map(student => {
        const history = student.assessmentHistory || [];
        const avgScore = history.length > 0
          ? history.reduce((sum, a) => sum + (a.score || 0), 0) / history.length
          : 0;
        return {
          id: student._id,
          name: student.name,
          grade: student.grade,
          masteryScore: parseFloat(avgScore.toFixed(1)),
          testsCompleted: history.length,
          weakAreas: student.weakAreas || []
        };
      })
      .filter(s => s.masteryScore < 60)
      .sort((a, b) => a.masteryScore - b.masteryScore);

    res.json(atRisk);
  } catch (error) {
    console.error('Error fetching at-risk:', error);
    res.status(500).json({ error: `Failed to fetch at-risk: ${error.message}` });
  }
});

/**
 * GET /api/dashboard/:ngoId/students
 * Student performance list
 */
router.get('/:ngoId/students', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.params;
    const students = await Student.find({ ngoId });

    const enriched = students.map(student => {
      const history = student.assessmentHistory || [];
      const avgScore = history.length > 0
        ? (history.reduce((sum, a) => sum + (a.score || 0), 0) / history.length).toFixed(1)
        : 0;

      return {
        id: student._id,
        name: student.name,
        grade: student.grade,
        averageScore: parseFloat(avgScore),
        testsCompleted: history.length,
        badges: (student.badges || []).length,
        enrolledAt: student.enrolledAt
      };
    });

    res.json({ students: enriched, total: enriched.length });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: `Failed to fetch students: ${error.message}` });
  }
});

/**
 * GET /api/dashboard/:ngoId/volunteers
 */
router.get('/:ngoId/volunteers', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.params;
    const volunteers = await Volunteer.find({ ngoId, approved: true });

    const enriched = volunteers.map(v => ({
      id: v._id,
      name: v.name,
      email: v.email,
      subjects: v.subjects,
      languages: v.languages,
      createdAt: v.createdAt
    }));

    res.json({ volunteers: enriched, total: enriched.length });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch volunteers: ${error.message}` });
  }
});

/**
 * GET /api/dashboard/:ngoId/mentors
 */
router.get('/:ngoId/mentors', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.params;
    const mentors = await Mentor.find({ ngoId, approved: true });

    const enriched = mentors.map(m => ({
      id: m._id,
      name: m.name,
      email: m.email,
      expertSubjects: m.expertSubjects,
      studentsAssigned: m.currentStudentCount || 0,
      maxStudents: m.maxStudents,
      createdAt: m.createdAt
    }));

    res.json({ mentors: enriched, total: enriched.length });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch mentors: ${error.message}` });
  }
});

/**
 * GET /api/dashboard/:ngoId/test-results
 */
router.get('/:ngoId/test-results', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.params;
    const students = await Student.find({ ngoId });
    const allTests = [];

    students.forEach(student => {
      (student.assessmentHistory || []).forEach(test => {
        allTests.push({
          studentName: student.name,
          subject: test.subject,
          topic: test.topic,
          score: test.score,
          date: test.date
        });
      });
    });

    allTests.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ testResults: allTests.slice(0, 100), total: allTests.length });
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch test results: ${error.message}` });
  }
});

module.exports = router;
