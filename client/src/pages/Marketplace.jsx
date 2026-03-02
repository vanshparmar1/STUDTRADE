import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Books', 'Cycles', 'Tech', 'Furniture', 'Other'];

export default function Marketplace() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: 'All',
        minPrice: '',
        maxPrice: '',
        search: '',
        page: 1
    });
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 1
    });

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.category !== 'All') params.append('category', filters.category);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.search) params.append('search', filters.search);
            params.append('page', filters.page);
            params.append('limit', 12);

            const { data } = await axios.get(`http://localhost:5000/api/items?${params.toString()}`);
            if (data.success) {
                setItems(data.data);
                setPagination({
                    total: data.total,
                    page: data.page,
                    totalPages: data.totalPages
                });
            }
        } catch (err) {
            setError('Failed to load items. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <main className="flex-grow bg-gray-50/50 min-h-screen">
            {/* Search Header */}
            <div className="bg-white border-b border-gray-100 py-8 px-6 shadow-sm">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Marketplace</h1>
                            <p className="text-gray-500 font-medium mt-2">Find the best deals across campus.</p>
                        </div>

                        <div className="relative w-full md:max-w-md group">
                            <input
                                type="text"
                                placeholder="Search for items (e.g. cycles, books...)"
                                className="w-full pl-12 pr-6 py-4 bg-gray-100 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium shadow-inner group-hover:bg-gray-200/50 group-hover:focus:bg-white"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest mr-2">Category:</span>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleFilterChange('category', cat)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filters.category === cat
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 md:py-10 flex flex-col md:flex-row gap-8">
                {/* Side Filters (Desktop) */}
                <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="font-black text-gray-900 uppercase tracking-wider text-sm">Price Range</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border border-transparent focus:border-indigo-500 outline-none"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold border border-transparent focus:border-indigo-500 outline-none"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl shadow-indigo-100">
                        <h4 className="font-bold text-lg mb-2 leading-tight">Safety Tip</h4>
                        <p className="text-sm opacity-80 leading-relaxed font-medium">Always meet in public campus areas and verify the item before paying.</p>
                    </div>
                </aside>

                {/* Items Grid */}
                <div className="flex-grow space-y-10">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-[2rem] aspect-[4/5] animate-pulse border border-gray-100"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 text-center">
                            <p className="text-red-600 font-bold">{error}</p>
                            <button onClick={fetchItems} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold">Retry</button>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 text-center space-y-4 shadow-sm">
                            <div className="text-6xl">🔍</div>
                            <h3 className="text-2xl font-black text-gray-900">No items found</h3>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                            <button
                                onClick={() => setFilters({ category: 'All', minPrice: '', maxPrice: '', search: '', page: 1 })}
                                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all active:scale-95"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map(item => (
                                    <Link key={item._id} to={`/item/${item._id}`} className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1">
                                        <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                                            <img
                                                src={item.images[0]}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-900 shadow-sm border border-white/50">
                                                {item.category}
                                            </div>
                                            <div className="absolute bottom-4 right-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-lg shadow-lg">
                                                ₹{item.price.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors truncate pr-2">{item.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${item.condition === 'New' ? 'bg-emerald-50 text-emerald-600' :
                                                        item.condition === 'Like New' ? 'bg-blue-50 text-blue-600' :
                                                            'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {item.condition}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase italic">
                                                    {item.seller?.name?.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-gray-500 truncate">{item.seller?.name}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 py-10">
                                    <button
                                        disabled={filters.page === 1}
                                        onClick={() => handleFilterChange('page', filters.page - 1)}
                                        className="p-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <span className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl font-black text-gray-900 text-sm">
                                        Page {pagination.page} <span className="text-gray-300 mx-1">/</span> {pagination.totalPages}
                                    </span>
                                    <button
                                        disabled={filters.page === pagination.totalPages}
                                        onClick={() => handleFilterChange('page', filters.page + 1)}
                                        className="p-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
