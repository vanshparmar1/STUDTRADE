import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import API from '../api/axios';
import toast from 'react-hot-toast';
import PromoCarousel from '../components/PromoCarousel';
import { useAuth } from '../context/AuthContext';
import { getStoredPosts } from '../utils/postsStore';
import { getActiveNeeds, getDaysLeft } from '../utils/needsStore';
import { getCampusUpdates, getShortRemainingTime, getCategoryIcon, cleanupExpiredCampusPosts } from '../utils/campusUpdatesStore';
import { getStudyMaterials } from '../utils/studyStore';
import { getImageUrl, handleImageError, DEFAULT_AVATAR_FALLBACK, DEFAULT_FALLBACK_IMAGE } from '../utils/imageUrl';
import { renderFormattedText } from '../utils/formatText';

const HERO_IMG = '/assets/landing_hero.png';

const ESSENTIAL_ACTIONS = [
  { icon: 'shopping_bag', label: 'Buy', sub: 'Find items', to: '/marketplace', color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white border-blue-100' },
  { icon: 'sell', label: 'Sell', sub: 'Sell to peers', to: '/sell', color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white border-emerald-100' },
  { icon: 'saved_search', label: 'Need', sub: 'Ask campus', to: '/need', color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white border-purple-100' },
  { icon: 'card_giftcard', label: 'Free', sub: 'Giveaways', to: '/marketplace?filter=free', color: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white border-rose-100' },
  { icon: 'home_repair_service', label: 'Services', sub: 'Useful help', to: '/services', color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white border-amber-100' },
  { icon: 'menu_book', label: 'Study', sub: 'Notes & PYQs', to: '/study', color: 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white border-sky-100' },
  { icon: 'campaign', label: 'Campus', sub: 'Live updates', to: '/campus', color: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white border-indigo-100' },
];

const ANNOUNCEMENTS = [
  { id: 1, icon: 'campaign', title: 'Coding Club Recruitment', time: 'Tomorrow • 5 PM', color: 'text-amber-500' },
  { id: 2, icon: 'local_library', title: 'Library closes at 10 PM', time: 'Today', color: 'text-blue-500' },
  { id: 3, icon: 'sports_basketball', title: 'Basketball practice', time: '6 PM • Sports Ground', color: 'text-rose-500' },
  { id: 4, icon: 'article', title: 'End-Sem Exam Timetable Out', time: 'Check Notice Board', color: 'text-emerald-500' },
];

const TRENDING_TOPICS = [
  { tag: 'Calculators', count: '12 posts' },
  { tag: 'Study material', count: '24 new posts' },
  { tag: 'Free items', count: '8 available' },
  { tag: 'Hostel Furniture', count: '15 listings' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [ads, setAds] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  const [recentNeeds, setRecentNeeds] = useState([]);
  const [campusUpdates, setCampusUpdates] = useState([]);
  const [recentStudy, setRecentStudy] = useState([]);

  useEffect(() => {
    // Fetch live feed posts directly from MongoDB database
    const fetchFeed = async () => {
      try {
        const { data } = await API.get('/items?limit=20');
        if (data.success && Array.isArray(data.data)) {
          const realPosts = data.data.map((item) => {
            const sellerObj = typeof item.seller === 'object' ? item.seller : null;
            const sellerName = sellerObj?.name || sellerObj?.fullName || 'Campus Member';
            const sellerEmail = sellerObj?.email || '';
            const handle = sellerEmail ? `@${sellerEmail.split('@')[0]}` : '@campus_member';
            const isVerified = sellerObj?.verificationStatus === 'approved';

            const rawLikes = Array.isArray(item.likes) ? item.likes : [];
            const isLiked = currentUser?._id
              ? rawLikes.some((id) => String(id) === String(currentUser._id))
              : false;

            const rawComments = Array.isArray(item.comments) ? item.comments : [];
            const mappedComments = rawComments.map((c) => ({
              id: c._id || Date.now() + Math.random(),
              user: c.userName || 'Student',
              text: c.text,
              createdAt: c.createdAt,
            }));

            return {
              id: item._id,
              _id: item._id,
              user: sellerName,
              handle: handle,
              avatar: getImageUrl(sellerObj?.avatar, DEFAULT_AVATAR_FALLBACK),
              badge: isVerified ? 'Verified Student' : 'Student',
              isVerified: isVerified,
              timeAgo: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now',
              category: item.category || 'General',
              price: item.price !== undefined ? `₹${item.price}` : 'Free / Trade',
              title: item.title,
              caption: item.description,
              image: getImageUrl(item.images?.[0], ''),
              sellerId: sellerObj?._id || item.seller,
              likes: rawLikes.length,
              isLiked: isLiked,
              saved: false,
              comments: mappedComments,
            };
          });
          setPosts(realPosts);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.warn('API feed fetch note:', err.message);
        setPosts([]);
      }
    };

    fetchFeed();

    const fetchRecentNeeds = async () => {
      try {
        const { data } = await API.get('/needs');
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.slice(0, 3).map((item) => ({
            id: item._id,
            category: item.category,
            title: item.title,
            description: item.description,
            budget: item.budget,
            location: item.location,
            createdAt: item.createdAt,
          }));
          setRecentNeeds(mapped);
        }
      } catch (err) {
        console.warn('API needs fetch error:', err.message);
      }
    };

    const fetchRecentStudy = async () => {
      try {
        const { data } = await API.get('/study');
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.slice(0, 3).map((item) => ({
            id: item._id,
            contentType: item.contentType,
            branch: item.branch,
            year: item.year,
            subject: item.subject,
            title: item.title,
            uploadedBy: item.uploadedByName || item.uploadedBy?.name || 'Student',
          }));
          setRecentStudy(mapped);
        }
      } catch (err) {
        console.warn('API study fetch error:', err.message);
      }
    };

    const fetchCampusUpdates = async () => {
      try {
        const { data } = await API.get('/campus-updates');
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.slice(0, 3).map((item) => ({
            id: item._id,
            category: item.category,
            title: item.title,
            location: item.location,
            expiresAt: item.expiresAt,
          }));
          setCampusUpdates(mapped);
        }
      } catch (err) {
        console.warn('API campus updates fetch error:', err.message);
      }
    };

    fetchRecentNeeds();
    fetchRecentStudy();
    fetchCampusUpdates();

    const fetchAds = async () => {
      try {
        const { data } = await API.get('/ads');
        if (data.success) setAds(data.data);
      } catch (err) {
        console.error('Failed to fetch ads', err);
      }
    };
    fetchAds();
  }, [currentUser]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/items/${postId}`);
      toast.success('Post deleted successfully! 🎉');
      setPosts((prev) => prev.filter((p) => p.id !== postId && p._id !== postId));
    } catch (err) {
      console.error('Delete post error:', err);
      toast.error('Failed to delete post');
    }
  };

  // Toggle Like (persisted in MongoDB)
  const handleToggleLike = async (postId) => {
    if (!currentUser) {
      toast.error('Please log in first to like posts');
      navigate('/login');
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId || post._id === postId) {
          const nextLiked = !post.isLiked;
          return {
            ...post,
            isLiked: nextLiked,
            likes: nextLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
          };
        }
        return post;
      })
    );

    try {
      const { data } = await API.post(`/items/${postId}/like`);
      if (data.success && data.data) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId || post._id === postId) {
              return {
                ...post,
                likes: data.data.likesCount,
                isLiked: data.data.isLiked,
              };
            }
            return post;
          })
        );
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Toggle Bookmark / Save
  const handleToggleSave = (postId) => {
    setPosts((posts) =>
      posts.map((post) => {
        if (post.id === postId) {
          const nextSaved = !post.saved;
          toast.success(nextSaved ? 'Saved to bookmarks' : 'Removed from bookmarks');
          return { ...post, saved: nextSaved };
        }
        return post;
      })
    );
  };

  // Add Comment (persisted in MongoDB)
  const handleAddComment = async (postId) => {
    if (!currentUser) {
      toast.error('Please log in first to comment');
      navigate('/login');
      return;
    }
    if (!commentInput.trim()) return;

    const textToSubmit = commentInput.trim();
    setCommentInput('');

    try {
      const { data } = await API.post(`/items/${postId}/comment`, { text: textToSubmit });
      if (data.success && data.data?.comments) {
        const updatedComments = data.data.comments.map((c) => ({
          id: c._id || Date.now() + Math.random(),
          user: c.userName || currentUser?.name || 'Student',
          text: c.text,
          createdAt: c.createdAt,
        }));

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId || post._id === postId) {
              return {
                ...post,
                comments: updatedComments,
              };
            }
            return post;
          })
        );
        toast.success('Comment added!');
      }
    } catch (err) {
      console.error('Comment error:', err);
      toast.error('Failed to post comment');
    }
  };

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
      <StitchNavbar activeLink="Home" />

      <main className="pt-20">
        {/* ── Top Hero Header & Search Section ── */}
        <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-left space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary)]">
              STUDTRADE &bull; BY STUDENTS, FOR STUDENTS
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Your campus.<br />
              <span className="text-[var(--color-primary)]">Everything you need.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl font-normal">
              Buy, sell, find, share and stay connected — directly with students around you.
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="pt-1">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.search.value;
                if (q) navigate(`/marketplace?q=${encodeURIComponent(q)}`);
              }}
              className="relative max-w-2xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-full p-2 shadow-xs focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30 focus-within:border-[var(--color-primary)] flex items-center gap-2 transition-all"
            >
              <input
                type="text"
                name="search"
                placeholder="Search anything on campus..."
                style={{ outline: 'none' }}
                className="w-full bg-transparent px-4 py-2 text-sm sm:text-base text-slate-800 placeholder-slate-400 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl sm:rounded-full gradient-primary hover:opacity-95 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex-shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* ── Top Promotional Offer Carousel ── */}
        <PromoCarousel />

        {/* ── Action Cards (Essentials) Section ── */}
        <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {ESSENTIAL_ACTIONS.map(({ icon, label, sub, to, color }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:-translate-y-1.5 hover:shadow-lg active:scale-[0.97] transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between space-y-3 group"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-2xs group-hover:scale-110 group-hover:shadow-md ${color}`}>
                  <span className="material-symbols-outlined text-2xl sm:text-3xl">{icon}</span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-black text-xs sm:text-sm text-slate-900 tracking-tight">{label}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold block line-clamp-1">{sub}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Home Page Compact Student Services Section ── */}
        <section className="pb-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-left max-w-md">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--color-primary)]">STUDENT SERVICES</span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Useful things around your campus</h3>
              <p className="text-xs sm:text-sm text-slate-600">Discover verified home tiffins, hostel rentals & floor water camper refills.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-5 text-center w-full lg:w-auto">
              <button onClick={() => navigate('/services?category=Mess+/+Tiffin')} className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[var(--color-primary-container)]/30 transition-all border border-slate-200/60 cursor-pointer flex flex-col items-center">
                <span className="text-2xl sm:text-3xl mb-1">🍱</span>
                <span className="font-bold text-xs text-slate-800">Mess/Tiffin</span>
                <span className="text-[10px] text-slate-500 font-medium">Find food</span>
              </button>

              <button onClick={() => navigate('/services?category=Rental')} className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[var(--color-primary-container)]/30 transition-all border border-slate-200/60 cursor-pointer flex flex-col items-center">
                <span className="text-2xl sm:text-3xl mb-1">🏠</span>
                <span className="font-bold text-xs text-slate-800">Rental</span>
                <span className="text-[10px] text-slate-500 font-medium">Rent items</span>
              </button>

              <button onClick={() => navigate('/services?category=Water')} className="p-3.5 rounded-2xl bg-slate-50 hover:bg-[var(--color-primary-container)]/30 transition-all border border-slate-200/60 cursor-pointer flex flex-col items-center">
                <span className="text-2xl sm:text-3xl mb-1">💧</span>
                <span className="font-bold text-xs text-slate-800">Water</span>
                <span className="text-[10px] text-slate-500 font-medium">Get water</span>
              </button>
            </div>

            <button
              onClick={() => navigate('/services')}
              className="px-6 py-3 rounded-2xl gradient-primary text-white font-bold text-xs sm:text-sm shadow-xs hover:opacity-95 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Explore Services</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* ── Home Page Compact Needs Preview Section ── */}
        {recentNeeds.length > 0 && (
          <section className="pb-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔎</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">NEEDS AROUND CAMPUS</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">Recent active queries from fellow students</p>
                </div>

                <button
                  onClick={() => navigate('/need')}
                  className="px-4 py-2 rounded-2xl bg-[var(--color-primary-container)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary-container)]/50 font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <span>View All Needs</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {recentNeeds.map((need) => {
                  const daysLeft = getDaysLeft(need.createdAt);
                  return (
                    <div key={need.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-[var(--color-primary)]/40 transition-all flex flex-col justify-between space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[var(--color-primary)]">
                            {need.category}
                          </span>
                          <span className="text-amber-700 font-bold">⏳ {daysLeft}d left</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 leading-snug">{need.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">{need.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          {need.budget && <span className="text-emerald-700 font-bold">💰 {need.budget}</span>}
                          <span className="text-slate-500 text-[11px]">📍 {need.location}</span>
                        </div>
                        <button
                          onClick={() => navigate('/need')}
                          className="text-[var(--color-primary)] hover:underline font-bold text-[11px] flex items-center gap-0.5"
                        >
                          Help <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Home Page Compact Study Material Preview Section ── */}
        {recentStudy.length > 0 && (
          <section className="pb-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">STUDY MATERIALS</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">Notes, PYQs, and Question Papers shared by branch peers</p>
                </div>

                <button
                  onClick={() => navigate('/study')}
                  className="px-4 py-2 rounded-2xl bg-[var(--color-primary-container)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary-container)]/50 font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <span>View Study Material</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {recentStudy.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate('/study')}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-[var(--color-primary)]/40 transition-all cursor-pointer flex flex-col justify-between space-y-2 text-left"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-emerald-700">
                          {item.contentType}
                        </span>
                        <span className="text-slate-500 font-semibold">{item.branch} • {item.year}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 leading-snug">{item.subject}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">{item.title}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-[var(--color-primary)]">
                      <span>By {item.uploadedBy || 'Student'}</span>
                      <span className="flex items-center gap-0.5">View Resource &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── 2-Column Section: Campus Feed (Left) & Campus Announcements (Right) ── */}
        <section className="py-10 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column (2 Cols): Campus Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Section Header */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
                    Campus Feed
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>IIIT Bhopal &bull; Live</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/sell')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full gradient-primary text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>Share a Post</span>
                </button>
              </div>

              {/* Feed Post Cards List */}
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary-container)]/30 text-[var(--color-primary)] flex items-center justify-center mx-auto text-3xl">
                      <span className="material-symbols-outlined text-4xl">dynamic_feed</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900">No posts on campus yet</h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-sm mx-auto">
                        Be the first to share a post, listing, or trade offer with fellow students!
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/sell')}
                      className="px-6 py-3 rounded-full gradient-primary text-white font-bold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      <span>Share a Post Now</span>
                    </button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="bg-white rounded-3xl border border-[var(--color-outline-variant)]/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      
                      {/* Post Header */}
                      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[var(--color-outline-variant)]/10">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(post.avatar, DEFAULT_AVATAR_FALLBACK)}
                            alt={post.user}
                            onError={(e) => handleImageError(e, DEFAULT_AVATAR_FALLBACK)}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-[var(--color-outline-variant)]/40 shadow-2xs"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-[var(--color-on-surface)] leading-tight">{post.user}</h4>
                              <span className="material-symbols-outlined text-sky-500 text-xs font-bold" title="Verified Campus Student">verified</span>
                              <span className="text-xs text-[var(--color-on-surface-variant)]">{post.handle}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 text-slate-600">{post.badge}</span>
                              <span className="text-[10px] text-[var(--color-on-surface-variant)]">• {post.timeAgo}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[var(--color-primary-container)]/30 text-[var(--color-primary)]">
                            {post.category || 'General'}
                          </span>

                          {/* Delete Post Button (for owner or admin) */}
                          {(currentUser?._id === post.sellerId || currentUser?.role === 'admin') && (
                            <button
                              onClick={() => handleDeletePost(post._id || post.id)}
                              title="Delete Post"
                              className="p-1 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Post Image with Price Tag */}
                      {post.image && (
                        <div 
                          onClick={() => navigate(`/item/${post._id || post.id}`)}
                          className="relative w-full bg-slate-900 group overflow-hidden flex items-center justify-center cursor-pointer"
                        >
                          <img
                            src={getImageUrl(post.image)}
                            alt={post.title || post.caption}
                            onError={(e) => handleImageError(e, DEFAULT_FALLBACK_IMAGE)}
                            className="w-full max-h-[440px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
                          />
                          {post.price && (
                            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-1">
                              <span className="material-symbols-outlined text-amber-400 text-sm">sell</span>
                              {post.price}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Post Content */}
                      <div className="p-4 sm:p-5 space-y-3 text-left">
                        {post.title && (
                          <h3 
                            onClick={() => navigate(`/item/${post._id || post.id}`)}
                            className="font-extrabold text-base text-[var(--color-on-surface)] leading-snug hover:text-[var(--color-primary)] cursor-pointer transition-colors"
                          >
                            {post.title}
                          </h3>
                        )}
                        <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed font-normal whitespace-pre-line">
                          {renderFormattedText(post.caption || post.description)}
                        </p>

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-outline-variant)]/10">
                          <div className="flex items-center gap-4">
                            {/* Like Button */}
                            <button
                              onClick={() => handleToggleLike(post.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                            >
                              <span className={`material-symbols-outlined text-xl ${post.isLiked ? 'text-rose-500 fill-1' : 'text-slate-500'}`} style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}>
                                favorite
                              </span>
                              <span className={post.isLiked ? 'text-rose-600 font-bold' : 'text-slate-600'}>{post.likes}</span>
                            </button>

                            {/* Comment Button */}
                            <button
                              onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-xl">chat_bubble_outline</span>
                              <span>{post.comments?.length || 0}</span>
                            </button>

                            {/* Contact / View Details Button */}
                            <button
                              onClick={() => navigate(`/item/${post._id || post.id}`)}
                              className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-container)]/20 px-3.5 py-1.5 rounded-full hover:bg-[var(--color-primary-container)]/50 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">shopping_cart</span>
                              <span>Buy / View Item</span>
                            </button>
                          </div>

                          {/* Bookmark / Save Button */}
                          <button
                            onClick={() => handleToggleSave(post.id)}
                            className="text-slate-500 hover:text-amber-500 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: post.saved ? "'FILL' 1" : "'FILL' 0" }}>
                              bookmark
                            </span>
                          </button>
                        </div>

                        {/* Comments Drawer */}
                        {activeCommentPostId === post.id && (
                          <div className="pt-3 space-y-3 bg-[var(--color-surface-container-low)] p-3.5 rounded-2xl border border-[var(--color-outline-variant)]/20">
                            <h5 className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Comments &amp; Offers</h5>
                            
                            {(!post.comments || post.comments.length === 0) ? (
                              <p className="text-xs text-[var(--color-on-surface-variant)] italic">No comments yet. Be the first to reply!</p>
                            ) : (
                              <div className="space-y-2">
                                {post.comments.map((c) => (
                                  <div key={c.id} className="text-xs bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                                    <span className="font-bold text-[var(--color-on-surface)] mr-2">{c.user}:</span>
                                    <span className="text-[var(--color-on-surface-variant)]">{c.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Comment Input */}
                            <div className="flex gap-2 pt-1">
                              <input
                                type="text"
                                placeholder="Write a comment or offer..."
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                className="flex-1 bg-white border border-[var(--color-outline-variant)]/40 rounded-xl px-3.5 py-2 text-xs text-[var(--color-on-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column (1 Col): Campus Announcements & Trending */}
            <div className="space-y-6 sticky top-24">
              
              {/* Campus Announcements / WHAT'S HAPPENING Card */}
              <div className="bg-white rounded-3xl border border-[var(--color-outline-variant)]/30 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-outline-variant)]/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📢</span>
                    <h3 className="font-extrabold text-base text-[var(--color-on-surface)] uppercase tracking-tight">WHAT'S HAPPENING</h3>
                  </div>
                  <button
                    onClick={() => navigate('/campus')}
                    className="px-3 py-1 rounded-full bg-[var(--color-primary-container)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary-container)]/60 text-[11px] font-extrabold transition-all cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {campusUpdates.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-slate-50 text-center space-y-1">
                      <span className="material-symbols-outlined text-slate-400 text-xl">notifications_off</span>
                      <p className="text-xs text-slate-500 font-medium">No new campus updates right now.</p>
                    </div>
                  ) : (
                    campusUpdates.map((item) => {
                      const icon = getCategoryIcon(item.category);
                      const timeLeft = getShortRemainingTime(item.expiresAt);
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => navigate('/campus')}
                          className="p-3 rounded-2xl bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer space-y-1 border border-slate-100/80 text-left"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-sm shrink-0">{icon}</span>
                              <h4 className="font-extrabold text-xs text-slate-900 leading-snug truncate">{item.title}</h4>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                              ⏳ {timeLeft}
                            </span>
                          </div>
                          {item.location && (
                            <p className="text-[10px] text-slate-500 font-medium pl-6 truncate">📍 {item.location}</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Trending Topics Card */}
              <div className="bg-white rounded-3xl border border-[var(--color-outline-variant)]/30 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--color-outline-variant)]/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-500 text-2xl">local_fire_department</span>
                    <h3 className="font-extrabold text-base text-[var(--color-on-surface)]">Trending Topics</h3>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  {(!TRENDING_TOPICS || TRENDING_TOPICS.length === 0) ? (
                    <div className="p-4 rounded-2xl bg-slate-50 text-center space-y-1">
                      <span className="material-symbols-outlined text-slate-400 text-xl">trending_flat</span>
                      <p className="text-xs text-slate-500 font-medium">Nothing trending right now.</p>
                    </div>
                  ) : (
                    TRENDING_TOPICS.map((topic, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] transition-colors cursor-pointer">
                        <span className="font-bold text-[var(--color-primary)]">#{topic.tag}</span>
                        <span className="text-[10px] font-semibold text-[var(--color-on-surface-variant)]">{topic.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ── Sponsored Ads ── */}
        {ads.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">Sponsored Offers</span>
              <div className="h-px flex-1 bg-[var(--color-surface-container)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <a 
                  key={ad._id} 
                  href={ad.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block relative rounded-3xl overflow-hidden group shadow-sm hover:shadow-xl transition-all aspect-[4/3] sm:aspect-[21/9] md:aspect-[16/9]"
                  style={{ boxShadow: '0px 12px 32px rgba(26,128,129,0.05)' }}
                >
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover object-center rounded-3xl max-w-full overflow-hidden group-hover:scale-105 transition-transform duration-500 bg-[var(--color-surface-container)]" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-16">
                    <div className="inline-block bg-[var(--color-primary)] text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 w-max mb-2">
                       Ad <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </div>
                    <h3 className="text-white font-bold text-base md:text-lg leading-snug line-clamp-2">{ad.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

      </main>

      <StitchFooter />

      {/* ── Floating Action Button (Create Listing / Share Post) ── */}
      <button
        onClick={() => navigate('/sell')}
        aria-label="Create Listing / Share Post"
        title="Share Post / Sell Item"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full gradient-primary text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20"
      >
        <span className="material-symbols-outlined text-3xl md:text-4xl select-none leading-none">add</span>
      </button>
    </div>
  );
};

export default LandingPage;