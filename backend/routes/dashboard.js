const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const Mentor = require('../models/Mentor');
const Assessment = require('../models/Assessment');
const NGO = require('../models/NGO');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * GET /api/dashboard/overview
 * KPI overview
 */
router.get('/overview', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.query;

    // Get counts
    const students = await Student.countDocuments({ ngoId: ngoId });
    const volunteers = await Volunteer.countDocuments({ ngoId: ngoId, approved: true });
    const mentors = await Mentor.countDocuments({ ngoId: ngoId, approved: true });

    // Calculate average mastery
    const studentsList = await Student.find({ ngoId: ngoId });
    let totalAvgScore = 0;
    let studentsWithTests = 0;

    studentsList.forEach(student => {
      if (student.assessmentHistory && student.assessmentHistory.length > 0) {
        const avgScore = student.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / student.assessmentHistory.length;
        totalAvgScore += avgScore;
        studentsWithTests++;
      }
    });

    const averageMastery = studentsWithTests > 0 ? (totalAvgScore / studentsWithTests).toFixed(2) : 0;

    // Find at-risk students (avg score < 60%)
    const atRiskCount = studentsList.filter(student => {
      if (!student.assessmentHistory || student.assessmentHistory.length === 0) return false;
      const avgScore = student.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / student.assessmentHistory.length;
      return avgScore < 60;
    }).length;

    res.json({
      success: true,
      overview: {
        totalStudents: students,
        totalVolunteers: volunteers,
        totalMentors: mentors,
        averageMastery: parseFloat(averageMastery),
        atRiskStudents: atRiskCount,
        healthScore: `${Math.min(100, Math.round((averageMastery + 40) * 1.25))}%`
      }
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch overview: ${error.message}`
    });
  }
});

/**
 * GET /api/dashboard/students
 * Student performance list with filters
 */
router.get('/students', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId, sortBy = 'name', filter = 'all' } = req.query;

    let students = await Student.find({ ngoId: ngoId });

    // Apply filter
    if (filter === 'at-risk') {
      students = students.filter(student => {
        if (!student.assessmentHistory || student.assessmentHistory.length === 0) return true;
        const avgScore = student.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / student.assessmentHistory.length;
        return avgScore < 60;
      });
    } else if (filter === 'top-performers') {
      students = students.filter(student => {
        if (!student.assessmentHistory || student.assessmentHistory.length === 0) return false;
        const avgScore = student.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / student.assessmentHistory.length;
        return avgScore >= 80;
      });
    }

    // Enrich with scores and badges
    const enrichedStudents = students.map(student => {
      const avgScore = student.assessmentHistory?.length > 0
        ? (student.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / student.assessmentHistory.length).toFixed(2)
        : 0;

      return {
        id: student._id,
        name: student.name,
        grade: student.grade,
        averageScore: parseFloat(avgScore),
        testsCompleted: student.assessmentHistory?.length || 0,
        badges: (student.badges || []).length,
        currentMentor: student.currentMentorId ? 'Assigned' : 'Not Assigned',
        enrolledAt: student.enrolledAt
      };
    });

    // Sort
    if (sortBy === 'score-desc') {
      enrichedStudents.sort((a, b) => b.averageScore - a.averageScore);
    } else if (sortBy === 'score-asc') {
      enrichedStudents.sort((a, b) => a.averageScore - b.averageScore);
    } else {
      enrichedStudents.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({
      success: true,
      students: enrichedStudents,
      total: enrichedStudents.length
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
 * GET /api/dashboard/volunteers
 * Volunteer effectiveness metrics
 */
router.get('/volunteers', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.query;

    const volunteers = await Volunteer.find({ ngoId: ngoId, approved: true });

    const enrichedVolunteers = volunteers.map(vol => {
      const subjectList = Array.isArray(vol.subjects) ? vol.subjects.join(', ') : '';
      const gradeList = Array.isArray(vol.gradeBand) ? vol.gradeBand.join(', ') : '';

      return {
        id: vol._id,
        name: vol.name,
        email: vol.email,
        subjects: subjectList,
        grades: gradeList,
        duration: vol.duration,
        languages: vol.languagesSpoken,
        qualifications: vol.qualifications,
        approved: vol.approved,
        createdAt: vol.createdAt
      };
    });

    res.json({
      success: true,
      volunteers: enrichedVolunteers,
      total: enrichedVolunteers.length
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch volunteers: ${error.message}`
    });
  }
});

/**
 * GET /api/dashboard/mentors
 * Mentor load and student progress
 */
router.get('/mentors', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.query;

    const mentors = await Mentor.find({ ngoId: ngoId, approved: true });

    const enrichedMentors = mentors.map(mentor => {
      const utilization = mentor.maxStudents > 0
        ? Math.round((mentor.currentStudentCount / mentor.maxStudents) * 100)
        : 0;

      return {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        expertSubjects: mentor.expertSubjects,
        studentsAssigned: mentor.currentStudentCount || 0,
        maxStudents: mentor.maxStudents,
        utilizationPercent: utilization,
        yearsExperience: mentor.yearsExperience,
        languages: mentor.languagesSpoken,
        createdAt: mentor.createdAt
      };
    });

    res.json({
      success: true,
      mentors: enrichedMentors,
      total: enrichedMentors.length
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch mentors: ${error.message}`
    });
  }
});

/**
 * GET /api/dashboard/subjects
 * Subject-wise performance breakdown
 */
router.get('/subjects', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.query;

    const students = await Student.find({ ngoId: ngoId });
    const subjectScores = {};

    students.forEach(student => {
      (student.assessmentHistory || []).forEach(test => {
        if (!subjectScores[test.subject]) {
          subjectScores[test.subject] = {
            scores: [],
            count: 0
          };
        }
        subjectScores[test.subject].scores.push(test.score);
        subjectScores[test.subject].count++;
      });
    });

    const subjectBreakdown = Object.entries(subjectScores).map(([subject, data]) => {
      const avgScore = (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(2);
      const maxScore = Math.max(...data.scores);
      const minScore = Math.min(...data.scores);

      return {
        subject: subject,
        averageScore: parseFloat(avgScore),
        maxScore: maxScore,
        minScore: minScore,
        totalTests: data.count,
        studentsTested: data.count // Approximate
      };
    });

    res.json({
      success: true,
      subjects: subjectBreakdown,
      total: subjectBreakdown.length
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch subjects: ${error.message}`
    });
  }
});

/**
 * GET /api/dashboard/at-risk
 * At-risk students list
 */
router.get('/at-risk', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.query;

    const students = await Student.find({ ngoId: ngoId }).populate('currentMentorId');

    const atRiskStudents = students
      .filter(student => {
        if (!student.assessmentHistory || student.assessmentHistory.length === 0) return true;
        const avgScore = student.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / student.assessmentHistory.length;
        return avgScore < 60;
      })
      .map(student => {
        const avgScore = student.assessmentHistory?.length > 0
          ? (student.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / student.assessmentHistory.length).toFixed(2)
          : 'No tests';

        const recentTest = student.assessmentHistory?.[student.assessmentHistory.length - 1];

        return {
          id: student._id,
          name: student.name,
          grade: student.grade,
          averageScore: typeof avgScore === 'string' ? avgScore : parseFloat(avgScore),
          testsCompleted: student.assessmentHistory?.length || 0,
          lastTestScore: recentTest?.score || null,
          lastTestDate: recentTest?.date || null,
          weakAreas: student.weakAreas,
          mentorAssigned: student.currentMentorId ? student.currentMentorId.name : 'Not Assigned',
          action: 'Assign Mentor / Schedule Session'
        };
      });

    res.json({
      success: true,
      atRiskStudents: atRiskStudents,
      total: atRiskStudents.length
    });
  } catch (error) {
    console.error('Error fetching at-risk students:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch at-risk students: ${error.message}`
    });
  }
});

/**
 * GET /api/dashboard/test-results
 * Generalized test results across all students
 */
router.get('/test-results', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.query;

    const students = await Student.find({ ngoId: ngoId });
    const allTests = [];

    students.forEach(student => {
      (student.assessmentHistory || []).forEach(test => {
        allTests.push({
          studentId: student._id,
          studentName: student.name,
          subject: test.subject,
          topic: test.topic,
          score: test.score,
          date: test.date
        });
      });
    });

    // Sort by most recent
    allTests.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      testResults: allTests.slice(0, 100), // Last 100 tests
      total: allTests.length
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch test results: ${error.message}`
    });
  }
});

/**
 * GET /api/dashboard/trends
 * Progress trends over time
 */
router.get('/trends', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { ngoId } = req.query;

    const students = await Student.find({ ngoId: ngoId });

    // Aggregate scores by week
    const weeklyTrends = {};
    students.forEach(student => {
      (student.assessmentHistory || []).forEach(test => {
        const testDate = new Date(test.date);
        const weekStart = new Date(testDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyTrends[weekKey]) {
          weeklyTrends[weekKey] = {
            scores: [],
            count: 0
          };
        }
        weeklyTrends[weekKey].scores.push(test.score);
        weeklyTrends[weekKey].count++;
      });
    });

    const trends = Object.entries(weeklyTrends)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([week, data]) => ({
        week: week,
        averageScore: (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(2),
        testsCompleted: data.count
      }));

    res.json({
      success: true,
      trends: trends,
      total: trends.length
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch trends: ${error.message}`
    });
  }
});

module.exports = router;
