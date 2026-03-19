import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDHi33oD8O2bjUCA6Hdt5WmM3cUm5nOziIT1-oSpgAwXa2tOQR9ln9Qf04pMKd_y3os62k0N2Ey0lfvdIhYZnMMFsnCvLtg6gKiK_SbNDSPNU4A0ciAAjn4-h-By6sesa5icE4G1UjdGRb19E359rb2AWs8_l9YU79IOA4g9TJMC7iBdADqmN_YEeGLzFmUTZ3d8PbF56WyZyAdBIcN7VyorTE70kgf-vRBirFoFl-I_YXFn_tJM8cd-VmwMyWo5kxl4t61lTiqIk';

const CATEGORIES = [
  { icon: 'menu_book',  label: 'Books',       count: '1.2k',  bg: 'bg-[var(--color-primary-container)]/20',    color: 'text-[var(--color-primary)]' },
  { icon: 'devices',   label: 'Electronics', count: '850',   bg: 'bg-[var(--color-secondary-container)]/30',  color: 'text-[var(--color-secondary)]' },
  { icon: 'chair',     label: 'Furniture',   count: '420',   bg: 'bg-[var(--color-tertiary-container)]/30',   color: 'text-[var(--color-tertiary)]' },
  { icon: 'home',      label: 'Housing',     count: '150',   bg: 'bg-[var(--color-error-container)]/20',      color: 'text-[var(--color-error)]' },
];

const FEATURED = [
  {
    badge: 'Textbook Swap', price: '$45.00', btnLabel: 'View Details',
    title: 'Engineering Mechanics Set', desc: 'Hardly used, 2023 edition with lab manuals included.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf6yQLe5G1ueIXt6KY3AL4wF1e2AWQaDHhpDkoH2gT0jvlWB_aIm3X1p9zkHtHxb58F_5sTJE7wWUuLFZelzVqQAwBL1eYZo2AXpsHzJMcv-ASM7v4Vbtb3hAidTTCm1RT-gtLW3J2jv3NSZonnMymY7QL33Rnr6AHF15BmCsfrGN8FRjqQJNJvf00ZgwmVZeXr8bWVI5gfjyJe_wSaOp0_G5ygKuUGjZc1JYhKBfIkpWxznqwwoEKC0H2Kfxa7ZsvYq18oOMO8rA',
  },
  {
    badge: 'Service', price: '$29.00/mo', btnLabel: 'Check Availability',
    title: 'Campus Storage Solutions', desc: 'Secure, student-run locker storage near the central library.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDplq-64BUsRRKpkKT_VAlho095r4-RicpnOcUtX1yCI3H6VimkpGSljbfBa_jVoxQoN1dX5euIcb3CqP7_tv1dl76WAealcj8CBV4SbY07eabeqpTWF6Gn9aF0ew5WKywO9ObJxitlvPEgdOfnU6p5oZFZCllA54H9hs15HGBeRfb6Bl74O1ZMH3xpPBIESJLib5tSi5J7eYV4j9w6PO0R5a_E7rQDUyHQvCBv1wFJGDIxYvSiwmBjnXwnRKWmxz-Y_iw1kXVvm60',
  },
  {
    badge: 'Electronics', price: '$120.00', btnLabel: 'Contact Seller',
    title: 'Smart Monitor 27"', desc: 'Perfect for dorm setups. Built-in speakers and HDMI ports.',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK-14R4t70BR1rRH5Wv1JT_VDEdEuNsqnBYP8Ya-l1P9i-PaPhd8UPx3Bx2XGECatOCMxilFYio62M_aLKa30GYK7mw0ia3kvt4_rKkzmpFV6NwFbw7-NBsPHuoJh3wNDysD1GIvXDdZlKYdbDnZypOzFokllSPUEPe0fByDfdDoN0i8Yreq4QVMSH8MRaB1yhKS-RbuoJju-d0JRWDf6irfZgR3uofu_NSAvV2mW1_8ZUVri5l5ByuqQN1M4I7vHLlTDzCeAftss',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
      <StitchNavbar activeLink="Home" />

      <main className="pt-20">
        {/* ── Hero ── */}
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <span className="text-xs text-[var(--color-primary)] font-bold uppercase tracking-widest">
                The Digital Sanctuary for Students
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-[var(--color-on-surface)] leading-[1.1] tracking-tight">
                Trade Smarter,{' '}
                <br />
                <span className="text-[var(--color-primary)]">Live Better.</span>
              </h1>
              <p className="text-lg text-[var(--color-on-surface-variant)] max-w-md leading-relaxed">
                Join the curated marketplace built for university life. Buy, sell, and swap items within your trusted student community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate('/register')}
                  className="gradient-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg active:scale-95 transition-all"
                >
                  Start Trading
                </button>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="bg-[var(--color-surface-container-high)] text-[var(--color-primary)] px-8 py-4 rounded-full font-bold text-lg hover:bg-[var(--color-surface-container-highest)] transition-all"
                >
                  Explore Catalog
                </button>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-[var(--color-primary-container)]/30 rounded-full -rotate-2 group-hover:rotate-0 transition-transform" />
              <img
                src={HERO_IMG}
                alt="STUDTRADE student trading app"
                className="relative z-10 w-full rounded-3xl object-cover aspect-[4/3]"
                style={{ boxShadow: '0px 20px 40px rgba(26,28,28,0.04)' }}
              />
            </div>
          </div>
        </section>

        {/* ── Categories ── */}
        <section className="bg-[var(--color-surface-container-low)] py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold">Browse by</span>
                <h2 className="text-3xl font-bold text-[var(--color-on-surface)]">Essentials</h2>
              </div>
              <Link to="/marketplace" className="text-[var(--color-primary)] font-semibold flex items-center gap-1 hover:underline">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {CATEGORIES.map(({ icon, label, count, bg, color }) => (
                <button
                  key={label}
                  onClick={() => navigate('/marketplace')}
                  className="bg-white p-8 rounded-3xl hover:-translate-y-2 transition-transform cursor-pointer flex flex-col items-center text-center"
                  style={{ boxShadow: '0px 20px 40px rgba(26,28,28,0.04)' }}
                >
                  <div className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center mb-4`}>
                    <span className={`material-symbols-outlined ${color} text-3xl`}>{icon}</span>
                  </div>
                  <h3 className="font-bold text-[var(--color-on-surface)]">{label}</h3>
                  <p className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-medium">{count} Listings</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured ── */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-on-surface)]">Featured Opportunities</h2>
            <div className="h-px flex-1 bg-[var(--color-surface-container)]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED.map(({ badge, price, title, desc, btnLabel, img }) => (
              <div
                key={title}
                className="group relative bg-white rounded-3xl overflow-hidden"
                style={{ boxShadow: '0px 20px 40px rgba(26,28,28,0.04)' }}
              >
                <div className="relative aspect-[16/10]">
                  <div className="absolute top-4 left-4 z-10 bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Featured
                  </div>
                  <div className="absolute top-4 right-4 z-10 bg-white/70 backdrop-blur-md text-[var(--color-on-surface)] text-sm font-bold px-3 py-1 rounded-full">
                    {price}
                  </div>
                  <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-sm text-[var(--color-primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)] font-bold">{badge}</span>
                  </div>
                  <h4 className="font-bold text-lg text-[var(--color-on-surface)] mb-2">{title}</h4>
                  <p className="text-[var(--color-on-surface-variant)] text-sm mb-4">{desc}</p>
                  <button
                    onClick={() => navigate('/item/1')}
                    className="w-full py-3 rounded-full text-sm font-bold border border-[var(--color-outline)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all"
                  >
                    {btnLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="gradient-primary p-12 md:p-20 rounded-3xl flex flex-col items-center text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white max-w-2xl leading-tight">
              Ready to declutter your dorm and fill your wallet?
            </h2>
            <p className="text-white/80 max-w-md font-medium">
              Join thousands of students trading daily on STUDTRADE. Safe, verified, and strictly for your campus.
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