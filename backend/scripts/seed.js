const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const User = require('../models/User');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');
const NGOAdmin = require('../models/NGOAdmin');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Mentor.deleteMany({}),
      Volunteer.deleteMany({}),
      NGO.deleteMany({}),
      NGOAdmin.deleteMany({}),
    ]);
    console.log('Cleared existing data.');

    // 1. Create a sample NGO
    const ngo = await NGO.create({
      name: 'Future BrighterFoundation',
      email: 'contact@futurebright.org',
      address: '123 Education Lane, Mumbai',
      description: 'Dedicated to providing quality education to underprivileged children.',
      website: 'https://futurebright.org',
      contactPerson: 'Arjun Gupta',
      phone: '+91 98765 43210',
    });
    console.log('Created NGO.');

    // 2. Create Users
    const users = await User.insertMany([
      {
        uid: 'demo_ngo_admin_1',
        email: 'admin@futurebright.org',
        displayName: 'Arjun Gupta',
        role: 'ngo_admin'
      },
      {
        uid: 'demo_mentor_1',
        email: 'mentor1@gmail.com',
        displayName: 'Sarah Wilson',
        role: 'mentor'
      },
      {
        uid: 'demo_volunteer_1',
        email: 'volunteer1@gmail.com',
        displayName: 'John Doe',
        role: 'volunteer'
      },
      {
        uid: 'demo_student_1',
        email: 'student1@gmail.com',
        displayName: 'Rahul Kumar',
        role: 'student'
      }
    ]);
    console.log('Created Users.');

    // 3. Create NGO Admin Profile
    await NGOAdmin.create({
      userId: users[0]._id,
      email: users[0].email,
      name: users[0].displayName,
      ngoId: ngo._id,
      role: 'admin'
    });

    // 4. Create Mentor Profile
    const mentor = await Mentor.create({
      userId: users[1]._id,
      email: users[1].email,
      name: users[1].displayName,
      ngoId: ngo._id,
      expertSubjects: ['Mathematics', 'Science'],
      yearsExperience: 5,
      maxStudents: 5,
      currentStudentCount: 1,
      approved: true
    });

    // 5. Create Volunteer Profile
    const volunteer = await Volunteer.create({
      userId: users[2]._id,
      email: users[2].email,
      name: users[2].displayName,
      ngoId: ngo._id,
      subjects: ['English', 'Art'],
      gradeBand: ['Elementary', 'Middle School'],
      approved: true
    });

    const LearningPath = require('../models/LearningPath');
    const learningPath = await LearningPath.create({
      volunteerId: volunteer._id,
      subject: 'English',
      grade: 'Middle School',
      totalModules: 4,
      completedModules: 1,
      status: 'in-progress',
      modules: [
        {
          moduleName: 'Introduction to Grammar',
          moduleDuration: 2,
          scheduledDate: new Date('2024-03-01'),
          status: 'completed',
          completedDate: new Date('2024-03-02')
        },
        {
          moduleName: 'Sentence Structure & Tenses',
          moduleDuration: 3,
          scheduledDate: new Date('2024-03-15'),
          status: 'in-progress'
        },
        {
          moduleName: 'Vocabulary Building',
          moduleDuration: 2,
          scheduledDate: new Date('2024-04-01'),
          status: 'upcoming'
        },
        {
          moduleName: 'Creative Writing Basics',
          moduleDuration: 4,
          scheduledDate: new Date('2024-04-15'),
          status: 'upcoming'
        }
      ],
      createdAt: new Date()
    });

    volunteer.learningPath = learningPath._id;
    await volunteer.save();

    // 6. Create Student Profile
    // ... rest of student logic
    await Student.create({
      userId: users[3]._id,
      email: users[3].email,
      name: users[3].displayName,
      ngoId: ngo._id,
      grade: '8th Grade',
      currentMentorId: mentor._id,
      weakAreas: ['Algebra', 'Grammar'],
      assessmentHistory: [
        { subject: 'Mathematics', topic: 'Fractions', score: 75, date: new Date('2024-03-01') },
        { subject: 'Science', topic: 'Plant Cells', score: 88, date: new Date('2024-03-10') },
        { subject: 'Mathematics', topic: 'Linear Equations', score: 62, date: new Date('2024-03-20') }
      ],
      badges: [
        { name: 'Quick Starter', earnedAt: new Date() }
      ]
    });

    console.log('Seeding complete! App is now full of demo data.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
