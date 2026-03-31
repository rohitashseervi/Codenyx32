const LearningPath = require('../models/LearningPath');
const LearningModule = require('../models/LearningModule');
const ClassGroup = require('../models/ClassGroup');

/**
 * Generate a learning path for a volunteer
 * Takes: volunteerId, classGroupId, subject, grade, commitmentDuration (months), timeSlots
 * Distributes modules across available dates based on timeSlots and duration
 */
async function generateLearningPath(volunteerId, classGroupId, subject, grade, commitmentDuration, timeSlots) {
  try {
    // Validate inputs
    if (!volunteerId || !classGroupId || !subject || !grade || !commitmentDuration || !timeSlots || timeSlots.length === 0) {
      throw new Error('Missing required parameters');
    }

    // Fetch all learning modules for this subject and grade, ordered by 'order'
    const modules = await LearningModule.find({
      subject: subject,
      grade: grade
    }).sort({ order: 1 });

    if (modules.length === 0) {
      throw new Error(`No learning modules found for ${subject} grade ${grade}`);
    }

    // Calculate available teaching dates based on timeSlots and duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + commitmentDuration);

    const scheduledModules = [];
    let currentDate = new Date(startDate);
    let moduleIndex = 0;

    // Build a schedule of classes based on available time slots
    const classSchedule = [];
    while (currentDate <= endDate && moduleIndex < modules.length) {
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Check if any time slot matches this day of week
      const matchingSlot = timeSlots.find(slot =>
        slot.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
      );

      if (matchingSlot) {
        // Add this date to the schedule
        const [hours, minutes] = matchingSlot.startTime.split(':');
        const classDateTime = new Date(currentDate);
        classDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        classSchedule.push({
          date: classDateTime,
          duration: matchingSlot.duration || 60 // minutes
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Distribute modules across scheduled dates
    moduleIndex = 0;
    for (let i = 0; i < classSchedule.length && moduleIndex < modules.length; i++) {
      const moduleScheduleItem = {
        moduleId: modules[moduleIndex]._id,
        moduleName: modules[moduleIndex].topic,
        moduleDuration: modules[moduleIndex].estimatedDuration || 60,
        scheduledDate: classSchedule[i].date,
        status: 'scheduled'
      };

      scheduledModules.push(moduleScheduleItem);
      moduleIndex++;
    }

    // Create the LearningPath document
    const learningPath = new LearningPath({
      volunteerId: volunteerId,
      classGroupId: classGroupId,
      subject: subject,
      grade: grade,
      commitmentDuration: commitmentDuration,
      timeSlots: timeSlots,
      startDate: startDate,
      endDate: endDate,
      modules: scheduledModules,
      totalModules: scheduledModules.length,
      completedModules: 0,
      status: 'active',
      createdAt: new Date()
    });

    await learningPath.save();

    return {
      success: true,
      learningPath: learningPath,
      message: `Learning path created with ${scheduledModules.length} modules`
    };
  } catch (error) {
    throw new Error(`Error generating learning path: ${error.message}`);
  }
}

/**
 * Get a learning path by ID
 */
async function getLearningPath(learningPathId) {
  try {
    const learningPath = await LearningPath.findById(learningPathId).populate('modules.moduleId');
    if (!learningPath) {
      throw new Error('Learning path not found');
    }
    return learningPath;
  } catch (error) {
    throw new Error(`Error fetching learning path: ${error.message}`);
  }
}

/**
 * Update module status in learning path (mark as completed)
 */
async function completeModule(learningPathId, moduleId) {
  try {
    const learningPath = await LearningPath.findById(learningPathId);
    if (!learningPath) {
      throw new Error('Learning path not found');
    }

    const moduleIndex = learningPath.modules.findIndex(
      m => m.moduleId.toString() === moduleId.toString()
    );

    if (moduleIndex === -1) {
      throw new Error('Module not found in learning path');
    }

    if (learningPath.modules[moduleIndex].status !== 'completed') {
      learningPath.modules[moduleIndex].status = 'completed';
      learningPath.modules[moduleIndex].completedDate = new Date();
      learningPath.completedModules = (learningPath.completedModules || 0) + 1;
    }

    await learningPath.save();

    return {
      success: true,
      learningPath: learningPath,
      message: 'Module marked as completed'
    };
  } catch (error) {
    throw new Error(`Error completing module: ${error.message}`);
  }
}

/**
 * Get learning paths for a volunteer
 */
async function getVolunteerLearningPaths(volunteerId) {
  try {
    const paths = await LearningPath.find({
      volunteerId: volunteerId,
      status: 'active'
    }).populate('classGroupId', 'name').sort({ startDate: 1 });

    return paths;
  } catch (error) {
    throw new Error(`Error fetching volunteer learning paths: ${error.message}`);
  }
}

module.exports = {
  generateLearningPath,
  getLearningPath,
  completeModule,
  getVolunteerLearningPaths
};
