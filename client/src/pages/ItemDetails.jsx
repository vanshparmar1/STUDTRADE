import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ItemDetails() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

    const fetchItem = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`http://localhost:5000/api/items/${id}`);
            if (data.success) {
                setItem(data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Item not found');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsSold = async () => {
        if (!window.confirm('Are you sure you want to mark this item as sold?')) return;

        try {
            // Need token from auth context for protected route
            const token = localStorage.getItem('studtrade_token');
            const { data } = await axios.patch(`http://localhost:5000/api/items/${item._id}/sold`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                // Instantly update local state to reflect sold status
                setItem(prev => ({ ...prev, status: 'sold' }));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to mark as sold');
        }
    };

    useEffect(() => {
        fetchItem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center p-20 animate-pulse">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center p-20 text-center space-y-4">
                <div className="text-6xl">😕</div>
                <h2 className="text-3xl font-black text-gray-900">Oops! {error}</h2>
                <Link to="/marketplace" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    return (
        <main className="flex-grow bg-white">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <nav className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <Link to="/marketplace" className="hover:text-indigo-600">Marketplace</Link>
                    <span>/</span>
                    <span className="text-gray-400">{item.category}</span>
                    <span>/</span>
                    <span className="text-gray-900 truncate">{item.title}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">

                    {/* Media Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square rounded-[2.5rem] bg-gray-50 border border-gray-100 overflow-hidden shadow-sm group relative">
                            <img
                                src={item.images[activeImage]}
                                alt={item.title}
                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-600 border border-indigo-100 shadow-sm">
                                {item.condition}
                            </div>
                        </div>

                        {item.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {item.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 transition-all overflow-hidden ${activeImage === i
                                            ? 'border-indigo-600 scale-95 shadow-lg'
                                            : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col h-full">
                        <div className="flex-grow space-y-8">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                                    {item.title}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <span className="text-4xl font-black text-indigo-600">₹{item.price.toLocaleString()}</span>
                                    <div className="h-6 w-[2px] bg-gray-200"></div>
                                    <span className="px-4 py-1.5 bg-gray-100 rounded-xl text-sm font-black text-gray-500 uppercase tracking-wider">
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 italic font-medium text-gray-600 leading-relaxed text-lg">
                                "{item.description}"
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Category</p>
                                    <p className="text-lg font-black text-indigo-900">{item.category}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Posted on</p>
                                    <p className="text-lg font-black text-purple-900">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Seller Card & Actions */}
                        <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-100 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-900 text-white rounded-[1.25rem] flex items-center justify-center text-xl font-black shadow-lg shadow-gray-200 uppercase">
                                        {item.seller.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seller Profile</p>
                                        <h4 className="text-xl font-black text-gray-900 leading-none mt-0.5">{item.seller.name}</h4>
                                        <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                            Verified Student Account
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Student ID</p>
                                    <p className="font-mono font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm inline-block">{item.seller.studtradeID}</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 pt-4">
                                {currentUser?._id === item.seller._id ? (
                                    <button
                                        onClick={handleMarkAsSold}
                                        disabled={item.status === 'sold'}
                                        className={`px-8 py-5 rounded-2xl font-black text-lg text-center shadow-xl transition-all flex items-center justify-center gap-3 ${item.status === 'sold'
                                                ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed pointer-events-none border-2 border-transparent'
                                                : 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700 active:scale-95'
                                            }`}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        {item.status === 'sold' ? 'Sold' : 'Mark as Sold'}
                                    </button>
                                ) : (
                                    <a
                                        href={item.status !== 'sold' ? `mailto:${item.seller.email}?subject=Interested in: ${item.title}` : undefined}
                                        className={`px-8 py-5 rounded-2xl font-black text-lg text-center shadow-xl transition-all flex items-center justify-center gap-3 ${item.status === 'sold'
                                                ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed pointer-events-none'
                                                : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-95'
                                            }`}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        {item.status === 'sold' ? 'Item Sold' : 'Contact Seller'}
                                    </a>
                                )}
                                <button
                                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                                    className="px-8 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-black text-lg text-center hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                    Share Listing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
