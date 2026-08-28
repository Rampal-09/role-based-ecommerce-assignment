import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';

const WishlistPage = () => {
  const { user } = useAuth();
  const { wishlist, wishlistCount, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleMoveToCart = async (product) => {
    await addToCart(product._id, 1);
    await removeFromWishlist(product._id);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black font-display text-slate-900 mb-2">
          Your Wishlist
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6">
          Please log in to view and manage your saved wishlist items.
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

  if (wishlist.products.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-violet-50/80 border border-violet-100 flex items-center justify-center text-violet-500 mx-auto mb-4">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black font-display text-slate-900 mb-2">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-xs mx-auto">
          Save your favorite products to your wishlist so you can find them later.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-violet-50 border border-violet-100 rounded-full text-xs font-bold text-violet-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Saved Products ({wishlistCount} {wishlistCount === 1 ? 'item' : 'items'})</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">
            My Wishlist
          </h1>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {wishlist.products.map((product) => {
          if (!product) return null;
          const isOutOfStock = product.stock <= 0;

          return (
            <div
              key={product._id}
              className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-0.5 hover:border-violet-200/60 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Product Image */}
              <div className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden">
                <Link to={`/products/${product._id}`}>
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </Link>

                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-800 text-[10px] font-bold rounded-md shadow-2xs uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>

                {/* Remove from wishlist button */}
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full backdrop-blur-md shadow-2xs transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info & Action */}
              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-display font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-sm sm:text-base font-black font-display text-slate-900">
                      {formatCurrency(product.price)}
                    </span>

                    {isOutOfStock ? (
                      <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold rounded-md">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold rounded-md">
                        In Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Move to Cart button */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={isOutOfStock}
                    className={`w-full py-2 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-brand-gradient text-white shadow-brand-glow hover:-translate-y-0.5 active:scale-95'
                    }`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
