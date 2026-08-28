import React from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  AlertCircle,
  X,
  ChevronRight,
  Sparkles,
  Tag,
  DollarSign,
  Layers,
} from 'lucide-react';

const ProductFilterSidebar = ({
  isOpen,
  onClose,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categoriesList,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  priceValidationError,
  handleClearFilters,
  hasActiveFilters,
  activeFiltersCount,
  totalProductsCount,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Component (Matching Admin/Sales Sidebar styling) */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/90 shadow-xl lg:shadow-none flex flex-col justify-between transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Search */}
        <div className="p-4 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black font-display text-slate-900 block leading-tight">
                  Catalog Filters
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {totalProductsCount} {totalProductsCount === 1 ? 'product' : 'products'} listed
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close filter panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Keyword Search */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5 flex items-center space-x-1">
              <Search className="w-3 h-3 text-slate-400" />
              <span>Keyword Search</span>
            </span>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category List */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-1">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>Departments</span>
              </span>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                      isSelected
                        ? 'bg-brand-gradient text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5 flex items-center space-x-1">
              <DollarSign className="w-3 h-3 text-slate-400" />
              <span>Price Range (₹)</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Min</span>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Max</span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="5000"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div className="grid grid-cols-3 gap-1 mt-2">
              <button
                type="button"
                onClick={() => { setMinPrice('0'); setMaxPrice('500'); }}
                className="py-1 px-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[10px] font-semibold transition-colors border border-slate-200/80 text-center"
              >
                &lt; ₹500
              </button>
              <button
                type="button"
                onClick={() => { setMinPrice('500'); setMaxPrice('2000'); }}
                className="py-1 px-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[10px] font-semibold transition-colors border border-slate-200/80 text-center"
              >
                ₹500-2k
              </button>
              <button
                type="button"
                onClick={() => { setMinPrice('2000'); setMaxPrice(''); }}
                className="py-1 px-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg text-[10px] font-semibold transition-colors border border-slate-200/80 text-center"
              >
                ₹2000+
              </button>
            </div>
          </div>

          {/* Validation Notice */}
          {priceValidationError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{priceValidationError}</span>
            </div>
          )}
        </div>

        {/* Bottom Footer & Reset Button */}
        <div className="p-4 border-t border-slate-100">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All ({activeFiltersCount})</span>
            </button>
          ) : (
            <div className="text-center text-[11px] text-slate-400 font-medium py-1">
              All filters clear
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default ProductFilterSidebar;
