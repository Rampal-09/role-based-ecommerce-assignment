import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { CheckCircle2, XCircle, Loader2, Shield, Store, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    success: false,
    message: '',
    error: null,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get('/health');
        setHealthStatus({
          loading: false,
          success: response.data?.success || false,
          message: response.data?.message || 'Connected successfully',
          error: null,
        });
      } catch (err) {
        setHealthStatus({
          loading: false,
          success: false,
          message: 'Failed to connect to backend',
          error: err.message || 'Network Error',
        });
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-3">
            <span>Assignment Setup Status: Initialized</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
            Role-Based E-Commerce Platform
          </h1>
          <p className="text-slate-400 mt-2 text-base">
            Full Stack Assessment System Architecture & Health Verification
          </p>
        </div>

        {/* Backend Health Check Card */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Backend API Health Status (`GET /api/health`)
          </h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {healthStatus.loading ? (
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              ) : healthStatus.success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400" />
              )}
              <div>
                <p className="font-medium text-slate-100">
                  {healthStatus.loading
                    ? 'Checking backend connection...'
                    : healthStatus.success
                    ? `Status: ${healthStatus.message}`
                    : `Error: ${healthStatus.message}`}
                </p>
                {healthStatus.error && (
                  <p className="text-xs text-rose-400 mt-0.5">{healthStatus.error}</p>
                )}
              </div>
            </div>

            <div>
              {healthStatus.loading ? (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400">
                  Checking...
                </span>
              ) : healthStatus.success ? (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  200 OK
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Offline / Disconnected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Roles Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200">Admin Role</h3>
            <p className="text-xs text-slate-400 mt-1">
              Full product control, manage users & roles, all orders, and sales stats.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200">Sales Person</h3>
            <p className="text-xs text-slate-400 mt-1">
              Create, edit, and delete only owned products; view product-specific orders.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200">User Role</h3>
            <p className="text-xs text-slate-400 mt-1">
              Browse, search & filter products, manage cart/wishlist, and checkout.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 text-center text-xs text-slate-500">
          Role-Based E-Commerce Platform &bull; Project Initialization Stage (Task 1 Complete)
        </div>
      </div>
    </div>
  );
}
