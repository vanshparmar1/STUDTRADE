import React from 'react';
import { Link } from 'react-router-dom';

const LOGO = '/logo.png';

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/1PRbNqa4TY/?mibextid=wwXIfr' },
  { label: 'Instagram', href: 'https://www.instagram.com/stud.trade?igsh=MWFranRidGNzOGhmOA==' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/studtrade1/' },
];

const StitchFooter = () => (
  <footer className="bg-[var(--color-surface-container-low)] border-t border-[var(--color-surface-variant)]">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 px-8 py-12 max-w-7xl mx-auto">
      {/* Brand */}
      <div className="md:col-span-1">
        <Link to="/" className="brand-logo-slot brand-logo-slot--mat-low mb-4 inline-flex">
          <img src={LOGO} alt="STUDTRADE — Where Students Trade Better" className="h-10 w-auto object-contain" />
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
          {[['Help', '/contact-us'], ['Careers', '#'], ['Community', '#'], ['Blog', '#']].map(([label, href]) => (
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

      {/* Legal & Policies */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface)] mb-6">Legal & Policies</h5>
        <ul className="space-y-3 text-sm text-[var(--color-on-surface-variant)] font-medium flex flex-col items-start gap-1">
          {[['Terms & Conditions', '/terms-conditions'], ['Privacy Policy', '/privacy-policy'], ['Refund & Cancellation', '/refund-cancellation'], ['Shipping & Delivery', '/shipping-delivery'], ['Contact Us', '/contact-us']].map(([label, href]) => (
            <li key={label}><Link to={href} className="hover:text-[var(--color-primary)] transition-colors block">{label}</Link></li>
          ))}
        </ul>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-[var(--color-surface-variant)]/50 py-8 px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[var(--color-on-surface-variant)]/60 text-xs font-semibold gap-4">
      <div>© {new Date().getFullYear()} STUDTRADE. Digital Sanctuary for Students.</div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {SOCIAL_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-primary)] transition-colors"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default StitchFooter;
