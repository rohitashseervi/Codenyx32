const admin = require('firebase-admin');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies Firebase token and attaches user to request
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);

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

    // Get user from database
    const user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: `Authentication failed: ${error.message}`
    });
  }
}

/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
function authorize(requiredRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
