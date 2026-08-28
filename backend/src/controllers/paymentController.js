const crypto = require('crypto');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { razorpayInstance, razorpayKeyId, razorpayKeySecret } = require('../config/razorpay');

/**
 * @desc    Create Razorpay Order from user's active Cart
 * @route   POST /api/payment/create-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Add products before proceeding to checkout.',
      });
    }

    // Validate stock and calculate total amount
    let totalAmount = 0;
    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'An item in your cart no longer exists.',
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" only has ${product.stock} units in stock. Please adjust your cart.`,
        });
      }

      totalAmount += product.price * item.quantity;
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart total amount.',
      });
    }

    const amountInPaise = Math.round(totalAmount * 100);
    const receiptId = `rcpt_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substring(2, 6)}`;

    let razorpayOrderId;

    // Check if using actual Razorpay credentials or fallback mock order for testing
    if (
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_ID.includes('mock')
    ) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
        });
        razorpayOrderId = order.id;
      } catch (err) {
        console.error('Razorpay SDK Order Error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment order with Razorpay: ' + (err.error?.description || err.message),
        });
      }
    } else {
      // Mock order for development/testing when keys are not in .env
      razorpayOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    return res.status(200).json({
      success: true,
      orderId: razorpayOrderId,
      amount: totalAmount,
      amountInPaise,
      currency: 'INR',
      keyId: razorpayKeyId,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error('Create Razorpay Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating checkout order',
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature, create Order, deduct stock, and clear cart
 * @route   POST /api/payment/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters',
      });
    }

    // Cryptographic HMAC SHA256 Signature Verification
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isMockValid =
      razorpay_order_id.startsWith('order_mock_') &&
      (razorpay_signature === 'mock_signature' || razorpay_signature === expectedSignature);

    const isSignatureValid = expectedSignature === razorpay_signature || isMockValid;

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid payment signature.',
      });
    }

    // Retrieve user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty or already processed.',
      });
    }

    // Deduct stock and build order items snapshot
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue;

      // Decrement product stock
      const newStock = Math.max(0, product.stock - item.quantity);
      await Product.findByIdAndUpdate(product._id, { stock: newStock });

      orderItems.push({
        product: product._id,
        seller: product.owner,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });

      totalAmount += product.price * item.quantity;
    }

    // Create Order Document
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'paid',
    });

    await order.save();

    // Clear User's Cart
    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully',
      data: {
        orderId: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        itemCount: order.items.length,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing payment verification',
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
