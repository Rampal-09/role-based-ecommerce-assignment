require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('./server');
const User = require('./models/User');

const TEST_PORT = 5099;

// Helper to make HTTP requests
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

const runTests = async () => {
  console.log('\n=============================================');
  console.log('STARTING TASK 3 AUTH & RBAC VERIFICATION SUITE');
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

  // Clean test accounts
  await User.deleteMany({
    email: {
      $in: [
        'test_user@example.com',
        'test_admin_attempt@example.com',
        'test_admin@example.com',
        'test_sales@example.com',
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
    // TEST 1: REGISTRATION TESTS
    // -------------------------------------------------------------
    console.log('\n--- 1. Registration Security & Roles ---');

    // 1.1 Normal Registration
    const reg1 = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Regular Customer',
        email: 'test_user@example.com',
        password: 'password123',
      },
    });
    assert(reg1.status === 201, 'Normal registration returns 201 Created', `Got ${reg1.status}`);
    assert(reg1.data.user?.role === 'user', 'Normal registration creates role "user"', `Got ${reg1.data.user?.role}`);
    assert(reg1.data.user?.password === undefined, 'Registration response NEVER exposes password', `Password field: ${reg1.data.user?.password}`);

    // 1.2 Attempting to register as "admin"
    const regAdminAttempt = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Attacker Admin',
        email: 'test_admin_attempt@example.com',
        password: 'password123',
        role: 'admin',
      },
    });
    assert(regAdminAttempt.status === 201, 'Registration with role:admin in body succeeds', `Got ${regAdminAttempt.status}`);
    assert(
      regAdminAttempt.data.user?.role === 'user',
      'Registration with role:admin MUST STILL CREATE role "user" (Backend security enforced)',
      `Actual role returned: ${regAdminAttempt.data.user?.role}`
    );

    // 1.3 Duplicate email registration
    const regDuplicate = await request({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        name: 'Duplicate User',
        email: 'test_user@example.com',
        password: 'password123',
      },
    });
    assert(
      regDuplicate.status === 409 || regDuplicate.status === 400,
      'Duplicate email registration is rejected with 409 Conflict / 400 Bad Request',
      `Got ${regDuplicate.status}`
    );

    // -------------------------------------------------------------
    // SETUP SALES & ADMIN USERS FOR RBAC TESTS
    // -------------------------------------------------------------
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('password123', salt);

    await User.create({
      name: 'Admin User',
      email: 'test_admin@example.com',
      password: hashedPass,
      role: 'admin',
    });

    await User.create({
      name: 'Sales User',
      email: 'test_sales@example.com',
      password: hashedPass,
      role: 'sales',
    });

    // -------------------------------------------------------------
    // TEST 2: LOGIN TESTS
    // -------------------------------------------------------------
    console.log('\n--- 2. Login & JWT Cookie Handling ---');

    // 2.1 Wrong password
    const loginWrongPass = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'test_user@example.com', password: 'wrongpassword' },
    });
    assert(loginWrongPass.status === 401, 'Login with wrong password returns 401', `Got ${loginWrongPass.status}`);

    // 2.2 Unknown email
    const loginUnknown = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'nonexistent@example.com', password: 'password123' },
    });
    assert(loginUnknown.status === 401, 'Login with unknown email returns 401', `Got ${loginUnknown.status}`);

    // 2.3 Correct user login
    const loginUser = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'test_user@example.com', password: 'password123' },
    });
    assert(loginUser.status === 200, 'Login with correct credentials returns 200 OK', `Got ${loginUser.status}`);
    const userCookie = extractTokenCookie(loginUser.cookies);
    assert(Boolean(userCookie), 'Login response sets HttpOnly "token" cookie', `Cookies: ${loginUser.cookies}`);
    assert(
      loginUser.cookies?.some((c) => c.toLowerCase().includes('httponly')),
      'Cookie has HttpOnly flag set',
      `Cookies: ${loginUser.cookies}`
    );

    // 2.4 Login Admin and Sales to get their cookies
    const loginAdmin = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'test_admin@example.com', password: 'password123' },
    });
    const adminCookie = extractTokenCookie(loginAdmin.cookies);

    const loginSales = await request({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'test_sales@example.com', password: 'password123' },
    });
    const salesCookie = extractTokenCookie(loginSales.cookies);

    // -------------------------------------------------------------
    // TEST 3: AUTHENTICATION (GET /api/auth/me)
    // -------------------------------------------------------------
    console.log('\n--- 3. Session Verification (GET /api/auth/me) ---');

    // 3.1 No cookie
    const meNoAuth = await request({
      method: 'GET',
      path: '/api/auth/me',
    });
    assert(meNoAuth.status === 401, 'GET /api/auth/me with NO cookie returns 401 Unauthorized', `Got ${meNoAuth.status}`);

    // 3.2 Valid cookie
    const meValid = await request({
      method: 'GET',
      path: '/api/auth/me',
      cookie: userCookie,
    });
    assert(meValid.status === 200, 'GET /api/auth/me with valid cookie returns 200 OK', `Got ${meValid.status}`);
    assert(meValid.data.user?.email === 'test_user@example.com', 'GET /api/auth/me returns current user info', `Email: ${meValid.data.user?.email}`);
    assert(meValid.data.user?.password === undefined, 'GET /api/auth/me NEVER exposes password', `Password: ${meValid.data.user?.password}`);

    // -------------------------------------------------------------
    // TEST 4: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
    // -------------------------------------------------------------
    console.log('\n--- 4. Role-Based Access Control (RBAC) Verification ---');

    // 4.1 Admin Route (/api/test/admin)
    const adminOnAdmin = await request({ method: 'GET', path: '/api/test/admin', cookie: adminCookie });
    assert(adminOnAdmin.status === 200, 'Admin calling /api/test/admin returns 200 OK', `Got ${adminOnAdmin.status}`);

    const salesOnAdmin = await request({ method: 'GET', path: '/api/test/admin', cookie: salesCookie });
    assert(salesOnAdmin.status === 403, 'Sales calling /api/test/admin returns 403 Forbidden', `Got ${salesOnAdmin.status}`);

    const userOnAdmin = await request({ method: 'GET', path: '/api/test/admin', cookie: userCookie });
    assert(userOnAdmin.status === 403, 'User calling /api/test/admin returns 403 Forbidden', `Got ${userOnAdmin.status}`);

    // 4.2 Sales Route (/api/test/sales)
    const adminOnSales = await request({ method: 'GET', path: '/api/test/sales', cookie: adminCookie });
    assert(adminOnSales.status === 200, 'Admin calling /api/test/sales returns 200 OK', `Got ${adminOnSales.status}`);

    const salesOnSales = await request({ method: 'GET', path: '/api/test/sales', cookie: salesCookie });
    assert(salesOnSales.status === 200, 'Sales calling /api/test/sales returns 200 OK', `Got ${salesOnSales.status}`);

    const userOnSales = await request({ method: 'GET', path: '/api/test/sales', cookie: userCookie });
    assert(userOnSales.status === 403, 'User calling /api/test/sales returns 403 Forbidden', `Got ${userOnSales.status}`);

    // 4.3 User Route (/api/test/user)
    const userOnUser = await request({ method: 'GET', path: '/api/test/user', cookie: userCookie });
    assert(userOnUser.status === 200, 'User calling /api/test/user returns 200 OK', `Got ${userOnUser.status}`);

    // 4.4 Unauthenticated on protected routes
    const unauthAdmin = await request({ method: 'GET', path: '/api/test/admin' });
    assert(unauthAdmin.status === 401, 'Unauthenticated calling /api/test/admin returns 401 Unauthorized', `Got ${unauthAdmin.status}`);

    const unauthSales = await request({ method: 'GET', path: '/api/test/sales' });
    assert(unauthSales.status === 401, 'Unauthenticated calling /api/test/sales returns 401 Unauthorized', `Got ${unauthSales.status}`);

    // -------------------------------------------------------------
    // TEST 5: LOGOUT
    // -------------------------------------------------------------
    console.log('\n--- 5. Logout & Session Invalidation ---');
    const logoutRes = await request({ method: 'POST', path: '/api/auth/logout', cookie: userCookie });
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns 200 OK', `Got ${logoutRes.status}`);
    assert(
      logoutRes.cookies?.some((c) => c.includes('token=;') || c.includes('Expires=Thu, 01 Jan 1970')),
      'Logout response expires / clears auth cookie',
      `Cookies: ${logoutRes.cookies}`
    );

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n=============================================');
    console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log('=============================================\n');

    // Clean test accounts
    await User.deleteMany({
      email: {
        $in: [
          'test_user@example.com',
          'test_admin_attempt@example.com',
          'test_admin@example.com',
          'test_sales@example.com',
        ],
      },
    });

    server.close(() => {
      mongoose.disconnect().then(() => {
        process.exit(testsFailed > 0 ? 1 : 0);
      });
    });
  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
