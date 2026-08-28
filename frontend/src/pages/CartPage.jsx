import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react';

const CartPage = () => {
  const { user } = useAuth();
  const { cart, cartCount, cartSubtotal, updateQuantity, removeFromCart, loading } = useCart();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black font-display text-slate-900 mb-2">
          Your Shopping Cart
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6">
          Please log in to access your personal shopping cart and checkout.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 transition-all"
        >
          <span>Sign In to Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-500 mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black font-display text-slate-900 mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-xs mx-auto">
          Explore our product catalog and add your favorite items to your cart.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <span>Browse Products Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'total items'})</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">
          Review Your Order
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const itemSubtotal = product.price * item.quantity;
            const maxStock = product.stock || 999;
            const isAtMaxStock = item.quantity >= maxStock;

            return (
              <div
                key={product._id}
                className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Product Thumbnail & Info */}
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80 flex-shrink-0">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full uppercase">
                      {product.category}
                    </span>
                    <Link
                      to={`/products/${product._id}`}
                      className="font-display font-bold text-slate-900 text-sm sm:text-base hover:text-indigo-600 transition-colors block truncate mt-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {formatCurrency(product.price)} each
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 sm:space-x-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity picker */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block sm:hidden mb-1">
                      Qty
                    </span>
                    <div className="inline-flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 rounded-xl hover:bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-8 text-center text-xs sm:text-sm font-bold text-slate-900 font-display">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        disabled={isAtMaxStock}
                        className="p-1.5 rounded-xl hover:bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title={isAtMaxStock ? 'Maximum stock reached' : 'Increase quantity'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right min-w-[80px]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total
                    </span>
                    <span className="text-sm sm:text-base font-black font-display text-slate-900">
                      {formatCurrency(itemSubtotal)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold font-display text-slate-900 mb-6">
            Order Summary
          </h2>

          <div className="space-y-3.5 text-xs sm:text-sm border-b border-slate-100 pb-5">
            <div className="flex justify-between text-slate-600">
              <span>Total Units</span>
              <span className="font-bold text-slate-900 font-display">{cartCount} items</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900 font-display">{formatCurrency(cartSubtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Standard Shipping</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
          </div>

          <div className="py-5 flex justify-between items-baseline">
            <span className="text-base font-bold text-slate-900 font-display">
              Estimated Total
            </span>
            <span className="text-2xl font-black font-display text-indigo-600">
              {formatCurrency(cartSubtotal)}
            </span>
          </div>

          {/* Checkout button placeholder for Task 7 */}
          <button
            type="button"
            className="w-full py-3.5 px-4 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Proceed to Checkout</span>
          </button>

          <p className="text-[11px] text-center text-slate-400 mt-4 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Razorpay Payment Gateway integration in Task 7</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
