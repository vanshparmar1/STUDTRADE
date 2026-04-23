import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';
import API from '../api/axios';
import toast from 'react-hot-toast';

const HERO_IMG = '/assets/landing_hero.png';

const CATEGORIES = [
  { icon: 'menu_book',  label: 'Books',       bg: 'bg-[var(--color-primary-container)]/20',    color: 'text-[var(--color-primary)]' },
  { icon: 'devices',    label: 'Electronics', bg: 'bg-[var(--color-secondary-container)]/30',  color: 'text-[var(--color-secondary)]' },
  { icon: 'chair',      label: 'Furniture',   bg: 'bg-[var(--color-tertiary-container)]/30',   color: 'text-[var(--color-tertiary)]' },
  { icon: 'home',       label: 'Housing',     bg: 'bg-[var(--color-error-container)]/20',      color: 'text-[var(--color-error)]' },
];


const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data } = await API.get('/ads');
        if (data.success) setAds(data.data);
      } catch (err) {
        console.error('Failed to fetch ads', err);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (location.state?.unauthorized) {
      toast.error('Access Denied: Admin privileges required', { id: 'unauthorized-toast' });
      // Clear the state so the toast doesn't re-appear on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
      <StitchNavbar activeLink="Home" />

      <main className="pt-20">
        {/* ── Hero ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12 pb-24 md:pt-20 md:pb-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center text-center lg:text-left">
            <div className="space-y-8 flex flex-col items-center lg:items-start">
              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[var(--color-on-surface)] leading-[1.1] tracking-tight">
                Trade Smart.
                <br />
                Study <span className="text-[var(--color-primary)]">Better.</span>
              </h1>
              
              {/* Subheadline */}
              <p className="text-base sm:text-lg text-[var(--color-on-surface-variant)] max-w-lg leading-relaxed mx-auto lg:mx-0">
                StudTrade is the trusted marketplace for students to buy, sell and exchange books, gadgets, notes and more.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 w-full max-w-2xl text-left">
                {/* Feature 1 */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-container)]/50 flex items-center justify-center text-[var(--color-primary)]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-on-surface)] text-sm mb-1">Buy &amp; Sell</h4>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">Easily buy or sell what you need.</p>
                  </div>
                </div>
                {/* Feature 2 */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-container)]/50 flex items-center justify-center text-[var(--color-primary)]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-on-surface)] text-sm mb-1">Safe &amp; Secure</h4>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">Verified users for a trusted experience.</p>
                  </div>
                </div>
                {/* Feature 3 */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-container)]/50 flex items-center justify-center text-[var(--color-primary)]">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--color-on-surface)] text-sm mb-1">Student to Student</h4>
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">Built for students, by students.</p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/sell')}
                  className="bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-xl font-bold text-base hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Start Trading Now
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="text-[var(--color-primary)] px-6 py-3.5 rounded-xl font-bold text-base hover:bg-[var(--color-primary-container)]/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Learn More
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={HERO_IMG}
                alt="STUDTRADE student trading app"
                className="relative z-10 w-full max-w-lg lg:max-w-full object-contain"
              />
            </div>
          </div>

          {/* Floating Banner */}
          <div className="absolute -bottom-8 left-4 right-4 sm:left-10 sm:right-10 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-5xl z-20">
            <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-around gap-6 sm:gap-4 border border-[var(--color-outline-variant)]/30" style={{ boxShadow: '0px 20px 60px rgba(0,0,0,0.06)' }}>
              
              <div className="flex items-center gap-4">
                <div className="text-[var(--color-primary)] flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[var(--color-on-surface)]">Verified Campus Students</h4>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">Trade with your peers</p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-10 bg-[var(--color-outline-variant)]/50" />

              <div className="flex items-center gap-4">
                <div className="text-emerald-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[var(--color-on-surface)]">Safe &amp; Secure</h4>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">Trusted platform</p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-10 bg-[var(--color-outline-variant)]/50" />

              <div className="flex items-center gap-4">
                <div className="text-amber-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>sell</span>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[var(--color-on-surface)]">Best Deals</h4>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">Everyday on campus</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Categories ── */}
        <section className="bg-[var(--color-surface-container-low)] py-12 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold">Browse by</span>
                <h2 className="text-3xl font-bold text-[var(--color-on-surface)]">Essentials</h2>
              </div>
              <Link to="/marketplace" className="text-[var(--color-primary)] font-semibold flex items-center gap-1 hover:underline">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {CATEGORIES.map(({ icon, label, count, bg, color }) => (
                <button
                  key={label}
                  onClick={() => navigate('/marketplace')}
                  className="bg-white p-6 md:p-8 rounded-3xl hover:-translate-y-2 hover:shadow-xl active:scale-[0.98] transition-all duration-200 cursor-pointer flex flex-col items-center text-center"
                  style={{ boxShadow: '0px 20px 40px rgba(26,28,28,0.04)' }}
                >
                  <div className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center mb-4`}>
                    <span className={`material-symbols-outlined ${color} text-3xl`}>{icon}</span>
                  </div>
                  <h3 className="font-bold text-[var(--color-on-surface)]">{label}</h3>
                </button>
              ))}
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


        {/* ── CTA Banner ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-12 md:mb-24">
          <div className="gradient-primary p-8 sm:p-12 md:p-20 rounded-3xl flex flex-col items-center text-center space-y-6 md:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white max-w-2xl leading-tight">
              Ready to declutter your dorm and fill your wallet?
            </h2>
            <p className="text-white/80 max-w-md font-medium">
              Join the growing community of students trading daily on STUDTRADE. Safe, verified, and strictly for your campus.
            </p>
            <button
              onClick={() => navigate('/sell')}
              className="bg-white text-[var(--color-primary)] px-10 py-4 rounded-full font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Create Your Listing
            </button>
          </div>
        </section>
      </main>

      <StitchFooter />
    </div>
  );
};

export default LandingPage;