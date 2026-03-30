const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const User = require('../models/User');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const Mentor = require('../models/Mentor');
const NGOAdmin = require('../models/NGOAdmin');

/**
 * POST /api/auth/register
 * Register new user with role
 */
router.post('/register', async (req, res) => {
  try {
    const { uid, email, displayName, role, profileData } = req.body;

    // Validate required fields
    if (!uid || !email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: uid, email, role'
      });
    }

    // Validate role
    const validRoles = ['student', 'volunteer', 'mentor', 'ngo_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ uid: uid });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create base user document
    const user = new User({
      uid: uid,
      email: email,
      displayName: displayName || email.split('@')[0],
      role: role,
      createdAt: new Date()
    });

    await user.save();

    // Create role-specific profile
    let profile = null;

    switch (role) {
      case 'student':
        profile = new Student({
          userId: user._id,
          email: email,
          name: displayName || email.split('@')[0],
          grade: profileData?.grade,
          language: profileData?.language || 'English',
          weakAreas: profileData?.weakAreas || [],
          assessmentHistory: [],
          matchHistory: [],
          activityLog: [],
          badges: [],
          createdAt: new Date()
        });
        break;

      case 'volunteer':
        profile = new Volunteer({
          userId: user._id,
          email: email,
          name: displayName || email.split('@')[0],
          subjects: profileData?.subjects || [],
          gradeBand: profileData?.gradeBand || [],
          timeSlots: profileData?.timeSlots || [],
          duration: profileData?.duration || 3,
          languages: profileData?.languages || ['English'],
          bio: profileData?.bio || '',
          qualifications: profileData?.qualifications || [],
          createdAt: new Date()
        });
        break;

      case 'mentor':
        profile = new Mentor({
          userId: user._id,
          email: email,
          name: displayName || email.split('@')[0],
          expertSubjects: profileData?.expertSubjects || [],
          languagesSpoken: profileData?.languagesSpoken || ['English'],
          maxStudents: profileData?.maxStudents || 5,
          currentStudentCount: 0,
          behavioralProfile: profileData?.behavioralProfile || {},
          yearsExperience: profileData?.yearsExperience || 0,
          createdAt: new Date()
        });
        break;

      case 'ngo_admin':
        profile = new NGOAdmin({
          userId: user._id,
          email: email,
          name: displayName || email.split('@')[0],
          ngoId: profileData?.ngoId || null,
          role: profileData?.adminRole || 'coordinator',
          createdAt: new Date()
        });
        break;
    }

    if (profile) {
      await profile.save();
    }

    res.status(201).json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        profile: profile
      },
      message: `${role} registered successfully`
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: `Registration failed: ${error.message}`
    });
  }
});

/**
 * POST /api/auth/login
 * Verify Firebase token and return user data
 */
router.post('/login', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Firebase token is required'
      });
    }

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (authError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Find or create user
    let user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      // Create user if doesn't exist
      user = new User({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email.split('@')[0],
        role: 'student', // Default role
        createdAt: new Date()
      });
      await user.save();
    }

    // Fetch role-specific profile
    let profile = null;
    switch (user.role) {
      case 'student':
        profile = await Student.findOne({ userId: user._id });
        break;
      case 'volunteer':
        profile = await Volunteer.findOne({ userId: user._id });
        break;
      case 'mentor':
        profile = await Mentor.findOne({ userId: user._id });
        break;
      case 'ngo_admin':
        profile = await NGOAdmin.findOne({ userId: user._id });
        break;
    }

    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        profile: profile
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: `Login failed: ${error.message}`
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', async (req, res) => {
  try {
    // Assumes middleware has set req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Fetch role-specific profile
    let profile = null;
    switch (user.role) {
      case 'student':
        profile = await Student.findOne({ userId: user._id });
        break;
      case 'volunteer':
        profile = await Volunteer.findOne({ userId: user._id });
        break;
      case 'mentor':
        profile = await Mentor.findOne({ userId: user._id });
        break;
      case 'ngo_admin':
        profile = await NGOAdmin.findOne({ userId: user._id });
        break;
    }

    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        profile: profile
      }
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch user: ${error.message}`
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const { displayName, profileData } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user base info
    if (displayName) {
      user.displayName = displayName;
    }
    await user.save();

    // Update role-specific profile
    let profile = null;
    switch (user.role) {
      case 'student':
        profile = await Student.findOne({ userId: user._id });
        if (profile && profileData) {
          Object.assign(profile, profileData);
          await profile.save();
        }
        break;
      case 'volunteer':
        profile = await Volunteer.findOne({ userId: user._id });
        if (profile && profileData) {
          Object.assign(profile, profileData);
          await profile.save();
        }
        break;
      case 'mentor':
        profile = await Mentor.findOne({ userId: user._id });
        if (profile && profileData) {
          Object.assign(profile, profileData);
          await profile.save();
        }
        break;
      case 'ngo_admin':
        profile = await NGOAdmin.findOne({ userId: user._id });
        if (profile && profileData) {
          Object.assign(profile, profileData);
          await profile.save();
        }
        break;
    }

    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        profile: profile
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: `Failed to update profile: ${error.message}`
    });
  }
});

module.exports = router;
