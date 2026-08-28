const express = require('express');
const {
  getMyOrders,
  getSellerDashboardData,
  getAdminDashboardData,
  getAdminUsersList,
} = require('../controllers/orderController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// 1. Customer personal order history
router.get('/my-orders', getMyOrders);

// 2. Sales person dashboard (seller orders and revenue)
router.get('/seller-dashboard', authorizeRoles('sales', 'admin'), getSellerDashboardData);

// 3. Admin store-wide analytics and all orders
router.get('/admin-dashboard', authorizeRoles('admin'), getAdminDashboardData);

// 4. Admin user directory
router.get('/admin/users', authorizeRoles('admin'), getAdminUsersList);

module.exports = router;
