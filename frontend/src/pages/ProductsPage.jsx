import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, RotateCcw, AlertCircle, ShoppingBag, Loader2, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Footwear',
  'Home',
  'Beauty',
  'Sports',
  'Apparel',
  'Misc',
];

const ProductsPage = () => {
  const { isAdmin, isSales } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Local state initialized from URL search params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceValidationError, setPriceValidationError] = useState('');

  // Fetch products based on active filters
  const fetchProducts = useCallback(async () => {
    // Validate price range before making API call
    if (minPrice && Number(minPrice) < 0) {
      setPriceValidationError('Minimum price cannot be negative.');
      return;
    }
    if (maxPrice && Number(maxPrice) < 0) {
      setPriceValidationError('Maximum price cannot be negative.');
      return;
    }
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setPriceValidationError('Minimum price cannot be greater than Maximum price.');
      return;
    }
    setPriceValidationError('');

    setLoading(true);
    setError(null);

    try {
      const params = {
        search: searchTerm,
        category: selectedCategory,
        minPrice,
        maxPrice,
      };

      const response = await productService.getProducts(params);
      if (response.success) {
        setProducts(response.data || []);
      } else {
        setError(response.message || 'Failed to retrieve products');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to product service.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, minPrice, maxPrice]);

  // Sync state to URL search parameters
  const updateUrlParams = useCallback(() => {
    const params = {};
    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    if (minPrice !== '') params.minPrice = minPrice;
    if (maxPrice !== '') params.maxPrice = maxPrice;

    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategory, minPrice, maxPrice, setSearchParams]);

  // Debounced search & filter effect (350ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrlParams();
      fetchProducts();
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, updateUrlParams, fetchProducts]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setPriceValidationError('');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(
    searchTerm || (selectedCategory && selectedCategory !== 'All') || minPrice || maxPrice
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-700 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Storefront Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900 tracking-tight">
            Explore Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Browse our catalog with real-time backend keyword search, category filtering, and price filters.
          </p>
        </div>

        {/* Role-Aware Add Product Action */}
        {(isAdmin || isSales) && (
          <Link
            to="/products/new"
            className="self-start md:self-auto px-4 py-2.5 bg-brand-gradient text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        )}
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 font-display">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Search & Filter Engine</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Search Input & Price Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5">
          {/* Keyword Search Input */}
          <div className="md:col-span-6 relative">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Search by Keyword
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name or description..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Min Price Input */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Min Price (₹)
            </label>
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="e.g. 100"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Max Price Input */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Max Price (₹)
            </label>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Price Validation Error Notice */}
        {priceValidationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{priceValidationError}</span>
          </div>
        )}

        {/* Category Pills Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-gradient text-white shadow-brand-glow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Products Grid & State Handling */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200/90">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-sm font-semibold font-display text-slate-600">
            Querying backend products catalog...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold font-display text-red-800 mb-1">
            Unable to load products
          </h3>
          <p className="text-xs text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200/90 text-center">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-display text-slate-900 mb-1">
            No products found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-6">
            We couldn't find any products matching your active filters. Try adjusting your search keywords or price range.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 bg-brand-gradient text-white text-xs font-bold rounded-xl shadow-brand-glow hover:-translate-y-0.5 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Results Counter */}
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-xs font-semibold text-slate-500">
              Showing <span className="font-bold text-slate-800">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
            </p>
          </div>

          {/* Responsive 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
