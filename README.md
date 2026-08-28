# Role-Based E-Commerce Platform

A full-stack Role-Based E-Commerce Platform built with React, Node.js, Express, MongoDB, and Tailwind CSS, featuring role-based access control (Admin, Sales Person, User).

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT authentication with HttpOnly cookies & bcrypt
- **Media Storage**: Cloudinary
- **Payments**: Razorpay (Test Mode)

---

## Project Structure

```text
role-based-ecommerce-assignment/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and third-party configurations
│   │   ├── controllers/    # Request handlers / business logic
│   │   ├── middleware/     # Auth and error middlewares
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express API routes
│   │   ├── services/       # Service layer
│   │   ├── utils/          # Utility functions and helpers
│   │   └── server.js       # Express server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── layouts/        # Page layout components
│   │   ├── pages/          # Application views / pages
│   │   ├── routes/         # Application routing configuration
│   │   ├── services/       # API services / Axios client
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # Frontend entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local instance or MongoDB Atlas)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   Backend will be running on `http://localhost:5000`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   Frontend will be accessible at `http://localhost:5173`.

---

## Health Check Endpoint

- **Backend Health Check**: `GET http://localhost:5000/api/health`
- **Expected Response**:
  ```json
  {
    "success": true,
    "message": "API is running"
  }
  ```
