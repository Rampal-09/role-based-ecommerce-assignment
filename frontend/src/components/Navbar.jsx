import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  ShoppingCart,
  Heart,
  PlusCircle,
  LayoutGrid,
  Package,
  TrendingUp,
  Shield,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isSales } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
            Admin
          </span>
        );
      case 'sales':
        return (
          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            Sales
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
            Customer
          </span>
        );
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-brand-gradient text-white font-black text-lg shadow-brand-glow flex items-center justify-center font-display group-hover:scale-105 transition-transform">
            CH
          </div>
          <div>
            <span className="font-display font-bold text-lg text-slate-900 tracking-tight block">
              CommerceHub
            </span>
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block -mt-1">
              Role-Based RBAC
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          <Link
            to="/"
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              isActive('/')
                ? 'bg-brand-gradient text-white shadow-brand-glow'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Home
          </Link>

          {/* Products Catalog */}
          <Link
            to="/products"
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              isActive('/products')
                ? 'bg-brand-gradient text-white shadow-brand-glow'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Products</span>
          </Link>

          {/* Role-Specific Link: Customer -> My Orders */}
          {user && !isAdmin && !isSales && (
            <Link
              to="/orders"
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                isActive('/orders')
                  ? 'bg-brand-gradient text-white shadow-brand-glow'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </Link>
          )}

          {/* Role-Specific Link: Sales Person -> Sales Dashboard */}
          {isSales && (
            <Link
              to="/sales/dashboard"
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                isActive('/sales/dashboard')
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-50 font-bold'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Sales Dashboard</span>
            </Link>
          )}

          {/* Role-Specific Link: Admin -> Admin Dashboard */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                isActive('/admin/dashboard')
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 hover:bg-rose-50 font-bold'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          {/* Add Product link visible to Admin and Sales */}
          {(isAdmin || isSales) && (
            <Link
              to="/products/new"
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                isActive('/products/new')
                  ? 'bg-brand-gradient text-white shadow-brand-glow'
                  : 'text-indigo-600 hover:bg-indigo-50 font-bold'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Add Product</span>
            </Link>
          )}

          {/* RBAC Live Test */}
          <Link
            to="/test-access"
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              isActive('/test-access')
                ? 'bg-brand-gradient text-white shadow-brand-glow'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden lg:inline">RBAC Test</span>
          </Link>
        </nav>

        {/* User Auth, Wishlist & Cart Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Wishlist & Cart Links - Exclusively for Customers */}
          {(!user || (!isAdmin && !isSales)) && (
            <>
              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className={`relative p-2.5 rounded-xl transition-all ${
                  isActive('/wishlist')
                    ? 'bg-violet-50 text-violet-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title="My Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Link */}
              <Link
                to="/cart"
                className={`relative p-2.5 rounded-xl transition-all ${
                  isActive('/cart')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title="My Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3 pl-1 border-l border-slate-200/80">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/90 rounded-2xl px-3 py-1.5 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-brand-gradient text-white font-black text-xs flex items-center justify-center border border-indigo-200 shadow-xs uppercase">
                  {user.name ? user.name.slice(0, 2) : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user.name}
                  </div>
                  <div className="flex items-center space-x-1 mt-0.5">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all flex items-center space-x-1"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 pl-1 border-l border-slate-200/80">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all flex items-center space-x-1"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-gradient shadow-brand-glow rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center space-x-1"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
