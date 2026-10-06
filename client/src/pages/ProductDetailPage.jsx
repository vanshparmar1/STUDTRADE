import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import API from '../api/axios';
import { getImageUrl, handleImageError } from '../utils/imageUrl';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isOnlineCashfreeCheckout } from '../config/payment';
import { formatListingAreaFromPickup } from '../utils/listingArea';

const PLACEHOLDER_IMG = 'https://placehold.co/600x600?text=No+Image';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeThumb, setActiveThumb] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
  const listingAreaLabel =
    item.listingArea ?? formatListingAreaFromPickup(item.pickupAddress);

  const handleContactWhatsApp = () => {
    if (!user) {
      toast.error('Please log in first to contact seller or buy items');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    const rawPhone = item.seller?.phone || item.phone || '';
    if (!rawPhone) {
      toast.error(
        `Seller (${item.seller?.name || 'Seller'}) has not listed a phone number. Email: ${item.seller?.email || 'N/A'}`
      );
      return;
    }

    const cleanPhone = rawPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    const message = encodeURIComponent(
      `Hi ${item.seller?.name || 'Seller'}, I am interested in buying your item "${item.title}" for ₹${item.price} listed on STUDTRADE! Is it available?`
    );
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteItem = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      setDeleting(true);
      await API.delete(`/items/${item._id}`);
      toast.success('Listing deleted successfully!');
      navigate('/marketplace');
    } catch (err) {
      toast.error('Failed to delete item');
    } finally {
      setDeleting(false);
    }
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
                src={getImageUrl(mainImage)}
                alt={item.title}
                onError={(e) => handleImageError(e)}
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
                    <img
                      src={getImageUrl(src)}
                      alt={`Thumbnail ${i + 1}`}
                      onError={(e) => handleImageError(e)}
                      className="w-full h-full object-cover object-center max-w-full overflow-hidden rounded-[inherit]"
                    />
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
              {listingAreaLabel ? (
                <p className="mt-4 flex items-start gap-2 text-sm font-semibold text-[var(--color-primary)]">
                  <span className="material-symbols-outlined text-lg shrink-0">distance</span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)] mb-0.5">
                      Pickup locality
                    </span>
                    {listingAreaLabel}
                    <span className="block text-xs font-normal text-[var(--color-on-surface-variant)] mt-2 leading-relaxed">
                      Campus or hostel zone (not the full address). Exact pickup is coordinated with the seller after you buy.
                    </span>
                  </span>
                </p>
              ) : null}
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

            {/* Seller Contact Details Card */}
            <div className="mt-2 p-5 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50/80 border border-emerald-200/80 rounded-3xl flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                  {item.seller?.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 tracking-wide">{item.seller?.name || 'Campus Seller'}</p>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    {item.seller?.phone ? `📱 +91 ${item.seller.phone}` : `✉️ ${item.seller?.email || 'Verified Student'}`}
                  </p>
                </div>
              </div>

              {item.seller?.phone && (
                <a
                  href={`tel:${item.seller.phone}`}
                  className="px-4 py-2 rounded-2xl bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs hover:shadow-xs"
                >
                  <span className="material-symbols-outlined text-base text-emerald-600">call</span>
                  <span>Call</span>
                </a>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4 pt-3">
              <button
                type="button"
                onClick={handleContactWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-4.5 rounded-2xl text-base shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Contact Seller on WhatsApp</span>
                <span className="material-symbols-outlined text-xl">chat</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="w-16 bg-[var(--color-surface-container-high)] text-[var(--color-primary)] py-4 rounded-2xl flex items-center justify-center hover:bg-[var(--color-surface-container-highest)] hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 cursor-pointer"
                  title="Share Item"
                >
                  <span className="material-symbols-outlined">share</span>
                </button>

                {(user?._id === (item.seller?._id || item.seller) || user?.role === 'admin') && (
                  <button
                    onClick={handleDeleteItem}
                    disabled={deleting}
                    className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined">delete</span>
                    <span>{deleting ? 'Deleting...' : 'Delete Listing'}</span>
                  </button>
                )}
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