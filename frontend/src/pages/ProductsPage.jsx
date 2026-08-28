import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import ProductCard from '../components/ProductCard';
import ProductFilterSidebar from '../components/ProductFilterSidebar';
import {
  SlidersHorizontal,
  RotateCcw,
  AlertCircle,
  ShoppingBag,
  Loader2,
  Plus,
  X,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
  const { user, isAdmin, isSales } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isStaff = isAdmin || isSales;

  const [categoriesList, setCategoriesList] = useState([
    'All',
    'Electronics',
    'Fashion',
    'Footwear',
    'Home',
    'Beauty',
    'Sports',
    'Apparel',
    'Misc',
  ]);

  // Local state initialized from URL search params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Mobile filter sidebar state
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceValidationError, setPriceValidationError] = useState('');

  // Fetch dynamic categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success && Array.isArray(res.data)) {
          setCategoriesList(['All', ...res.data.filter((c) => c !== 'All')]);
        }
      } catch (err) {
        // Fallback to default
      }
    };
    loadCategories();
  }, []);

  // Fetch products based on active filters
  const fetchProducts = useCallback(async () => {
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

  const activeFiltersCount = [
    Boolean(searchTerm),
    selectedCategory && selectedCategory !== 'All',
    Boolean(minPrice),
    Boolean(maxPrice),
  ].filter(Boolean).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* If Customer or Guest -> Render Left Filter Sidebar Component */}
      {!isStaff && (
        <ProductFilterSidebar
          isOpen={isFilterSidebarOpen}
          onClose={() => setIsFilterSidebarOpen(false)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categoriesList={categoriesList}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          priceValidationError={priceValidationError}
          handleClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          activeFiltersCount={activeFiltersCount}
          totalProductsCount={products.length}
        />
      )}

      {/* Main Content Area: Offset by lg:pl-64 when customer filter sidebar is active */}
      <div className={`p-4 sm:p-6 lg:p-8 transition-all ${!isStaff ? 'lg:pl-64' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {/* Top Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
            <div className="flex items-center space-x-3">
              {/* Mobile Filter Toggle Button (For Customer & Guests) */}
              {!isStaff && (
                <button
                  onClick={() => setIsFilterSidebarOpen(true)}
                  className="lg:hidden p-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center space-x-1.5 shadow-2xs text-xs font-bold"
                >
                  <Filter className="w-4 h-4 text-indigo-600" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-black">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              )}

              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-2xs flex-shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
                    Product Catalog
                  </h1>
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-bold">
                    {products.length} {products.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
                  Search keyword, departments, and price range to find items.
                </p>
              </div>
            </div>

            {/* Quick Actions (Add Product for Staff) */}
            {isStaff && (
              <Link
                to="/products/new"
                className="self-start sm:self-auto px-4 py-2.5 bg-brand-gradient text-white text-xs font-semibold rounded-xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            )}
          </div>

          {/* If Staff (Admin / Sales) -> Inline Filter Bar since left sidebar is Management */}
          {isStaff && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center text-xs">
                <div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search keyword..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min ₹"
                    className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max ₹"
                    className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Badges Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white rounded-2xl border border-slate-200/80 text-xs">
              <span className="text-slate-400 font-medium">Applied:</span>

              {searchTerm && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100">
                  <span>Keyword: "{searchTerm}"</span>
                  <button onClick={() => setSearchTerm('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory && selectedCategory !== 'All' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-violet-50 text-violet-700 font-bold rounded-lg border border-violet-100">
                  <span>Category: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('All')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-100">
                  <span>Price: ₹{minPrice || 0} - ₹{maxPrice || '∞'}</span>
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearFilters}
                className="text-[11px] text-rose-600 font-bold hover:underline ml-auto"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Catalog Results Grid */}
          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200/90">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-semibold font-display text-slate-600">
                Querying backend products catalog...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 bg-red-50 border border-red-200 text-red-800 rounded-3xl flex flex-col items-center text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h3 className="text-base font-bold font-display">Error Loading Catalog</h3>
              <p className="text-xs text-red-600 mt-1 max-w-md">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Retry Query
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200/90 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-display text-slate-900">
                No Products Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6">
                No catalog items match your search criteria. Try modifying your keyword, price range, or category filter.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-brand-gradient text-white text-xs font-bold rounded-xl shadow-brand-glow hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
