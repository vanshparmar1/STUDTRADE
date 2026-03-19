import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import StitchProductCard from '../components/StitchProductCard';
import API from '../api/axios';

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
      setError('Failed to load items. Please try again.');
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

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
      <StitchNavbar activeLink="Explore" />

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6">
        {/* Hero banner */}
        <header className="mb-12 relative overflow-hidden rounded-3xl bg-[var(--color-surface-container-low)] p-12 flex flex-col md:flex-row items-center justify-between">
          <div className="z-10 relative max-w-xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-[var(--color-on-surface)] mb-4">
              The Student <span className="text-[var(--color-primary)]">Marketplace</span>
            </h1>
            <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed">
              Trade essentials with verified peers. Clean, secure, and built for campus life.
            </p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-8">
            {/* Category */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-outline)] mb-4 px-2">Category</h3>
              <ul className="space-y-1">
                {CATEGORIES_FILTER.map((cat, i) => (
                  <li key={cat}>
                    <button
                      onClick={() => setActiveCategory(cat)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-full w-full text-sm transition-all ${
                        activeCategory === cat
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium'
                          : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-high)]'
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
                onClick={() => { setActiveCategory('All Items'); setConditions([]); }}
                className="w-full py-3 rounded-full border border-[var(--color-outline-variant)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-surface-container-high)] transition-all"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Main grid */}
          <section className="flex-1">
            {/* Sort bar */}
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-full shadow-sm">
              <span className="text-sm text-[var(--color-on-surface-variant)] font-medium ml-4">
                {loading && items.length === 0 ? (
                  'Loading…'
                ) : (
                  <>Showing <span className="text-[var(--color-on-surface)] font-bold">{total}</span> item{total !== 1 ? 's' : ''}</>
                )}
                {q && <span className="ml-1">for "<strong>{q}</strong>"</span>}
              </span>
              <div className="flex items-center gap-2 mr-4">
                <span className="text-xs uppercase tracking-widest text-[var(--color-outline)] font-bold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer text-[var(--color-on-surface)]"
                >
                  {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <StitchProductCard
                    key={item._id}
                    itemId={item._id}
                    image={item.images?.[0] || 'https://placehold.co/400x400?text=No+Image'}
                    price={formatPrice(item.price)}
                    verified={item.seller?.verified ?? false}
                    title={item.title}
                    subtitle={`${item.category} • ${item.condition}`}
                    seller={{ name: item.seller?.name ?? 'Student' }}
                  />
                ))}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
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
                  className="bg-[var(--color-surface-container-high)] text-[var(--color-primary)] px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-surface-container-highest)] transition-all mb-4"
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