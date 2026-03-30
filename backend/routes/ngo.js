const express = require('express');
const router = express.Router();
const NGO = require('../models/NGO');
const Student = require('../models/Student');
const Volunteer = require('../models/Volunteer');
const Mentor = require('../models/Mentor');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * POST /api/ngo
 * Create NGO (ngo_admin role)
 */
router.post('/', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const { name, description, location, contactEmail, contactPhone, website } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, location'
      });
    }

    const ngo = new NGO({
      name: name,
      description: description || '',
      location: location,
      contactEmail: contactEmail || req.user.email,
      contactPhone: contactPhone || '',
      website: website || '',
      admins: [req.user.userId],
      createdAt: new Date()
    });

    await ngo.save();

    res.status(201).json({
      success: true,
      ngo: ngo,
      message: 'NGO created successfully'
    });
  } catch (error) {
    console.error('Error creating NGO:', error);
    res.status(500).json({
      success: false,
      error: `Failed to create NGO: ${error.message}`
    });
  }
});

/**
 * GET /api/ngo/:id
 * Get NGO details
 */
router.get('/:id', async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    res.json({
      success: true,
      ngo: ngo
    });
  } catch (error) {
    console.error('Error fetching NGO:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch NGO: ${error.message}`
    });
  }
});

/**
 * PUT /api/ngo/:id
 * Update NGO (ngo_admin role)
 */
router.put('/:id', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);

    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    // Check authorization
    if (!ngo.admins.includes(req.user.userId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this NGO'
      });
    }

    const { name, description, location, contactEmail, contactPhone, website } = req.body;

    if (name) ngo.name = name;
    if (description) ngo.description = description;
    if (location) ngo.location = location;
    if (contactEmail) ngo.contactEmail = contactEmail;
    if (contactPhone) ngo.contactPhone = contactPhone;
    if (website) ngo.website = website;

    await ngo.save();

    res.json({
      success: true,
      ngo: ngo,
      message: 'NGO updated successfully'
    });
  } catch (error) {
    console.error('Error updating NGO:', error);
    res.status(500).json({
      success: false,
      error: `Failed to update NGO: ${error.message}`
    });
  }
});

/**
 * GET /api/ngo
 * List all NGOs (public)
 */
router.get('/', async (req, res) => {
  try {
    const ngos = await NGO.find().select('-admins').sort({ createdAt: -1 });

    res.json({
      success: true,
      ngos: ngos,
      total: ngos.length
    });
  } catch (error) {
    console.error('Error fetching NGOs:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch NGOs: ${error.message}`
    });
  }
});

/**
 * POST /api/ngo/:id/students
 * Enroll single student with baseline
 */
router.post('/:id/students', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    const { name, email, grade, weakAreas, baseline } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email'
      });
    }

    const student = new Student({
      name: name,
      email: email,
      grade: grade || '',
      ngoId: ngo._id,
      weakAreas: weakAreas || [],
      baseline: baseline || {},
      assessmentHistory: [],
      activityLog: [],
      badges: [],
      enrolledAt: new Date()
    });

    await student.save();

    // Add student to NGO
    if (!ngo.students) {
      ngo.students = [];
    }
    ngo.students.push(student._id);
    await ngo.save();

    res.status(201).json({
      success: true,
      student: student,
      message: 'Student enrolled successfully'
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({
      success: false,
      error: `Failed to enroll student: ${error.message}`
    });
  }
});

/**
 * POST /api/ngo/:id/students/bulk
 * Bulk enroll students
 */
router.post('/:id/students/bulk', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Students array is required and must not be empty'
      });
    }

    const enrolledStudents = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      try {
        const { name, email, grade, weakAreas, baseline } = students[i];
        if (!name || !email) {
          errors.push({ index: i, error: 'Missing name or email' });
          continue;
        }

        const student = new Student({
          name: name,
          email: email,
          grade: grade || '',
          ngoId: ngo._id,
          weakAreas: weakAreas || [],
          baseline: baseline || {},
          assessmentHistory: [],
          activityLog: [],
          badges: [],
          enrolledAt: new Date()
        });

        await student.save();
        enrolledStudents.push(student);

        if (!ngo.students) {
          ngo.students = [];
        }
        ngo.students.push(student._id);
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    await ngo.save();

    res.status(201).json({
      success: enrolledStudents.length > 0,
      enrolledStudents: enrolledStudents,
      enrolledCount: enrolledStudents.length,
      errors: errors,
      message: `${enrolledStudents.length} students enrolled, ${errors.length} failed`
    });
  } catch (error) {
    console.error('Error bulk enrolling students:', error);
    res.status(500).json({
      success: false,
      error: `Failed to bulk enroll students: ${error.message}`
    });
  }
});

/**
 * GET /api/ngo/:id/students
 * List all students in NGO
 */
router.get('/:id/students', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const students = await Student.find({ ngoId: req.params.id }).sort({ enrolledAt: -1 });

    res.json({
      success: true,
      students: students,
      total: students.length
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
 * GET /api/ngo/:id/volunteers
 * List volunteers (pending + approved)
 */
router.get('/:id/volunteers', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ ngoId: req.params.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      volunteers: volunteers,
      total: volunteers.length
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
 * GET /api/ngo/:id/mentors
 * List mentors (pending + approved)
 */
router.get('/:id/mentors', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const mentors = await Mentor.find({ ngoId: req.params.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      mentors: mentors,
      total: mentors.length
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
 * PUT /api/ngo/:id/approve/:userId
 * Approve volunteer/mentor
 */
router.put('/:id/approve/:userId', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    // Try to find as volunteer first, then mentor
    let volunteer = await Volunteer.findOne({ userId: req.params.userId, ngoId: req.params.id });
    if (volunteer) {
      volunteer.approved = true;
      await volunteer.save();
      return res.json({
        success: true,
        message: 'Volunteer approved successfully',
        type: 'volunteer'
      });
    }

    let mentor = await Mentor.findOne({ userId: req.params.userId, ngoId: req.params.id });
    if (mentor) {
      mentor.approved = true;
      await mentor.save();
      return res.json({
        success: true,
        message: 'Mentor approved successfully',
        type: 'mentor'
      });
    }

    res.status(404).json({
      success: false,
      error: 'User not found in NGO'
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      error: `Failed to approve user: ${error.message}`
    });
  }
});

/**
 * PUT /api/ngo/:id/reject/:userId
 * Reject volunteer/mentor
 */
router.put('/:id/reject/:userId', authenticate, authorize(['ngo_admin']), async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: 'NGO not found'
      });
    }

    // Try to find as volunteer first, then mentor
    let volunteer = await Volunteer.findOne({ userId: req.params.userId, ngoId: req.params.id });
    if (volunteer) {
      volunteer.approved = false;
      await volunteer.save();
      return res.json({
        success: true,
        message: 'Volunteer rejected',
        type: 'volunteer'
      });
    }

    let mentor = await Mentor.findOne({ userId: req.params.userId, ngoId: req.params.id });
    if (mentor) {
      mentor.approved = false;
      await mentor.save();
      return res.json({
        success: true,
        message: 'Mentor rejected',
        type: 'mentor'
      });
    }

    res.status(404).json({
      success: false,
      error: 'User not found in NGO'
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({
      success: false,
      error: `Failed to reject user: ${error.message}`
    });
  }
});

module.exports = router;
