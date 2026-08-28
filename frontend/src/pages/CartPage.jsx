import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import paymentService from '../services/paymentService';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CartPage = () => {
  const { user } = useAuth();
  const { cart, cartCount, cartSubtotal, updateQuantity, removeFromCart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    setCheckoutError('');

    try {
      // 1. Create Razorpay order on backend
      const orderData = await paymentService.createOrder();
      if (!orderData.success || !orderData.orderId) {
        setCheckoutError(orderData.message || 'Failed to initialize checkout order.');
        setIsProcessing(false);
        return;
      }

      // 2. Ensure Razorpay checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();

      // Check if we are running in real Razorpay checkout or test environment
      if (isScriptLoaded && window.Razorpay && !orderData.orderId.startsWith('order_mock_')) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: orderData.currency || 'INR',
          name: 'CommerceHub Store',
          description: `Order Checkout (${cartCount} items)`,
          order_id: orderData.orderId,
          prefill: {
            name: user.name || '',
            email: user.email || '',
          },
          theme: {
            color: '#4f46e5',
          },
          handler: async (response) => {
            try {
              // 3. Verify signature on backend
              const verifyRes = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success && verifyRes.data) {
                await fetchCart();
                navigate(`/order-success/${verifyRes.data.orderId}`, {
                  state: { order: verifyRes.data },
                });
              } else {
                setCheckoutError(verifyRes.message || 'Payment verification failed.');
              }
            } catch (err) {
              setCheckoutError(err.response?.data?.message || 'Error verifying payment signature.');
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response) => {
          setCheckoutError('Payment failed: ' + (response.error?.description || 'Transaction cancelled'));
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback test mode simulation (for mock test environments)
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const verifyRes = await paymentService.verifyPayment({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'mock_signature',
        });

        if (verifyRes.success && verifyRes.data) {
          await fetchCart();
          navigate(`/order-success/${verifyRes.data.orderId}`, {
            state: { order: verifyRes.data },
          });
        } else {
          setCheckoutError(verifyRes.message || 'Payment verification failed.');
        }
        setIsProcessing(false);
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Server error processing checkout.');
      setIsProcessing(false);
    }
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

      {/* Checkout error banner if any */}
      {checkoutError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center space-x-2 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

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
                className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
              >
                {/* Product Thumbnail & Info */}
                <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80 flex-shrink-0">
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
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase">
                      {product.category}
                    </span>
                    <Link
                      to={`/products/${product._id}`}
                      className="font-display font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors block truncate mt-0.5"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {formatCurrency(product.price)} each
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3 sm:space-x-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity picker */}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block sm:hidden mb-0.5">
                      Qty
                    </span>
                    <div className="inline-flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isProcessing}
                        className="p-1 rounded-lg hover:bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-6 text-center text-xs font-bold text-slate-900 font-display">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        disabled={isAtMaxStock || isProcessing}
                        className="p-1 rounded-lg hover:bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title={isAtMaxStock ? 'Maximum stock reached' : 'Increase quantity'}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      Total
                    </span>
                    <span className="text-sm font-black font-display text-slate-900">
                      {formatCurrency(itemSubtotal)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product._id)}
                    disabled={isProcessing}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold font-display text-slate-900 mb-4">
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

          {/* Checkout button connected to Razorpay */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={isProcessing || cart.items.length === 0}
            className="w-full py-3.5 px-4 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Razorpay Checkout...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Proceed to Razorpay Checkout</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 mt-4 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-bit encrypted checkout with Razorpay</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
