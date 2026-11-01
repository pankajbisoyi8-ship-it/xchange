import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api.ts';
import { Listing, Category } from '../types/index.ts';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  Star, 
  MapPin, 
  SlidersHorizontal, 
  X,
  ChevronLeft,
  ChevronRight,
  Cpu
} from 'lucide-react';

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read current filters from URL params
  const currentCategory = searchParams.get('category') || '';
  const currentQ = searchParams.get('q') || '';
  const currentCondition = searchParams.get('condition') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Local state for instant inputs
  const [searchInput, setSearchInput] = useState(currentQ);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/listings/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const queryObj: any = {
          page: currentPage,
          limit: 12,
          sort: currentSort,
        };
        if (currentCategory) queryObj.category = currentCategory;
        if (currentQ) queryObj.q = currentQ;
        if (currentCondition) queryObj.condition = currentCondition;
        if (minPrice) queryObj.minPrice = minPrice;
        if (maxPrice) queryObj.maxPrice = maxPrice;

        const res = await api.get('/listings', { params: queryObj });
        setListings(res.data.data || []);
        setTotalItems(res.data.meta?.total || 0);
        setTotalPages(res.data.meta?.totalPages || 1);
      } catch (err) {
        console.error('Failed to load listings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [searchParams]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchInput.trim() || null);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const conditions = [
    { label: 'All Conditions', value: '' },
    { label: 'Like New', value: 'LIKE_NEW' },
    { label: 'Good', value: 'GOOD' },
    { label: 'Fair', value: 'FAIR' },
    { label: 'For Parts', value: 'FOR_PARTS' },
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Explore Hardware Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {totalItems} verified second-hand PC and laptop components
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search GPU, CPU, RTX 3070, Ryzen..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:border-brand-500 outline-none shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Quick Search Hardware Tags */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-400">Quick Filters:</span>
        {['GPU', 'RTX 3070', 'CPU', 'Ryzen', 'Motherboard', 'Storage', 'Monitor', 'Controller'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setSearchInput(tag);
              updateParam('q', tag);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
              currentQ.toLowerCase() === tag.toLowerCase()
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-brand-500 hover:bg-slate-50'
            }`}
          >
            {tag}
          </button>
        ))}
        {currentQ && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              updateParam('q', null);
            }}
            className="text-xs text-rose-600 font-bold hover:underline ml-2"
          >
            Clear Search ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-600" />
              <span>Filter Options</span>
            </h3>
            {(currentCategory || currentCondition || currentQ || minPrice || maxPrice) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-brand-600 hover:underline font-semibold"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</label>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('category', null)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !currentCategory ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam('category', c.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    currentCategory === c.slug ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-slate-400">{c._count?.listings || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Condition Grade</label>
            <div className="space-y-1">
              {conditions.map((cond) => (
                <button
                  key={cond.value}
                  onClick={() => updateParam('condition', cond.value || null)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentCondition === cond.value ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price (₹)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={minPrice}
                onBlur={(e) => updateParam('minPrice', e.target.value || null)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                defaultValue={maxPrice}
                onBlur={(e) => updateParam('maxPrice', e.target.value || null)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3 space-y-6">
          {/* Sort bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-700 outline-none"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse bg-white border border-slate-200 rounded-2xl h-72" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <Cpu className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No components match your search</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your filters, adjusting the price bounds, or clearing keywords.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-xs font-bold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <Link
                  key={item.id}
                  to={`/listings/${item.id}`}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-brand-500 hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img
                      src={item.images?.[0]?.url || '/images/grafhics card.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur">
                        {item.condition.replace('_', ' ')}
                      </span>
                      {item.isInspected && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Inspected</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">
                      {item.category?.name}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.area}</span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium">Price (COD)</span>
                        <div className="text-lg font-extrabold text-slate-900">
                          ₹{Number(item.price).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{item.seller?.avgRating || '5.0'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={currentPage <= 1}
                onClick={() => updateParam('page', String(currentPage - 1))}
                className="p-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700 px-3">
                {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => updateParam('page', String(currentPage + 1))}
                className="p-2 border border-slate-300 rounded-lg text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Filter Hardware</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => { updateParam('category', null); setMobileFilterOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700"
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { updateParam('category', c.slug); setMobileFilterOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Condition</label>
              <div className="space-y-1">
                {conditions.map((cond) => (
                  <button
                    key={cond.value}
                    onClick={() => { updateParam('condition', cond.value || null); setMobileFilterOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700"
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

