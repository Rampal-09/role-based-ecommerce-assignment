import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import {
  Package,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Calendar,
  CreditCard,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderService.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-semibold font-display text-slate-600">
          Loading your order history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
          Unable to Load Orders
        </h2>
        <p className="text-xs text-slate-600 mb-6">{error}</p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-gradient text-white text-xs font-bold rounded-xl shadow-brand-glow hover:-translate-y-0.5 transition-all"
        >
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-500 mx-auto mb-4">
          <Package className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black font-display text-slate-900 mb-2">
          No Orders Placed Yet
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-xs mx-auto">
          You haven't placed any orders yet. Browse our catalog and start shopping!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 mb-2">
          <Package className="w-3.5 h-3.5 text-indigo-600" />
          <span>Order History ({orders.length} {orders.length === 1 ? 'order' : 'orders'})</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">
          My Past Orders
        </h1>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden"
          >
            {/* Order Card Header */}
            <div className="bg-slate-50 p-4 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <span className="text-slate-400 block font-medium uppercase text-[10px] tracking-wider">
                    Order ID
                  </span>
                  <span className="font-mono font-bold text-slate-800 break-all">
                    {order._id}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium uppercase text-[10px] tracking-wider">
                    Placed On
                  </span>
                  <span className="font-semibold text-slate-700 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(order.createdAt)}</span>
                  </span>
                </div>

                {order.razorpayPaymentId && (
                  <div>
                    <span className="text-slate-400 block font-medium uppercase text-[10px] tracking-wider">
                      Payment ID
                    </span>
                    <span className="font-mono text-slate-600">
                      {order.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 self-start sm:self-auto">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full uppercase tracking-wider flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{order.status.toUpperCase()}</span>
                </span>
              </div>
            </div>

            {/* Order Items Table / List */}
            <div className="p-4 sm:p-6 divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs sm:text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Quantity: <span className="font-semibold text-slate-700">{item.quantity}</span> &times; {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-black font-display text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="bg-slate-50/50 p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Grand Total Paid
              </span>
              <span className="text-lg sm:text-xl font-black font-display text-indigo-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrdersPage;
