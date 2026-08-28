import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, ShoppingBag, ShieldCheck, ArrowRight, KeyRound, Lock, CheckCircle2, LayoutGrid, PlusCircle } from 'lucide-react';

export default function HomePage() {
  const { user, isAdmin, isSales } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-200/80 py-16 sm:py-24">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-400/10 via-violet-400/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Task 5: Product Catalog & Filters Active</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-slate-900 leading-tight">
            Role-Based E-Commerce <br />
            <span className="text-brand-gradient">Product Catalog & RBAC</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mt-5 max-w-2xl mx-auto leading-relaxed">
            Multi-role storefront with server-side keyword search, dynamic category filtering, price range filters, and backend ownership isolation.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/products"
              className="px-6 py-3 bg-brand-gradient text-white text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all flex items-center space-x-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Browse Product Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {(isAdmin || isSales) && (
              <Link
                to="/products/new"
                className="px-6 py-3 bg-white text-indigo-600 border border-indigo-200 text-sm font-semibold rounded-2xl shadow-2xs hover:bg-indigo-50 transition-all flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Add Product</span>
              </Link>
            )}

            <Link
              to="/test-access"
              className="px-6 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-2xl hover:bg-slate-200 transition-all flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>RBAC Live Matrix</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Session State Banner (if logged in) */}
      {user && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 w-full z-10">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Logged in as</p>
                <p className="text-sm font-bold text-slate-900">
                  {user.name} ({user.email})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Active Role:</span>
              <span className="px-3 py-1 bg-brand-gradient text-white text-xs font-black uppercase rounded-full shadow-2xs">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Role Specifications Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 text-center">
          Role-Based Access Matrix Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Role */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold font-display text-slate-900">Admin Role</h3>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                Superuser
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full administrative privileges. Create, edit, and delete any product in the store, manage users & roles, and oversee all operations.
            </p>
          </div>

          {/* Sales Role */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold font-display text-slate-900">Sales Role</h3>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                Merchant
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Merchant access. Create new products and manage (update/delete) strictly only products owned by them.
            </p>
          </div>

          {/* User Role */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold font-display text-slate-900">User Role</h3>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                Customer
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard consumer account. Can browse products, search, filter categories and price ranges, and view product details.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        Role-Based E-Commerce Platform &bull; Task 5 Product Catalog & Filtering
      </footer>
    </div>
  );
}
