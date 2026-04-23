import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import StitchProductCard from '../components/StitchProductCard';
import API from '../api/axios';
import { formatListingAreaFromPickup } from '../utils/listingArea';

// Maps the sidebar labels to the API's category values
const CATEGORY_MAP = {
  'All Items': '',
  'Books': 'Books',
  'Tech': 'Tech',
  'Furniture': 'Furniture',
  'Cycles': 'Cycles',
  'Other': 'Other',
};
const CATEGORIES_FILTER = Object.keys(CATEGORY_MAP);
const ICONS = ['grid_view', 'menu_book', 'laptop_mac', 'chair', 'directions_bike', 'category'];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

const SORT_OPTIONS = ['Newest First', 'Price: Low to High', 'Price: High to Low'];

const sortToApiParam = (sort) => {
  if (sort === 'Price: Low to High') return 'price_asc';
  if (sort === 'Price: High to Low') return 'price_desc';
  return 'newest';
};

const MarketplaceGrid = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [sortBy, setSortBy] = useState('Newest First');
  const [conditions, setConditions] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const q = searchParams.get('q') || '';

  const fetchItems = useCallback(async (reset = false) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (CATEGORY_MAP[activeCategory]) params.set('category', CATEGORY_MAP[activeCategory]);
      if (conditions.length === 1) params.set('condition', conditions[0]);
      if (q) params.set('search', q);
      params.set('page', reset ? 1 : page);
      params.set('limit', 12);

      const { data } = await API.get(`/items?${params.toString()}`);
      if (data.success) {
        setItems((prev) => reset ? data.data : [...prev, ...data.data]);
        setTotal(data.total);
        if (reset) setPage(1);
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      const isNetwork = !err.response && err.message;
      setError(
        apiMsg
          || (isNetwork ? `Cannot reach API (${err.message}). Check VITE_API_URL on Vercel and redeploy.` : null)
          || 'Failed to load items. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [activeCategory, conditions, sortBy, page, q]);

  // Re-fetch when filters change (reset to page 1)
  useEffect(() => {
    fetchItems(true);
  }, [activeCategory, conditions, sortBy, q]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(false);
  };

  const toggleCondition = (c) => {
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  const renderFilters = () => (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-outline)] mb-4 px-2">Category</h3>
        <ul className="space-y-1">
          {CATEGORIES_FILTER.map((cat, i) => (
            <li key={cat}>
              <button
                onClick={() => { setActiveCategory(cat); setIsMobileFilterOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold shadow-sm'
                    : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)] active:scale-[0.97]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{ICONS[i]}</span>
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Condition */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-outline)] mb-4 px-2">Condition</h3>
        <div className="space-y-2 px-2">
          {CONDITIONS.map((c) => (
            <label key={c} className="flex items-center gap-3 text-sm text-[var(--color-on-surface-variant)] cursor-pointer">
              <input
                type="checkbox"
                checked={conditions.includes(c)}
                onChange={() => toggleCondition(c)}
                className="rounded border-[var(--color-outline-variant)] accent-[var(--color-primary)]"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-[var(--color-surface-container)]">
        <button
          onClick={() => { setActiveCategory('All Items'); setConditions([]); setIsMobileFilterOpen(false); }}
          className="w-full py-3 rounded-full border border-[var(--color-outline-variant)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-surface-container-high)] hover:border-[var(--color-outline)] active:scale-[0.97] transition-all duration-200"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
      <StitchNavbar activeLink="Explore" />

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Hero banner */}
        <header className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary-container)]/30 to-[var(--color-surface-container-low)] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="z-10 relative max-w-xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-[var(--color-on-surface)] mb-4">
              The Student <span className="text-[var(--color-primary)]">Marketplace</span>
            </h1>
            <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed">
              Trade essentials with verified peers. Clean, secure, and built for campus life.
            </p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-10 relative">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            {renderFilters()}
          </aside>

          {/* Mobile Filter Drawer Overlay */}
          <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${isMobileFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
            <div className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-[var(--color-surface-container)]">
                <h2 className="text-xl font-extrabold">Filters</h2>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)} 
                  className="p-2 bg-[var(--color-surface-container-low)] rounded-full hover:bg-[var(--color-surface-container-high)] active:scale-95 transition-all text-[var(--color-on-surface-variant)]"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1">
                {renderFilters()}
              </div>
            </div>
          </div>

          {/* Main grid */}
          <section className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 bg-white p-4 sm:p-5 rounded-3xl shadow-sm">
              <span className="text-sm text-[var(--color-on-surface-variant)] font-medium sm:ml-4">
                {loading && items.length === 0 ? (
                  'Loading…'
                ) : (
                  <>Showing <span className="text-[var(--color-on-surface)] font-bold">{total}</span> item{total !== 1 ? 's' : ''}</>
                )}
                {q && <span className="ml-1">for "<strong>{q}</strong>"</span>}
              </span>
              
              <div className="flex justify-between sm:justify-end items-center gap-4 sm:mr-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-[var(--color-surface-container-low)]">
                {/* Mobile Filter Toggle Button */}
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="md:hidden flex items-center gap-2 bg-[var(--color-surface-container-high)] px-4 py-2 rounded-xl text-sm font-bold text-[var(--color-on-surface)] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span className="hidden sm:inline">Filters</span>
                </button>
                
                <div className="flex items-center gap-2 bg-[var(--color-surface-container-low)] sm:bg-transparent px-3 py-1.5 sm:px-0 sm:py-0 rounded-xl">
                  <span className="text-xs uppercase tracking-widest text-[var(--color-outline)] font-bold">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer text-[var(--color-on-surface)] pr-8 sm:pr-0"
                  >
                    {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="text-center py-20 text-[var(--color-error)]">
                <span className="material-symbols-outlined text-5xl mb-4 block">error_outline</span>
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && items.length === 0 && (
              <div className="text-center py-24 text-[var(--color-on-surface-variant)]">
                <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">storefront</span>
                <h2 className="text-xl font-bold mb-2 text-[var(--color-on-surface)]">No items found</h2>
                <p className="text-sm">Be the first to list something in this category!</p>
              </div>
            )}

            {/* Product grid */}
            {items.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {items.map((item) => (
                  <StitchProductCard
                    key={item._id}
                    itemId={item._id}
                    image={item.images?.[0] || 'https://placehold.co/400x400?text=No+Image'}
                    price={formatPrice(item.price)}
                    verified={item.seller?.verified ?? false}
                    title={item.title}
                    subtitle={`${item.category} • ${item.condition}`}
                    listingArea={item.listingArea ?? formatListingAreaFromPickup(item.pickupAddress)}
                    sold={item.status === 'sold'}
                  />
                ))}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse">
                    <div className="aspect-square rounded-t-3xl bg-[var(--color-surface-container)]" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 rounded-full bg-[var(--color-surface-container)] w-3/4" />
                      <div className="h-3 rounded-full bg-[var(--color-surface-container)] w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load more */}
            {!loading && items.length < total && (
              <div className="mt-16 flex flex-col items-center">
                <button
                  onClick={handleLoadMore}
                  className="bg-[var(--color-surface-container-high)] text-[var(--color-primary)] px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-surface-container-highest)] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.97] transition-all duration-200 mb-4"
                >
                  Load More Items
                </button>
              </div>
            )}

            {!loading && items.length > 0 && items.length >= total && (
              <p className="mt-12 text-center text-[10px] text-[var(--color-outline)] uppercase tracking-widest">
                You've seen all {total} items
              </p>
            )}
          </section>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
};

export default MarketplaceGrid;