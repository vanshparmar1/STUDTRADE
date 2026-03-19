import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LOGO = '/logo.png';
const HERO_BG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT7nmOl0QoXdZRS89O_KV6Eqe_wtFW5g7fCJxRWqf037X4j2Uf7-In9DmwGZRScK8TnsJ701xmNZjIZGy1lK2MB2wEEuqk0fngP0oKLK0uNh6hurPW2MI67XyOyclw53M8b1ka9HSjGeDTrD-BYnxdZZ5NGq65f48vw7hD1yvqc3wyLKUWjXT5B79sHwOJTswtwXbTKfTt5gmeJoYw4fMWbLMtsszF2xegVFD4w4r3lohn0tM-MmwgoVpTvKjEsr6qnjDYBgw5Lkg';
const PRODUCT_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCs9NkO35XoCxvC7zIXE0i_IOVf79jPX6exMIeqc3YyrhfDPA6e1ubHXbEWTf1JoF4Fwoja88oSkNdpsCnkjBLNJs0lT-uDRNAmlYICWDjS05clZxAN-gPgefjKDMjoKu0k_EVpWOi09Avdyfrqj1W-NfrVdGiDpiV_rq_3X9k_vWeUaUTkIXpQKN4XDLIdsCzR0HsrI7lksymhgxB43aGrR7NZVQX8RJt26Rnm57jkEwrglLIeIwk6J2dF4FUshSzq2nFfWZy8zEs';

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2 ml-4">
      {label}
    </label>
    <input
      className="w-full bg-[var(--color-surface-container-low)] border-none rounded-full px-6 py-3 focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:bg-white transition-all outline-none text-sm"
      {...props}
    />
  </div>
);

const BuyPage = () => {
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState('card');
  const [form, setForm] = useState({ name: '', address: '', city: '', postal: '', cardNum: '', expiry: '', cvv: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); navigate('/success'); };

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
      {/* Checkout-only navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-[var(--color-surface-variant)]">
        <div className="flex justify-between items-center px-6 max-w-7xl mx-auto py-2">
          <div className="flex items-center gap-4">
            <Link to="/item/1" className="material-symbols-outlined text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors p-2 rounded-full hover:bg-[var(--color-surface-container-low)]">
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
                    <InputField label="Shipping Address" name="address" value={form.address} onChange={handleChange} placeholder="123 University Ave, Room 402" type="text" />
                  </div>
                  <InputField label="City" name="city" value={form.city} onChange={handleChange} placeholder="Cambridge" type="text" />
                  <InputField label="Postal Code" name="postal" value={form.postal} onChange={handleChange} placeholder="CB2 1TN" type="text" />
                </div>
              </section>

              {/* Payment */}
              <section className="bg-white p-8 rounded-3xl" style={{ boxShadow: '0px 12px 32px rgba(26,128,129,0.05)' }}>
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">payments</span>
                  <h2 className="text-xl font-bold tracking-tight">Payment Method</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'card', icon: 'credit_card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Amex' },
                    { id: 'mobile', icon: 'smartphone', label: 'Mobile Pay', sub: 'Apple Pay, Google Pay' },
                  ].map(({ id, icon, label, sub }) => (
                    <label
                      key={id}
                      className={`flex items-center p-5 rounded-full cursor-pointer transition-all border-2 ${
                        payMethod === id
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                          : 'border-transparent bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container-high)]'
                      }`}
                    >
                      <input type="radio" name="payment" value={id} checked={payMethod === id} onChange={() => setPayMethod(id)} className="sr-only" />
                      <span className={`material-symbols-outlined mr-3 ${payMethod === id ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`}>{icon}</span>
                      <div>
                        <p className="font-bold text-sm">{label}</p>
                        <p className="text-[10px] text-[var(--color-on-surface-variant)] uppercase tracking-wider">{sub}</p>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payMethod === id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--color-outline-variant)]'}`}>
                        {payMethod === id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </label>
                  ))}
                </div>

                {payMethod === 'card' && (
                  <div className="mt-8 pt-8 border-t border-[var(--color-surface-container-high)] grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <InputField label="Card Number" name="cardNum" value={form.cardNum} onChange={handleChange} placeholder="0000 0000 0000 0000" type="text" />
                    </div>
                    <InputField label="Expiry Date" name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" type="text" />
                    <InputField label="CVV" name="cvv" value={form.cvv} onChange={handleChange} placeholder="•••" type="password" />
                  </div>
                )}
              </section>
            </div>

            {/* Right: Order summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <aside className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0px 12px 32px rgba(26,128,129,0.05)' }}>
                <div className="p-8">
                  <h2 className="text-xl font-bold tracking-tight mb-8">Order Summary</h2>
                  {/* Product row */}
                  <div className="flex gap-6 mb-8">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[var(--color-surface-container)] flex-shrink-0">
                      <img src={PRODUCT_IMG} alt="Sony WH-1000XM5" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-[var(--color-on-surface)] leading-tight">Sony WH-1000XM5</h3>
                        <span className="font-bold text-[var(--color-primary)]">$299.00</span>
                      </div>
                      <p className="text-[10px] uppercase font-bold text-[var(--color-on-surface-variant)] mb-4">Edition: Midnight Blue</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-[var(--color-surface-container-low)] rounded-full px-2 py-1 gap-4">
                          <button type="button" className="material-symbols-outlined text-sm hover:text-[var(--color-primary)] p-1 rounded-full">remove</button>
                          <span className="text-sm font-bold">1</span>
                          <button type="button" className="material-symbols-outlined text-sm hover:text-[var(--color-primary)] p-1 rounded-full">add</button>
                        </div>
                        <button type="button" className="text-[10px] font-black text-[var(--color-error)] uppercase tracking-widest ml-auto hover:underline">Remove</button>
                      </div>
                    </div>
                  </div>
                  {/* Price breakdown */}
                  <div className="space-y-4 pt-8 border-t border-[var(--color-surface-container)]">
                    {[['Subtotal', '$299.00', false],['Student Discount (10%)', '-$29.90', true],['Shipping', 'Free', true]].map(([label, val, isGreen]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-[var(--color-on-surface-variant)]">{label}</span>
                        <span className={`font-semibold ${isGreen ? 'text-[var(--color-primary)]' : ''}`}>{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-end pt-6">
                      <span className="text-lg font-bold">Order Total</span>
                      <div className="text-right">
                        <span className="block text-3xl font-black text-[var(--color-primary)] tracking-tighter">$269.10</span>
                        <span className="text-[10px] uppercase font-bold text-[var(--color-on-surface-variant)] tracking-widest">Includes VAT</span>
                      </div>
                    </div>
                  </div>
                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full mt-10 py-5 gradient-primary text-white rounded-full font-bold text-lg tracking-tight shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Complete Purchase
                  </button>
                  <p className="mt-6 text-center text-[10px] text-[var(--color-on-surface-variant)] leading-relaxed px-4">
                    By clicking "Complete Purchase", you agree to our{' '}
                    <a href="#" className="underline hover:text-[var(--color-primary)]">Terms of Service</a> and{' '}
                    <a href="#" className="underline hover:text-[var(--color-primary)]">Privacy Policy</a>. All transactions are encrypted.
                  </p>
                </div>
                {/* Trust bar */}
                <div className="bg-[var(--color-surface-container-low)] px-8 py-5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--color-primary)] text-sm">verified_user</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">Verified Student Deal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] text-sm">inventory_2</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">In Stock</span>
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