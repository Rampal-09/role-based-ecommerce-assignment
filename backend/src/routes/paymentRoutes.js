const express = require('express');
const {
  createRazorpayOrder,
  verifyPayment,
} = require('../controllers/paymentController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Payment and checkout operations are strictly customer-only permissions
router.use(authenticate);
router.use(authorizeRoles('user'));

router.post('/create-order', createRazorpayOrder);
router.post('/verify-payment', verifyPayment);

module.exports = router;
