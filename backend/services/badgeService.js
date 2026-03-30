const Badge = require('../models/Badge');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');

/**
 * Badge definitions
 */
const badgeDefinitions = {
  'perfect-score': {
    name: 'Perfect Score',
    description: 'Achieved 100% on a test',
    icon: 'perfect-star',
    criteria: 'score === 100',
    rarity: 'rare'
  },
  'math-star': {
    name: 'Math Star',
    description: '90%+ on 3 consecutive math tests',
    icon: 'math-star',
    criteria: 'consecutive_math_90_plus_3',
    rarity: 'uncommon'
  },
  'english-star': {
    name: 'English Star',
    description: '90%+ on 3 consecutive English tests',
    icon: 'english-star',
    criteria: 'consecutive_english_90_plus_3',
    rarity: 'uncommon'
  },
  'science-star': {
    name: 'Science Star',
    description: '90%+ on 3 consecutive Science tests',
    icon: 'science-star',
    criteria: 'consecutive_science_90_plus_3',
    rarity: 'uncommon'
  },
  'seven-day-streak': {
    name: '7-Day Streak',
    description: '7 consecutive days with learning activity',
    icon: 'fire-7',
    criteria: 'activity_streak_7',
    rarity: 'uncommon'
  },
  'thirty-day-streak': {
    name: '30-Day Streak',
    description: '30 consecutive days with learning activity',
    icon: 'fire-30',
    criteria: 'activity_streak_30',
    rarity: 'epic'
  },
  'first-test': {
    name: 'First Test',
    description: 'Completed your first test',
    icon: 'first-test',
    criteria: 'completed_first_test',
    rarity: 'common'
  },
  'top-performer': {
    name: 'Top Performer',
    description: 'Scored in top 3 in your class on a test',
    icon: 'top-three',
    criteria: 'top_3_score',
    rarity: 'rare'
  }
};

/**
 * Check if student earned "Perfect Score" badge
 */
async function checkPerfectScore(student, testScore) {
  if (testScore === 100) {
    return { earned: true, badgeId: 'perfect-score' };
  }
  return { earned: false };
}

/**
 * Check if student earned subject star badges (3 consecutive 90+ tests)
 */
async function checkSubjectStar(student, subject) {
  const recentTests = student.assessmentHistory
    ?.filter(a => a.subject === subject)
    ?.sort((a, b) => new Date(b.date) - new Date(a.date))
    ?.slice(0, 3) || [];

  if (recentTests.length >= 3) {
    const allAbove90 = recentTests.every(test => test.score >= 90);
    if (allAbove90) {
      const badgeMap = {
        'Math': 'math-star',
        'English': 'english-star',
        'Science': 'science-star'
      };
      const badgeId = badgeMap[subject];
      if (badgeId) {
        return { earned: true, badgeId: badgeId };
      }
    }
  }
  return { earned: false };
}

/**
 * Check if student earned activity streak badges
 */
async function checkActivityStreaks(student) {
  const activityDates = student.activityLog?.map(log => new Date(log.date).toDateString()) || [];
  const uniqueDates = [...new Set(activityDates)];

  if (uniqueDates.length === 0) {
    return { earned: false, badges: [] };
  }

  // Sort dates
  uniqueDates.sort((a, b) => new Date(a) - new Date(b));

  const badges = [];
  let currentStreak = 1;

  // Calculate streaks
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const dayDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      currentStreak++;
      if (currentStreak === 7) {
        badges.push({ badgeId: 'seven-day-streak', streak: 7 });
      }
      if (currentStreak === 30) {
        badges.push({ badgeId: 'thirty-day-streak', streak: 30 });
      }
    } else if (dayDiff > 1) {
      currentStreak = 1;
    }
  }

  return { earned: badges.length > 0, badges: badges };
}

/**
 * Check if student earned "First Test" badge
 */
async function checkFirstTest(student) {
  if (student.assessmentHistory && student.assessmentHistory.length === 1) {
    return { earned: true, badgeId: 'first-test' };
  }
  return { earned: false };
}

/**
 * Check if student earned "Top Performer" badge (top 3 in class)
 */
async function checkTopPerformer(student, testScore, assessmentId, classGroupId) {
  if (!classGroupId) {
    return { earned: false };
  }

  try {
    // Get all scores for this assessment in the class
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return { earned: false };
    }

    // Count students with higher scores on this assessment
    const higherScores = await Assessment.countDocuments({
      _id: assessmentId,
      'submissions.score': { $gt: testScore }
    });

    // If 2 or fewer students have higher scores, this student is in top 3
    if (higherScores <= 2) {
      return { earned: true, badgeId: 'top-performer' };
    }
  } catch (error) {
    console.error('Error checking top performer badge:', error);
  }

  return { earned: false };
}

/**
 * Check and award badges to a student
 * Context: { testScore, subject, assessmentId, classGroupId }
 */
async function checkAndAwardBadges(studentId, assessmentContext) {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const newBadges = [];
    const { testScore, subject, assessmentId, classGroupId } = assessmentContext;

    // Get student's existing badges
    const existingBadges = student.badges?.map(b => b.badgeId) || [];

    // 1. Check Perfect Score
    if (testScore === 100 && !existingBadges.includes('perfect-score')) {
      const result = await checkPerfectScore(student, testScore);
      if (result.earned) {
        newBadges.push(result.badgeId);
      }
    }

    // 2. Check Subject Stars
    if (subject && !existingBadges.includes(`${subject.toLowerCase()}-star`)) {
      const result = await checkSubjectStar(student, subject);
      if (result.earned && !newBadges.includes(result.badgeId)) {
        newBadges.push(result.badgeId);
      }
    }

    // 3. Check Activity Streaks
    const streakResult = await checkActivityStreaks(student);
    if (streakResult.earned) {
      streakResult.badges.forEach(badge => {
        if (!existingBadges.includes(badge.badgeId) && !newBadges.includes(badge.badgeId)) {
          newBadges.push(badge.badgeId);
        }
      });
    }

    // 4. Check First Test
    if (!existingBadges.includes('first-test')) {
      const result = await checkFirstTest(student);
      if (result.earned && !newBadges.includes(result.badgeId)) {
        newBadges.push(result.badgeId);
      }
    }

    // 5. Check Top Performer
    if (!existingBadges.includes('top-performer') && assessmentId && classGroupId) {
      const result = await checkTopPerformer(student, testScore, assessmentId, classGroupId);
      if (result.earned && !newBadges.includes(result.badgeId)) {
        newBadges.push(result.badgeId);
      }
    }

    // Award new badges to student
    const awardedBadges = [];
    for (const badgeId of newBadges) {
      const badgeDef = badgeDefinitions[badgeId];
      if (badgeDef) {
        const badge = {
          badgeId: badgeId,
          name: badgeDef.name,
          description: badgeDef.description,
          icon: badgeDef.icon,
          rarity: badgeDef.rarity,
          earnedAt: new Date()
        };

        if (!student.badges) {
          student.badges = [];
        }
        student.badges.push(badge);
        awardedBadges.push(badge);
      }
    }

    if (awardedBadges.length > 0) {
      await student.save();
    }

    return {
      success: true,
      newBadges: awardedBadges,
      message: `Student awarded ${awardedBadges.length} new badge(s)`
    };
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    throw new Error(`Failed to check and award badges: ${error.message}`);
  }
}

/**
 * Get all available badges
 */
function getAllBadges() {
  return Object.entries(badgeDefinitions).map(([badgeId, definition]) => ({
    badgeId,
    ...definition
  }));
}

/**
 * Get student's badges
 */
async function getStudentBadges(studentId) {
  try {
    const student = await Student.findById(studentId).select('badges');
    if (!student) {
      throw new Error('Student not found');
    }
    return {
      success: true,
      badges: student.badges || [],
      totalBadges: (student.badges || []).length
    };
  } catch (error) {
    throw new Error(`Error fetching student badges: ${error.message}`);
  }
}

module.exports = {
  checkAndAwardBadges,
  getAllBadges,
  getStudentBadges,
  badgeDefinitions
};
