import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── LazyImage ───────────────────────────────────────────────────────────────
/**
 * Loads the image only when it scrolls into the viewport via IntersectionObserver.
 * While loading, a shimmer skeleton is shown inside the already-reserved space,
 * which prevents Cumulative Layout Shift (CLS).
 *
 * The parent wrapper holds the aspect ratio via `aspect-[4/5]` so the
 * document height never changes regardless of image load state.
 */
function LazyImage({ src, alt, className = '' }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            {
                // Start loading 200 px before it enters the viewport
                rootMargin: '200px 0px',
                threshold: 0,
            }
        );

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="absolute inset-0 w-full h-full">
            {/* Shimmer skeleton — always mounted, fades out once image loads */}
            <div
                aria-hidden="true"
                className={`absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite_linear] transition-opacity duration-300 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            />

            {/* Error fallback */}
            {errored ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 gap-2">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium">No image</span>
                </div>
            ) : (
                /* Only render the <img> tag when the card is near the viewport */
                visible && (
                    <img
                        src={src}
                        alt={alt}
                        loading="lazy"          // native browser lazy-load as a belt-and-suspenders fallback
                        decoding="async"        // offload decode to a background thread
                        onLoad={() => setLoaded(true)}
                        onError={() => { setLoaded(true); setErrored(true); }}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                    />
                )
            )}
        </div>
    );
}

// ─── ItemCard ─────────────────────────────────────────────────────────────────
/**
 * Renders a single marketplace item card.
 *
 * Props:
 *  item      — the item object from the API
 *  onToggleSave(e, itemId) — optional callback when the save button is clicked
 */
export default function ItemCard({ item, onToggleSave }) {
    const { user } = useAuth();
    const isSaved = user?.savedItems?.includes(item._id);

    return (
        <Link
            to={`/item/${item._id}`}
            className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 relative block"
        >
            {/* ── Sold Overlay ─────────────────────────────────────────── */}
            {item.status === 'sold' && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <span className="px-6 py-2 bg-gray-900/90 text-white font-black tracking-widest uppercase rounded-2xl shadow-xl -skew-x-6 text-xl border border-gray-800 backdrop-blur-md">
                        Sold
                    </span>
                </div>
            )}

            {/* ── Wishlist Button ───────────────────────────────────────── */}
            {onToggleSave && (
                <button
                    onClick={(e) => onToggleSave(e, item._id)}
                    aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                    className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-300 hover:text-rose-500 hover:scale-110 shadow-sm border border-white/50 transition-all z-20"
                >
                    <svg
                        className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500 drop-shadow-md' : 'fill-none'}`}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            )}

            {/* ── Image Container — aspect ratio is ALWAYS reserved here ─ */}
            <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                <LazyImage
                    src={item.images?.[0]}
                    alt={item.title}
                    className="group-hover:scale-110 transition-transform duration-500"
                />

                {/* Category badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-900 shadow-sm border border-white/50 z-[5]">
                    {item.category}
                </div>

                {/* Price badge */}
                <div className="absolute bottom-4 right-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-lg shadow-lg z-[5]">
                    ₹{item.price.toLocaleString()}
                </div>
            </div>

            {/* ── Card Body ─────────────────────────────────────────────── */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors truncate pr-2">
                        {item.title}
                    </h3>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${item.condition === 'New' ? 'bg-emerald-50 text-emerald-600' :
                            item.condition === 'Like New' ? 'bg-blue-50 text-blue-600' :
                                'bg-amber-50 text-amber-600'
                        }`}>
                        {item.condition}
                    </span>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold bg-gray-50 px-2 py-0.5 rounded-md">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {item.views || 0}
                    </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase italic flex-shrink-0">
                        {item.seller?.name?.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-gray-500 truncate flex items-center gap-1 group-hover:text-gray-900 transition-colors">
                        {item.seller?.name}
                        {item.seller?.verificationStatus === 'approved' && (
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Verified Student">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        )}
                    </span>
                </div>
            </div>
        </Link>
    );
}
