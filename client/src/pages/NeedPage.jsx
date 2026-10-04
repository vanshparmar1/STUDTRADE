import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getStoredNeeds, saveNeed, markNeedFulfilled, getDaysLeft } from '../utils/needsStore';

const CATEGORIES = [
  'Item Needed',
  'Service Needed',
  'Skill Needed',
  'Study Help',
  'Rental Needed',
  'Urgent Need',
  'Paid Opportunity',
  'Free / Borrow',
  'Urgent Sale',
  'Other'
];

const NeedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [needs, setNeeds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Item Needed',
    budget: '',
    location: 'Hostel B',
    image: '',
    user: 'You'
  });

  const fetchNeeds = async () => {
    try {
      const { data } = await API.get('/needs');
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((item) => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          description: item.description,
          category: item.category,
          budget: item.budget,
          location: item.location,
          user: item.userName || item.user?.name || 'Student',
          userId: item.user?._id || item.user,
          image: item.image,
          status: item.status,
          createdAt: item.createdAt,
          verified: true,
        }));
        setNeeds(mapped);
      } else {
        setNeeds(getStoredNeeds());
      }
    } catch (err) {
      console.warn('API needs fetch note:', err.message);
      setNeeds(getStoredNeeds());
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchNeeds();
  }, []);

  // Filter Active Non-Expired Posts
  const activePosts = needs.filter((post) => {
    if (post.status === 'FULFILLED' || post.status === 'EXPIRED') return false;
    const daysLeft = getDaysLeft(post.createdAt);
    if (daysLeft <= 0) return false;

    // Category Filter
    if (selectedCategory !== 'All' && post.category !== selectedCategory) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.location.toLowerCase().includes(q) ||
        (post.category && post.category.toLowerCase().includes(q))
      );
      if (!match) return false;
    }

    return true;
  });

  const handleCreateNeed = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please enter a title and description');
      return;
    }

    const newPostData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      budget: formData.budget || 'Flexible',
      location: formData.location || 'Hostel Area',
      image: formData.image || '',
    };

    try {
      const { data } = await API.post('/needs', newPostData);
      if (data.success) {
        toast.success('Need query posted successfully! 🎉');
        fetchNeeds();
      }
    } catch (err) {
      console.warn('API need post error:', err.message);
      const newPost = {
        id: 'n_' + Date.now(),
        ...newPostData,
        user: user?.name || 'You',
        verified: true,
        createdAt: Date.now(),
        status: 'ACTIVE'
      };
      const updated = saveNeed(newPost);
      setNeeds(updated);
      toast.success('Need query saved locally.');
    }

    setIsModalOpen(false);
    setFormData({
      title: '',
      description: '',
      category: 'Item Needed',
      budget: '',
      location: 'Hostel B',
      image: '',
      user: 'You'
    });
  };

  const handleFulfill = async (id) => {
    try {
      await API.patch(`/needs/${id}/fulfill`);
      toast.success('Marked as Fulfilled!');
      fetchNeeds();
    } catch (err) {
      const updated = markNeedFulfilled(id);
      setNeeds(updated);
      toast.success('Marked as Fulfilled!');
    }
  };

  const handleDeleteNeed = async (id) => {
    if (!window.confirm('Are you sure you want to delete this need query?')) return;
    try {
      await API.delete(`/needs/${id}`);
      toast.success('Need query deleted successfully!');
      setNeeds((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    } catch (err) {
      console.error('Delete need error:', err);
      toast.error('Failed to delete need query');
    }
  };

  const handleContact = (post) => {
    toast.success(`Connecting with ${post.user} for "${post.title}"...`);
    navigate('/marketplace');
  };

  return (
    <div className="bg-[#f6f9fc] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar activeLink="Need" />

      <main className="flex-1 pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        
        {/* Sub-header tagline matching screenshot */}
        <div className="text-center sm:text-left space-y-1">
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">
            Ask your campus. Someone may have what you need.
          </p>
        </div>

        {/* Page Top Bar / CTA */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔎</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">NEED</h1>
          </div>

          {/* Clean Post Need button without extra duplicate plus sign */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Post a Need</span>
          </button>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="space-y-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search campus queries (calculator, PPT, study table, books)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ outline: 'none' }}
              className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Needs
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Section Header matching screenshot: Needs around campus */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Needs around campus</h2>
          <span className="text-xs text-slate-500 font-semibold">{activePosts.length} active {activePosts.length === 1 ? 'request' : 'requests'}</span>
        </div>

        {/* Vertically Scrolling Need Feed */}
        <div className="space-y-4">
          {activePosts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-3">
              <div className="text-4xl">🔎</div>
              <h3 className="font-bold text-slate-900 text-base">No active queries found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first to post what you need, or reset search filters to see all campus queries.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                Post a Need
              </button>
            </div>
          ) : (
            activePosts.map((post) => {
              const daysLeft = getDaysLeft(post.createdAt);
              return (
                <div 
                  key={post.id} 
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Card Top Meta */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px]">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-1 text-slate-600 font-semibold">
                        <span>{post.user}</span>
                        {post.verified && (
                          <span className="material-symbols-outlined text-blue-500 text-xs font-bold" title="Verified Student">verified</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <span>⏳</span>
                        <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
                      </div>

                      {(user?._id === post.userId || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteNeed(post._id || post.id)}
                          title="Delete Need Query"
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-full"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">{post.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{post.description}</p>
                  </div>

                  {/* Optional Uploaded Image */}
                  {post.image && (
                    <div className="relative rounded-2xl overflow-hidden max-h-60 bg-slate-100 border border-slate-200">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Details Row: Budget & Location */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-4">
                      {post.budget && (
                        <div className="flex items-center gap-1 text-emerald-700 font-extrabold">
                          <span>💰</span>
                          <span>{post.budget}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-slate-600">
                        <span>📍</span>
                        <span>{post.location}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFulfill(post.id)}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Mark Fulfilled
                      </button>

                      <button
                        onClick={() => handleContact(post)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>{post.category === 'Urgent Sale' ? 'Contact' : 'I Can Help'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </main>

      {/* ── Post a Need Upload Modal (matching exact screenshot design) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-5 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header matching screenshot */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">QUICK CAMPUS REQUEST</span>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Post a Need</h3>
                <p className="text-xs text-slate-500 font-medium">Keep it simple. Students can contact you directly.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form matching screenshot */}
            <form onSubmit={handleCreateNeed} className="space-y-4 text-xs font-semibold">
              
              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-slate-700">Title</label>
                <input
                  type="text"
                  placeholder="What do you need?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white border border-slate-200/90 rounded-2xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  required
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-slate-700">Description</label>
                <textarea
                  rows={3}
                  placeholder="Add a few details to help students understand."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-slate-200/90 rounded-2xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium resize-none"
                  required
                />
              </div>

              {/* Category & Budget Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white border border-slate-200/90 rounded-2xl p-3.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 flex items-center justify-between">
                    <span>Budget</span>
                    <span className="text-[10px] text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹800 or Flexible"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-white border border-slate-200/90 rounded-2xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Location Input */}
              <div className="space-y-1.5">
                <label className="text-slate-700">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Hostel B"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white border border-slate-200/90 rounded-2xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  required
                />
              </div>

              {/* Image Upload / URL Dropzone matching screenshot */}
              <div className="space-y-1.5">
                <label className="text-slate-700 flex items-center justify-between">
                  <span>Image</span>
                  <span className="text-[10px] text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="border-2 border-dashed border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                    +
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      placeholder="Add a reference photo URL (JPG or PNG)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-normal">JPG or PNG - up to 5 MB</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer matching screenshot */}
              <div className="pt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Active for 7 days</span>
                <button
                  type="submit"
                  className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Post Need</span>
                  <span>&rarr;</span>
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

export default NeedPage;
