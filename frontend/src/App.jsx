import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TestAccessPage from './pages/TestAccessPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import UserOrdersPage from './pages/UserOrdersPage';
import SalesDashboardPage from './pages/SalesDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailsPage />} />
                  <Route
                    path="/products/new"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'sales']}>
                        <AddProductPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products/:id/edit"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'sales']}>
                        <EditProductPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute allowedRoles={['user', 'sales', 'admin']}>
                        <UserOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sales/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['sales', 'admin']}>
                        <SalesDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/test-access" element={<TestAccessPage />} />
                </Routes>
              </main>
            </div>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
