import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGO = '/logo.png';

const defaultLinks = [
  { label: 'Home', to: '/' },
  { label: 'Buy', to: '/marketplace' },
  { label: 'Need', to: '/need' },
  { label: 'Services', to: '/services', title: 'Student Services' },
  { label: 'Study', to: '/study', title: 'Academic Resource Library' },
  { label: 'Campus', to: '/campus', title: "Campus What's Happening" },
];

/**
 * StitchNavbar — global glassmorphism top navbar for StudTrade.
 * Props:
 *   links        — array of { label, to }
 *   showSearch   — boolean (default false, can enable if needed)
 *   activeLink   — string matching one of the link labels to bold + underline
 */
const StitchNavbar = ({ links = defaultLinks, showSearch = false, activeLink = '' }) => {
  const [query, setQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsMobileMenuOpen(false);
      navigate(`/marketplace?q=${encodeURIComponent(query)}`);
    }
  };

  const isCurrentActive = (linkLabel, linkTo) => {
    if (activeLink) {
      return activeLink.toLowerCase() === linkLabel.toLowerCase();
    }
    if (linkTo === '/') return location.pathname === '/';
    return location.pathname.startsWith(linkTo);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-[var(--color-surface-variant)]/50"
         onClick={(e) => {
           if (isMenuOpen && !e.target.closest('.profile-dropdown')) setIsMenuOpen(false);
         }}>
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 max-w-7xl mx-auto relative z-20 bg-inherit">
        
        {/* Left: Mobile Menu Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-[var(--color-surface-container-high)] active:scale-90 transition-all duration-200 flex items-center justify-center text-[var(--color-on-surface-variant)] cursor-pointer"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined transition-transform duration-300">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
          
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="brand-logo-slot shrink-0 flex items-center"
          >
            <img src={LOGO} alt="STUDTRADE — Where Students Trade Better" className="h-9 sm:h-12 w-auto object-contain" />
          </Link>
        </div>

        {/* Center: 5 Navigation Buttons (Home, Buy, Need, Study, Campus) */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const active = isCurrentActive(link.label, link.to);
            return (
              <Link
                key={link.label}
                to={link.to}
                title={link.title || link.label}
                className={`text-xs sm:text-sm font-bold transition-all duration-200 py-1 border-b-2 ${
                  active
                    ? 'text-[var(--color-primary)] border-[var(--color-primary)] font-extrabold'
                    : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] border-transparent hover:border-[var(--color-outline-variant)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Search Input (if explicitly enabled) */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-xs mx-4 relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] text-lg">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campus…"
              className="w-full bg-[var(--color-surface-container-low)] border-none rounded-full py-2 pl-9 pr-4 text-xs focus:ring-0 focus-visible:ring-0 transition-all outline-none focus:outline-none focus-visible:outline-none"
            />
          </form>
        )}

        {/* Right: Campus Verified Badge + Admin Button + Chat + Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Provider Dashboard Shortcut (if role is provider) */}
          {user?.role === 'provider' && (
            <Link
              to="/provider/dashboard"
              title="Provider Dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold hover:bg-amber-100 transition-all"
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span className="hidden sm:inline">Provider Portal</span>
            </Link>
          )}

          {/* Admin Panel Shortcut Button (for admin/manager) */}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Link
              to="/admin"
              title="Admin Dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold hover:bg-rose-100 transition-all"
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              <span className="hidden sm:inline">Admin Panel</span>
            </Link>
          )}

          {/* For Providers Link (for students/guests) */}
          {user?.role !== 'provider' && (
            <Link
              to="/provider"
              title="STUDTRADE Provider Portal"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200/80"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              <span>For Providers</span>
            </Link>
          )}

          {/* Campus Verified Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary-container)]/30 text-[var(--color-primary)] border border-[var(--color-primary)]/20 text-xs font-bold shadow-2xs">
            <span className="text-[var(--color-primary)] font-extrabold">✓</span>
            <span>IIIT Bhopal</span>
          </div>

          {/* Chat Icon Button */}
          <button
            onClick={() => navigate('/')}
            title="Campus Live Chat"
            className="p-2 hover:bg-[var(--color-surface-container-high)] rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">forum</span>
          </button>
          
          {/* Profile Dropdown Menu */}
          <div className="relative profile-dropdown">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/profile');
                }}
                className="p-1.5 hover:bg-[var(--color-surface-container-high)] rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
                aria-label="Open profile"
              >
                <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] text-2xl">account_circle</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 hover:bg-[var(--color-surface-container-high)] rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
                  aria-label="Account menu"
                >
                  <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] text-2xl">account_circle</span>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] py-3 z-50 border border-[var(--color-surface-variant)] overflow-hidden">
                    <div className="px-5 py-2 mb-2">
                      <p className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-widest leading-none">Welcome</p>
                    </div>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-5 py-3 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors"
                    >
                      Join STUDTRADE
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-[var(--color-surface-variant)] shadow-lg origin-top transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobileMenuOpen 
            ? 'opacity-100 scale-y-100 border-opacity-100 pointer-events-auto' 
            : 'opacity-0 scale-y-0 border-opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 flex flex-col space-y-2">
          {links.map((link) => {
            const active = isCurrentActive(link.label, link.to);
            return (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  active
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-extrabold'
                    : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-on-surface)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default StitchNavbar;
