import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Check, Loader2, Edit3 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { user, isAdmin, isSales } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const isOutOfStock = product.stock <= 0;
  const inWishlist = isInWishlist(product._id);

  // Check if current user is owner or admin
  const ownerId = typeof product.owner === 'object' ? product.owner?._id : product.owner;
  const currentUserId = user?._id || user?.id;
  const canManage = isAdmin || (isSales && ownerId && currentUserId && ownerId.toString() === currentUserId.toString());
  const isInternalStaff = isAdmin || isSales;

  // Format currency in INR
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (isInternalStaff) {
      setFeedbackMessage('Wishlist is only available for Customer accounts.');
      setTimeout(() => setFeedbackMessage(''), 2500);
      return;
    }

    setWishlistLoading(true);
    if (inWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
    setWishlistLoading(false);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    if (isInternalStaff) {
      setFeedbackMessage('Shopping cart is only available for Customer accounts.');
      setTimeout(() => setFeedbackMessage(''), 2500);
      return;
    }

    if (isOutOfStock) return;

    setIsAddingToCart(true);
    setFeedbackMessage('');

    const res = await addToCart(product._id, 1);
    setIsAddingToCart(false);

    if (res.success) {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 1500);
    } else {
      setFeedbackMessage(res.message);
      setTimeout(() => setFeedbackMessage(''), 2500);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200/60 transition-all duration-300 flex flex-col justify-between relative">
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <Link to={`/products/${product._id}`} className="block w-full h-full">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </Link>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-800 text-[10px] font-bold rounded-full shadow-2xs uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Wishlist Heart Floating Button (Visible only to Customers & Unauthenticated visitors) */}
        {!isInternalStaff && (
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-sm transition-all ${
              inWishlist
                ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105 shadow-rose-200'
                : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {wishlistLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white text-white' : ''}`} />
            )}
          </button>
        )}

        {/* Stock Badge */}
        <div className="absolute bottom-3 left-3">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 bg-rose-50/95 backdrop-blur-xs text-rose-700 border border-rose-200 text-[10px] font-bold rounded-full shadow-2xs">
              Out of Stock
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-emerald-50/95 backdrop-blur-xs text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full shadow-2xs">
              In Stock ({product.stock})
            </span>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/products/${product._id}`}>
            <h3 className="font-display font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Feedback message if any */}
        {feedbackMessage && (
          <p className="text-[11px] font-semibold text-rose-600 mt-2 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
            {feedbackMessage}
          </p>
        )}

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Price
            </span>
            <span className="text-base sm:text-lg font-black font-display text-slate-900">
              {formattedPrice}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* View Details */}
            <Link
              to={`/products/${product._id}`}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              title="View Product Details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            {/* If Admin or Sales owner -> Show Edit shortcut */}
            {canManage ? (
              <Link
                to={`/products/${product._id}/edit`}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1 border border-amber-200"
                title="Edit Product"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>
            ) : !isInternalStaff ? (
              /* If Customer -> Show Add to Cart Button */
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1 shadow-2xs ${
                  cartSuccess
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-brand-gradient text-white shadow-brand-glow hover:-translate-y-0.5 active:scale-95'
                }`}
                title={isOutOfStock ? 'Product is Out of Stock' : 'Add 1 to Shopping Cart'}
              >
                {isAddingToCart ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : cartSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Cart</span>
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
