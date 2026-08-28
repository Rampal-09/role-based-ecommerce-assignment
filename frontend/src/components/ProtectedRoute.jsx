import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component for route authorization guards
 * @param {Array} allowedRoles - Optional array of allowed roles, e.g. ['admin'], ['admin', 'sales']
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 font-display">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl font-bold border border-red-200">
            🚫
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 mb-2">Access Denied (403)</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your current role (<span className="font-semibold text-indigo-600 uppercase">{user.role}</span>) does not have permission to view this resource.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-brand-gradient text-white text-sm font-semibold rounded-xl shadow-brand-glow hover:-translate-y-0.5 transition-all"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
