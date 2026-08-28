const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token from HttpOnly cookie and attaches user payload to req.user
 */
const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const secret = process.env.JWT_SECRET || 'role_ecommerce_jwt_secret_dev_fallback_key';

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token.',
        });
      }

      req.user = {
        id: decoded.id,
        role: decoded.role,
      };

      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

/**
 * Role Authorization Middleware
 * Verifies if the authenticated user has one of the required roles
 * @param  {...string} roles - Allowed roles e.g. ('admin'), ('admin', 'sales')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
