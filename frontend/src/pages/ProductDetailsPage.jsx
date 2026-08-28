import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../services/productService';
import { ArrowLeft, CheckCircle2, AlertCircle, ShoppingBag, User, Tag, Layers, Loader2, Sparkles } from 'lucide-react';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back link */}
      <Link
        to="/products"
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-indigo-600 mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Products Catalog</span>
      </Link>

      {/* Main Product Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Left: Image Container */}
        <div className="md:col-span-6 bg-slate-100 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200/80">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm bg-white">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Specifications & Info */}
        <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Category & Stock Pills */}
            <div className="flex items-center space-x-2 mb-4">
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
                  <span>In Stock ({product.stock} units available)</span>
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight mb-3">
              {product.name}
            </h1>

            {/* Price Banner */}
            <div className="my-6 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
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

            {/* Seller Information */}
            {product.owner && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Verified Merchant / Owner
                </h3>
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <div className="w-9 h-9 rounded-xl bg-brand-gradient text-white font-bold text-xs flex items-center justify-center shadow-xs">
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

          {/* Action Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/products"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Back to Catalog
            </Link>

            <span className="text-[11px] text-slate-400 font-medium">
              Cart & Checkout available in Task 6
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
