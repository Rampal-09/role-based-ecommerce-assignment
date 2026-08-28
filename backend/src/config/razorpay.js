const Razorpay = require('razorpay');

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mockSecret';

const razorpayInstance = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

module.exports = {
  razorpayInstance,
  razorpayKeyId,
  razorpayKeySecret,
};
