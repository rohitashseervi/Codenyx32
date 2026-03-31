const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const Match = require('../models/Match');

/**
 * Calculate match score between mentor and student (0-100)
 * Weighted factors:
 * - Subject alignment (30%)
 * - Learning gap priority (25%)
 * - Language match (20%)
 * - Availability (15%)
 * - Behavioral fit (10%)
 */
async function calculateMatchScore(mentor, student) {
  let score = 0;

  // 1. Subject Alignment (30%)
  const studentWeakAreas = student.weakAreas || [];
  const mentorSubjects = mentor.expertSubjects || [];
  const alignmentMatches = studentWeakAreas.filter(area =>
    mentorSubjects.some(sub => sub.toLowerCase() === area.toLowerCase())
  ).length;
  const subjectScore = studentWeakAreas.length > 0
    ? (alignmentMatches / studentWeakAreas.length) * 100
    : 50;
  score += (subjectScore * 0.30);

  // 2. Learning Gap Priority (25%)
  // Students with worse average scores get priority (higher match score)
  const averageScore = student.assessmentHistory?.length > 0
    ? student.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / student.assessmentHistory.length
    : 50;
  const gapPriority = 100 - Math.min(averageScore, 100);
  score += (gapPriority * 0.25);

  // 3. Language Match (20%)
  const languageScore = mentor.languagesSpoken?.includes(student.language) ? 100 : 0;
  score += (languageScore * 0.20);

  // 4. Availability (15%)
  const hasCapacity = (mentor.currentStudentCount || 0) < (mentor.maxStudents || 5);
  const availabilityScore = hasCapacity ? 100 : 0;
  score += (availabilityScore * 0.15);

  // 5. Behavioral Fit (10%)
  let behavioralScore = 50;
  if (mentor.behavioralProfile) {
    const mentorPatience = mentor.behavioralProfile.patience || 5;
    const studentNeeds = student.weakAreas?.length > 3 ? 'high-support' : student.weakAreas?.length > 1 ? 'moderate-support' : 'independent';
    if ((studentNeeds === 'high-support' && mentorPatience >= 4) ||
        (studentNeeds === 'moderate-support' && mentorPatience >= 3) ||
        (studentNeeds === 'independent') ||
        (mentorPatience >= 3)) {
      behavioralScore = 100;
    }
  }
  score += (behavioralScore * 0.10);

  return Math.min(Math.round(score), 100);
}

/**
 * Find available mentors for a student in an NGO
 * Returns ranked list of potential matches
 */
async function findMentorMatches(studentId, ngoId) {
  try {
    // Fetch student
    const student = await Student.findById(studentId).populate('ngoId');
    if (!student) {
      throw new Error('Student not found');
    }

    // Fetch all approved mentors in the NGO with capacity
    const mentors = await Mentor.find({
      ngoId: ngoId,
      approved: true,
      $expr: {
        $lt: [
          { $ifNull: ['$currentStudentCount', 0] },
          { $ifNull: ['$maxStudents', 5] }
        ]
      }
    });

    if (mentors.length === 0) {
      return {
        matches: [],
        message: 'No available mentors found'
      };
    }

    // Calculate scores for each mentor
    const matches = await Promise.all(
      mentors.map(async (mentor) => {
        const matchScore = await calculateMatchScore(mentor, student);
        return {
          mentorId: mentor._id,
          mentorName: mentor.name,
          matchScore: matchScore,
          expertSubjects: mentor.expertSubjects,
          languages: mentor.languagesSpoken,
          currentStudentCount: mentor.currentStudentCount || 0,
          maxStudents: mentor.maxStudents || 5
        };
      })
    );

    // Sort by match score (descending)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      matches: matches,
      totalMatches: matches.length
    };
  } catch (error) {
    throw new Error(`Error finding mentor matches: ${error.message}`);
  }
}

/**
 * Execute a match - create Match document and update counters
 */
async function executeMatch(studentId, mentorId, ngoId) {
  try {
    // Fetch student and mentor
    const [student, mentor] = await Promise.all([
      Student.findById(studentId),
      Mentor.findById(mentorId)
    ]);

    if (!student) {
      throw new Error('Student not found');
    }
    if (!mentor) {
      throw new Error('Mentor not found');
    }

    // Check mentor capacity
    const currentCount = mentor.currentStudentCount || 0;
    const maxStudents = mentor.maxStudents || 5;
    if (currentCount >= maxStudents) {
      throw new Error('Mentor is at capacity');
    }

    // Create Match document
    const match = new Match({
      studentId: studentId,
      mentorId: mentorId,
      ngoId: ngoId,
      matchScore: await calculateMatchScore(mentor, student),
      matchedAt: new Date(),
      status: 'active'
    });

    await match.save();

    // Update student's currentMentorId
    student.currentMentorId = mentorId;
    if (!student.matchHistory) {
      student.matchHistory = [];
    }
    student.matchHistory.push({
      mentorId: mentorId,
      matchedAt: new Date(),
      matchScore: match.matchScore
    });
    await student.save();

    // Increment mentor's currentStudentCount
    mentor.currentStudentCount = (mentor.currentStudentCount || 0) + 1;
    await mentor.save();

    return {
      success: true,
      match: match,
      message: `Student matched with mentor successfully`
    };
  } catch (error) {
    throw new Error(`Error executing match: ${error.message}`);
  }
}

/**
 * End a match and decrement mentor's student count
 */
async function endMatch(studentId, mentorId) {
  try {
    const [student, mentor, match] = await Promise.all([
      Student.findById(studentId),
      Mentor.findById(mentorId),
      Match.findOne({ studentId: studentId, mentorId: mentorId, status: 'active' })
    ]);

    if (!match) {
      throw new Error('Active match not found');
    }

    // Mark match as inactive
    match.status = 'inactive';
    match.endedAt = new Date();
    await match.save();

    // Clear student's currentMentorId
    if (student) {
      student.currentMentorId = null;
      await student.save();
    }

    // Decrement mentor's currentStudentCount
    if (mentor && mentor.currentStudentCount > 0) {
      mentor.currentStudentCount -= 1;
      await mentor.save();
    }

    return {
      success: true,
      message: 'Match ended successfully'
    };
  } catch (error) {
    throw new Error(`Error ending match: ${error.message}`);
  }
}

module.exports = {
  calculateMatchScore,
  findMentorMatches,
  executeMatch,
  endMatch
};
