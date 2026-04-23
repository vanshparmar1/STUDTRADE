import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { isOnlineCashfreeCheckout } from '../config/payment';

const PLACEHOLDER_IMG = 'https://placehold.co/600x600?text=No+Image';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeThumb, setActiveThumb] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/items/${id}`);
        if (data.success) {
          setItem(data.data);
          setActiveThumb(0); // Reset thumbnail on load
        }
      } catch (err) {
        setError('Item not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchItem();
      // Scroll to top when new item loads
      window.scrollTo(0, 0);
    }
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      const { data } = await API.post('/cart/add', { itemId: item._id });
      if (data.success) {
        toast.success(data.message || 'Added to cart');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
        <StitchNavbar activeLink="Shop" />
        <main className="flex-1 flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col items-center gap-4 text-[var(--color-on-surface-variant)]">
            <span className="material-symbols-outlined text-4xl animate-spin text-[var(--color-primary)]">refresh</span>
            <p className="font-semibold uppercase tracking-widest text-sm">Loading details...</p>
          </div>
        </main>
        <StitchFooter />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
        <StitchNavbar activeLink="Shop" />
        <main className="flex-1 flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-[var(--color-error)] mb-4">error_outline</span>
            <h2 className="text-2xl font-bold mb-4">{error || 'Item not found'}</h2>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-full hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
            >
              Back to Marketplace
            </button>
          </div>
        </main>
        <StitchFooter />
      </div>
    );
  }

  const images = item.images && item.images.length > 0 ? item.images : [PLACEHOLDER_IMG];
  const mainImage = images[activeThumb] || images[0];

  const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

  const handleBuyNow = () => {
    if (isOnlineCashfreeCheckout()) {
      navigate('/checkout/' + item._id);
      return;
    }
    navigate('/offline-pay/' + item._id);
  };

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar activeLink="Shop" />

      <main className="flex-1 pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="aspect-[4/5] bg-[var(--color-surface-container-low)] rounded-3xl overflow-hidden relative group">
              <img
                src={mainImage}
                alt={item.title}
                className="w-full h-full object-cover object-center max-w-full overflow-hidden rounded-[inherit] group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-6 right-6">
                <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full font-bold text-[var(--color-on-surface)] shadow-sm text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">sell</span>
                  {item.condition}
                </span>
              </div>
            </div>
            
            {/* Thumbnails (only show if more than 1 image) */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 sm:gap-4 mt-4 lg:mt-0">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                  className={`aspect-square rounded-2xl overflow-hidden transition-all duration-200 ${
                      activeThumb === i
                        ? 'ring-2 ring-[var(--color-primary)] opacity-100 shadow-md'
                        : 'opacity-60 hover:opacity-100 hover:ring-1 hover:ring-[var(--color-outline-variant)] hover:shadow-sm'
                    } bg-[var(--color-surface-container-low)]`}
                  >
                    <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover object-center max-w-full overflow-hidden rounded-[inherit]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-5 sticky top-32 flex flex-col gap-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2 block">
                {item.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--color-on-surface)] leading-tight mb-4">
                {item.title}
              </h1>
              <div className="flex items-baseline gap-4 flex-wrap mt-6">
                <span className="text-4xl font-black text-[var(--color-on-surface)] tracking-tighter">
                  {formatPrice(item.price)}
                </span>
                {item.condition === 'New' && (
                  <span className="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Mint Condition
                  </span>
                )}
              </div>
            </div>



            {/* Description */}
            <div className="p-6 bg-[var(--color-surface-container-low)] rounded-2xl">
              <h3 className="font-bold mb-3 text-[var(--color-on-surface)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[var(--color-outline)]">article</span>
                Description
              </h3>
              <p className="text-[var(--color-on-surface-variant)] leading-relaxed text-sm whitespace-pre-wrap">
                {item.description}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4 pt-4">
              <button
                type="button"
                onClick={handleBuyNow}
                className="bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold py-4 rounded-2xl text-lg shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Buy Now
                <span className="material-symbols-outlined">shopping_bag</span>
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 bg-[var(--color-surface-container-high)] text-[var(--color-primary)] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[var(--color-surface-container-highest)] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {addingToCart ? (
                    <span className="material-symbols-outlined animate-spin text-[var(--color-outline)]">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-[var(--color-outline)]">add_shopping_cart</span>
                  )}
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-16 bg-[var(--color-surface-container-high)] text-[var(--color-primary)] py-4 rounded-2xl flex items-center justify-center hover:bg-[var(--color-surface-container-highest)] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200"
                  title="Share Item"
                >
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>
            </div>


          </div>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
};

export default ProductDetailPage;