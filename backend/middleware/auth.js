const crypto = require('crypto');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies token and attaches user to request
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

    // Decode and verify token
    let payload;
    try {
      const [data, signature] = token.split('.');
      const secret = process.env.JWT_SECRET || 'gapzero-secret-key-2024';
      const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('hex');

      if (signature !== expectedSig) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      payload = JSON.parse(Buffer.from(data, 'base64').toString());
    } catch (decodeErr) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
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
