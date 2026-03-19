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
 *   seller      — { name, avatar }
 *   itemId      — string (for router navigation)
 */
const StitchProductCard = ({ image, price, verified, title, subtitle, seller, itemId }) => {
  const navigate = useNavigate();

  return (
    <div className="group bg-white rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden bg-[var(--color-surface-container-low)]"
        onClick={() => navigate(itemId ? `/item/${itemId}` : '/marketplace')}
      >
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur rounded-full px-3 py-1 text-xs font-bold font-headline text-[var(--color-on-surface)] shadow-sm">
          {price}
        </div>
        {/* Verified chip */}
        {verified && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-1 line-clamp-1">{title}</h3>
        <p className="text-xs text-[var(--color-on-surface-variant)] mb-4">{subtitle}</p>

        {/* Bottom row */}
        <div className="mt-auto flex items-center justify-between">
          {/* Seller */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--color-surface-container-highest)] overflow-hidden border border-white flex items-center justify-center">
              {seller?.avatar ? (
                <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[8px] font-bold text-[var(--color-on-primary-container)]">
                  {seller?.name?.slice(0, 2).toUpperCase() ?? 'ST'}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium text-[var(--color-on-surface-variant)]">{seller?.name ?? 'Student'}</span>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate(itemId ? `/item/${itemId}` : '/marketplace')}
            className="gradient-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-transform active:scale-95"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StitchProductCard;
