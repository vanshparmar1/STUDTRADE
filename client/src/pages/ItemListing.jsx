import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import toast from 'react-hot-toast';
import { addStoredPost } from '../utils/postsStore';

const CATEGORIES = [
  { label: 'Books', icon: '📚' },
  { label: 'Tech', icon: '💻' },
  { label: 'Furniture', icon: '🛋️' },
  { label: 'Cycles', icon: '🚲' },
  { label: 'Housing', icon: '🏠' },
  { label: 'Need', icon: '🙋' },
  { label: 'Other', icon: '🏷️' },
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function ItemListing() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [postText, setPostText] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [category, setCategory] = useState('Tech');
  const [condition, setCondition] = useState('Good');
  const [location, setLocation] = useState(user?.address?.fullAddress || 'Main Campus / Hostel');

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      return setError('You can upload up to 5 photos max.');
    }
    setError('');
    const newImages = [...images, ...files];
    setImages(newImages);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    if (previews[index] && previews[index].startsWith('blob:')) {
      URL.revokeObjectURL(previews[index]);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const createDefaultImageFile = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 400, 400);
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(1, '#059669');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('STUDTRADE LISTING', 200, 190);
        ctx.font = '16px sans-serif';
        ctx.fillText('Campus Verified Post', 200, 230);
        const dataUrl = canvas.toDataURL('image/png');
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], 'campus_post.png', { type: mime });
      }
    } catch (e) {
      console.warn('Canvas creation fallback:', e);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim() && !title.trim() && previews.length === 0) {
      return setError('Please provide a title, description or photo for your post!');
    }
    setLoading(true);
    setError('');

    const numPrice = isFree ? 0 : Number(price) || 0;
    const formattedPrice = isFree ? 'FREE' : price ? `₹${price}` : 'Free / Trade';

    // Format title & description to meet backend validators (min title: 3, min desc: 10)
    let finalTitle = (title.trim() || postText.slice(0, 40).trim() || 'Campus Item').slice(0, 120);
    if (finalTitle.length < 3) finalTitle = finalTitle + ' Item';

    let finalDesc = (postText.trim() || title.trim() || 'Campus listing and post item').slice(0, 2000);
    if (finalDesc.length < 10) finalDesc = finalDesc + ' - Available on campus for student pickup.';

    const finalLocality = (location.trim() || 'Main Campus').slice(0, 120);

    // Build FormData payload conforming to MongoDB server validation rules
    const formData = new FormData();
    formData.append('title', finalTitle);
    formData.append('description', finalDesc);
    formData.append('price', String(numPrice));
    formData.append('category', category);
    formData.append('condition', condition);
    formData.append('pickupAddress.fullAddress', finalLocality);
    formData.append('pickupAddress.locality', finalLocality);

    if (images.length > 0) {
      images.forEach((img) => formData.append('images', img));
    } else {
      const defaultImgFile = createDefaultImageFile();
      if (defaultImgFile) {
        formData.append('images', defaultImgFile);
      }
    }

    try {
      // Send FormData to backend. Axios automatically attaches Authorization header
      // and sets the correct multipart boundary header for Multer.
      const response = await API.post('/items', formData);
      const serverItem = response.data?.data;

      const postImg = serverItem?.images?.[0] || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80';

      const newPostItem = {
        _id: serverItem?._id || 'post_' + Date.now(),
        id: serverItem?.id || Date.now(),
        user: serverItem?.seller?.name || user?.name || 'Campus Member',
        handle: serverItem?.seller?.email ? `@${serverItem.seller.email.split('@')[0]}` : (user?.email ? `@${user.email.split('@')[0]}` : '@campus_member'),
        avatar: serverItem?.seller?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        badge: user?.verificationStatus === 'approved' ? 'Verified Student' : 'Student',
        isVerified: user?.verificationStatus === 'approved',
        timeAgo: 'Just now',
        title: finalTitle,
        caption: finalDesc,
        price: formattedPrice,
        rawPrice: numPrice,
        category: category,
        condition: condition,
        location: finalLocality,
        image: postImg,
        likes: 0,
        isLiked: false,
        saved: false,
        comments: []
      };

      addStoredPost(newPostItem);

      // Clean up blob URLs
      previews.forEach((p) => {
        if (typeof p === 'string' && p.startsWith('blob:')) URL.revokeObjectURL(p);
      });

      toast.success('Post published to Campus Feed! 🎉');
      navigate('/');
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to publish post';
      console.error('API post error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex-grow w-full">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-on-surface-variant)] mb-3">
            <button onClick={() => navigate('/')} className="hover:text-[var(--color-primary)] cursor-pointer">Home</button>
            <span>/</span>
            <span className="text-[var(--color-primary)]">Share Post &amp; Sell</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-on-surface)] tracking-tight">
            Share a Post &amp; Sell Item
          </h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
            Reach thousands of students across campus instantly with your listing, trade offer, or request.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Main Instagram-Style Upload Post Card */}
        <div className="bg-white rounded-3xl border border-[var(--color-outline-variant)]/30 p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* User Info Header */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-[var(--color-outline-variant)]/20">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border border-[var(--color-outline-variant)]/40 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-[var(--color-on-surface)]">{user?.name || 'Verified Student'}</h3>
                <span className="material-symbols-outlined text-blue-500 text-sm font-bold" title="Verified Campus Student">verified</span>
              </div>
              <p className="text-xs text-[var(--color-on-surface-variant)]">Posting to IIIT Bhopal Campus</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title / Headline Input */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">
                Post Title / Item Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio Calculator, Engineering Physics Notes, Desk Chair..."
                className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-2xl p-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 text-[var(--color-on-surface)]"
              />
            </div>

            {/* Post Caption / Description Input */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">
                Description / Details
              </label>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's happening on campus? Share item details, condition, trade terms, or pickup info..."
                className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none h-28 text-[var(--color-on-surface)]"
              />
            </div>

            {/* Photo Attachment & Preview Section */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">
                Photos (Up to 5 photos)
              </label>
              
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {previews.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/75 text-white rounded-full p-1 hover:bg-black transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ))}

                {previews.length < 5 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-[var(--color-outline-variant)] hover:border-[var(--color-primary)] bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] flex flex-col items-center justify-center cursor-pointer transition-colors text-center p-2">
                    <span className="material-symbols-outlined text-2xl text-[var(--color-primary)] mb-1">add_a_photo</span>
                    <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)]">Add Photo</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">
                Select Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.label}
                    onClick={() => setCategory(cat.label)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      category === cat.label
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                        : 'bg-[var(--color-surface-container-low)] text-slate-700 border-[var(--color-outline-variant)]/40 hover:bg-[var(--color-surface-container)]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition & Price Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Condition */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">
                  Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CONDITIONS.map((cond) => (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => setCondition(cond)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${
                        condition === cond
                          ? 'bg-[var(--color-primary-container)] text-[var(--color-primary)] border-[var(--color-primary)]'
                          : 'bg-[var(--color-surface-container-low)] text-slate-700 border-[var(--color-outline-variant)]/40'
                      }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Free Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                    Price (₹)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => {
                        setIsFree(e.target.checked);
                        if (e.target.checked) setPrice('');
                      }}
                      className="rounded accent-emerald-600"
                    />
                    <span>Free Giveaway</span>
                  </label>
                </div>
                <input
                  type="number"
                  disabled={isFree}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={isFree ? 'Free ($0)' : 'e.g. 500'}
                  className={`w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-2xl p-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 text-[var(--color-on-surface)] ${
                    isFree ? 'opacity-50 cursor-not-allowed bg-emerald-50' : ''
                  }`}
                />
              </div>
            </div>

            {/* Campus Location */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-2">
                Pickup / Campus Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Hostel B, Main Library, Engineering Block..."
                className="w-full bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-2xl p-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 text-[var(--color-on-surface)]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl gradient-primary text-white font-extrabold text-base shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Publishing Post...</span>
                ) : (
                  <>
                    <span>Publish Post to Campus</span>
                    <span className="material-symbols-outlined text-xl">send</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
}
