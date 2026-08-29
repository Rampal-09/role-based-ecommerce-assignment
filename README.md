# Role-Based E-Commerce Platform

A production-ready, full-stack Role-Based E-Commerce application built with React, Node.js, Express, MongoDB, and Tailwind CSS. The platform features strict backend Role-Based Access Control (RBAC), multi-role dashboards, dynamic catalog filtering, atomic cart/wishlist management, Cloudinary media uploads, and Razorpay test payment integration with HMAC-SHA256 signature verification.

---

## 🌐 Live Application URLs

- **Frontend Live (Vercel)**: [https://role-based-ecommerce-assignment-1dsehak8p.vercel.app/](https://role-based-ecommerce-assignment-1dsehak8p.vercel.app/)
- **Backend API Live (Render)**: [https://role-based-ecommerce-api.onrender.com/](https://role-based-ecommerce-api.onrender.com/)
- **API Health Check**: [https://role-based-ecommerce-api.onrender.com/api/health](https://role-based-ecommerce-api.onrender.com/api/health)
- **Public Products Catalog API**: [https://role-based-ecommerce-api.onrender.com/api/products](https://role-based-ecommerce-api.onrender.com/api/products)

---

## 🔐 Test Login Credentials

| Role | Email | Password | Permissions & Features |
|---|---|---|---|
| **Admin** | `admin@example.com` | `Demo@12345` | Store-wide KPI metrics, manage/edit/delete any product, manage user roles (promote/demote), view all store orders. |
| **Sales Person** | `sales@example.com` | `Demo@12345` | Add new products, edit/delete **only** own products, view seller dashboard with personal revenue, units sold, and orders containing their items. |
| **Customer (User)** | `user@example.com` | `Demo@12345` | Browse catalog, search & filter, manage cart and wishlist, checkout with Razorpay test mode, view personal itemized order receipts. |

> **Note**: Demo data and test accounts are pre-seeded in the live database. You can also re-seed anytime by running `npm run seed` in the `backend` directory.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React
- **Backend**: Node.js, Express.js (REST API, MVC Architecture)
- **Database**: MongoDB Atlas with Mongoose ORM
- **Authentication**: JWT stored in `HttpOnly`, `SameSite: 'none'`, `secure: true` cookies with bcrypt password hashing
- **Media Storage**: Cloudinary (Multipart image upload via Multer memory buffer)
- **Payments**: Razorpay Node SDK & Razorpay Standard Checkout (Test Mode)
- **Deployment**: Render (Backend Web Service) + Vercel (Frontend Static SPA)

---

## 📋 Feature Completion Summary

| Feature | Implementation Details | Status |
|---|---|---|
| **Authentication** | JWT issued on login/register stored inside `HttpOnly` secure cookies. Passwords encrypted with bcrypt (10 salt rounds). Exposes `/api/auth/me` session check and `/api/auth/logout`. | Complete |
| **Role-Based Access Control (RBAC)** | Strict server-side route guards (`authenticate` + `authorizeRoles`). Access violations return `403 Forbidden` on backend regardless of frontend state. Client routes protected via React `ProtectedRoute`. | Complete |
| **Product CRUD & Cloudinary** | Full CRUD capabilities. File uploads routed via Multer to Cloudinary SDK; only secure Cloudinary URLs and public IDs are stored in DB. Strict ownership checks: Sales can only update/delete their own products; Admin has superuser override. | Complete |
| **Dynamic Categories** | Dynamic Category schema with real-time fetching in catalog filters and product creation forms. Admin and Sales can create new categories on the fly. | Complete |
| **Search & Filtering** | Live keyword search (regex on name/description), dynamic category selector, and min/max price range filter querying backend `/api/products`. | Complete |
| **Wishlist & Cart** | Isolated customer cart & wishlist in MongoDB. Atomic quantity adjustments, duplicate prevention, live badge counters in Navbar, and stock limit validations. | Complete |
| **Razorpay Payments** | Server-side Razorpay order generation (`/api/payment/create-order`), client-side test checkout popup, server-side cryptographic HMAC-SHA256 signature verification (`/api/payment/verify-payment`), atomic stock decrement, and cart clearing. | Complete |
| **Customer Orders** | Itemized order history (`/orders`) displaying purchased items, prices, transaction IDs, payment badges, and delivery status. | Complete |
| **Sales Dashboard** | Seller analytics (`/sales/dashboard`) showing total seller revenue, units sold, product inventory management table with quick actions, and incoming customer orders. | Complete |
| **Admin Superuser Console** | Store-wide KPI overview (`/admin/dashboard`) including gross revenue, total orders count, user directory with inline role mutation (`admin`, `sales`, `user`), and complete orders stream. | Complete |
| **Responsive UI & Design** | Fully responsive layout with custom design tokens, mobile slide-over drawer navigation, product cards with discount tags, circular badge counters, and clean footer matching the design system. | Complete |

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas cluster or local MongoDB instance

---

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Fill in your credentials in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/role_ecommerce_db?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_super_secret_key_change_in_production
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   CLIENT_URL=http://localhost:5173
   ```
5. Seed initial demo users & sample products:
   ```bash
   npm run seed
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Backend running on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Set the environment variables in `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
   ```
5. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *Frontend running on `http://localhost:5173`.*

---

## 💳 Razorpay Test Payment Flow

1. Log in as a Customer (`user@example.com` / `Demo@12345`).
2. Add products to the cart from the Catalog (`/products`).
3. Open Cart (`/cart`) and click **Proceed to Checkout**.
4. In the Razorpay Test Mode modal:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry**: `12/28` (any future date)
   - **CVV**: `123`
   - **OTP**: Enter `123456` or click **Success**.
5. Upon successful HMAC signature verification, stock decrements atomically, the cart clears, and the receipt displays on `/order-success/:orderId`.

---

## 🧪 Automated Verification & Test Suites

The repository contains automated test suites verifying all backend routes and RBAC assertions:

```bash
# Run Auth & RBAC Security Suite (26 tests)
node src/test_auth.js

# Run Product CRUD & Ownership Isolation Suite (31 tests)
node src/test_products.js

# Run Cart & Wishlist Isolation Suite (32 tests)
node src/test_cart_wishlist.js

# Run Razorpay Checkout & Signature Verification Suite (16 tests)
node src/test_payment.js

# Run Role Dashboards & KPI Analytics Suite (18 tests)
node src/test_dashboards.js
```

---

## 📄 Implementation Report

### 1. Completed Features
- **Strict Role-Based Access Control**: Implemented 3 distinct roles (`admin`, `sales`, `user`). Route-level security is enforced on the Express backend (`authorizeRoles` middleware) returning `403 Forbidden` whenever unauthorized requests occur.
- **Product Ownership Matrix**: Sales persons can create products, but ownership is assigned strictly on the server (ignoring client-side spoofing). Only the owning sales person or an administrator can edit or delete a given product.
- **Cloudinary Media Storage**: Product image uploads accept `multipart/form-data` via Multer memory buffer and pipe directly to Cloudinary. Server stores only the returned HTTPS URL.
- **Dynamic Category & Search System**: Dynamic database-backed categories with instant search keyword regex matching and price filtering.
- **Atomic Cart & Wishlist**: Multi-item customer cart and deduplicated wishlist with real-time stock validation.
- **Razorpay Test Integration**: End-to-end payment lifecycle with HMAC SHA256 cryptographic verification before order commitment and stock decrement.
- **Three Specialized Dashboards**: User order history receipts, Sales person seller metrics and order item views, and Admin store-wide analytics with user role management.
- **Responsive Modern UI**: Built with custom design tokens, dual font pairing (`Inter` + `Space Grotesk`), mobile drawer navigation, circular badge counters, and responsive tables.

### 2. Challenges Faced & Solutions
1. **Preventing Unauthorized Product Mutation**:
   - *Challenge*: A malicious sales user could send an `owner` ID in the request body to spoof product ownership.
   - *Solution*: Backend controller explicitly overrides `req.body.owner = req.user._id` for sales users and checks `product.owner.toString() === req.user._id.toString()` before performing updates or deletions.
2. **Preventing Tampered Razorpay Payment Callbacks**:
   - *Challenge*: Malicious users could trigger fake success callbacks on the client without transferring funds.
   - *Solution*: The backend creates the order using Razorpay SDK, receives the Razorpay signature upon completion, and generates `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')`. Orders are only created in the database if the signatures match identically.
3. **Cross-Domain Cookies & SPA Routing on Vercel/Render**:
   - *Challenge*: Deploying backend on Render and frontend on Vercel requires cross-domain cookies and SPA route rewriting.
   - *Solution*: Configured `app.set('trust proxy', 1)`, dynamic CORS origin matching, `sameSite: 'none'`, `secure: true` cookie settings, and added `vercel.json` rewrite rules.

### 3. Known Assumptions & Limitations
- **Payment Gateway**: Razorpay is configured in Test Mode (`rzp_test_...`) using dummy card/UPI credentials for testing purposes.
- **Image Uploads**: Product creation supports image uploads via Cloudinary; fallback image URLs are supported during automated test seeding.

---

## 📁 Repository Structure

```text
role-based-ecommerce-assignment/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Cloudinary, Razorpay configurations
│   │   ├── controllers/    # Request handlers (Auth, Products, Cart, Orders, Payments, Categories)
│   │   ├── middleware/     # JWT authentication, RBAC authorization, Multer upload
│   │   ├── models/         # Mongoose schemas (User, Product, Order, Category)
│   │   ├── routes/         # Express API route definitions
│   │   ├── scripts/        # Seeding scripts (seedDemoData.js, seedAdmin.js)
│   │   ├── test_*.js       # Automated test verification suites
│   │   └── server.js       # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar drawer, ProductCard, ProductFilterSidebar, Footer
│   │   ├── context/        # AuthContext, CartContext, WishlistContext
│   │   ├── pages/          # Storefront, Catalog, Cart, Wishlist, Dashboards, Auth
│   │   ├── services/       # Axios API client modules
│   │   ├── App.jsx         # Router & AppLayout
│   │   └── index.css       # Tailwind & typography design tokens
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json         # Vercel SPA routing rewrites
│   └── vite.config.js
├── .env.example
├── .gitignore
├── design.md
└── README.md
```
