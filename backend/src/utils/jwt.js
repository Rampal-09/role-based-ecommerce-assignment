const jwt = require('jsonwebtoken');

/**
 * Generate JWT token and set HttpOnly cookie on response
 * @param {Object} res - Express response object
 * @param {Object} user - User object containing _id and role
 * @returns {String} token - Generated JWT token
 */
const generateTokenAndSetCookie = (res, user) => {
  const payload = {
    id: user._id,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || 'role_ecommerce_jwt_secret_dev_fallback_key';
  
  const token = jwt.sign(payload, secret, {
    expiresIn: '7d',
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };

  res.cookie('token', token, cookieOptions);

  return token;
};

/**
 * Clear authentication cookie
 * @param {Object} res - Express response object
 */
const clearAuthCookie = (res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };

  res.clearCookie('token', cookieOptions);
};

module.exports = {
  generateTokenAndSetCookie,
  clearAuthCookie,
};
