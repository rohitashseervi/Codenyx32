const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Resource = require('../models/Resource');
const Message = require('../models/Message');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/communication/notifications
 * Get all notifications for current user
 */
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipientId: req.user.dbId, // Assuming dbId is attached in authenticate middleware
    }).sort({ createdAt: -1 }).limit(20);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/communication/notifications/:id/read
 * Mark notification as read
 */
router.post('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.dbId },
      { read: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/communication/resources
 * Get resources relevant to the user
 */
router.get('/resources', authenticate, async (req, res) => {
  try {
    // Basic logic: filter by NGO
    const resources = await Resource.find({
      ngoId: req.user.ngoId,
    }).sort({ createdAt: -1 });

    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/communication/resources
 * Upload a resource (Volunteers/NGOAdmin only)
 */
router.post('/resources', authenticate, async (req, res) => {
  try {
    if (!['volunteer', 'ngo_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { title, description, type, url, subject, grade, visibility, classGroupId } = req.body;
    
    const resource = new Resource({
      title,
      description,
      type,
      url,
      uploadedBy: req.user.dbId,
      ngoId: req.user.ngoId,
      subject,
      grade,
      visibility,
      classGroupId
    });

    await resource.save();
    res.json({ success: true, resource });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
