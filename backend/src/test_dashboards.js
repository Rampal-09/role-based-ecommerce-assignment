require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('./server');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const TEST_PORT = 5098;

const request = ({ method, path, body, cookie }) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData);
    if (cookie) headers['Cookie'] = cookie;

    const req = http.request(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(responseBody);
          } catch (e) {
            json = { raw: responseBody };
          }
          resolve({
            status: res.statusCode,
            cookies: res.headers['set-cookie'],
            data: json,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
};

const extractTokenCookie = (cookieHeaders) => {
  if (!cookieHeaders) return null;
  const cookieStr = Array.isArray(cookieHeaders) ? cookieHeaders.join('; ') : cookieHeaders;
  const match = cookieStr.match(/token=[^;]+/);
  return match ? match[0] : null;
};

const runDashboardTests = async () => {
  console.log('\n=============================================');
  console.log('STARTING TASK 8 DASHBOARDS & ORDER HISTORY VERIFICATION SUITE');
  console.log('=============================================\n');

  const server = app.listen(TEST_PORT, () => {
    console.log(`Test server running on port ${TEST_PORT}`);
  });

  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/role_ecommerce_db';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
  }

  // Cleanup
  await User.deleteMany({
    email: { $in: ['dash_user_a@example.com', 'dash_sales@example.com', 'dash_admin@example.com'] },
  });
  await Product.deleteMany({ name: 'Dash Test Seller Watch' });

  let testsPassed = 0;
  let testsFailed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      testsPassed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - ${details}`);
      testsFailed++;
    }
  };

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('password123', salt);

    const userBuyer = await User.create({
      name: 'Customer Buyer',
      email: 'dash_user_a@example.com',
      password: hashedPass,
      role: 'user',
    });

    const salesSeller = await User.create({
      name: 'Sales Merchant',
      email: 'dash_sales@example.com',
      password: hashedPass,
      role: 'sales',
    });

    const adminUser = await User.create({
      name: 'Admin Superuser',
      email: 'dash_admin@example.com',
      password: hashedPass,
      role: 'admin',
    });

    const sellerProduct = await Product.create({
      name: 'Dash Test Seller Watch',
      description: 'Luxury chronograph',
      price: 2000,
      category: 'Electronics',
      stock: 15,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      owner: salesSeller._id,
    });

    // Create a sample paid order placed by userBuyer containing salesSeller's product
    const order1 = await Order.create({
      user: userBuyer._id,
      items: [
        {
          product: sellerProduct._id,
          seller: salesSeller._id,
          name: 'Dash Test Seller Watch',
          price: 2000,
          quantity: 2,
        },
      ],
      totalAmount: 4000,
      razorpayOrderId: 'order_dash_test_1',
      razorpayPaymentId: 'pay_dash_test_1',
      status: 'paid',
    });

    // Log in all 3 users
    const loginBuyer = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'dash_user_a@example.com', password: 'password123' },
    });
    const cookieBuyer = extractTokenCookie(loginBuyer.cookies);

    const loginSales = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'dash_sales@example.com', password: 'password123' },
    });
    const cookieSales = extractTokenCookie(loginSales.cookies);

    const loginAdmin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'dash_admin@example.com', password: 'password123' },
    });
    const cookieAdmin = extractTokenCookie(loginAdmin.cookies);

    // -----------------------------------------------------------------
    // 1. Customer (User) Orders
    // -----------------------------------------------------------------
    console.log('\n--- 1. Customer Order History ---');

    const buyerOrders = await request({
      method: 'GET',
      path: '/api/orders/my-orders',
      cookie: cookieBuyer,
    });
    assert(buyerOrders.status === 200, 'GET /api/orders/my-orders returns 200 OK for Customer', `Got ${buyerOrders.status}`);
    assert(buyerOrders.data.count === 1, 'Customer sees exactly their 1 placed order', `Count: ${buyerOrders.data.count}`);
    assert(buyerOrders.data.data[0].totalAmount === 4000, 'Order total is ₹4,000', `Total: ${buyerOrders.data.data[0].totalAmount}`);

    // Customer forbidden from seller dashboard
    const buyerSalesAccess = await request({
      method: 'GET',
      path: '/api/orders/seller-dashboard',
      cookie: cookieBuyer,
    });
    assert(buyerSalesAccess.status === 403, 'Customer blocked from Sales Dashboard (403 Forbidden)', `Got ${buyerSalesAccess.status}`);

    // Customer forbidden from admin dashboard
    const buyerAdminAccess = await request({
      method: 'GET',
      path: '/api/orders/admin-dashboard',
      cookie: cookieBuyer,
    });
    assert(buyerAdminAccess.status === 403, 'Customer blocked from Admin Dashboard (403 Forbidden)', `Got ${buyerAdminAccess.status}`);

    // -----------------------------------------------------------------
    // 2. Sales Person Dashboard
    // -----------------------------------------------------------------
    console.log('\n--- 2. Sales Person Dashboard & Metrics ---');

    const sellerDash = await request({
      method: 'GET',
      path: '/api/orders/seller-dashboard',
      cookie: cookieSales,
    });
    assert(sellerDash.status === 200, 'GET /api/orders/seller-dashboard returns 200 OK for Sales Person', `Got ${sellerDash.status}`);
    assert(sellerDash.data.stats?.sellerRevenue === 4000, 'Calculated seller revenue = ₹4,000 (2 × ₹2,000)', `Rev: ${sellerDash.data.stats?.sellerRevenue}`);
    assert(sellerDash.data.stats?.sellerUnitsSold === 2, 'Calculated units sold = 2', `Units: ${sellerDash.data.stats?.sellerUnitsSold}`);
    assert(sellerDash.data.stats?.productsCount >= 1, 'Includes active listed products count', `Products: ${sellerDash.data.stats?.productsCount}`);
    assert(sellerDash.data.orders?.length === 1, 'Includes incoming customer orders list', `Orders: ${sellerDash.data.orders?.length}`);

    // Sales person forbidden from admin dashboard
    const salesAdminAccess = await request({
      method: 'GET',
      path: '/api/orders/admin-dashboard',
      cookie: cookieSales,
    });
    assert(salesAdminAccess.status === 403, 'Sales Person blocked from Admin Dashboard (403 Forbidden)', `Got ${salesAdminAccess.status}`);

    // -----------------------------------------------------------------
    // 3. Admin Dashboard & User Management
    // -----------------------------------------------------------------
    console.log('\n--- 3. Admin Dashboard & Superuser Analytics ---');

    const adminDash = await request({
      method: 'GET',
      path: '/api/orders/admin-dashboard',
      cookie: cookieAdmin,
    });
    assert(adminDash.status === 200, 'GET /api/orders/admin-dashboard returns 200 OK for Admin', `Got ${adminDash.status}`);
    assert(adminDash.data.stats?.totalRevenue >= 4000, 'Admin receives store-wide total revenue', `TotalRev: ${adminDash.data.stats?.totalRevenue}`);
    assert(adminDash.data.stats?.totalOrders >= 1, 'Admin receives total orders count', `Orders: ${adminDash.data.stats?.totalOrders}`);
    assert(adminDash.data.stats?.totalUsers >= 3, 'Admin receives total registered users count', `Users: ${adminDash.data.stats?.totalUsers}`);
    assert(Boolean(adminDash.data.stats?.usersByRole), 'Admin receives role distribution breakdown', `Roles: ${JSON.stringify(adminDash.data.stats?.usersByRole)}`);

    const adminUsers = await request({
      method: 'GET',
      path: '/api/orders/admin/users',
      cookie: cookieAdmin,
    });
    assert(adminUsers.status === 200, 'GET /api/orders/admin/users returns 200 OK', `Got ${adminUsers.status}`);
    assert(adminUsers.data.count >= 3, 'Admin retrieves full user directory', `UsersCount: ${adminUsers.data.count}`);

    console.log('\n=============================================');
    console.log(`DASHBOARD TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log('=============================================\n');

    // Cleanup
    await User.deleteMany({
      email: { $in: ['dash_user_a@example.com', 'dash_sales@example.com', 'dash_admin@example.com'] },
    });
    await Product.deleteMany({ name: 'Dash Test Seller Watch' });
    await Order.deleteMany({ _id: order1._id });

    server.close(() => {
      mongoose.disconnect().then(() => {
        process.exit(testsFailed > 0 ? 1 : 0);
      });
    });
  } catch (err) {
    console.error('Fatal Dashboard Test Error:', err);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runDashboardTests();
