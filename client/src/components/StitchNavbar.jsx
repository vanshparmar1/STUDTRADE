import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOGO = '/logo.png';

const defaultLinks = [
  { label: 'Explore', to: '/marketplace', active: false },
  { label: 'Sell', to: '/sell', active: false },
];

/**
 * StitchNavbar — global glassmorphism top navbar for the new Stitch UI pages.
 * Props:
 *   links        — array of { label, to, active }
 *   showSearch   — boolean (default true)
 *   activeLink   — string matching one of the link labels to bold + underline
 */
const StitchNavbar = ({ links = defaultLinks, showSearch = true, activeLink = '' }) => {
  const [query, setQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsMobileMenuOpen(false);
      navigate(`/marketplace?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-[var(--color-surface-variant)]/50"
         onClick={(e) => {
           if (isMenuOpen && !e.target.closest('.profile-dropdown')) setIsMenuOpen(false);
         }}>
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 max-w-7xl mx-auto relative z-20 bg-inherit">
        
        {/* Left: Mobile Menu Toggle + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-[var(--color-surface-container-high)] active:scale-90 transition-all duration-200 flex items-center justify-center text-[var(--color-on-surface-variant)]"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined transition-transform duration-300">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
          
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="brand-logo-slot shrink-0"
          >
            <img src={LOGO} alt="STUDTRADE — Where Students Trade Better" className="h-10 sm:h-14 w-auto object-contain" />
          </Link>
          
          <div className="hidden md:flex items-center gap-6 ml-4">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 pb-0.5 ${
                  activeLink === link.label
                    ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                    : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:border-b-2 hover:border-[var(--color-outline-variant)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Centre: Desktop Search */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] text-xl">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campus…"
              className="w-full bg-[var(--color-surface-container-low)] border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none"
            />
          </form>
        )}

        {/* Right: Cart + Profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isAuthenticated && (
            <Link
              to="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-[var(--color-surface-container-high)] rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center relative group"
              aria-label="Cart"
            >
              <span className="material-symbols-outlined text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)] transition-colors">shopping_cart</span>
            </Link>
          )}
          
          <div className="relative profile-dropdown">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/profile');
                }}
                className="p-2 hover:bg-[var(--color-surface-container-high)] rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center"
                aria-label="Open profile"
              >
                <span className="material-symbols-outlined text-[var(--color-on-surface-variant)]">account_circle</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-[var(--color-surface-container-high)] rounded-full transition-all duration-200 active:scale-90 flex items-center justify-center"
                  aria-label="Account menu"
                >
                  <span className="material-symbols-outlined text-[var(--color-on-surface-variant)]">account_circle</span>
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

      {/* Mobile Menu Dropdown (Animated) */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-[var(--color-surface-variant)] shadow-lg origin-top transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobileMenuOpen 
            ? 'opacity-100 scale-y-100 border-opacity-100 pointer-events-auto' 
            : 'opacity-0 scale-y-0 border-opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 flex flex-col space-y-2">
          {showSearch && (
            <form onSubmit={handleSearch} className="relative mb-2">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] text-xl">
                search
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search campus…"
                className="w-full bg-[var(--color-surface-container-low)] border-none rounded-full py-3.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none"
              />
            </form>
          )}

          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-4 rounded-2xl text-sm font-bold uppercase tracking-wider transition-colors ${
                activeLink === link.label
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-on-surface)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default StitchNavbar;
