const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const Mentor = require('../models/Mentor');
const NGOAdmin = require('../models/NGOAdmin');
const NGO = require('../models/NGO');
const { authenticate } = require('../middleware/auth');

// Simple JWT-like token generation (no external dependency)
function generateToken(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    iat: Date.now()
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const secret = process.env.JWT_SECRET || 'gapzero-secret-key-2024';
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return `${data}.${signature}`;
}

/**
 * POST /api/auth/register
 * Register new user with role
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, role, profileData } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, role'
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 4 characters'
      });
    }

    const validRoles = ['student', 'volunteer', 'mentor', 'ngo_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: password,
      displayName: displayName || email.split('@')[0],
      role: role,
      uid: email.toLowerCase(),
      createdAt: new Date()
    });

    await user.save();

    // Create role-specific profile
    let profile = null;

    switch (role) {
      case 'student': {
        const studentGrade = parseInt(profileData?.grade) || 1;
        profile = new Student({
          userId: user._id,
          email: email,
          name: displayName || email.split('@')[0],
          grade: Math.max(1, Math.min(5, studentGrade)),
          school: profileData?.school || '',
          language: profileData?.language || 'English',
          ngoId: profileData?.ngoId || null,
          weakAreas: profileData?.weakAreas || [],
          assessmentHistory: [],
          matchHistory: [],
          activityLog: [],
          badges: [],
          status: 'active',
          createdAt: new Date()
        });
        break;
      }

      case 'volunteer': {
        // Map form fields: expertise → subjects, qualifications (string) → array
        const volSubjects = profileData?.subjects
          || (profileData?.expertise ? profileData.expertise.split(',').map(s => s.trim()) : []);
        const volQualifications = profileData?.qualifications
          ? (Array.isArray(profileData.qualifications) ? profileData.qualifications : [profileData.qualifications])
          : [];
        profile = new Volunteer({
          userId: user._id,
          email: email,
          name: displayName || email.split('@')[0],
          subjects: volSubjects,
          gradeBand: profileData?.gradeBand || ['1', '2', '3', '4', '5'],
          timeSlots: profileData?.timeSlots || [],
          duration: parseInt(profileData?.availability) || profileData?.duration || 3,
          languages: profileData?.languages || ['English'],
          bio: profileData?.bio || '',
          qualifications: volQualifications,
          approved: false,
          createdAt: new Date()
        });
        break;
      }

      case 'mentor': {
        // Map form fields: expertise → expertSubjects, experience → yearsExperience
        const mentorSubjects = profileData?.expertSubjects
          || (profileData?.expertise ? profileData.expertise.split(',').map(s => s.trim()) : []);
        profile = new Mentor({
          userId: user._id,
          email: email,
          name: displayName || email.split('@')[0],
          expertSubjects: mentorSubjects,
          languagesSpoken: profileData?.languagesSpoken || ['English'],
          maxStudents: profileData?.maxStudents || 5,
          currentStudentCount: 0,
          behavioralProfile: profileData?.behavioralProfile || {},
          yearsExperience: parseInt(profileData?.experience) || 0,
          approved: false,
          createdAt: new Date()
        });
        break;
      }

      case 'ngo_admin': {
        // Auto-create an NGO for this admin
        const ngo = new NGO({
          name: profileData?.organizationName || `${displayName || email.split('@')[0]}'s NGO`,
          description: profileData?.description || 'Education-focused NGO on GapZero',
          location: profileData?.location || '',
          contactEmail: email,
          contactPhone: profileData?.contactPhone || '',
          registrationNumber: profileData?.registrationNumber || '',
          admins: [user._id],
          students: [],
          createdAt: new Date()
        });
        await ngo.save();

        profile = new NGOAdmin({
          userId: user._id,
          email: email,
          name: displayName || email.split('@')[0],
          ngoId: ngo._id,
          ngoName: ngo.name,
          role: profileData?.adminRole || 'admin',
          createdAt: new Date()
        });
        break;
      }
    }

    if (profile) {
      await profile.save();
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token: token,
      user: {
        _id: user._id,
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
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Simple password check
    if (user.password !== password && !user.validPassword(password)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
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

    const token = generateToken(user);

    res.json({
      success: true,
      token: token,
      user: {
        _id: user._id,
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
 * Get current user profile (requires auth)
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

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
        _id: user._id,
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
 * Update user profile (requires auth)
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { displayName, profileData } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (displayName) {
      user.displayName = displayName;
    }
    await user.save();

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
        _id: user._id,
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
