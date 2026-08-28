const express = require('express');
const {
  createRazorpayOrder,
  verifyPayment,
} = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

router.post('/create-order', createRazorpayOrder);
router.post('/verify-payment', verifyPayment);

module.exports = router;
