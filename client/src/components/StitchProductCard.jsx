import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * StitchProductCard — Marketplace product card.
 * Props:
 *   image       — image URL
 *   price       — string e.g. "$24"
 *   verified    — boolean
 *   title       — string
 *   subtitle    — string (condition/type)
 *   listingArea — optional campus locality (or legacy city · PIN) for delivery estimates
 *   itemId      — string (for router navigation)
 */
const StitchProductCard = ({ image, price, verified, title, subtitle, listingArea, itemId, sold }) => {
  const navigate = useNavigate();

  return (
    <div className="group bg-white rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer">
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden bg-[var(--color-surface-container-low)]"
        onClick={() => navigate(itemId ? `/item/${itemId}` : '/marketplace')}
      >
        <img
          src={image}
          alt={title}
          className="object-cover object-center w-full h-full max-w-full overflow-hidden rounded-[inherit] group-hover:scale-105 transition-transform duration-500"
        />
        {sold && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <span className="px-5 py-1.5 bg-[var(--color-on-surface)] text-white font-black tracking-widest uppercase rounded-2xl shadow-xl -skew-x-6 text-sm border border-[var(--color-outline-variant)]">
              Sold
            </span>
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur rounded-full px-3 py-1 text-xs font-bold font-headline text-[var(--color-on-surface)] shadow-sm z-20 transition-all duration-200 group-hover:bg-white group-hover:shadow-md">
          {price}
        </div>
        {/* Verified chip */}
        {verified && (
          <div className="absolute bottom-3 left-3 z-20">
            <span className="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-1 line-clamp-1" title={title}>{title}</h3>
        <p className="text-xs text-[var(--color-on-surface-variant)] mb-1 truncate text-ellipsis" title={subtitle}>{subtitle}</p>
        {listingArea ? (
          <p
            className="text-[11px] font-semibold text-[var(--color-primary)] mb-4 flex items-start gap-1 min-h-[1.25rem]"
            title={`Pickup locality — ${listingArea}`}
          >
            <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5 opacity-90">distance</span>
            <span className="line-clamp-2 leading-snug">{listingArea}</span>
          </p>
        ) : (
          <p className="text-[10px] text-[var(--color-outline)] mb-4">Campus locality not listed</p>
        )}

        {/* Bottom row (Buttons stack on mobile) */}
        <div className="mt-auto pt-2 flex flex-col sm:flex-row gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(itemId ? `/item/${itemId}` : '/marketplace');
            }}
            className="w-full sm:flex-1 bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-xs font-bold uppercase tracking-widest py-2.5 sm:py-3 rounded-full transition-all duration-200 hover:bg-[var(--color-surface-container-highest)] active:scale-[0.97] text-center border border-[var(--color-outline-variant)]/50"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(itemId ? `/item/${itemId}` : '/marketplace');
            }}
            className="w-full sm:flex-1 gradient-primary text-white text-xs font-bold uppercase tracking-widest py-2.5 sm:py-3 rounded-full transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-[0.97] flex items-center justify-center gap-1.5"
          >
            Buy
            <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StitchProductCard;
