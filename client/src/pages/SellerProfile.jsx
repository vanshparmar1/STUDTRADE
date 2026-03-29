import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API from '../api/axios';
import StitchProductCard from '../components/StitchProductCard';

export default function SellerProfile() {
    const { id } = useParams();
    const [seller, setSeller] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                setLoading(true);
                // Fetch profile and items simultaneously
                const [userRes, itemsRes] = await Promise.all([
                    API.get(`/users/${id}`),
                    API.get(`/users/${id}/items`)
                ]);

                if (userRes.data.success) setSeller(userRes.data.data);
                if (itemsRes.data.success) setItems(itemsRes.data.data);

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load seller profile');
            } finally {
                setLoading(false);
            }
        };

        fetchSellerData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center min-h-screen bg-gray-50/50">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !seller) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center min-h-screen bg-gray-50/50 text-center space-y-4">
                <div className="text-6xl">😕</div>
                <h2 className="text-3xl font-black text-gray-900">{error || 'Seller not found'}</h2>
                <Link to="/marketplace" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    return (
        <main className="flex-grow bg-gray-50/50 min-h-screen pb-20">
            {/* Header / Profile Card */}
            <div className="bg-white border-b border-gray-100 shadow-sm pt-20 pb-12 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                    <div className="w-32 h-32 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-xl shadow-gray-200 uppercase border-4 border-white">
                        {seller.name.charAt(0)}
                    </div>
                    <div className="flex-grow space-y-1 pb-2">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{seller.name}</h1>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
                            {seller.verificationStatus === 'approved' && (
                                <p className="text-sm font-bold text-emerald-600 flex items-center justify-center md:justify-start gap-1.5">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    Verified Student Account
                                </p>
                            )}
                            {seller.studtradeID && (
                                <p className="font-mono font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg text-xs inline-block">
                                    ID: {seller.studtradeID}
                                </p>
                            )}
                            <p className="text-sm font-bold text-gray-500">
                                Member since {new Date(seller.createdAt).getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seller's Items */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900">Active Listings <span className="text-indigo-600">({items.length})</span></h2>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white p-12 rounded-[2rem] border border-gray-100 text-center space-y-2 shadow-sm">
                        <p className="text-gray-500 font-bold">This seller currently has no active listings.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {items.map(item => (
                            <StitchProductCard
                                key={item._id}
                                itemId={item._id}
                                image={item.images?.[0] || 'https://placehold.co/400x400?text=No+Image'}
                                price={`₹${item.price.toLocaleString('en-IN')}`}
                                verified={seller.verificationStatus === 'approved'}
                                title={item.title}
                                subtitle={`${item.category} • ${item.condition}`}
                                sold={item.status === 'sold'}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
