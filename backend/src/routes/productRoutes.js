const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadProductImage } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public Routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected Routes (Admin & Sales)
router.post('/', authenticate, authorizeRoles('admin', 'sales'), uploadProductImage, createProduct);
router.put('/:id', authenticate, authorizeRoles('admin', 'sales'), uploadProductImage, updateProduct);
router.delete('/:id', authenticate, authorizeRoles('admin', 'sales'), deleteProduct);

module.exports = router;
