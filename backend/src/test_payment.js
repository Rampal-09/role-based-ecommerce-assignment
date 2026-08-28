require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const app = require('./server');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const { razorpayKeySecret } = require('./config/razorpay');

const TEST_PORT = 5097;

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

const runPaymentTests = async () => {
  console.log('\n=============================================');
  console.log('STARTING TASK 7 RAZORPAY CHECKOUT & PAYMENT VERIFICATION SUITE');
  console.log('=============================================\n');

  const server = app.listen(TEST_PORT, () => {
    console.log(`Test server running on port ${TEST_PORT}`);
  });

  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/role_ecommerce_db';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
  }

  // Cleanup
  await User.deleteMany({ email: 'payment_buyer@example.com' });
  await Product.deleteMany({ name: 'Checkout Test Laptop' });

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

    const buyer = await User.create({
      name: 'Buyer User',
      email: 'payment_buyer@example.com',
      password: hashedPass,
      role: 'user',
    });

    const product = await Product.create({
      name: 'Checkout Test Laptop',
      description: 'High performance laptop',
      price: 50000,
      category: 'Electronics',
      stock: 10,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
      owner: buyer._id,
    });

    await Cart.deleteMany({ user: buyer._id });
    await Order.deleteMany({ user: buyer._id });

    // Log in buyer
    const loginRes = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'payment_buyer@example.com', password: 'password123' },
    });
    const cookie = extractTokenCookie(loginRes.cookies);

    // 1. Unauthenticated access
    const unauthOrder = await request({ method: 'POST', path: '/api/payment/create-order' });
    assert(unauthOrder.status === 401, 'POST /api/payment/create-order unauthenticated returns 401', `Got ${unauthOrder.status}`);

    const unauthVerify = await request({
      method: 'POST',
      path: '/api/payment/verify-payment',
      body: { razorpay_order_id: '123', razorpay_payment_id: '456', razorpay_signature: '789' },
    });
    assert(unauthVerify.status === 401, 'POST /api/payment/verify-payment unauthenticated returns 401', `Got ${unauthVerify.status}`);

    // 2. Empty cart checkout attempt
    const emptyOrder = await request({
      method: 'POST',
      path: '/api/payment/create-order',
      cookie,
    });
    assert(emptyOrder.status === 400, 'Checkout with empty cart returns 400 Bad Request', `Got ${emptyOrder.status}`);

    // 3. Add 2 units of Laptop to Cart (Total = 100,000)
    await request({
      method: 'POST',
      path: '/api/cart',
      cookie,
      body: { productId: product._id.toString(), quantity: 2 },
    });

    // 4. Create Razorpay order
    const createOrderRes = await request({
      method: 'POST',
      path: '/api/payment/create-order',
      cookie,
    });
    assert(createOrderRes.status === 200, 'POST /api/payment/create-order returns 200 OK', `Got ${createOrderRes.status}`);
    assert(createOrderRes.data.amount === 100000, 'Order amount matches cart total ₹100,000', `Amount: ${createOrderRes.data.amount}`);
    assert(Boolean(createOrderRes.data.orderId), 'Returns Razorpay Order ID', `ID: ${createOrderRes.data.orderId}`);

    const rzpOrderId = createOrderRes.data.orderId;
    const rzpPaymentId = `pay_test_${Date.now()}`;

    // 5. Tampered / Fake Signature Verification -> Must FAIL with 400
    const fakeVerify = await request({
      method: 'POST',
      path: '/api/payment/verify-payment',
      cookie,
      body: {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: 'fake_tampered_signature_string',
      },
    });
    assert(fakeVerify.status === 400, 'Invalid payment signature returns 400 Bad Request', `Got ${fakeVerify.status}`);

    // 6. Legitimate HMAC SHA256 Signature Verification -> MUST SUCCEED
    const validSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest('hex');

    const successVerify = await request({
      method: 'POST',
      path: '/api/payment/verify-payment',
      cookie,
      body: {
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
      },
    });

    assert(successVerify.status === 200, 'Valid HMAC signature verifies payment and creates Order (200 OK)', `Got ${successVerify.status}`);
    assert(successVerify.data.data?.status === 'paid', 'Order status is "paid"', `Status: ${successVerify.data.data?.status}`);
    assert(successVerify.data.data?.totalAmount === 100000, 'Saved order total amount is ₹100,000', `Total: ${successVerify.data.data?.totalAmount}`);

    // 7. Verify stock deduction in DB: Started with 10, bought 2 -> Remaining must be 8
    const updatedProduct = await Product.findById(product._id);
    assert(updatedProduct.stock === 8, 'Product stock reduced from 10 to 8 in MongoDB', `Stock: ${updatedProduct.stock}`);

    // 8. Verify Cart cleared in DB
    const cartAfterOrder = await request({ method: 'GET', path: '/api/cart', cookie });
    assert(cartAfterOrder.data.data?.items?.length === 0, 'User cart emptied after successful payment', `Items: ${cartAfterOrder.data.data?.items?.length}`);

    // 9. Verify Order document in MongoDB has item snapshot and seller reference
    const dbOrder = await Order.findById(successVerify.data.data.orderId);
    assert(Boolean(dbOrder), 'Order document exists in MongoDB', `Found: ${Boolean(dbOrder)}`);
    assert(dbOrder.items.length === 1, 'Order has 1 line item', `Count: ${dbOrder.items.length}`);
    assert(dbOrder.items[0].name === 'Checkout Test Laptop', 'Snapshot name preserved', `Name: ${dbOrder.items[0].name}`);
    assert(dbOrder.items[0].seller.toString() === buyer._id.toString(), 'Snapshot seller preserved for seller dashboard', `Seller: ${dbOrder.items[0].seller}`);

    console.log('\n=============================================');
    console.log(`PAYMENT TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log('=============================================\n');

    // Cleanup
    await User.deleteMany({ email: 'payment_buyer@example.com' });
    await Product.deleteMany({ name: 'Checkout Test Laptop' });
    await Cart.deleteMany({ user: buyer._id });
    await Order.deleteMany({ user: buyer._id });

    server.close(() => {
      mongoose.disconnect().then(() => {
        process.exit(testsFailed > 0 ? 1 : 0);
      });
    });
  } catch (err) {
    console.error('Fatal Payment Test Error:', err);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runPaymentTests();
