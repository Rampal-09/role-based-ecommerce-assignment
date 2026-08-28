import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, Clock, FileText } from 'lucide-react';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const orderDetails = location.state?.order || null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-12 text-center">
        {/* Animated Checkmark Badge */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xs animate-in zoom-in-50 duration-500">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Heading */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Payment Verified & Confirmed</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight mb-2">
          Thank You for Your Order!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-8">
          Your Razorpay test payment was cryptographically verified and your order has been securely registered in the system.
        </p>

        {/* Order Details Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 mb-8 text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Order ID
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 break-all">
                {orderId}
              </span>
            </div>

            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full self-start sm:self-auto uppercase tracking-wider">
              Paid & Confirmed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Payment Gateway</span>
              <span className="font-bold text-slate-800">Razorpay (Test Mode)</span>
            </div>

            {orderDetails?.totalAmount !== undefined && (
              <div>
                <span className="text-slate-400 block font-medium">Total Amount Paid</span>
                <span className="font-black font-display text-indigo-600 text-sm">
                  {formatCurrency(orderDetails.totalAmount)}
                </span>
              </div>
            )}

            <div>
              <span className="text-slate-400 block font-medium">Cart Status</span>
              <span className="font-bold text-emerald-600">Cleared (0 items)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/products"
            className="px-6 py-3 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all flex items-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/orders"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-2xl transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>View Order History</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
