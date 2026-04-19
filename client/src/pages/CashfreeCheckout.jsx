import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { load } from '@cashfreepayments/cashfree-js';
import API from '../api/axios';
import toast from 'react-hot-toast';

const LOGO = '/logo.png';

const CashfreeCheckout = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const cashfreeRef = useRef(null);

    // ─── State ─────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [itemData, setItemData] = useState(null);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('idle'); // idle | success | failure

    // ─── Initialize Cashfree SDK ───────────────────────────────────────────
    useEffect(() => {
        const initCashfree = async () => {
            try {
                const sdk = await load({
                    mode: import.meta.env.PROD ? 'production' : 'sandbox',
                });
                cashfreeRef.current = sdk;
            } catch (err) {
                console.error('Failed to load Cashfree SDK:', err);
                toast.error('Payment system failed to initialize');
            }
        };
        initCashfree();
    }, []);

    // ─── Fetch Product & Create Order ──────────────────────────────────────
    useEffect(() => {
        const initializeCheckout = async () => {
            try {
                setLoading(true);
                
                // 1. Fetch Item details for UI
                const itemRes = await API.get(`/items/${productId}`);
                if (!itemRes.data.success) {
                    throw new Error('Item not found');
                }
                const fetchedItem = itemRes.data.data;
                setItemData(fetchedItem);

                // 2. Create Cashfree order on backend
                const orderRes = await API.post('/payment/create-order', { productId });
                if (orderRes.data.success) {
                    setOrderData(orderRes.data);
                } else {
                    throw new Error('Failed to initialize payment');
                }

            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Error loading checkout');
                toast.error('Failed to load checkout details');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            initializeCheckout();
            window.scrollTo(0, 0);
        }
    }, [productId]);

    // ─── Handle Cashfree Payment ───────────────────────────────────────────
    const handlePayment = async () => {
        if (!orderData?.paymentSessionId || !cashfreeRef.current) {
            toast.error('Payment initialization failed. Please try again.');
            return;
        }

        try {
            const result = await cashfreeRef.current.checkout({
                paymentSessionId: orderData.paymentSessionId,
                redirectTarget: '_modal', // Opens in a modal overlay
            });

            if (result.error) {
                // User closed the popup or payment error
                toast.error(result.error.message || 'Payment was cancelled');
                return;
            }

            if (result.paymentDetails) {
                // Payment completed on Cashfree's end — verify server-side
                setSubmitting(true);
                try {
                    const verifyRes = await API.post('/payment/verify', {
                        orderId: orderData.orderId,
                    });

                    if (verifyRes.data.success) {
                        toast.success('Payment successful!');
                        setStatus('success');
                    }
                } catch (err) {
                    toast.error('Payment verification failed.');
                    setStatus('failure');
                } finally {
                    setSubmitting(false);
                }
            }
        } catch (err) {
            toast.error('Payment failed. Please try again.');
            setStatus('idle');
        }
    };

    const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

    // ─── UI Render ─────────────────────────────────────────────────────────

    // Nav Header (shared across states)
    const NavBar = () => (
        <nav className="fixed top-0 w-full z-50 glass-nav border-b border-[var(--color-surface-variant)]">
            <div className="flex justify-between items-center px-6 max-w-7xl mx-auto py-2">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="material-symbols-outlined text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors p-2 rounded-full hover:bg-[var(--color-surface-container-low)]">
                        arrow_back
                    </button>
                    <Link to="/">
                        <img src={LOGO} alt="STUDTRADE" className="h-10 w-auto object-contain" />
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Secure Checkout</span>
                    <span className="material-symbols-outlined text-[var(--color-primary)]">lock</span>
                </div>
            </div>
        </nav>
    );

    if (loading) {
        return (
            <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
                <NavBar />
                <main className="flex-1 flex flex-col items-center justify-center min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                    <span className="material-symbols-outlined animate-spin text-[var(--color-primary)] text-4xl mb-4">refresh</span>
                    <p className="font-semibold uppercase tracking-widest text-sm text-[var(--color-on-surface-variant)]">Initializing Payment...</p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
                <NavBar />
                <main className="flex-1 flex flex-col items-center justify-center min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
                    <span className="material-symbols-outlined text-6xl text-[var(--color-error)] mb-4">error_outline</span>
                    <h2 className="text-2xl font-bold mb-4">{error}</h2>
                    <button
                        onClick={() => navigate(`/item/${productId}`)}
                        className="px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-full hover:bg-[var(--color-primary)]/90"
                    >
                        Return to Item
                    </button>
                </main>
            </div>
        );
    }

    // Success Screen
    if (status === 'success') {
        return (
            <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
                <NavBar />
                <main className="flex-1 flex flex-col items-center justify-center min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-green-600 text-6xl">check_circle</span>
                    </div>
                    <h1 className="text-4xl font-extrabold mb-4">Payment Successful!</h1>
                    <p className="text-[var(--color-on-surface-variant)] mb-8">Thank you for your purchase. The seller will be notified.</p>
                    <Link
                        to="/marketplace"
                        className="px-8 py-4 bg-[var(--color-primary)] text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        Continue Shopping
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
            <NavBar />
            
            <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start justify-center">
                    
                    {/* Left: Product Info Hero */}
                    <div className="lg:col-span-6 lg:col-start-1 space-y-10">
                        <div className="relative rounded-3xl overflow-hidden h-64 shadow-lg border border-[var(--color-surface-container)]">
                            <img src={itemData?.images?.[0]} alt={itemData?.title} className="w-full h-full object-cover object-center max-w-full overflow-hidden rounded-3xl" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-inverse-surface)]/80 to-transparent flex flex-col justify-end p-8">
                                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2">Item Details</span>
                                <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">{itemData?.title}</h1>
                                <p className="text-white/80 text-sm mt-2">{itemData?.condition} Condition</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-3xl" style={{ boxShadow: '0px 12px 32px rgba(26,128,129,0.05)' }}>
                             <div className="flex items-center gap-4 mb-4">
                                <span className="material-symbols-outlined text-[var(--color-primary)] text-3xl">verified_user</span>
                                <div>
                                    <h3 className="font-bold text-lg">Safe Deal Program</h3>
                                    <p className="text-sm text-[var(--color-on-surface-variant)]">Your payment is secure. We verify payment status server-side to ensure authenticity.</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Right: Payment Breakdown */}
                    <div className="lg:col-span-5 lg:col-start-8">
                        <aside className="bg-white rounded-3xl overflow-hidden sticky top-24" style={{ boxShadow: '0px 12px 32px rgba(26,128,129,0.05)' }}>
                            <div className="p-8">
                                <h2 className="text-xl font-bold tracking-tight mb-6">Payment Overview</h2>
                                
                                {orderData && (
                                    <div className="space-y-4 pt-4 border-t border-[var(--color-surface-container)]">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--color-on-surface-variant)] leading-relaxed">Product Price</span>
                                            <span className="font-semibold">{formatPrice(orderData.breakdown.basePrice)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--color-on-surface-variant)] leading-relaxed flex items-center gap-1">
                                                Platform Fee (10%)
                                                <span className="material-symbols-outlined text-[10px] text-[var(--color-primary)] cursor-pointer" title="Helps us maintain the platform">info</span>
                                            </span>
                                            <span className="font-semibold">{formatPrice(orderData.breakdown.platformFee)}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-end pt-6 border-t border-[var(--color-surface-container)] mt-6">
                                            <span className="text-lg font-bold">Total Amount</span>
                                            <span className="text-3xl font-black text-[var(--color-primary)] tracking-tighter">
                                                {formatPrice(orderData.finalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handlePayment}
                                    disabled={submitting || status === 'failure'}
                                    className="w-full mt-10 py-5 gradient-primary text-white rounded-full font-bold text-lg tracking-tight shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Pay with Cashfree
                                            <span className="material-symbols-outlined">payments</span>
                                        </>
                                    )}
                                </button>
                                
                                <div className="mt-6 flex items-center justify-center gap-2 grayscale opacity-60">
                                   <span className="text-[10px] font-bold tracking-widest uppercase">Secured by Cashfree</span>
                                </div>
                            </div>
                        </aside>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CashfreeCheckout;
