/**
 * GapZero Database Seed Script
 * Creates sample NGO, students, volunteers, mentors with realistic data
 *
 * Usage: node seeds/seedData.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const NGO = require('../models/NGO');
const NGOAdmin = require('../models/NGOAdmin');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const Mentor = require('../models/Mentor');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gapzero';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // ===== 1. Find or create rohit's user =====
    let rohitUser = await User.findOne({ email: 'rohit@gmail.com' });
    if (!rohitUser) {
      rohitUser = new User({
        email: 'rohit@gmail.com',
        password: 'rohit123',
        displayName: 'Rohit',
        role: 'ngo_admin',
        uid: 'rohit@gmail.com'
      });
      await rohitUser.save();
      console.log('Created rohit user');
    } else {
      console.log('Found existing rohit user:', rohitUser._id);
    }

    // ===== 2. Create NGO for rohit =====
    let ngo = await NGO.findOne({ contactEmail: 'rohit@gmail.com' });
    if (!ngo) {
      ngo = new NGO({
        name: 'Bright Future Foundation',
        description: 'Empowering underprivileged children through quality education in grades 1-5',
        location: 'Mumbai, Maharashtra',
        contactEmail: 'rohit@gmail.com',
        contactPhone: '+91 9876543210',
        website: 'https://brightfuture.org',
        admins: [rohitUser._id],
        students: [],
        createdAt: new Date('2025-06-01')
      });
      await ngo.save();
      console.log('Created NGO:', ngo.name);
    } else {
      console.log('Found existing NGO:', ngo.name);
    }

    // ===== 3. Link NGOAdmin profile =====
    let ngoAdmin = await NGOAdmin.findOne({ userId: rohitUser._id });
    if (!ngoAdmin) {
      ngoAdmin = new NGOAdmin({
        userId: rohitUser._id,
        email: 'rohit@gmail.com',
        name: 'Rohit',
        ngoId: ngo._id,
        ngoName: ngo.name,
        role: 'admin'
      });
      await ngoAdmin.save();
    } else {
      ngoAdmin.ngoId = ngo._id;
      ngoAdmin.ngoName = ngo.name;
      await ngoAdmin.save();
    }
    console.log('NGO Admin linked, ngoId:', ngo._id);

    // ===== 4. Create Volunteer Users =====
    const volunteerData = [
      { email: 'priya.sharma@gmail.com', name: 'Priya Sharma', subjects: ['Math', 'Science'], languages: ['Hindi', 'English'], experience: 3 },
      { email: 'amit.patel@gmail.com', name: 'Amit Patel', subjects: ['English', 'Hindi'], languages: ['Hindi', 'English', 'Gujarati'], experience: 5 },
      { email: 'sneha.reddy@gmail.com', name: 'Sneha Reddy', subjects: ['Math', 'EVS'], languages: ['Telugu', 'English', 'Hindi'], experience: 2 },
      { email: 'rahul.kumar@gmail.com', name: 'Rahul Kumar', subjects: ['Science', 'Math'], languages: ['Hindi', 'English'], experience: 4 },
    ];

    const volunteers = [];
    for (const v of volunteerData) {
      let user = await User.findOne({ email: v.email });
      if (!user) {
        user = new User({ email: v.email, password: 'pass1234', displayName: v.name, role: 'volunteer', uid: v.email });
        await user.save();
      }
      let vol = await Volunteer.findOne({ userId: user._id });
      if (!vol) {
        vol = new Volunteer({
          userId: user._id,
          email: v.email,
          name: v.name,
          ngoId: ngo._id,
          subjects: v.subjects,
          gradeBand: ['1', '2', '3', '4', '5'],
          languages: v.languages,
          duration: 6,
          bio: `${v.experience} years of teaching experience`,
          qualifications: ['B.Ed'],
          approved: true,
          createdAt: new Date('2025-07-15')
        });
        await vol.save();
      }
      volunteers.push(vol);
    }
    console.log(`Created/found ${volunteers.length} volunteers`);

    // ===== 5. Create Mentor Users =====
    const mentorData = [
      { email: 'anita.desai@gmail.com', name: 'Anita Desai', subjects: ['Math', 'Science'], languages: ['Hindi', 'English'], experience: 8 },
      { email: 'vikram.singh@gmail.com', name: 'Vikram Singh', subjects: ['English', 'Hindi'], languages: ['Hindi', 'English', 'Punjabi'], experience: 6 },
      { email: 'lakshmi.iyer@gmail.com', name: 'Lakshmi Iyer', subjects: ['Math', 'EVS'], languages: ['Tamil', 'English', 'Hindi'], experience: 10 },
    ];

    const mentors = [];
    for (const m of mentorData) {
      let user = await User.findOne({ email: m.email });
      if (!user) {
        user = new User({ email: m.email, password: 'pass1234', displayName: m.name, role: 'mentor', uid: m.email });
        await user.save();
      }
      let mentor = await Mentor.findOne({ userId: user._id });
      if (!mentor) {
        mentor = new Mentor({
          userId: user._id,
          email: m.email,
          name: m.name,
          ngoId: ngo._id,
          expertSubjects: m.subjects,
          languagesSpoken: m.languages,
          maxStudents: 5,
          currentStudentCount: 0,
          yearsExperience: m.experience,
          approved: true,
          createdAt: new Date('2025-07-20')
        });
        await mentor.save();
      }
      mentors.push(mentor);
    }
    console.log(`Created/found ${mentors.length} mentors`);

    // ===== 6. Create Student Users with Assessment History =====
    const studentNames = [
      { name: 'Aarav Mehta', grade: 3, email: 'aarav@student.gz', weakAreas: ['Fractions'], language: 'Hindi' },
      { name: 'Diya Sharma', grade: 2, email: 'diya@student.gz', weakAreas: ['Spelling'], language: 'Hindi' },
      { name: 'Ishaan Gupta', grade: 4, email: 'ishaan@student.gz', weakAreas: ['Grammar'], language: 'English' },
      { name: 'Kavya Patel', grade: 1, email: 'kavya@student.gz', weakAreas: ['Numbers'], language: 'Gujarati' },
      { name: 'Rohan Reddy', grade: 5, email: 'rohan@student.gz', weakAreas: ['Division', 'Geometry'], language: 'Telugu' },
      { name: 'Ananya Das', grade: 3, email: 'ananya@student.gz', weakAreas: ['Reading Comprehension'], language: 'Hindi' },
      { name: 'Arjun Nair', grade: 2, email: 'arjun@student.gz', weakAreas: ['Addition'], language: 'English' },
      { name: 'Meera Joshi', grade: 4, email: 'meera@student.gz', weakAreas: ['Science Concepts'], language: 'Hindi' },
      { name: 'Sai Kumar', grade: 5, email: 'sai@student.gz', weakAreas: ['Essay Writing'], language: 'Telugu' },
      { name: 'Pooja Yadav', grade: 3, email: 'pooja@student.gz', weakAreas: ['Multiplication'], language: 'Hindi' },
      { name: 'Vivaan Rao', grade: 1, email: 'vivaan@student.gz', weakAreas: ['Alphabets'], language: 'English' },
      { name: 'Nisha Thakur', grade: 4, email: 'nisha@student.gz', weakAreas: ['Word Problems'], language: 'Hindi' },
      { name: 'Karan Verma', grade: 2, email: 'karan@student.gz', weakAreas: ['Subtraction'], language: 'Hindi' },
      { name: 'Tara Pandey', grade: 5, email: 'tara@student.gz', weakAreas: ['Fractions', 'Decimals'], language: 'Hindi' },
      { name: 'Aditya Bhatt', grade: 3, email: 'aditya@student.gz', weakAreas: ['Hindi Grammar'], language: 'Hindi' },
    ];

    const subjects = ['Math', 'English', 'Science', 'Hindi', 'EVS'];
    const studentIds = [];

    for (let i = 0; i < studentNames.length; i++) {
      const s = studentNames[i];
      let user = await User.findOne({ email: s.email });
      if (!user) {
        user = new User({ email: s.email, password: 'student123', displayName: s.name, role: 'student', uid: s.email });
        await user.save();
      }

      let student = await Student.findOne({ userId: user._id });
      if (!student) {
        // Generate realistic assessment history (5-12 tests over last 60 days)
        const numTests = 5 + Math.floor(Math.random() * 8);
        const assessmentHistory = [];

        for (let t = 0; t < numTests; t++) {
          const daysAgo = Math.floor(Math.random() * 60);
          const testDate = new Date();
          testDate.setDate(testDate.getDate() - daysAgo);

          const subject = subjects[Math.floor(Math.random() * subjects.length)];
          // Some students perform well, some struggle
          const baseScore = i < 5 ? 70 : i < 10 ? 55 : 40;
          const score = Math.max(15, Math.min(100, baseScore + Math.floor(Math.random() * 30) - 10));
          const masteryLevel = score >= 75 ? 'mastered' : score >= 50 ? 'developing' : 'needs_help';

          assessmentHistory.push({
            subject,
            topic: `${subject} - Unit ${t + 1}`,
            score,
            masteryLevel,
            date: testDate
          });
        }

        // Assign mentor (distribute among mentors)
        const assignedMentor = mentors[i % mentors.length];

        student = new Student({
          userId: user._id,
          email: s.email,
          name: s.name,
          grade: s.grade,
          ngoId: ngo._id,
          language: s.language,
          weakAreas: s.weakAreas,
          assessmentHistory,
          currentMentorId: assignedMentor._id,
          consistencyStreak: Math.floor(Math.random() * 15),
          lastActiveDate: new Date(),
          status: 'active',
          enrolledAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
        });
        await student.save();

        // Update mentor student count
        await Mentor.findByIdAndUpdate(assignedMentor._id, { $inc: { currentStudentCount: 1 } });
      }

      studentIds.push(student._id);
    }

    // Update NGO with student refs
    ngo.students = studentIds;
    await ngo.save();

    console.log(`Created/found ${studentIds.length} students`);

    // ===== Summary =====
    console.log('\n===== SEED COMPLETE =====');
    console.log(`NGO: ${ngo.name} (ID: ${ngo._id})`);
    console.log(`Admin: rohit@gmail.com (password: rohit123)`);
    console.log(`Volunteers: ${volunteers.length}`);
    console.log(`Mentors: ${mentors.length}`);
    console.log(`Students: ${studentIds.length}`);
    console.log(`\nLogin at the app with rohit@gmail.com / rohit123`);
    console.log('=========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
