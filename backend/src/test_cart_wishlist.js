require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('./server');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');

const TEST_PORT = 5096;

// HTTP request helper
const request = ({ method, path, body, cookie }) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (cookie) {
      headers['Cookie'] = cookie;
    }

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
            headers: res.headers,
            cookies: res.headers['set-cookie'],
            data: json,
          });
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const extractTokenCookie = (cookieHeaders) => {
  if (!cookieHeaders) return null;
  const cookieStr = Array.isArray(cookieHeaders) ? cookieHeaders.join('; ') : cookieHeaders;
  const match = cookieStr.match(/token=[^;]+/);
  return match ? match[0] : null;
};

const runCartWishlistTests = async () => {
  console.log('\n=============================================');
  console.log('STARTING TASK 6 CART & WISHLIST VERIFICATION SUITE');
  console.log('=============================================\n');

  // Start test server
  const server = app.listen(TEST_PORT, () => {
    console.log(`Test server running on port ${TEST_PORT}`);
  });

  // Ensure DB connected
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/role_ecommerce_db';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
  }

  // Clean old test data
  await User.deleteMany({
    email: { $in: ['cart_user_a@example.com', 'cart_user_b@example.com'] },
  });
  await Product.deleteMany({
    name: { $in: ['Cart Test Sneaker', 'Cart Test Watch'] },
  });

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
    // Setup test users & products
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('password123', salt);

    const userA = await User.create({
      name: 'User Alice',
      email: 'cart_user_a@example.com',
      password: hashedPass,
      role: 'user',
    });

    const userB = await User.create({
      name: 'User Bob',
      email: 'cart_user_b@example.com',
      password: hashedPass,
      role: 'user',
    });

    const productA = await Product.create({
      name: 'Cart Test Sneaker',
      description: 'Shoes with 5 units stock',
      price: 1000,
      category: 'Footwear',
      stock: 5,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      owner: userA._id,
    });

    const productB = await Product.create({
      name: 'Cart Test Watch',
      description: 'Watch with 10 units stock',
      price: 500,
      category: 'Electronics',
      stock: 10,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      owner: userA._id,
    });

    // Clean user carts and wishlists
    await Cart.deleteMany({ user: { $in: [userA._id, userB._id] } });
    await Wishlist.deleteMany({ user: { $in: [userA._id, userB._id] } });

    // Log in User A and User B
    const loginA = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'cart_user_a@example.com', password: 'password123' },
    });
    const cookieA = extractTokenCookie(loginA.cookies);

    const loginB = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'cart_user_b@example.com', password: 'password123' },
    });
    const cookieB = extractTokenCookie(loginB.cookies);

    // -------------------------------------------------------------
    // TEST 1: CART OPERATIONS & COUNT CALCULATIONS
    // -------------------------------------------------------------
    console.log('\n--- 1. Cart Flow & Count Calculations ---');

    // 1.1 Unauthenticated Cart Access -> 401
    const unauthCart = await request({ method: 'GET', path: '/api/cart' });
    assert(unauthCart.status === 401, 'GET /api/cart unauthenticated returns 401 Unauthorized', `Got ${unauthCart.status}`);

    // 1.2 Initial empty cart -> returns { items: [] }
    const initialCart = await request({ method: 'GET', path: '/api/cart', cookie: cookieA });
    assert(initialCart.status === 200, 'GET /api/cart for new user returns 200 OK', `Got ${initialCart.status}`);
    assert(initialCart.data.data?.items?.length === 0, 'Initial cart has 0 items', `Items: ${initialCart.data.data?.items?.length}`);

    // 1.3 Add Product A with quantity = 1
    const add1 = await request({
      method: 'POST',
      path: '/api/cart',
      cookie: cookieA,
      body: { productId: productA._id.toString(), quantity: 1 },
    });
    assert(add1.status === 200, 'POST /api/cart adds Product A with quantity 1 (200 OK)', `Got ${add1.status}`);
    let cartA = add1.data.data;
    let totalQty = cartA.items.reduce((sum, item) => sum + item.quantity, 0);
    assert(totalQty === 1, 'Cart Count = 1 after adding 1 unit of Product A', `Count: ${totalQty}`);

    // 1.4 Add Product A again with quantity = 2 (Should merge to 3)
    const add2 = await request({
      method: 'POST',
      path: '/api/cart',
      cookie: cookieA,
      body: { productId: productA._id.toString(), quantity: 2 },
    });
    assert(add2.status === 200, 'POST /api/cart for existing product merges quantity (200 OK)', `Got ${add2.status}`);
    cartA = add2.data.data;
    assert(cartA.items.length === 1, 'Cart contains exactly 1 unique item (no duplicate items)', `Unique: ${cartA.items.length}`);
    assert(cartA.items[0].quantity === 3, 'Product A quantity merged: 1 + 2 = 3', `Qty: ${cartA.items[0].quantity}`);
    totalQty = cartA.items.reduce((sum, item) => sum + item.quantity, 0);
    assert(totalQty === 3, 'Cart Count = 3 after merging', `Count: ${totalQty}`);

    // 1.5 Add Product B with quantity = 1
    const add3 = await request({
      method: 'POST',
      path: '/api/cart',
      cookie: cookieA,
      body: { productId: productB._id.toString(), quantity: 1 },
    });
    assert(add3.status === 200, 'POST /api/cart adds Product B (200 OK)', `Got ${add3.status}`);
    cartA = add3.data.data;
    assert(cartA.items.length === 2, 'Cart has 2 unique products', `Unique: ${cartA.items.length}`);
    totalQty = cartA.items.reduce((sum, item) => sum + item.quantity, 0);
    assert(totalQty === 4, 'Cart Count = 4 (Shoes × 3 + Watch × 1)', `Count: ${totalQty}`);

    // 1.6 Calculate Subtotal dynamically: (1000 * 3) + (500 * 1) = 3500
    const subtotal = cartA.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    assert(subtotal === 3500, 'Calculated Subtotal = ₹3,500 (₹1000×3 + ₹500×1)', `Subtotal: ${subtotal}`);

    // -------------------------------------------------------------
    // TEST 2: STOCK VALIDATION
    // -------------------------------------------------------------
    console.log('\n--- 2. Stock Limits & Quantity Validation ---');

    // Product A stock is 5. Current cart qty is 3. Attempting to add 3 more (total 6 > 5) -> 400
    const exceedAdd = await request({
      method: 'POST',
      path: '/api/cart',
      cookie: cookieA,
      body: { productId: productA._id.toString(), quantity: 3 },
    });
    assert(exceedAdd.status === 400, 'Adding quantity exceeding available stock returns 400 Bad Request', `Got ${exceedAdd.status}`);
    assert(
      exceedAdd.data?.message?.toLowerCase().includes('exceeds'),
      'Returns clear message regarding stock limits',
      `Message: ${exceedAdd.data?.message}`
    );

    // 2.2 Update quantity with PATCH: change Product A from 3 -> 2
    const updateQty = await request({
      method: 'PATCH',
      path: `/api/cart/${productA._id}`,
      cookie: cookieA,
      body: { quantity: 2 },
    });
    assert(updateQty.status === 200, 'PATCH /api/cart/:id updates quantity to 2 (200 OK)', `Got ${updateQty.status}`);
    cartA = updateQty.data.data;
    totalQty = cartA.items.reduce((sum, item) => sum + item.quantity, 0);
    assert(totalQty === 3, 'Cart Count = 3 after reducing Product A to 2 (2 + 1)', `Count: ${totalQty}`);

    // 2.3 Attempt to update quantity to 0 via PATCH -> 400 (Must use DELETE)
    const zeroQty = await request({
      method: 'PATCH',
      path: `/api/cart/${productA._id}`,
      cookie: cookieA,
      body: { quantity: 0 },
    });
    assert(zeroQty.status === 400, 'PATCH quantity <= 0 returns 400 Bad Request', `Got ${zeroQty.status}`);

    // 2.4 Delete Product B from Cart
    const deleteItem = await request({
      method: 'DELETE',
      path: `/api/cart/${productB._id}`,
      cookie: cookieA,
    });
    assert(deleteItem.status === 200, 'DELETE /api/cart/:id removes product (200 OK)', `Got ${deleteItem.status}`);
    cartA = deleteItem.data.data;
    assert(cartA.items.length === 1, 'Cart has 1 item remaining', `Items: ${cartA.items.length}`);
    totalQty = cartA.items.reduce((sum, item) => sum + item.quantity, 0);
    assert(totalQty === 2, 'Cart Count = 2 after removing Product B', `Count: ${totalQty}`);

    // -------------------------------------------------------------
    // TEST 3: USER CART ISOLATION (SECURITY)
    // -------------------------------------------------------------
    console.log('\n--- 3. Cart User Ownership & Data Isolation ---');

    // User B requests cart -> Should be empty (User A's items NOT visible)
    const cartUserB = await request({ method: 'GET', path: '/api/cart', cookie: cookieB });
    assert(cartUserB.status === 200, 'User B retrieves their own cart', `Got ${cartUserB.status}`);
    assert(cartUserB.data.data?.items?.length === 0, 'User B cart is empty (User A data isolated)', `Items: ${cartUserB.data.data?.items?.length}`);

    // -------------------------------------------------------------
    // TEST 4: WISHLIST FLOW, DUPLICATE PREVENTION & ISOLATION
    // -------------------------------------------------------------
    console.log('\n--- 4. Wishlist Flow, Deduplication & Isolation ---');

    // 4.1 Unauthenticated Wishlist -> 401
    const unauthWishlist = await request({ method: 'GET', path: '/api/wishlist' });
    assert(unauthWishlist.status === 401, 'GET /api/wishlist unauthenticated returns 401 Unauthorized', `Got ${unauthWishlist.status}`);

    // 4.2 User A adds Product A to wishlist
    const addWish1 = await request({
      method: 'POST',
      path: `/api/wishlist/${productA._id}`,
      cookie: cookieA,
    });
    assert(addWish1.status === 200, 'POST /api/wishlist/:id adds Product A (200 OK)', `Got ${addWish1.status}`);
    let wishlistA = addWish1.data.data;
    assert(wishlistA.products.length === 1, 'Wishlist Count = 1 after adding Product A', `Count: ${wishlistA.products.length}`);

    // 4.3 User A adds Product A AGAIN -> MUST NOT DUPLICATE
    const addWishDuplicate = await request({
      method: 'POST',
      path: `/api/wishlist/${productA._id}`,
      cookie: cookieA,
    });
    assert(addWishDuplicate.status === 200, 'Adding same product again succeeds without duplicating', `Got ${addWishDuplicate.status}`);
    wishlistA = addWishDuplicate.data.data;
    assert(
      wishlistA.products.length === 1,
      'Wishlist Count remains 1 (NO DUPLICATE products in Wishlist)',
      `Count: ${wishlistA.products.length}`
    );

    // 4.4 User A adds Product B -> Wishlist Count = 2
    const addWish2 = await request({
      method: 'POST',
      path: `/api/wishlist/${productB._id}`,
      cookie: cookieA,
    });
    wishlistA = addWish2.data.data;
    assert(wishlistA.products.length === 2, 'Wishlist Count = 2 after adding Product B', `Count: ${wishlistA.products.length}`);

    // 4.5 User B requests Wishlist -> Empty (isolated from User A)
    const wishlistB = await request({ method: 'GET', path: '/api/wishlist', cookie: cookieB });
    assert(wishlistB.data.data?.products?.length === 0, 'User B wishlist is isolated and empty', `Count: ${wishlistB.data.data?.products?.length}`);

    // 4.6 User A removes Product A from Wishlist
    const removeWish = await request({
      method: 'DELETE',
      path: `/api/wishlist/${productA._id}`,
      cookie: cookieA,
    });
    assert(removeWish.status === 200, 'DELETE /api/wishlist/:id removes product (200 OK)', `Got ${removeWish.status}`);
    wishlistA = removeWish.data.data;
    assert(wishlistA.products.length === 1, 'Wishlist Count = 1 after removing Product A', `Count: ${wishlistA.products.length}`);

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n=============================================');
    console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log('=============================================\n');

    // Clean test data
    await User.deleteMany({
      email: { $in: ['cart_user_a@example.com', 'cart_user_b@example.com'] },
    });
    await Product.deleteMany({
      name: { $in: ['Cart Test Sneaker', 'Cart Test Watch'] },
    });
    await Cart.deleteMany({ user: { $in: [userA._id, userB._id] } });
    await Wishlist.deleteMany({ user: { $in: [userA._id, userB._id] } });

    server.close(() => {
      mongoose.disconnect().then(() => {
        process.exit(testsFailed > 0 ? 1 : 0);
      });
    });
  } catch (err) {
    console.error('Fatal Cart/Wishlist Test Error:', err);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runCartWishlistTests();
