import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import productService from '../services/productService';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  PlusCircle,
  Edit3,
  Trash2,
  DollarSign,
  Layers,
  Calendar,
  User,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';

const SalesDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products'

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getSellerDashboard();
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load seller dashboard.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error loading sales dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      const res = await productService.deleteProduct(productId);
      if (res.success) {
        fetchDashboardData();
      } else {
        alert(res.message || 'Failed to delete product.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product.');
    }
  };

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
        <p className="text-sm font-semibold font-display text-slate-600">
          Loading Sales Merchant Dashboard...
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
          Dashboard Unavailable
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

  const { stats, orders, myProducts } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header & Actions */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            <span>Merchant Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">
            Sales Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track revenue, fulfill orders containing your products, and manage your inventory.
          </p>
        </div>

        <Link
          to="/products/new"
          className="px-5 py-3 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Seller Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
            My Product Revenue
          </span>
          <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 block">
            {formatCurrency(stats.sellerRevenue)}
          </span>
        </div>

        {/* Units Sold */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
            Units Sold
          </span>
          <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 block">
            {stats.sellerUnitsSold} units
          </span>
        </div>

        {/* Orders Involving My Products */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
            Orders Containing My Items
          </span>
          <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 block">
            {stats.ordersCount}
          </span>
        </div>

        {/* My Listed Products */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
            Active Catalog Items
          </span>
          <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 block">
            {stats.productsCount}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Listed Products ({myProducts.length})</span>
        </button>
      </div>

      {/* Tab 1: Customer Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500 text-xs">
              No orders have been placed for your products yet.
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
                      <span className="font-semibold text-slate-700">
                        {order.buyer.name} ({order.buyer.email})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block uppercase text-[10px] font-bold">
                        Order Date
                      </span>
                      <span className="text-slate-600">{formatDate(order.orderDate)}</span>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase rounded-full self-start sm:self-auto">
                    {order.status}
                  </span>
                </div>

                <div className="p-4 sm:p-5 divide-y divide-slate-100">
                  {order.sellerItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs sm:text-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {item.quantity} &times; {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="font-black font-display text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50/50 p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">
                    My Portion of Order
                  </span>
                  <span className="font-black font-display text-indigo-600 text-base">
                    {formatCurrency(order.sellerSubtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: My Listed Products */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {myProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              You haven't listed any products yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="p-4 sm:px-6">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 sm:px-6 flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>
                        <div>
                          <Link
                            to={`/products/${prod._id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1"
                          >
                            {prod.name}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ID: {prod._id.slice(-6)}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full uppercase">
                          {prod.category}
                        </span>
                      </td>

                      <td className="p-4 font-black font-display text-slate-900">
                        {formatCurrency(prod.price)}
                      </td>

                      <td className="p-4">
                        {prod.stock <= 0 ? (
                          <span className="text-rose-600 font-bold">0 (Out of stock)</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">{prod.stock} units</span>
                        )}
                      </td>

                      <td className="p-4 sm:px-6 text-right space-x-2">
                        <Link
                          to={`/products/${prod._id}`}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors inline-block"
                          title="View Product Specs"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/products/${prod._id}/edit`}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors inline-block"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDeleteProduct(prod._id, prod.name)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesDashboardPage;
