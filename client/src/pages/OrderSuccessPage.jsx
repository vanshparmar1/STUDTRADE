import React from 'react';
import { Link } from 'react-router-dom';
import StitchFooter from '../components/StitchFooter';

const LOGO = '/logo.png';
const PRODUCT_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnhFY0aPvMWAGaHVElL6UwK-8SbVi-DesHkd9sp1yj7mC2JBweXgZ_U1IQM7EAuQUprnRjbOgDEM0CbRdztf_HttUXW7E2682bb9En_TlF-1FRZF7gZIbFUYDKnb2Mh0KxLKGrUpaRkjLkqX0ztd0Ix7o0a6zKVWyvpykC1sUgrhMkrisipS00RQxFFN30mRVMoQ5zSku5cYDgGqN30_a6rcIGZWxvRKUNyRMLP1TAN-geHGHbDUNO5SBvxnmi86ULZIapSGOrqjY';

const OrderSuccessPage = () => (
  <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
    {/* Branding-only nav */}
    <header className="fixed top-0 w-full z-50 glass-nav border-b border-[var(--color-surface-variant)]/50">
      <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
        <Link to="/">
          <img src={LOGO} alt="STUDTRADE" className="h-10 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-on-surface-variant)] font-semibold uppercase tracking-wider">Secure Checkout</span>
          <span className="material-symbols-outlined text-[var(--color-primary)]">verified_user</span>
        </div>
      </div>
    </header>

    <main className="flex-1 pt-24 pb-12 px-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full text-center">
        {/* Check icon */}
        <div className="relative inline-block mb-12">
          <div className="gradient-primary h-32 w-32 rounded-full flex items-center justify-center mx-auto relative z-10"
            style={{ boxShadow: '0 0 60px rgba(26,128,129,0.3)' }}>
            <span className="material-symbols-outlined text-white text-6xl" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-[var(--color-secondary-container)] rounded-full opacity-50 blur-xl" />
          <div className="absolute -bottom-2 -left-6 w-16 h-16 bg-[var(--color-tertiary-container)] rounded-full opacity-40 blur-xl" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-on-surface)] mb-4 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-[var(--color-on-surface-variant)] text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
          Your item is on its way. We've sent a confirmation email with all the details of your delivery.
        </p>

        {/* Order details bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {[
            { label: 'Order Reference', value: '#ST-99284-XK' },
            { label: 'Estimated Arrival', value: 'Oct 24, 2024' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white p-8 rounded-3xl text-center border border-[var(--color-outline-variant)]/30">
              <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-2">{label}</p>
              <p className="text-2xl font-bold text-[var(--color-on-surface)]">{value}</p>
            </div>
          ))}
        </div>

        {/* Transaction summary */}
        <div className="bg-[var(--color-surface-container-low)] rounded-3xl p-1 mb-12 border border-[var(--color-outline-variant)]/30">
          <div className="bg-white p-6 px-10 flex items-center justify-between rounded-3xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--color-surface-container-low)] rounded-full overflow-hidden">
                <img src={PRODUCT_IMG} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="font-bold text-[var(--color-on-surface)]">Minimalist Study Set</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">Qty: 1</p>
              </div>
            </div>
            <p className="font-bold text-[var(--color-on-surface)] text-xl">$45.00</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            to="/marketplace"
            className="gradient-primary text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto text-center"
          >
            Back to Marketplace
          </Link>
          <Link
            to="/dashboard"
            className="bg-[var(--color-surface-container-high)] text-[var(--color-primary)] px-10 py-5 rounded-full font-bold text-lg hover:bg-[var(--color-surface-container-highest)] active:scale-95 transition-all w-full sm:w-auto text-center border border-[var(--color-primary)]/20"
          >
            View Order History
          </Link>
        </div>
      </div>
    </main>

    <StitchFooter />
  </div>
);

export default OrderSuccessPage;