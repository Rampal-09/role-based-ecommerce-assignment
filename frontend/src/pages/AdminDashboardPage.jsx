import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import {
  Shield,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  PlusCircle,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'users'

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, usersRes] = await Promise.all([
        orderService.getAdminDashboard(),
        orderService.getAdminUsers(),
      ]);

      if (dashRes.success) {
        setData(dashRes);
      } else {
        setError(dashRes.message || 'Failed to load admin stats.');
      }

      if (usersRes.success) {
        setUsersList(usersRes.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error loading admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
            Admin
          </span>
        );
      case 'sales':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            Sales
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
            Customer
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-4" />
        <p className="text-sm font-semibold font-display text-slate-600">
          Loading Administrator Superuser Dashboard...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
          Admin Dashboard Error
        </h2>
        <p className="text-xs text-slate-600 mb-6">{error}</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-gradient text-white text-xs font-bold rounded-xl"
        >
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  const { stats, orders } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Quick Action Buttons */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-rose-50 border border-rose-200 rounded-full text-xs font-bold text-rose-800 mb-2">
            <Shield className="w-3.5 h-3.5 text-rose-600" />
            <span>Superuser Control Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Store-wide overview, revenue analytics, customer order fulfillment, and user access directory.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <Link
            to="/products/new"
            className="px-4 py-2.5 bg-brand-gradient text-white text-xs font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 4 Superuser Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Store Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
            Total Store Revenue
          </span>
          <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 block">
            {formatCurrency(stats.totalRevenue)}
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
            Total Orders Placed
          </span>
          <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 block">
            {stats.totalOrders}
          </span>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
            Total Catalog Products
          </span>
          <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 block">
            {stats.totalProducts}
          </span>
        </div>

        {/* Total Users & Role Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
            Registered Users
          </span>
          <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 block">
            {stats.totalUsers}
          </span>
          <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-slate-500 font-semibold">
            <span>{stats.usersByRole?.admin || 0} Admins</span>
            <span>&bull;</span>
            <span>{stats.usersByRole?.sales || 0} Sales</span>
            <span>&bull;</span>
            <span>{stats.usersByRole?.user || 0} Users</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>All Store Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users Directory ({usersList.length})</span>
        </button>
      </div>

      {/* Tab 1: All Store Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500 text-xs">
              No orders have been recorded in the system yet.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden"
              >
                <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    <div>
                      <span className="text-slate-400 block uppercase text-[10px] font-bold">
                        Order ID
                      </span>
                      <span className="font-mono font-bold text-slate-800 break-all">
                        {order._id}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block uppercase text-[10px] font-bold">
                        Customer
                      </span>
                      <span className="font-bold text-slate-800">
                        {order.user ? `${order.user.name} (${order.user.email})` : 'Deleted Customer'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block uppercase text-[10px] font-bold">
                        Date
                      </span>
                      <span className="text-slate-600">{formatDate(order.createdAt)}</span>
                    </div>

                    {order.razorpayPaymentId && (
                      <div>
                        <span className="text-slate-400 block uppercase text-[10px] font-bold">
                          Razorpay Payment ID
                        </span>
                        <span className="font-mono text-slate-600">{order.razorpayPaymentId}</span>
                      </div>
                    )}
                  </div>

                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full self-start sm:self-auto">
                    {order.status}
                  </span>
                </div>

                <div className="p-4 sm:p-5 divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs sm:text-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Qty: <span className="font-semibold text-slate-700">{item.quantity}</span> &times; {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="font-black font-display text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50/50 p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Order Grand Total</span>
                  <span className="font-black font-display text-indigo-600 text-base">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Users Directory */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="p-4 sm:px-6">User Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Role Permission</th>
                  <th className="p-4 sm:px-6">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 sm:px-6 font-bold text-slate-900 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-brand-gradient text-white text-xs font-black flex items-center justify-center uppercase">
                        {u.name ? u.name.slice(0, 2) : 'U'}
                      </div>
                      <span>{u.name}</span>
                    </td>

                    <td className="p-4 text-slate-600">{u.email}</td>

                    <td className="p-4">{getRoleBadge(u.role)}</td>

                    <td className="p-4 sm:px-6 text-slate-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
