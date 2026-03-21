import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      if (data.success) {
        setCart(data.data);
        setSubtotal(data.subtotal);
      }
    } catch (err) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await API.delete(`/cart/${itemId}`);
      if (data.success) {
        // Optimistic update
        setCart((prev) => prev.filter((entry) => entry.item._id !== itemId));
        fetchCart(); // Recalculate subtotal from server
        toast.success('Item removed from cart');
      }
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      // In a real app, this would create an Order and Start Payment.
      // For now, clear cart and redirect to success.
      await API.delete('/cart/clear');
      navigate('/success');
    } catch (err) {
      toast.error('Checkout failed');
      setCheckoutLoading(false);
    }
  };

  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar activeLink="" />

      <main className="flex-1 pt-28 pb-20 max-w-7xl mx-auto px-6 w-full">
        <h1 className="text-3xl font-extrabold mb-8 tracking-tight text-[var(--color-on-surface)]">
          Your Shopping Cart
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-4xl animate-spin text-[var(--color-primary)]">refresh</span>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-24 bg-[var(--color-surface-container-low)] rounded-3xl">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-30">shopping_cart</span>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/marketplace"
              className="gradient-primary text-white font-bold py-3 px-8 rounded-full shadow-md"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {cart.map((entry) => (
                <div
                  key={entry._id}
                  className="flex flex-col sm:flex-row gap-6 p-6 bg-[var(--color-surface-container-low)] rounded-3xl items-start sm:items-center relative group transition-all hover:shadow-md border border-transparent hover:border-[var(--color-surface-container-highest)]"
                >
                  <img
                    src={entry.item.images[0]}
                    alt={entry.item.title}
                    className="w-24 h-24 object-cover rounded-2xl bg-[var(--color-surface-container)] shrink-0 cursor-pointer"
                    onClick={() => navigate(`/item/${entry.item._id}`)}
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-1 block">
                      {entry.item.category}
                    </span>
                    <h3 
                      className="font-bold text-lg mb-1 cursor-pointer hover:underline"
                      onClick={() => navigate(`/item/${entry.item._id}`)}
                    >
                      {entry.item.title}
                    </h3>
                    <p className="text-sm text-[var(--color-on-surface-variant)] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">sell</span>
                      {entry.item.condition}
                    </p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-4">
                    <div className="text-right">
                      <p className="font-extrabold text-xl tracking-tight text-[var(--color-on-surface)]">
                        {formatPrice(entry.item.price * entry.quantity)}
                      </p>
                      {entry.quantity > 1 && (
                        <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                          {entry.quantity} x {formatPrice(entry.item.price)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(entry.item._id)}
                      className="text-[var(--color-error)] hover:bg-[var(--color-error)]/10 p-2 rounded-full transition-colors flex items-center justify-center shrink-0"
                      title="Remove from cart"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 sticky top-32 p-8 bg-[var(--color-surface-container-highest)]/30 border border-[var(--color-surface-container-highest)] rounded-3xl">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="flex justify-between items-center mb-4 text-[var(--color-on-surface-variant)]">
                <span className="font-medium">Subtotal ({cart.length} items)</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-[var(--color-on-surface-variant)]">
                <span className="font-medium">Campus Delivery</span>
                <span className="font-bold text-[var(--color-primary)]">FREE</span>
              </div>
              
              <div className="border-t border-[var(--color-outline-variant)] pt-6 mb-8 flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-black tracking-tighter text-[var(--color-on-surface)]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full gradient-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 relative overflow-hidden group"
              >
                {checkoutLoading ? (
                  <span className="material-symbols-outlined animate-spin text-2xl relative z-10">refresh</span>
                ) : (
                  <>
                    <span className="relative z-10">Proceed to Checkout</span>
                    <span className="material-symbols-outlined relative z-10 text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
              
              <p className="text-xs text-center text-[var(--color-on-surface-variant)] mt-4 font-medium flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Secure checkout
              </p>
            </div>
          </div>
        )}
      </main>

      <StitchFooter />
    </div>
  );
};

export default CartPage;
