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
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/marketplace?q=${encodeURIComponent(query)}`);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-[var(--color-surface-variant)]/50"
         onClick={(e) => isMenuOpen && !e.target.closest('.profile-dropdown') && setIsMenuOpen(false)}>
      <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
        {/* Left: Logo + links */}
        <div className="flex items-center gap-8">
          <Link to="/">
            <img src={LOGO} alt="STUDTRADE" className="h-14 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeLink === link.label
                    ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                    : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Centre: Search */}
        {showSearch && (
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] text-xl">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campus…"
              className="w-full bg-[var(--color-surface-container-low)] border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none"
            />
          </form>
        )}

        {/* Right: Cart + Profile */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-[var(--color-surface-container-high)] rounded-full transition-all"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined text-[var(--color-on-surface-variant)]">shopping_cart</span>
          </button>
          
          <div className="relative profile-dropdown">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-[var(--color-surface-container-high)] rounded-full transition-all flex items-center justify-center"
              aria-label="Profile"
            >
              <span className="material-symbols-outlined text-[var(--color-on-surface-variant)]">account_circle</span>
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] py-3 z-50 border border-[var(--color-surface-variant)] overflow-hidden">
                {isAuthenticated ? (
                  <>
                    <div className="px-5 py-3 border-b border-[var(--color-surface-variant)] mb-2">
                       <p className="text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-widest mb-1">Account</p>
                       <p className="text-sm font-bold truncate text-[var(--color-on-surface)]">Student User</p>
                    </div>
                    <button 
                      onClick={() => { setIsMenuOpen(false); logout(); }}
                      className="w-full text-left px-5 py-3 text-sm font-semibold text-[var(--color-error)] hover:bg-[var(--color-error)]/5 flex items-center gap-3 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StitchNavbar;
