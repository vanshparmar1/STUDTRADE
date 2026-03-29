import React from 'react';
import { Link } from 'react-router-dom';

const LOGO = '/logo.png';

const StitchFooter = () => (
  <footer className="bg-[var(--color-surface-container-low)] border-t border-[var(--color-surface-variant)]">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-8 py-12 max-w-7xl mx-auto">
      {/* Brand */}
      <div className="md:col-span-1">
        <Link to="/">
          <img src={LOGO} alt="STUDTRADE" className="h-10 w-auto mb-4 object-contain" />
        </Link>
        <p className="text-[var(--color-on-surface-variant)] text-sm leading-relaxed font-medium">
          The premium editorial marketplace designed for modern campus life. Empowering students through circular economy.
        </p>
      </div>

      {/* Platform */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface)] mb-6">Platform</h5>
        <ul className="space-y-3 text-sm text-[var(--color-on-surface-variant)] font-medium">
          {[['How it Works', '#'], ['Pricing', '#'], ['Safety', '#'], ['Mobile App', '#']].map(([label, href]) => (
            <li key={label}><a href={href} className="hover:text-[var(--color-primary)] transition-colors">{label}</a></li>
          ))}
        </ul>
      </div>

      {/* Resources */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface)] mb-6">Resources</h5>
        <ul className="space-y-3 text-sm text-[var(--color-on-surface-variant)] font-medium">
          {[['Help', '/terms#help'], ['Careers', '#'], ['Community', '#'], ['Blog', '#']].map(([label, href]) => (
            <li key={label}>
              {href.startsWith('/') ? (
                <Link to={href} className="hover:text-[var(--color-primary)] transition-colors">{label}</Link>
              ) : (
                <a href={href} className="hover:text-[var(--color-primary)] transition-colors">{label}</a>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Legal */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface)] mb-6">Legal</h5>
        <ul className="space-y-3 text-sm text-[var(--color-on-surface-variant)] font-medium">
          {[['Terms', '/terms'], ['Privacy', '/terms'], ['Cookies', '/terms']].map(([label, href]) => (
            <li key={label}><Link to={href} className="hover:text-[var(--color-primary)] transition-colors">{label}</Link></li>
          ))}
        </ul>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-[var(--color-surface-variant)]/50 py-8 px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[var(--color-on-surface-variant)]/60 text-xs font-semibold gap-4">
      <div>© {new Date().getFullYear()} STUDTRADE. Digital Sanctuary for Students.</div>
      <div className="flex space-x-6">
        <a href="#" className="hover:text-[var(--color-primary)]">Twitter</a>
        <a href="#" className="hover:text-[var(--color-primary)]">Instagram</a>
        <a href="#" className="hover:text-[var(--color-primary)]">LinkedIn</a>
      </div>
    </div>
  </footer>
);

export default StitchFooter;
