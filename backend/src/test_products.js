require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('./server');
const User = require('./models/User');
const Product = require('./models/Product');

const TEST_PORT = 5098;

// HTTP request helper
const request = ({ method, path, body, cookie, headers = {} }) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }
    if (cookie) {
      reqHeaders['Cookie'] = cookie;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        path,
        method,
        headers: reqHeaders,
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

const runProductTests = async () => {
  console.log('\n=============================================');
  console.log('STARTING TASK 4 PRODUCT CRUD & OWNERSHIP RBAC TEST SUITE');
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
    email: {
      $in: [
        'prod_admin@example.com',
        'prod_seller_a@example.com',
        'prod_seller_b@example.com',
        'prod_customer@example.com',
      ],
    },
  });
  await Product.deleteMany({
    name: {
      $in: [
        'Admin Product Special',
        'Product A by Seller A',
        'Product B by Seller B',
        'Updated Product A',
        'Attacker Product',
        'Filter Test Shoe',
        'Filter Test Shirt',
      ],
    },
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
    // -------------------------------------------------------------
    // SETUP USERS: ADMIN, SELLER A, SELLER B, CUSTOMER
    // -------------------------------------------------------------
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'System Admin',
      email: 'prod_admin@example.com',
      password: hashedPass,
      role: 'admin',
    });

    const sellerAUser = await User.create({
      name: 'Seller Alice',
      email: 'prod_seller_a@example.com',
      password: hashedPass,
      role: 'sales',
    });

    const sellerBUser = await User.create({
      name: 'Seller Bob',
      email: 'prod_seller_b@example.com',
      password: hashedPass,
      role: 'sales',
    });

    const customerUser = await User.create({
      name: 'Regular Customer',
      email: 'prod_customer@example.com',
      password: hashedPass,
      role: 'user',
    });

    // Log in all users to acquire cookies
    const loginAdmin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'prod_admin@example.com', password: 'password123' },
    });
    const adminCookie = extractTokenCookie(loginAdmin.cookies);

    const loginSellerA = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'prod_seller_a@example.com', password: 'password123' },
    });
    const sellerACookie = extractTokenCookie(loginSellerA.cookies);

    const loginSellerB = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'prod_seller_b@example.com', password: 'password123' },
    });
    const sellerBCookie = extractTokenCookie(loginSellerB.cookies);

    const loginCustomer = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'prod_customer@example.com', password: 'password123' },
    });
    const customerCookie = extractTokenCookie(loginCustomer.cookies);

    // -------------------------------------------------------------
    // TEST 1: CREATE PRODUCT & ROLE PERMISSIONS
    // -------------------------------------------------------------
    console.log('\n--- 1. Product Creation & Ownership Assignment ---');

    // 1.1 Admin creates product
    const adminCreate = await request({
      method: 'POST',
      path: '/api/products',
      cookie: adminCookie,
      body: {
        name: 'Admin Product Special',
        description: 'Created by Admin',
        price: 999,
        category: 'Electronics',
        stock: 10,
        image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      },
    });
    assert(adminCreate.status === 201, 'Admin can create product (201 Created)', `Got ${adminCreate.status}`);
    assert(
      adminCreate.data.data?.owner?._id === adminUser._id.toString(),
      'Admin product owner is assigned to Admin ID',
      `Owner: ${adminCreate.data.data?.owner?._id}`
    );

    // 1.2 Seller A creates Product A
    const sellerACreate = await request({
      method: 'POST',
      path: '/api/products',
      cookie: sellerACookie,
      body: {
        name: 'Product A by Seller A',
        description: 'Owned by Seller A',
        price: 150,
        category: 'Fashion',
        stock: 25,
        image: 'https://res.cloudinary.com/demo/image/upload/sample_a.jpg',
        // Attempt to spoof owner to admin: backend MUST ignore this
        owner: adminUser._id.toString(),
      },
    });
    assert(sellerACreate.status === 201, 'Seller A can create Product A (201 Created)', `Got ${sellerACreate.status}`);
    const productA = sellerACreate.data.data;
    assert(
      productA?.owner?._id === sellerAUser._id.toString(),
      'Backend ignores client owner spoof and strictly sets Product A owner to Seller A',
      `Actual owner: ${productA?.owner?._id}`
    );

    // 1.3 Seller B creates Product B
    const sellerBCreate = await request({
      method: 'POST',
      path: '/api/products',
      cookie: sellerBCookie,
      body: {
        name: 'Product B by Seller B',
        description: 'Owned by Seller B',
        price: 300,
        category: 'Footwear',
        stock: 15,
        image: 'https://res.cloudinary.com/demo/image/upload/sample_b.jpg',
      },
    });
    assert(sellerBCreate.status === 201, 'Seller B can create Product B (201 Created)', `Got ${sellerBCreate.status}`);
    const productB = sellerBCreate.data.data;
    assert(
      productB?.owner?._id === sellerBUser._id.toString(),
      'Product B owner is strictly Seller B',
      `Owner: ${productB?.owner?._id}`
    );

    // 1.4 Normal User attempts to create product -> 403
    const userCreate = await request({
      method: 'POST',
      path: '/api/products',
      cookie: customerCookie,
      body: {
        name: 'Attacker Product',
        price: 50,
        category: 'Misc',
        stock: 5,
        image: 'https://res.cloudinary.com/demo/image/upload/sample_user.jpg',
      },
    });
    assert(userCreate.status === 403, 'Normal User cannot create product (403 Forbidden)', `Got ${userCreate.status}`);

    // 1.5 Unauthenticated user attempts to create product -> 401
    const unauthCreate = await request({
      method: 'POST',
      path: '/api/products',
      body: {
        name: 'Unauth Product',
        price: 50,
        category: 'Misc',
        stock: 5,
        image: 'https://res.cloudinary.com/demo/image/upload/sample_unauth.jpg',
      },
    });
    assert(unauthCreate.status === 401, 'Unauthenticated user cannot create product (401 Unauthorized)', `Got ${unauthCreate.status}`);

    // -------------------------------------------------------------
    // TEST 2: PRODUCT OWNERSHIP AUTHORIZATION (MANDATORY TEST 17)
    // -------------------------------------------------------------
    console.log('\n--- 2. Mandatory Product Ownership Isolation Matrix ---');

    // 2.1 Seller A updates own Product A -> 200 OK
    const sellerAUpdatesA = await request({
      method: 'PUT',
      path: `/api/products/${productA._id}`,
      cookie: sellerACookie,
      body: {
        name: 'Updated Product A',
        price: 175,
      },
    });
    assert(sellerAUpdatesA.status === 200, 'Seller A can update own Product A (200 OK)', `Got ${sellerAUpdatesA.status}`);
    assert(sellerAUpdatesA.data.data?.price === 175, 'Product A price was updated to 175', `Price: ${sellerAUpdatesA.data.data?.price}`);

    // 2.2 Seller A attempts to update Seller B's Product B -> 403 Forbidden
    const sellerAUpdatesB = await request({
      method: 'PUT',
      path: `/api/products/${productB._id}`,
      cookie: sellerACookie,
      body: {
        name: 'Hacked Product B by A',
        price: 1,
      },
    });
    assert(
      sellerAUpdatesB.status === 403,
      'Seller A attempting to update Seller B\'s Product B returns 403 Forbidden',
      `Got ${sellerAUpdatesB.status}`
    );
    assert(
      sellerAUpdatesB.data?.message === 'You can only manage your own products',
      'Returns exact message: "You can only manage your own products"',
      `Got: ${sellerAUpdatesB.data?.message}`
    );

    // 2.3 Seller B attempts to update Seller A's Product A -> 403 Forbidden
    const sellerBUpdatesA = await request({
      method: 'PUT',
      path: `/api/products/${productA._id}`,
      cookie: sellerBCookie,
      body: {
        name: 'Hacked Product A by B',
        price: 2,
      },
    });
    assert(
      sellerBUpdatesA.status === 403,
      'Seller B attempting to update Seller A\'s Product A returns 403 Forbidden',
      `Got ${sellerBUpdatesA.status}`
    );

    // 2.4 Seller A attempts to delete Seller B's Product B -> 403 Forbidden
    const sellerADeletesB = await request({
      method: 'DELETE',
      path: `/api/products/${productB._id}`,
      cookie: sellerACookie,
    });
    assert(
      sellerADeletesB.status === 403,
      'Seller A attempting to delete Seller B\'s Product B returns 403 Forbidden',
      `Got ${sellerADeletesB.status}`
    );

    // 2.5 Admin updates Seller A's Product A -> 200 OK
    const adminUpdatesA = await request({
      method: 'PUT',
      path: `/api/products/${productA._id}`,
      cookie: adminCookie,
      body: {
        price: 250,
      },
    });
    assert(adminUpdatesA.status === 200, 'Admin can update Seller A\'s Product A (200 OK)', `Got ${adminUpdatesA.status}`);

    // 2.6 Admin deletes Seller B's Product B -> 200 OK
    const adminDeletesB = await request({
      method: 'DELETE',
      path: `/api/products/${productB._id}`,
      cookie: adminCookie,
    });
    assert(adminDeletesB.status === 200, 'Admin can delete any product (Seller B\'s Product B) (200 OK)', `Got ${adminDeletesB.status}`);

    // 2.7 Normal user attempts to update Product A -> 403 Forbidden
    const userUpdatesA = await request({
      method: 'PUT',
      path: `/api/products/${productA._id}`,
      cookie: customerCookie,
      body: { price: 10 },
    });
    assert(userUpdatesA.status === 403, 'Normal User cannot update product (403 Forbidden)', `Got ${userUpdatesA.status}`);

    // 2.8 Normal user attempts to delete Product A -> 403 Forbidden
    const userDeletesA = await request({
      method: 'DELETE',
      path: `/api/products/${productA._id}`,
      cookie: customerCookie,
    });
    assert(userDeletesA.status === 403, 'Normal User cannot delete product (403 Forbidden)', `Got ${userDeletesA.status}`);

    // -------------------------------------------------------------
    // TEST 3: PUBLIC GET, SEARCH & FILTERING
    // -------------------------------------------------------------
    console.log('\n--- 3. Public Queries, Keyword Search & Filtering ---');

    // Create a couple extra products for search/filter tests
    await Product.create([
      {
        name: 'Filter Test Shoe Running Pro',
        description: 'High performance running sneakers',
        price: 500,
        category: 'Footwear',
        stock: 30,
        image: 'https://res.cloudinary.com/demo/image/upload/shoe.jpg',
        owner: sellerAUser._id,
      },
      {
        name: 'Filter Test Shirt Casual',
        description: 'Cotton summer t-shirt',
        price: 80,
        category: 'Apparel',
        stock: 50,
        image: 'https://res.cloudinary.com/demo/image/upload/shirt.jpg',
        owner: sellerAUser._id,
      },
    ]);

    // 3.1 Public GET all products
    const getAll = await request({ method: 'GET', path: '/api/products' });
    assert(getAll.status === 200, 'GET /api/products returns 200 OK (Public)', `Got ${getAll.status}`);
    assert(getAll.data.data?.length > 0, 'Returns list of products', `Count: ${getAll.data.count}`);

    // 3.2 Public GET single product by ID
    const getSingle = await request({ method: 'GET', path: `/api/products/${productA._id}` });
    assert(getSingle.status === 200, 'GET /api/products/:id returns 200 OK', `Got ${getSingle.status}`);
    assert(getSingle.data.data?.name === 'Updated Product A', 'Returns matching product details', `Name: ${getSingle.data.data?.name}`);
    assert(getSingle.data.data?.owner?.password === undefined, 'Owner object never exposes password', `Password: ${getSingle.data.data?.owner?.password}`);

    // 3.3 Search filter by keyword
    const searchRes = await request({ method: 'GET', path: '/api/products?search=Running' });
    assert(searchRes.status === 200, 'GET /api/products?search=Running returns 200 OK', `Got ${searchRes.status}`);
    assert(
      searchRes.data.data?.some((p) => p.name.includes('Running') || p.description.includes('running')),
      'Search successfully matches product keyword',
      `Found: ${searchRes.data.data?.map((p) => p.name).join(', ')}`
    );

    // 3.4 Category filter
    const catRes = await request({ method: 'GET', path: '/api/products?category=Footwear' });
    assert(catRes.status === 200, 'GET /api/products?category=Footwear returns 200 OK', `Got ${catRes.status}`);
    assert(
      catRes.data.data?.every((p) => p.category.toLowerCase() === 'footwear'),
      'All returned products belong to category "Footwear"',
      `Categories: ${catRes.data.data?.map((p) => p.category).join(', ')}`
    );

    // 3.5 Price range filter (minPrice=100 & maxPrice=600)
    const priceRes = await request({ method: 'GET', path: '/api/products?minPrice=100&maxPrice=600' });
    assert(priceRes.status === 200, 'GET /api/products?minPrice=100&maxPrice=600 returns 200 OK', `Got ${priceRes.status}`);
    assert(
      priceRes.data.data?.every((p) => p.price >= 100 && p.price <= 600),
      'All returned products are within price range [100, 600]',
      `Prices: ${priceRes.data.data?.map((p) => p.price).join(', ')}`
    );

    // 3.6 Nonexistent product ID returns 404
    const notFoundRes = await request({ method: 'GET', path: `/api/products/${new mongoose.Types.ObjectId()}` });
    assert(notFoundRes.status === 404, 'GET /api/products/:id for non-existent ID returns 404 Not Found', `Got ${notFoundRes.status}`);

    // -------------------------------------------------------------
    // TEST 4: SELLER A DELETES OWN PRODUCT
    // -------------------------------------------------------------
    console.log('\n--- 4. Seller A Deletes Own Product ---');
    const sellerADeletesA = await request({
      method: 'DELETE',
      path: `/api/products/${productA._id}`,
      cookie: sellerACookie,
    });
    assert(sellerADeletesA.status === 200, 'Seller A can delete own Product A (200 OK)', `Got ${sellerADeletesA.status}`);

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n=============================================');
    console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log('=============================================\n');

    // Clean test data
    await User.deleteMany({
      email: {
        $in: [
          'prod_admin@example.com',
          'prod_seller_a@example.com',
          'prod_seller_b@example.com',
          'prod_customer@example.com',
        ],
      },
    });
    await Product.deleteMany({
      name: {
        $in: [
          'Admin Product Special',
          'Product A by Seller A',
          'Product B by Seller B',
          'Updated Product A',
          'Attacker Product',
          'Filter Test Shoe',
          'Filter Test Shoe Running Pro',
          'Filter Test Shirt Casual',
        ],
      },
    });

    server.close(() => {
      mongoose.disconnect().then(() => {
        process.exit(testsFailed > 0 ? 1 : 0);
      });
    });
  } catch (err) {
    console.error('Fatal test error:', err);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runProductTests();
