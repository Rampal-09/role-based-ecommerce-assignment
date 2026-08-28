const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin only route
router.get('/admin', authenticate, authorizeRoles('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Admin! Access granted to admin protected route.',
    user: req.user,
  });
});

// Admin & Sales route
router.get('/sales', authenticate, authorizeRoles('admin', 'sales'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome Staff! Access granted to sales protected route.',
    user: req.user,
  });
});

// User (customer) route
router.get('/user', authenticate, authorizeRoles('user'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome User! Access granted to customer protected route.',
    user: req.user,
  });
});

module.exports = router;
