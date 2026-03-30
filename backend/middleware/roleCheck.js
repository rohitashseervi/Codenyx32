const logger = require('../utils/logger');

const ROLES = {
  NGO_ADMIN: 'ngo_admin',
  VOLUNTEER: 'volunteer',
  MENTOR: 'mentor',
  STUDENT: 'student',
};

// Check if user has specific role
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!rolesArray.includes(req.user.role)) {
        logger.warn(`Unauthorized access attempt: User ${req.user._id} with role ${req.user.role} tried to access ${req.originalUrl}`);

        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this action',
          requiredRoles: rolesArray,
          userRole: req.user.role,
        });
      }

      next();
    } catch (error) {
      logger.error('Role check error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

// Check if user is NGO admin
const isNGOAdmin = (req, res, next) => {
  return requireRole(ROLES.NGO_ADMIN)(req, res, next);
};

// Check if user is volunteer
const isVolunteer = (req, res, next) => {
  return requireRole(ROLES.VOLUNTEER)(req, res, next);
};

// Check if user is mentor
const isMentor = (req, res, next) => {
  return requireRole(ROLES.MENTOR)(req, res, next);
};

// Check if user is student
const isStudent = (req, res, next) => {
  return requireRole(ROLES.STUDENT)(req, res, next);
};

// Check if user has any admin role (NGO admin)
const isAdmin = (req, res, next) => {
  return requireRole(ROLES.NGO_ADMIN)(req, res, next);
};

// Check if user can manage resources in their NGO
const canManageNGO = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const ngoId = req.params.ngoId || req.body.ngoId || req.query.ngoId;

    if (!ngoId) {
      return res.status(400).json({
        success: false,
        message: 'NGO ID is required',
      });
    }

    // NGO admins can only manage their own NGO
    if (req.user.role === ROLES.NGO_ADMIN) {
      if (req.user.ngoId?.toString() !== ngoId.toString()) {
        logger.warn(`Unauthorized NGO access attempt: User ${req.user._id} tried to access NGO ${ngoId}`);

        return res.status(403).json({
          success: false,
          message: 'You can only manage your own NGO',
        });
      }
    }

    // Other roles need explicit permission
    if (!Object.values(ROLES).includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role',
      });
    }

    next();
  } catch (error) {
    logger.error('NGO access check error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  ROLES,
  requireRole,
  isNGOAdmin,
  isVolunteer,
  isMentor,
  isStudent,
  isAdmin,
  canManageNGO,
};
