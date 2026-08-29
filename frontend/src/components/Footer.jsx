import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Heart, Package } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/90 text-slate-600 mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand-glow group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                Commerce<span className="text-indigo-600">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Next-generation role-based e-commerce platform featuring dynamic inventory tracking, secure multi-role dashboards, and seamless shopping experiences.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Enterprise Ready
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Live Inventory
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/products" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
              Categories
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/products?category=Electronics" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/products?category=Fashion" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link to="/products?category=Footwear" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Footwear
                </Link>
              </li>
              <li>
                <Link to="/products?category=Home" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Home & Living
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Access */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-display">
              Account
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/sales/dashboard" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Sales Portal
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bottom Bar */}
      <div className="border-t border-slate-100 bg-slate-50/50 py-6 text-xs font-medium text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-brand-gradient text-white font-black text-[10px] flex items-center justify-center font-display">
              CH
            </div>
            <span>&copy; {new Date().getFullYear()} CommerceHub, Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6">
            <span className="text-slate-400 text-xs">Role-Based E-Commerce Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
