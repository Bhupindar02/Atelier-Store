'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';

export default function ProductQuickView() {
  const { quickViewProduct, closeQuickView, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [activeImage, setActiveImage] = useState<0 | 1>(0);
  const [selectedSize, setSelectedSize] = useState<string>('');

  if (!quickViewProduct) return null;

  const currentSize = selectedSize || (quickViewProduct.sizes ? quickViewProduct.sizes[0] : 'One Size');
  const wishlisted = isInWishlist(quickViewProduct.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeQuickView}
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="relative bg-[#faf9f7] max-w-4xl w-full border border-[#e8e3db] shadow-2xl overflow-hidden z-10 animate-fade-in">
          {/* Close Button */}
          <button
            type="button"
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-20 p-2 text-[#1a1714] hover:text-[#a11826] bg-white/80 backdrop-blur-sm"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Images */}
            <div className="relative aspect-[3/4] bg-[#f2ede6]">
              <Image
                src={activeImage === 0 ? quickViewProduct.primaryImage : quickViewProduct.secondaryImage}
                alt={quickViewProduct.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />

              {/* Angle switcher buttons */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveImage(0)}
                  className={`px-3 py-1 text-[9px] uppercase tracking-widest font-medium transition-all ${
                    activeImage === 0 ? 'bg-[#1a1714] text-white' : 'bg-white/90 text-[#1a1714]'
                  }`}
                >
                  Primary
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImage(1)}
                  className={`px-3 py-1 text-[9px] uppercase tracking-widest font-medium transition-all ${
                    activeImage === 1 ? 'bg-[#1a1714] text-white' : 'bg-white/90 text-[#1a1714]'
                  }`}
                >
                  Detail
                </button>
              </div>
            </div>

            {/* Right: Product details */}
            <div className="p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b]">
                    {quickViewProduct.categoryLabel}
                  </span>
                  <span className="font-mono text-base font-semibold text-[#1a1714]">
                    {quickViewProduct.formattedPrice}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl text-[#1a1714]">
                  {quickViewProduct.name}
                </h3>

                <p className="text-xs text-[#8e857b] tracking-wider uppercase">
                  {quickViewProduct.material} · {quickViewProduct.color}
                </p>

                <p className="text-xs text-[#5c544d] font-light leading-relaxed">
                  {quickViewProduct.description}
                </p>

                {/* Sizes */}
                {quickViewProduct.sizes && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1714] block">
                      Size:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3.5 py-1.5 text-[11px] tracking-wider uppercase border transition-all ${
                            currentSize === sz
                              ? 'border-[#1a1714] bg-[#1a1714] text-white'
                              : 'border-[#d8d0c5] bg-white text-[#1a1714] hover:border-[#1a1714]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details List */}
                <div className="border-t border-[#e8e3db] pt-3 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1714] block mb-1">
                    Atelier Specifications:
                  </span>
                  {quickViewProduct.details.map((item, idx) => (
                    <p key={idx} className="text-[11px] text-[#5c544d] flex items-center gap-2">
                      <span className="text-[#a11826] text-xs">✦</span>
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-4 border-t border-[#e8e3db]">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(quickViewProduct, currentSize);
                    closeQuickView();
                  }}
                  className="w-full py-4 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-[#a11826] transition-colors"
                >
                  Add to Shopping Bag — {quickViewProduct.formattedPrice}
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  className="w-full py-3 border border-[#d8d0c5] text-[#1a1714] text-[10px] uppercase tracking-[0.2em] font-medium hover:border-[#1a1714] transition-colors"
                >
                  {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
