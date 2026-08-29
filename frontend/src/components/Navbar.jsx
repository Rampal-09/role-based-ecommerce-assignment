import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Sidebar from './Sidebar';
import {
  LogOut,
  LogIn,
  UserPlus,
  ShoppingCart,
  Heart,
  LayoutGrid,
  Package,
  Menu,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isSales } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isInternalStaff = isAdmin || isSales;

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all ${
          isInternalStaff ? 'lg:pl-64' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Left section: Hamburger Button + Brand Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Mobile Hamburger Menu Button for all users */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center ${
                isInternalStaff ? 'lg:hidden' : 'md:hidden'
              }`}
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Brand Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-gradient text-white font-black text-sm sm:text-lg shadow-brand-glow flex items-center justify-center font-display group-hover:scale-105 transition-transform flex-shrink-0">
                CH
              </div>
              <span className="font-display font-bold text-base sm:text-lg text-slate-900 tracking-tight hidden min-[360px]:inline">
                Commerce<span className="text-indigo-600">Hub</span>
              </span>
            </Link>
          </div>

          {/* Center section: Desktop Navigation Links (for Customers & Guests) */}
          {!isInternalStaff && (
            <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                  isActive('/products')
                    ? 'bg-brand-gradient text-white shadow-brand-glow'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Products</span>
              </Link>

              {/* My Orders for Customers */}
              {user && user.role === 'user' && (
                <Link
                  to="/orders"
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                    isActive('/orders')
                      ? 'bg-brand-gradient text-white shadow-brand-glow'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>My Orders</span>
                </Link>
              )}
            </nav>
          )}

          {/* Right section: Wishlist, Cart & Auth */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-shrink-0">
            {/* Wishlist & Cart Links - Exclusively for Customers/Guests */}
            {!isInternalStaff && (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                {/* Wishlist Link */}
                <Link
                  to="/wishlist"
                  className={`relative p-2 sm:p-2.5 rounded-xl transition-all flex-shrink-0 ${
                    isActive('/wishlist')
                      ? 'bg-violet-50 text-violet-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title="My Wishlist"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Link */}
                <Link
                  to="/cart"
                  className={`relative p-2 sm:p-2.5 rounded-xl transition-all flex-shrink-0 ${
                    isActive('/cart')
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title="My Shopping Cart"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            )}

            {/* User Profile / Auth Actions */}
            {user ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1 sm:pl-2 border-l border-slate-200/80 flex-shrink-0">
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/90 rounded-2xl px-2 py-1 sm:px-3 sm:py-1.5 shadow-2xs">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-gradient text-white font-black text-xs flex items-center justify-center border border-indigo-200 shadow-xs uppercase flex-shrink-0">
                    {user.name ? user.name.slice(0, 2) : 'U'}
                  </div>
                  <div className="text-left hidden sm:block max-w-[100px] truncate">
                    <span className="text-xs font-bold text-slate-800 leading-tight block truncate">
                      {user.name}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all flex items-center space-x-1 flex-shrink-0"
                  title="Log Out"
                  aria-label="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1 sm:pl-2 border-l border-slate-200/80 flex-shrink-0">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all flex items-center space-x-1 flex-shrink-0"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:flex px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-gradient shadow-brand-glow rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all items-center space-x-1 flex-shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Responsive Mobile / Staff Sidebar Drawer */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default Navbar;
