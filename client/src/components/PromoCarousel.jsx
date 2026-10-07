import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { getImageUrl } from '../utils/imageUrl';

export const PROMOTIONS_DATA = [
  {
    id: 'p1',
    category: 'SERVICES',
    subCategory: 'Discover nearby',
    title: 'Campus Services',
    description: 'Mess, tiffin, rentals, water and useful student services.',
    buttonText: 'Explore Services',
    to: '/services',
    bgCard: 'bg-[#f0f8f8]',
    accentColor: 'text-[var(--color-primary)]',
    btnColor: 'gradient-primary hover:opacity-95 text-white',
    rightCards: [
      { icon: 'restaurant', label: 'MEALS', color: 'text-amber-600 bg-amber-50 border-amber-200' },
      { icon: 'home', label: 'RENT', color: 'text-blue-600 bg-blue-50 border-blue-200' },
      { icon: 'water_drop', label: 'WATER', color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    ],
    rightFooter: 'EVERYDAY CAMPUS HELP'
  },
  {
    id: 'p2',
    category: 'STUDENT DEAL',
    subCategory: 'Special Offers',
    title: 'Student Deals Are Here 🎉',
    description: 'Discover useful things from students around your campus.',
    buttonText: 'Explore Deals',
    to: '/marketplace',
    bgCard: 'bg-[#f0f8f8]',
    accentColor: 'text-[var(--color-primary)]',
    btnColor: 'gradient-primary hover:opacity-95 text-white',
    rightCards: [
      { icon: 'local_offer', label: 'DEALS', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { icon: 'shopping_bag', label: 'SHOP', color: 'text-purple-600 bg-purple-50 border-purple-200' },
      { icon: 'percent', label: 'OFFERS', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    ],
    rightFooter: 'BEST CAMPUS OFFERS'
  },
  {
    id: 'p3',
    category: 'SELL',
    subCategory: 'Instant Cash',
    title: 'Sell What You Don\'t Need',
    description: 'Turn your unused books, gadgets and essentials into cash.',
    buttonText: 'Start Selling',
    to: '/sell',
    bgCard: 'bg-[#f0f8f8]',
    accentColor: 'text-[var(--color-primary)]',
    btnColor: 'gradient-primary hover:opacity-95 text-white',
    rightCards: [
      { icon: 'menu_book', label: 'BOOKS', color: 'text-sky-600 bg-sky-50 border-sky-200' },
      { icon: 'devices', label: 'TECH', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
      { icon: 'payments', label: 'CASH', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    ],
    rightFooter: 'PEER TO PEER TRADE'
  },
  {
    id: 'p4',
    category: 'STUDY',
    subCategory: 'Exam Prep',
    title: 'Study Smarter 📚',
    description: 'Find notes, previous-year papers and useful study material.',
    buttonText: 'Explore Study',
    to: '/study',
    bgCard: 'bg-[#f0f8f8]',
    accentColor: 'text-[var(--color-primary)]',
    btnColor: 'gradient-primary hover:opacity-95 text-white',
    rightCards: [
      { icon: 'history_edu', label: 'NOTES', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
      { icon: 'quiz', label: 'PAPERS', color: 'text-blue-600 bg-blue-50 border-blue-200' },
      { icon: 'auto_stories', label: 'BOOKS', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    ],
    rightFooter: 'STUDY MATERIAL'
  }
];

const PromoCarousel = ({ autoPlayInterval = 4500 }) => {
  const [promotions, setPromotions] = useState(PROMOTIONS_DATA);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Fetch dynamic promotions from backend
  useEffect(() => {
    fetchActivePromotions();
  }, []);

  const fetchActivePromotions = async () => {
    try {
      const { data } = await API.get('/promotions/active');
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const mapped = data.data.map((promo) => ({
          id: promo._id,
          category: (promo.category || 'OFFER').toUpperCase(),
          subCategory: promo.offerText || 'Special Offer',
          title: promo.title,
          description: promo.description,
          buttonText: promo.buttonText || 'Explore Now',
          to: promo.buttonLink || '/marketplace',
          image: promo.image ? getImageUrl(promo.image) : '',
          bgCard: 'bg-[#f0f8f8]',
          accentColor: 'text-[var(--color-primary)]',
          btnColor: 'gradient-primary hover:opacity-95 text-white',
          rightCards: [
            { icon: 'local_offer', label: 'OFFER', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { icon: 'star', label: 'DEAL', color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { icon: 'campaign', label: 'CAMPUS', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
          ],
          rightFooter: promo.offerText || 'VERIFIED CAMPUS OFFER'
        }));
        setPromotions(mapped);
      }
    } catch (err) {
      console.warn('Using default promo slides fallback:', err.message);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  }, [promotions.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  }, [promotions.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused || promotions.length <= 1) return;
    timerRef.current = setInterval(nextSlide, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide, autoPlayInterval, promotions.length]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  };

  const currentPromo = promotions[currentIndex] || promotions[0];

  return (
    <section 
      aria-label="Promotional Carousel"
      className="max-w-6xl mx-auto px-4 sm:px-6 my-6 md:my-8 w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={`relative rounded-3xl ${currentPromo.bgCard} text-[var(--color-on-surface)] border border-slate-200/80 shadow-xs transition-colors duration-500 min-h-[220px] sm:min-h-[260px] md:min-h-[280px] flex items-center p-6 sm:p-8 md:p-10 group`}>
        
        {/* Left Arrow Button */}
        {promotions.length > 1 && (
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-slate-700 shadow-md hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer border border-slate-200/80"
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
        )}

        {/* Right Arrow Button */}
        {promotions.length > 1 && (
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-slate-700 shadow-md hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer border border-slate-200/80"
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        )}

        {/* Slide Inner Layout */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center px-4 sm:px-8">
          
          {/* Left Content Area */}
          <div className="md:col-span-7 space-y-3.5 text-left">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${currentPromo.accentColor} px-2.5 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs`}>
                {currentPromo.category}
              </span>
              <span className="text-xs text-slate-500 font-semibold">• {currentPromo.subCategory}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {currentPromo.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
              {currentPromo.description}
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (currentPromo.to.startsWith('http')) {
                    window.open(currentPromo.to, '_blank');
                  } else {
                    navigate(currentPromo.to);
                  }
                }}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl ${currentPromo.btnColor} font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer`}
              >
                <span>{currentPromo.buttonText}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Right Visual Feature Cards / Image Area */}
          <div className="md:col-span-5 hidden md:flex flex-col items-center justify-center space-y-4">
            {currentPromo.image ? (
              <div className="w-full max-w-[280px] h-44 rounded-3xl overflow-hidden shadow-md border border-slate-200/80 bg-white">
                <img
                  src={currentPromo.image}
                  alt={currentPromo.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full max-w-[280px] h-40 rounded-3xl bg-white/70 backdrop-blur-md border border-slate-200/60 p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                {/* Tilted Floating Cards */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {currentPromo.rightCards.map((card, idx) => (
                    <div 
                      key={idx}
                      className={`bg-white border border-slate-200/90 shadow-md rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center space-y-1.5 min-w-[70px] sm:min-w-[76px] transition-all hover:scale-105 ${
                        idx === 0 ? '-rotate-6' : idx === 1 ? 'rotate-0 scale-105 shadow-lg border-emerald-200 z-10' : 'rotate-6'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shadow-2xs ${card.color}`}>
                        <span className="material-symbols-outlined text-base sm:text-lg">{card.icon}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-800 tracking-wider">
                        {card.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sub-label at bottom */}
                <div className="text-center">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                    {currentPromo.rightFooter}
                  </span>
                </div>
              </div>
            )}

            {/* Slide Counter */}
            <div className="text-[11px] font-mono font-bold text-slate-400">
              0{currentIndex + 1} / 0{promotions.length}
            </div>
          </div>

        </div>

        {/* Bottom Dot Indicators */}
        {promotions.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10">
            {promotions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 bg-[var(--color-primary)] shadow-2xs'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default PromoCarousel;
