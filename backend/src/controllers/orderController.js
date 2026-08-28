const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * @desc    Get authenticated user's personal order history
 * @route   GET /api/orders/my-orders
 * @access  Private (All authenticated users)
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get My Orders Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving personal order history',
    });
  }
};

/**
 * @desc    Get Sales Person dashboard data (seller metrics, filtered orders, owned products)
 * @route   GET /api/orders/seller-dashboard
 * @access  Private (Sales Person, Admin)
 */
const getSellerDashboardData = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Find orders that contain at least one product sold by this seller
    const rawOrders = await Order.find({ 'items.seller': sellerId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Fetch products listed by this seller
    const myProducts = await Product.find({ owner: sellerId }).sort({ createdAt: -1 });

    let sellerRevenue = 0;
    let sellerUnitsSold = 0;

    // Process orders to extract seller-specific line items and metrics
    const sellerOrders = rawOrders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.seller && item.seller.toString() === sellerId.toString()
      );

      const orderSubtotalForSeller = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (order.status === 'paid') {
        sellerRevenue += orderSubtotalForSeller;
        sellerUnitsSold += sellerItems.reduce((sum, item) => sum + item.quantity, 0);
      }

      return {
        _id: order._id,
        orderDate: order.createdAt,
        status: order.status,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        buyer: order.user
          ? { name: order.user.name, email: order.user.email }
          : { name: 'Customer', email: 'N/A' },
        sellerItems,
        sellerSubtotal: orderSubtotalForSeller,
        grandTotal: order.totalAmount,
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        sellerRevenue,
        sellerUnitsSold,
        ordersCount: sellerOrders.length,
        productsCount: myProducts.length,
      },
      orders: sellerOrders,
      myProducts,
    });
  } catch (error) {
    console.error('Get Seller Dashboard Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving sales dashboard data',
    });
  }
};

/**
 * @desc    Get Admin dashboard analytics (store-wide revenue, orders, products, users)
 * @route   GET /api/orders/admin-dashboard
 * @access  Private (Admin only)
 */
const getAdminDashboardData = async (req, res) => {
  try {
    // 1. Total Store Revenue from paid orders
    const revenueAggregate = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0;

    // 2. Total Counts
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // 3. User distribution by role
    const adminCount = await User.countDocuments({ role: 'admin' });
    const salesCount = await User.countDocuments({ role: 'sales' });
    const userCount = await User.countDocuments({ role: 'user' });

    // 4. All Store Orders (recent first)
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        usersByRole: {
          admin: adminCount,
          sales: salesCount,
          user: userCount,
        },
      },
      orders,
    });
  } catch (error) {
    console.error('Get Admin Dashboard Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving admin dashboard statistics',
    });
  }
};

/**
 * @desc    Get all registered users list for Admin
 * @route   GET /api/orders/admin/users
 * @access  Private (Admin only)
 */
const getAdminUsersList = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get Admin Users Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving users directory',
    });
  }
};

module.exports = {
  getMyOrders,
  getSellerDashboardData,
  getAdminDashboardData,
  getAdminUsersList,
};
