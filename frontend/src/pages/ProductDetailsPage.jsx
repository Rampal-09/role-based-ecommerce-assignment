import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Heart,
  Plus,
  Minus,
  Loader2,
  Check,
  Edit3,
  Trash2,
} from 'lucide-react';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productService.getProductById(id);
        if (response.success && response.data) {
          setProduct(response.data);
        } else {
          setError(response.message || 'Product not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-semibold font-display text-slate-600">
          Loading product specifications...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 border border-red-200 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
          Product Not Found
        </h2>
        <p className="text-xs text-slate-600 mb-6">
          {error || 'The requested product does not exist or has been removed.'}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-gradient text-white text-xs font-bold rounded-xl shadow-brand-glow hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const inWishlist = isInWishlist(product._id);

  // Check if current user is Admin OR owner of this product
  const ownerId = typeof product.owner === 'object' ? product.owner?._id : product.owner;
  const currentUserId = user?._id || user?.id;
  const isOwner = ownerId && currentUserId && ownerId.toString() === currentUserId.toString();
  const canManageProduct = isAdmin || isOwner;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isOutOfStock) return;

    setIsAddingToCart(true);
    setFeedbackMsg('');

    const res = await addToCart(product._id, quantity);
    setIsAddingToCart(false);

    if (res.success) {
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 1500);
    } else {
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
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

  const handleDeleteProduct = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${product.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await productService.deleteProduct(product._id);
      if (res.success) {
        navigate('/products');
      } else {
        alert(res.message || 'Failed to delete product.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top action row */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-indigo-600 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Products Catalog</span>
        </Link>

        {/* Management actions for Admin or Product Owner */}
        {canManageProduct && (
          <div className="flex items-center space-x-2">
            <Link
              to={`/products/${product._id}/edit`}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Product</span>
            </Link>

            <button
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Product Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Left: Image Container */}
        <div className="md:col-span-6 bg-slate-100 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm bg-white">
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
        </div>

        {/* Right: Specifications & Info */}
        <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Category & Stock Pills */}
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold rounded-full uppercase tracking-wider">
                {product.category}
              </span>

              {isOutOfStock ? (
                <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-full">
                  Out of Stock
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In Stock ({product.stock} available)</span>
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight mb-3">
              {product.name}
            </h1>

            {/* Price Banner */}
            <div className="my-5 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                  Listing Price
                </span>
                <span className="text-3xl font-black font-display text-indigo-600">
                  {formattedPrice}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                Inclusive of all taxes
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description || 'No detailed description provided for this product.'}
              </p>
            </div>

            {/* Cart & Wishlist Actions (Customer Only) */}
            {!isAdmin && !isSales ? (
              <>
                {/* Quantity Picker */}
                {!isOutOfStock && (
                  <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                      Select Quantity
                    </label>
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-medium text-slate-600">Units:</span>
                        <div className="inline-flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                          <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-900 font-display">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                            disabled={quantity >= product.stock}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 font-medium block">
                          Max units allowed:
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {product.stock} units
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error / Alert feedback */}
                {feedbackMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{feedbackMsg}</span>
                  </div>
                )}

                {/* Actions: Add to Cart & Wishlist */}
                <div className="flex items-center space-x-3 mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAddingToCart}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-2xs ${
                      cartSuccess
                        ? 'bg-emerald-600 text-white'
                        : isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-brand-gradient text-white shadow-brand-glow hover:-translate-y-0.5 active:scale-95'
                    }`}
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding to Cart...</span>
                      </>
                    ) : cartSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Shopping Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-center ${
                      inWishlist
                        ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    {wishlistLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-600' : ''}`} />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">
                  Merchant / Admin Account Mode
                </span>
                Shopping cart and wishlist actions are reserved for Customer accounts. Use the management buttons above to update or remove this catalog listing.
              </div>
            )}

            {/* Seller Information */}
            {product.owner && (
              <div className="pt-5 border-t border-slate-100">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Verified Merchant / Owner
                </h3>
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <div className="w-8 h-8 rounded-xl bg-brand-gradient text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {product.owner.name ? product.owner.name.slice(0, 2).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{product.owner.name}</p>
                    <p className="text-[11px] text-slate-500">{product.owner.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
