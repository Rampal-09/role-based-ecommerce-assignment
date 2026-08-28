import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Truck,
  Layers,
  Sparkles,
  Smartphone,
  Shirt,
  Watch,
  Home as HomeIcon,
  PackageCheck,
  CreditCard,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Electronics', icon: Smartphone, bg: 'bg-blue-50 text-blue-600 border-blue-200' },
  { name: 'Fashion', icon: Shirt, bg: 'bg-rose-50 text-rose-600 border-rose-200' },
  { name: 'Footwear', icon: Watch, bg: 'bg-amber-50 text-amber-600 border-amber-200' },
  { name: 'Home', icon: HomeIcon, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
];

export default function HomePage() {
  const { user, isAdmin, isSales } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/20 to-slate-50 border-b border-slate-200/80 py-16 sm:py-24">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-400/10 via-violet-400/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Discover Quality Products & Effortless Shopping</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-slate-900 leading-tight">
            The Modern Storefront for <br />
            <span className="text-brand-gradient">Next-Gen E-Commerce</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mt-5 max-w-2xl mx-auto leading-relaxed">
            Explore curated collections of premium electronics, fashion, footwear, and home essentials with instant, secure 256-bit encrypted checkout.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/products"
              className="px-7 py-3.5 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Products Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="px-6 py-3.5 bg-white text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold rounded-2xl shadow-2xs hover:bg-rose-50 transition-all"
              >
                <span>Admin Dashboard</span>
              </Link>
            )}

            {isSales && (
              <Link
                to="/sales/dashboard"
                className="px-6 py-3.5 bg-white text-amber-800 border border-amber-200 text-xs sm:text-sm font-bold rounded-2xl shadow-2xs hover:bg-amber-50 transition-all"
              >
                <span>Sales Merchant Portal</span>
              </Link>
            )}

            {user && !isAdmin && !isSales && (
              <Link
                to="/orders"
                className="px-6 py-3.5 bg-white text-slate-700 border border-slate-200 text-xs sm:text-sm font-bold rounded-2xl shadow-2xs hover:bg-slate-100 transition-all flex items-center space-x-1.5"
              >
                <PackageCheck className="w-4 h-4 text-indigo-600" />
                <span>My Past Orders</span>
              </Link>
            )}

            <Link
              to="/test-access"
              className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-2xl transition-colors flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>RBAC Live Matrix</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Categories Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider block">
              Categories
            </span>
            <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">
              Shop by Department
            </h2>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:-translate-y-1 hover:border-indigo-300 transition-all text-center group flex flex-col items-center justify-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-2xs`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 mt-0.5">Explore Catalog &rarr;</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Trust & Feature Badges */}
      <div className="bg-white border-y border-slate-200/80 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Secure Payments</h4>
                <p className="text-xs text-slate-500 mt-0.5">Cryptographic 256-bit Razorpay verified checkout</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Verified Merchants</h4>
                <p className="text-xs text-slate-500 mt-0.5">All products listed by authenticated vendors</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Live Inventory</h4>
                <p className="text-xs text-slate-500 mt-0.5">Automated stock decrement & order snapshots</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Multi-Role RBAC</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tailored controls for Admins, Sales, and Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Modern Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-brand-gradient text-white font-black text-xs flex items-center justify-center font-display">
              CH
            </div>
            <span className="font-bold text-slate-200">CommerceHub</span>
            <span>&bull; Role-Based E-Commerce Platform</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400 text-xs">
            <Link to="/products" className="hover:text-white transition-colors">Catalog</Link>
            <Link to="/test-access" className="hover:text-white transition-colors">RBAC Matrix</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>

          <p className="text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} CommerceHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
