import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
  computeOfflineBilling,
  offlinePaymentQrSrc,
  offlinePaymentPhone,
  OFFLINE_PLATFORM_FEE_RATE,
} from '../config/payment';

const LOGO = '/logo.png';

const formatMoney = (n) =>
  `₹${Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const waDigits = (phone) => phone.replace(/\D/g, '');

const OfflinePaymentPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [qrFailed, setQrFailed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/items/${productId}`);
        if (!data.success) throw new Error('Item not found');
        setItem(data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Could not load item');
        toast.error('Failed to load billing');
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      load();
      window.scrollTo(0, 0);
    }
  }, [productId]);

  const billing = useMemo(
    () => (item ? computeOfflineBilling(item.price) : null),
    [item],
  );

  const digits = offlinePaymentPhone ? waDigits(offlinePaymentPhone) : '';
  const totalLabel = billing ? formatMoney(billing.total) : '';
  const feePctLabel = `${OFFLINE_PLATFORM_FEE_RATE * 100}%`;
  const waHref =
    digits && item && billing
      ? `https://wa.me/${digits}?text=${encodeURIComponent(
          `Hi, I paid for "${item.title}" via QR.\nListed price: ${formatMoney(billing.basePrice)}\nPlatform fees (${feePctLabel}): ${formatMoney(billing.platformFee)}\nTotal paid: ${totalLabel}\nPayment screenshot attached.`,
        )}`
      : null;

  const NavBar = () => (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-[var(--color-surface-variant)]">
      <div className="flex justify-between items-center px-6 max-w-7xl mx-auto py-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="material-symbols-outlined text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors p-2 rounded-full hover:bg-[var(--color-surface-container-low)]"
          >
            arrow_back
          </button>
          <Link to="/">
            <img src={LOGO} alt="STUDTRADE" className="h-10 w-auto object-contain" />
          </Link>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
          Pay with QR
        </span>
      </div>
    </nav>
  );

  if (loading) {
    return (
      <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
        <NavBar />
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen pt-24 pb-20 px-4">
          <span className="material-symbols-outlined animate-spin text-[var(--color-primary)] text-4xl mb-4">
            refresh
          </span>
          <p className="font-semibold uppercase tracking-widest text-sm text-[var(--color-on-surface-variant)]">
            Loading billing…
          </p>
        </main>
      </div>
    );
  }

  if (error || !item || !billing) {
    return (
      <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
        <NavBar />
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen pt-24 pb-20 px-4 text-center">
          <span className="material-symbols-outlined text-6xl text-[var(--color-error)] mb-4">error_outline</span>
          <h1 className="text-2xl font-bold mb-4">{error || 'Item not found'}</h1>
          <button
            type="button"
            onClick={() => navigate(`/item/${productId}`)}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-full hover:opacity-90"
          >
            Back to item
          </button>
        </main>
      </div>
    );
  }

  const thumb = item.images?.[0] || 'https://placehold.co/400x300?text=No+Image';

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
      <NavBar />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: summary + billing + delivery alert */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2">
                Offline checkout
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">Billing &amp; payment</h1>
              <p className="text-[var(--color-on-surface-variant)] text-sm">
                Pay the <strong className="text-[var(--color-on-surface)]">total below</strong> using the QR code. Platform fees are included in this total.
              </p>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/50">
              <img
                src={thumb}
                alt=""
                className="w-24 h-24 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <h2 className="font-bold text-lg leading-snug line-clamp-2">{item.title}</h2>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
                  Listed price (seller){' '}
                  <span className="font-semibold text-[var(--color-on-surface)]">
                    {formatMoney(billing.basePrice)}
                  </span>
                </p>
              </div>
            </div>

            <section
              className="rounded-3xl bg-white border border-[var(--color-outline-variant)]/40 overflow-hidden"
              style={{ boxShadow: '0px 12px 32px rgba(26,128,129,0.06)' }}
            >
              <div className="px-6 py-4 border-b border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)]/50">
                <h3 className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">receipt_long</span>
                  Bill summary
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-on-surface-variant)]">Base price (listed)</span>
                  <span className="font-semibold tabular-nums">{formatMoney(billing.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-on-surface-variant)] flex items-center gap-1">
                    Platform fees
                    <span className="text-xs font-bold text-[var(--color-primary)]">({feePctLabel})</span>
                  </span>
                  <span className="font-semibold tabular-nums">{formatMoney(billing.platformFee)}</span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-[var(--color-outline-variant)]/50">
                  <span className="text-lg font-bold">Pay via QR (total)</span>
                  <span className="text-2xl sm:text-3xl font-black text-[var(--color-primary)] tracking-tight tabular-nums">
                    {formatMoney(billing.total)}
                  </span>
                </div>
              </div>
            </section>

            <div
              className="rounded-2xl border border-amber-600/25 bg-amber-50 p-4 flex gap-3"
              role="alert"
            >
              <span className="material-symbols-outlined text-amber-700 shrink-0">local_shipping</span>
              <div className="text-sm leading-relaxed text-amber-950">
                <p className="font-bold text-amber-900 mb-1">Delivery charges</p>
                <p className="text-amber-900/90">
                  Delivery fees will be confirmed with you when you place or confirm your order. Charges are kept{' '}
                  <strong>very nominal</strong>—fair campus rates only, not inflated or overpriced.
                </p>
              </div>
            </div>
          </div>

          {/* Right: QR + instructions */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <section
              className="rounded-3xl bg-white border border-[var(--color-outline-variant)]/40 overflow-hidden p-6"
              style={{ boxShadow: '0px 12px 32px rgba(26,128,129,0.06)' }}
            >
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-primary)]">qr_code_2</span>
                Scan to pay
              </h3>
              <div className="flex justify-center mb-5">
                <div className="rounded-2xl bg-white p-4 shadow-inner border border-[var(--color-outline-variant)]/30">
                  {!qrFailed ? (
                    <img
                      src={offlinePaymentQrSrc}
                      alt="Payment QR code"
                      className="w-52 h-52 object-contain"
                      onError={() => setQrFailed(true)}
                    />
                  ) : (
                    <div className="w-52 h-52 flex flex-col items-center justify-center text-center px-3 text-xs text-[var(--color-on-surface-variant)]">
                      <span className="material-symbols-outlined text-4xl mb-2 text-[var(--color-outline)]">
                        qr_code_2
                      </span>
                      <p>
                        Add <code className="bg-[var(--color-surface-container-high)] px-1 rounded">client/public/offline-payment-qr.png</code> or set{' '}
                        <code className="bg-[var(--color-surface-container-high)] px-1 rounded">VITE_OFFLINE_PAYMENT_QR_SRC</code> in <code className="bg-[var(--color-surface-container-high)] px-1 rounded">.env</code>.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--color-primary-container)]/40 border border-[var(--color-primary)]/20 p-4 mb-5">
                <p className="text-sm leading-relaxed text-[var(--color-on-surface)]">
                  Pay <strong>{formatMoney(billing.total)}</strong> using this QR. After it succeeds, send a{' '}
                  <strong>screenshot of the transaction</strong>
                  {waHref ? (
                    <>
                      {' '}on WhatsApp to{' '}
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[var(--color-primary)] underline underline-offset-2"
                      >
                        {offlinePaymentPhone}
                      </a>
                      .
                    </>
                  ) : (
                    <>
                      {' '}using the number from support (set{' '}
                      <code className="text-xs bg-[var(--color-surface-container-high)] px-1 rounded">VITE_OFFLINE_PAYMENT_PHONE</code> in{' '}
                      <code className="text-xs bg-[var(--color-surface-container-high)] px-1 rounded">.env</code>).
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-center shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[22px]">chat</span>
                    Open WhatsApp with details
                  </a>
                )}
                <Link
                  to="/contact-us"
                  className="w-full py-3 rounded-2xl text-center font-semibold text-[var(--color-primary)] border border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-container-high)] transition-colors"
                >
                  Contact support
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfflinePaymentPage;
