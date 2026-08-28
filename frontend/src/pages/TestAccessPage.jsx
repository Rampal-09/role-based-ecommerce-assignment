import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Lock, Play, Sparkles } from 'lucide-react';

const TestAccessPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState({});
  const [loadingEndpoint, setLoadingEndpoint] = useState(null);

  const testEndpoint = async (endpointKey, url) => {
    setLoadingEndpoint(endpointKey);
    try {
      const res = await api.get(url);
      setResults((prev) => ({
        ...prev,
        [endpointKey]: {
          status: res.status,
          success: true,
          data: res.data,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [endpointKey]: {
          status: err.response?.status || 'Network Error',
          success: false,
          data: err.response?.data || { message: err.message },
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setLoadingEndpoint(null);
    }
  };

  const testAllEndpoints = async () => {
    await testEndpoint('admin', '/test/admin');
    await testEndpoint('sales', '/test/sales');
    await testEndpoint('user', '/test/user');
  };

  const routesToTest = [
    {
      key: 'admin',
      url: '/test/admin',
      name: 'Admin Only Route',
      description: 'Requires authentication and "admin" role.',
      allowedRoles: ['admin'],
    },
    {
      key: 'sales',
      url: '/test/sales',
      name: 'Sales & Admin Route',
      description: 'Requires authentication and either "admin" or "sales" role.',
      allowedRoles: ['admin', 'sales'],
    },
    {
      key: 'user',
      url: '/test/user',
      name: 'User (Customer) Route',
      description: 'Requires authentication and "user" role.',
      allowedRoles: ['user'],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Backend RBAC Authorization Testing Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              Role-Based Access Control Verification
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Execute live HTTP GET requests to backend protected routes. Backend authorization enforces
              role access independent of the client interface.
            </p>
          </div>

          <button
            onClick={testAllEndpoints}
            disabled={loadingEndpoint !== null}
            className="px-5 py-3 bg-brand-gradient text-white text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all flex items-center space-x-2 self-start sm:self-center disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Test All Endpoints</span>
          </button>
        </div>

        {/* Current User Session Status */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active Session:
          </span>
          {user ? (
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs">
              <span className="font-semibold text-slate-900">{user.name}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">{user.email}</span>
              <span className="text-slate-400">|</span>
              <span className="px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] bg-brand-gradient text-white shadow-2xs">
                Role: {user.role}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Unauthenticated (No active session cookie)</span>
            </div>
          )}
        </div>
      </div>

      {/* Test Route Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {routesToTest.map((route) => {
          const result = results[route.key];
          const isExpectedAllowed = user && route.allowedRoles.includes(user.role);

          return (
            <div
              key={route.key}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 font-display">
                    GET {route.url}
                  </span>
                  <div className="flex gap-1">
                    {route.allowedRoles.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-lg font-bold font-display text-slate-900 mb-1">
                  {route.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4">{route.description}</p>

                {/* Expected Outcome Indicator */}
                <div className="mb-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Expected Result:</span>
                  <span
                    className={`font-bold ${
                      !user
                        ? 'text-amber-600'
                        : isExpectedAllowed
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {!user ? '401 Unauthorized' : isExpectedAllowed ? '200 OK' : '403 Forbidden'}
                  </span>
                </div>

                {/* Result Box */}
                {result && (
                  <div
                    className={`mb-4 p-3 rounded-2xl border text-xs animate-in fade-in ${
                      result.status === 200
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : result.status === 403
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : 'bg-amber-50/70 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <div className="flex items-center space-x-1.5">
                        {result.status === 200 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : result.status === 403 ? (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                        )}
                        <span>HTTP {result.status}</span>
                      </div>
                      <span className="text-[10px] font-normal text-slate-500">
                        {result.timestamp}
                      </span>
                    </div>
                    <pre className="mt-2 p-2 bg-white/80 rounded-xl overflow-x-auto text-[10px] font-mono text-slate-800 border border-slate-200/60">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <button
                onClick={() => testEndpoint(route.key, route.url)}
                disabled={loadingEndpoint === route.key}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {loadingEndpoint === route.key ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin"></div>
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Test</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestAccessPage;
