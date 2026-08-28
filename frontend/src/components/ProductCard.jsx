import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

const ProductCard = ({ product }) => {
  const isOutOfStock = product.stock <= 0;

  // Format currency in INR / standard format
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200/60 transition-all duration-300 flex flex-col justify-between">
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-800 text-[10px] font-bold rounded-full shadow-2xs uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
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
          <h3 className="font-display font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Price
            </span>
            <span className="text-lg font-black font-display text-slate-900">
              {formattedPrice}
            </span>
          </div>

          <Link
            to={`/products/${product._id}`}
            className="px-3.5 py-2 bg-slate-100 hover:bg-brand-gradient hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs group/btn"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
