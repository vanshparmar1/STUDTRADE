import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const LOGO = '/logo.png';
const HERO_BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT7nmOl0QoXdZRS89O_KV6Eqe_wtFW5g7fCJxRWqf037X4j2Uf7-In9DmwGZRScK8TnsJ701xmNZjIZGy1lK2MB2wEEuqk0fngP0oKLK0uNh6hurPW2MI67XyOyclw53M8b1ka9HSjGeDTrD-BYnxdZZ5NGq65f48vw7hD1yvqc3wyLKUWjXT5B79sHwOJTswtwXbTKfTt5gmeJoYw4fMWbLMtsszF2xegVFD4w4r3lohn0tM-MmwgoVpTvKjEsr6qnjDYBgw5Lkg';

const PAYMENT_METHODS = [
  { id: 'COD',    icon: 'payments',      label: 'Cash on Delivery', sub: 'Pay when you receive' },
  { id: 'UPI',    icon: 'smartphone',    label: 'UPI',              sub: 'PhonePe, GPay, Paytm' },
  { id: 'Online', icon: 'credit_card',   label: 'Online / Card',    sub: 'Debit / Credit card' },
];

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2 ml-4">
      {label}
    </label>
    <input
      className="w-full bg-[var(--color-surface-container-low)] border-none rounded-full px-6 py-3 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:bg-white transition-all outline-none text-sm"
      required
      {...props}
    />
  </div>
);

const BuyPage = () => {
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState('COD');
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  // ── Cart data ────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(true);

  // ── Submission state ─────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await API.get('/cart');
        if (data.success) {
          setCart(data.data);
          setSubtotal(data.subtotal);
        }
      } catch {
        toast.error('Failed to load cart');
      } finally {
        setCartLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await API.post('/orders', {
        name: form.name,
        phone: form.phone,
        address: form.address,
        paymentMethod: payMethod,
      });
      if (data.success) {
        toast.success(`${data.count} order(s) placed!`);
        navigate('/success');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (p) => `₹${Number(p).toLocaleString('en-IN')}`;

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
      {/* Checkout-only navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-[var(--color-surface-variant)]">
        <div className="flex justify-between items-center px-6 max-w-7xl mx-auto py-2">
          <div className="flex items-center gap-4">
            <Link to="/cart" className="material-symbols-outlined text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors p-2 rounded-full hover:bg-[var(--color-surface-container-low)]">
              arrow_back
            </Link>
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

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Forms */}
            <div className="lg:col-span-7 space-y-10">
              {/* Hero banner */}
              <div className="relative rounded-3xl overflow-hidden h-48">
                <img src={HERO_BG} alt="Checkout" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-inverse-surface)]/60 to-transparent flex items-center px-10">
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">Finalize Order</h1>
                </div>
              </div>

              {/* Delivery */}
              <section className="bg-white p-8 rounded-3xl" style={{ boxShadow: '0px 12px 32px rgba(26,128,129,0.05)' }}>
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">local_shipping</span>
                  <h2 className="text-xl font-bold tracking-tight">Delivery Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Alex Student" type="text" />
                  </div>
                  <div className="md:col-span-2">
                    <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" type="tel" />
                  </div>
                  <div className="md:col-span-2">
                    <InputField label="Campus Address / Hostel Room" name="address" value={form.address} onChange={handleChange} placeholder="Hostel D, Room 214, IIIT Bhopal" type="text" />
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="bg-white p-8 rounded-3xl" style={{ boxShadow: '0px 12px 32px rgba(26,128,129,0.05)' }}>
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">payments</span>
                  <h2 className="text-xl font-bold tracking-tight">Payment Method</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PAYMENT_METHODS.map(({ id, icon, label, sub }) => (
                    <label
                      key={id}
                      className={`flex flex-col items-center justify-center p-5 rounded-2xl cursor-pointer transition-all border-2 text-center ${
                        payMethod === id
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-transparent bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)]'
                      }`}
                    >
                      <input type="radio" name="payment" value={id} checked={payMethod === id} onChange={() => setPayMethod(id)} className="sr-only" />
                      <span className={`material-symbols-outlined mb-2 text-3xl ${payMethod === id ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`}>{icon}</span>
                      <p className="font-bold text-sm">{label}</p>
                      <p className="text-[10px] text-[var(--color-on-surface-variant)] uppercase tracking-wider mt-1">{sub}</p>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <aside className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0px 12px 32px rgba(26,128,129,0.05)' }}>
                <div className="p-8">
                  <h2 className="text-xl font-bold tracking-tight mb-6">Order Summary</h2>

                  {/* Cart items list */}
                  {cartLoading ? (
                    <div className="flex justify-center py-8">
                      <span className="material-symbols-outlined animate-spin text-[var(--color-primary)] text-3xl">refresh</span>
                    </div>
                  ) : cart.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-on-surface-variant)]">
                      <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">shopping_cart</span>
                      <p className="text-sm font-medium">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      {cart.map((entry) => (
                        <div key={entry._id} className="flex gap-4 items-center">
                          <img
                            src={entry.item.images?.[0] || 'https://placehold.co/64x64?text=?'}
                            alt={entry.item.title}
                            className="w-14 h-14 rounded-xl object-cover bg-[var(--color-surface-container)] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{entry.item.title}</p>
                            <p className="text-xs text-[var(--color-on-surface-variant)]">{entry.item.condition}</p>
                          </div>
                          <p className="font-bold text-sm shrink-0">{formatPrice(entry.item.price)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price breakdown */}
                  <div className="space-y-3 pt-6 border-t border-[var(--color-surface-container)]">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-on-surface-variant)]">Subtotal ({cart.length} items)</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-on-surface-variant)]">Campus Delivery</span>
                      <span className="font-semibold text-[var(--color-primary)]">FREE</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-[var(--color-surface-container)]">
                      <span className="text-lg font-bold">Order Total</span>
                      <span className="text-3xl font-black text-[var(--color-primary)] tracking-tighter">{formatPrice(subtotal)}</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || cartLoading || cart.length === 0}
                    className="w-full mt-8 py-5 gradient-primary text-white rounded-full font-bold text-lg tracking-tight shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                        Placing Order…
                      </>
                    ) : (
                      <>
                        Complete Purchase
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                  <p className="mt-4 text-center text-[10px] text-[var(--color-on-surface-variant)] leading-relaxed px-4">
                    By clicking "Complete Purchase", you agree to our{' '}
                    <a href="#" className="underline hover:text-[var(--color-primary)]">Terms of Service</a> and{' '}
                    <a href="#" className="underline hover:text-[var(--color-primary)]">Privacy Policy</a>.
                  </p>
                </div>

                {/* Trust bar */}
                <div className="bg-[var(--color-surface-container-low)] px-8 py-5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-sm">verified_user</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">Verified Student Deal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] text-sm">lock</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Encrypted</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default BuyPage;