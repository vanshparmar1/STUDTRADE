import React, { useState, useEffect } from 'react';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  getCampusUpdates,
  addCampusUpdate,
  deleteCampusUpdate,
  cleanupExpiredCampusPosts,
  getCategoryIcon,
  getCategoryBadgeStyle,
  getRemainingTimeText,
  CATEGORY_OPTIONS
} from '../utils/campusUpdatesStore';

const CampusAnnouncementsPage = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Announcement');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Initial load + periodic tick for expiration cleanup & countdown
  const refreshFeed = async () => {
    try {
      const { data } = await API.get('/campus-updates');
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((item) => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          description: item.description,
          category: item.category || 'Announcement',
          location: item.location || 'Main Campus',
          expiresAt: item.expiresAt,
          createdByUserId: item.createdBy?._id || item.createdBy,
          createdAt: item.createdAt,
        }));
        setUpdates(mapped);
      } else {
        cleanupExpiredCampusPosts();
        setUpdates(getCampusUpdates());
      }
    } catch (err) {
      cleanupExpiredCampusPosts();
      setUpdates(getCampusUpdates());
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    refreshFeed();

    const interval = setInterval(() => {
      refreshFeed();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Handle local file image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error('Image size should be less than 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please provide a title');
      return;
    }
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    try {
      const { data } = await API.post('/campus-updates', {
        title,
        description,
        category,
        location: location || 'Main Campus',
        durationHours: 24,
      });
      if (data.success) {
        toast.success('Campus update posted successfully! 🎉');
        refreshFeed();
      }
    } catch (err) {
      console.warn('API campus update post note:', err.message);
      addCampusUpdate({
        title,
        description,
        category,
        location,
        dateTime,
        image: imageUrl
      });
      toast.success('Campus update posted locally!');
    }
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('Announcement');
    setLocation('');
    setDateTime('');
    setImageUrl('');
    setImagePreview('');
    setIsModalOpen(false);

    refreshFeed();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campus update?')) return;
    try {
      await API.delete(`/campus-updates/${id}`);
      toast.success('Campus update deleted successfully!');
      setUpdates((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    } catch (err) {
      deleteCampusUpdate(id);
      toast.success('Campus update removed');
      refreshFeed();
    }
  };

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col font-sans">
      <StitchNavbar activeLink="Campus" />

      <main className="flex-1 pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 w-full space-y-8">
        
        {/* ── 1. PAGE HEADER ── */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-left shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold uppercase tracking-wider">
              <span>📢</span>
              <span>LIVE CAMPUS BOARD</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              WHAT'S HAPPENING
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
              What's happening around your campus right now. Fresh 24-hour campus notices, events & updates.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl gradient-primary text-white font-extrabold text-xs sm:text-sm shadow-sm hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Post Campus Update</span>
          </button>
        </section>

        {/* ── 2. MAIN FEED ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">Active Updates ({updates.length})</h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">24-hour validity</span>
          </div>

          {updates.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-2xl mx-auto border border-amber-200">
                📢
              </div>
              <h3 className="text-lg font-bold text-slate-900">No new campus updates right now.</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Be the first to share an announcement, college event, workshop or seminar with fellow students!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
              >
                Post Update
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((post) => {
                const icon = getCategoryIcon(post.category);
                const badgeStyle = getCategoryBadgeStyle(post.category);
                const remainingText = getRemainingTimeText(post.expiresAt);

                return (
                  <article 
                    key={post.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4 relative group"
                  >
                    {/* Header: Category Badge + Expiration Timer */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${badgeStyle} text-xs font-extrabold`}>
                        <span>{icon}</span>
                        <span className="uppercase tracking-wider text-[11px]">{post.category}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold border border-slate-200">
                          <span>⏳</span>
                          <span>{remainingText}</span>
                        </span>

                        {/* Quick Delete Option */}
                        <button
                          onClick={() => handleDelete(post.id)}
                          title="Remove update"
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Content & Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Optional Image */}
                      {post.image ? (
                        <div className="md:col-span-4 h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null}

                      {/* Text Content */}
                      <div className={`${post.image ? 'md:col-span-8' : 'md:col-span-12'} space-y-2.5 text-left`}>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                          {post.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                          {post.description}
                        </p>

                        {/* Location & Date/Time Pills */}
                        {(post.location || post.dateTime) && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-bold text-slate-700">
                            {post.location && (
                              <div className="inline-flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                                <span className="text-slate-500">📍</span>
                                <span>{post.location}</span>
                              </div>
                            )}

                            {post.dateTime && (
                              <div className="inline-flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                                <span className="text-slate-500">🕐</span>
                                <span>{post.dateTime}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* ── 3. POST CAMPUS UPDATE MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📢</span>
                <h3 className="text-lg font-black text-slate-900">Post Campus Update</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryIcon(cat)} {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Sports Meet, Exam Timetable, Library Notice"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share details about the update, event time, guidelines, or notice..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none resize-none"
                />
              </div>

              {/* Location & Date/Time (2-cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Seminar Hall, Ground"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Date / Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    placeholder="e.g. Tomorrow, 10 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
                  />
                </div>
              </div>

              {/* Image Input (Upload file or URL) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Image (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[var(--color-primary-container)]/30 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary-container)]/50 cursor-pointer"
                  />

                  <div className="relative">
                    <input
                      type="url"
                      value={imageUrl.startsWith('data:') ? '' : imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Or paste an Image URL..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none"
                    />
                  </div>

                  {imagePreview && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setImageUrl('');
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer"
                >
                  Publish Update (24h)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <StitchFooter />
    </div>
  );
};

export default CampusAnnouncementsPage;
