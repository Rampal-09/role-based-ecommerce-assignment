import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  Shield,
  TrendingUp,
  PlusCircle,
  LogOut,
  LayoutGrid,
  Home,
  Package,
  ShoppingCart,
  Heart,
  LogIn,
  UserPlus,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isSales } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const isStaff = isAdmin || isSales;

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const adminLinks = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: Shield },
    { label: 'Seller Dashboard', path: '/sales/dashboard', icon: TrendingUp },
    { label: 'Store Catalog', path: '/products', icon: LayoutGrid },
    { label: 'Add New Product', path: '/products/new', icon: PlusCircle, highlight: true },
  ];

  const salesLinks = [
    { label: 'Seller Dashboard', path: '/sales/dashboard', icon: TrendingUp },
    { label: 'Store Catalog', path: '/products', icon: LayoutGrid },
    { label: 'Add New Product', path: '/products/new', icon: PlusCircle, highlight: true },
  ];

  const customerLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Products Catalog', path: '/products', icon: LayoutGrid },
    { label: 'My Orders', path: '/orders', icon: Package },
    { label: 'Shopping Cart', path: '/cart', icon: ShoppingCart, count: cartCount },
    { label: 'Saved Wishlist', path: '/wishlist', icon: Heart, count: wishlistCount },
  ];

  const guestLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Products Catalog', path: '/products', icon: LayoutGrid },
    { label: 'Shopping Cart', path: '/cart', icon: ShoppingCart, count: cartCount },
    { label: 'Saved Wishlist', path: '/wishlist', icon: Heart, count: wishlistCount },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 animate-in fade-in duration-200 ${
            isStaff ? 'lg:hidden' : ''
          }`}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200/90 shadow-2xl lg:shadow-none flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isStaff
            ? isOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0 lg:w-64'
            : isOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="overflow-y-auto flex-1">
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <Link
              to="/"
              onClick={() => onClose && onClose()}
              className="flex items-center space-x-3 group"
            >
              <div className="w-9 h-9 rounded-2xl bg-brand-gradient text-white font-black text-base shadow-brand-glow flex items-center justify-center font-display group-hover:scale-105 transition-transform">
                CH
              </div>
              <span className="font-display font-bold text-base text-slate-900 tracking-tight block">
                CommerceHub
              </span>
            </Link>

            {/* Close Button on Mobile / Drawer */}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
                isStaff ? 'lg:hidden' : ''
              }`}
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Card */}
          {user ? (
            <div className="p-3.5 mx-3.5 my-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-brand-gradient text-white font-black text-xs flex items-center justify-center shadow-xs uppercase">
                  {user.name ? user.name.slice(0, 2) : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 mx-3.5 my-4 bg-gradient-to-br from-indigo-50/60 to-slate-50 border border-indigo-100/80 rounded-2xl">
              <p className="text-xs font-bold text-slate-900">Welcome to CommerceHub</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Sign in to access your orders and checkout.</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Link
                  to="/login"
                  onClick={() => onClose && onClose()}
                  className="flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => onClose && onClose()}
                  className="flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-gradient shadow-brand-glow rounded-xl hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="px-3 space-y-1">
            <span className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              {isStaff ? 'Management Menu' : 'Store Navigation'}
            </span>

            {(isStaff ? (isAdmin ? adminLinks : salesLinks) : user ? customerLinks : guestLinks).map(
              (item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => onClose && onClose()}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      active
                        ? isStaff
                          ? isAdmin
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs'
                            : 'bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs'
                        : item.highlight
                        ? 'text-indigo-600 hover:bg-indigo-50/80'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          active
                            ? isStaff
                              ? isAdmin
                                ? 'text-rose-600'
                                : 'text-amber-600'
                              : 'text-indigo-600'
                            : item.highlight
                            ? 'text-indigo-600'
                            : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== undefined && item.count > 0 && (
                      <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              }
            )}
          </div>
        </div>

        {/* Bottom Footer & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {isStaff && (
            <Link
              to="/"
              onClick={() => onClose && onClose()}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Storefront Home</span>
            </Link>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
