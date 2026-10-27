'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SPOTLIGHT_HERO_PRODUCT, Product } from '@/data/fashion-data';
import { useStore } from '@/context/StoreContext';
import StockBadge from '@/components/StockBadge';

interface SpotlightProductProps {
  spotlightProduct?: Product;
}

export default function SpotlightProduct({ spotlightProduct }: SpotlightProductProps) {
  const currentHero = spotlightProduct || SPOTLIGHT_HERO_PRODUCT;
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    currentHero.sizes ? currentHero.sizes[0] : 'Mini'
  );

  const images = currentHero.gallery && currentHero.gallery.length > 0
    ? currentHero.gallery
    : [
        currentHero.primaryImage,
        currentHero.secondaryImage,
        'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=1200&auto=format&fit=crop',
      ];

  const wishlisted = isInWishlist(currentHero.id);
  const isOutOfStock = currentHero.stockState?.status === 'out_of_stock';

  return (
    <section id="spotlight" className="py-24 sm:py-32 bg-[#f2ede6] border-b border-[#e8e3db]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Section Eyebrow */}
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] tracking-[0.35em] uppercase font-semibold text-[#a11826]">
            SAVOIR-FAIRE DEEP DIVE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1a1714]">
            The Masterpiece Focus
          </h2>
          <div className="w-12 h-[1px] bg-[#1a1714] mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Gallery with Large Hero View + Interactive Thumbnails */}
          <div className="lg:col-span-7 space-y-6">
            <div className={`relative aspect-[4/5] overflow-hidden bg-[#e8e3db] border border-[#d8d0c5] shadow-[0_20px_50px_rgba(0,0,0,0.08)] ${isOutOfStock ? 'opacity-90' : ''}`}>
              <Image
                src={images[activeImageIndex]}
                alt={currentHero.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className={`object-cover transition-all duration-700 ease-out ${isOutOfStock ? 'grayscale-[20%]' : ''}`}
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                <div className="bg-white/95 px-3 py-1.5 text-[9px] uppercase tracking-[0.25em] font-medium text-[#1a1714] shadow-sm">
                  ARCHIVE REISSUE · N° 1968
                </div>
                {currentHero.stockState && (
                  <StockBadge
                    status={currentHero.stockState.status}
                    remaining={currentHero.stockState.remaining}
                    variant="card-overlay"
                  />
                )}
              </div>
            </div>

            {/* Thumbnails row */}
            <div className="flex gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 aspect-[4/5] overflow-hidden border transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#1a1714] ring-1 ring-[#1a1714]'
                      : 'border-[#d8d0c5] opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail view ${idx + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Masterpiece Narrative & Acquisition */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#8e857b]">
                {currentHero.material}
              </span>
              <Link
                href={`/products/${currentHero.id}`}
                className="font-serif text-3xl sm:text-4xl text-[#1a1714] leading-tight block hover:text-[#a11826] transition-colors"
              >
                {currentHero.name}
              </Link>
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-xl text-[#1a1714]">
                  {currentHero.formattedPrice}
                </p>
                <Link
                  href={`/products/${currentHero.id}`}
                  className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1714] hover:text-[#a11826] underline underline-offset-4"
                >
                  Full Dossier & Dimensions →
                </Link>
              </div>
            </div>

            <p className="text-sm text-[#5c544d] font-light leading-relaxed">
              {currentHero.description}
            </p>

            {/* Stock Status Banner */}
            {currentHero.stockState && (
              <StockBadge
                status={currentHero.stockState.status}
                remaining={currentHero.stockState.remaining}
                variant="banner"
              />
            )}

            {/* Size selection */}
            {currentHero.sizes && (
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1714] block">
                  Select Proportion:
                </label>
                <div className="flex gap-3">
                  {currentHero.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2.5 text-[11px] tracking-wider uppercase border transition-all ${
                        selectedSize === sz
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

            {/* Craftsmanship Specs */}
            <div className="border-t border-b border-[#d8d0c5] py-4 space-y-2.5">
              <p className="text-[10px] uppercase tracking-[0.22em] font-medium text-[#1a1714]">
                Craftsmanship & Savoir-Faire:
              </p>
              <ul className="space-y-2">
                {currentHero.details.map((detail, i) => (
                  <li key={i} className="text-xs text-[#5c544d] flex items-start gap-2.5">
                    <span className="text-[#a11826] mt-0.5">✦</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-4 bg-[#e8e3db] text-[#8e857b] text-[11px] uppercase tracking-[0.24em] font-medium cursor-not-allowed shadow-none"
                >
                  Archive Unavailable · Out of Stock
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => addToCart(currentHero, selectedSize)}
                  className="w-full py-4 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.24em] font-medium hover:bg-[#a11826] transition-colors duration-300"
                >
                  Acquire This Creation ({currentHero.formattedPrice})
                </button>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => toggleWishlist(currentHero.id)}
                  className="flex-1 py-3 border border-[#1a1714] text-[#1a1714] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-white transition-colors"
                >
                  {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </button>
                <a
                  href="#concierge"
                  className="flex-1 py-3 border border-[#d8d0c5] text-center text-[#5c544d] text-[10px] uppercase tracking-[0.2em] font-medium hover:border-[#1a1714] hover:text-[#1a1714] transition-colors"
                >
                  Book Private View
                </a>
              </div>
            </div>

            {/* Luxury perks */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4 text-[10px] uppercase tracking-[0.15em] text-[#8e857b]">
              <span>✓ Complimentary Monogramming</span>
              <span>✓ Signature Velvet Presentation Box</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
