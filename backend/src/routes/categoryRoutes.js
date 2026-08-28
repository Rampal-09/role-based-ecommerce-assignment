const express = require('express');
const {
  getCategories,
  createCategory,
} = require('../controllers/categoryController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public endpoint to retrieve all available categories
router.get('/', getCategories);

// Protected endpoint for Admin and Sales to create categories
router.post('/', authenticate, authorizeRoles('admin', 'sales'), createCategory);

module.exports = router;
