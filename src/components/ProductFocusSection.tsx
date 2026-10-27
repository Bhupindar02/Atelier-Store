'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, Product } from '@/data/fashion-data';
import { useStore } from '@/context/StoreContext';
import StockBadge from '@/components/StockBadge';

interface ProductFocusSectionProps {
  initialProducts?: Product[];
  initialCategories?: { id: string; name: string; slug: string }[];
}

export default function ProductFocusSection({
  initialProducts,
  initialCategories,
}: ProductFocusSectionProps) {
  const allAvailableProducts = initialProducts && initialProducts.length > 0 ? initialProducts : PRODUCTS;
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const { toggleWishlist, isInWishlist, addToCart, openQuickView } = useStore();

  const filteredProducts = activeFilter === 'all'
    ? allAvailableProducts
    : allAvailableProducts.filter((p) => p.category === activeFilter);

  const filterTabs = initialCategories && initialCategories.length > 0
    ? [{ id: 'all', label: 'All Creations' }, ...initialCategories.map(c => ({ id: c.slug, label: c.name }))]
    : [
        { id: 'all', label: 'All Creations' },
        { id: 'handbags', label: 'Leather Goods' },
        { id: 'tailoring', label: 'Tailoring' },
        { id: 'ready-to-wear', label: 'Ready-to-Wear' },
        { id: 'footwear', label: 'Footwear' },
        { id: 'accessories', label: 'Jewelry & Eyewear' },
      ];

  return (
    <section id="products" className="py-24 sm:py-32 bg-[#faf9f7] border-b border-[#e8e3db]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-[10px] tracking-[0.3em] font-medium uppercase text-[#a11826]">
            PRODUCT SPOTLIGHT
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1a1714]">
            The Atelier Focus
          </h2>
          <p className="text-xs sm:text-sm text-[#5c544d] font-light leading-relaxed">
            Meticulously developed prototypes brought to fruition with Italian artisan hands. Click any piece for technical specifications and direct acquisition.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-12 gap-2 sm:gap-4 no-scrollbar border-b border-[#e8e3db]/70">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`whitespace-nowrap px-4 py-2 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-medium transition-all duration-300 relative ${
                  isActive
                    ? 'text-[#1a1714] font-semibold'
                    : 'text-[#8e857b] hover:text-[#1a1714]'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#1a1714]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {filteredProducts.map((product) => {
            const isHovered = hoveredProductId === product.id;
            const wishlisted = isInWishlist(product.id);
            const isOutOfStock = product.stockState?.status === 'out_of_stock';

            return (
              <div
                key={product.id}
                className="group flex flex-col"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                {/* 3:4 Portrait Image Frame */}
                <div
                  className={`relative aspect-[3/4] overflow-hidden bg-[#f2ede6] border border-[#e8e3db]/80 ${
                    isOutOfStock ? 'opacity-85' : ''
                  }`}
                >
                  <Link href={`/products/${product.id}`} className="block absolute inset-0">
                    {/* Primary & Hover Images */}
                    <Image
                      src={product.primaryImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`object-cover transition-opacity duration-700 ease-in-out ${
                        isOutOfStock ? 'grayscale-[20%]' : ''
                      } ${isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                    />
                    <Image
                      src={product.secondaryImage}
                      alt={`${product.name} detail view`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={`object-cover transition-all duration-700 ease-in-out ${
                        isOutOfStock ? 'grayscale-[20%]' : ''
                      } ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
                    />
                  </Link>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {product.badge && (
                      <div className="bg-[#11100e] text-[#f2ede6] px-2.5 py-1 text-[8px] tracking-[0.25em] uppercase font-medium self-start shadow-sm">
                        {product.badge}
                      </div>
                    )}
                    {product.stockState && (
                      <StockBadge
                        status={product.stockState.status}
                        remaining={product.stockState.remaining}
                        variant="card-overlay"
                      />
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#1a1714] hover:text-[#a11826] transition-colors shadow-sm focus:outline-none z-10"
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <svg
                      className="w-4 h-4 stroke-[1.2]"
                      fill={wishlisted ? '#a11826' : 'none'}
                      stroke={wishlisted ? '#a11826' : 'currentColor'}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                  </button>

                  {/* Hover Floating Actions */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                      type="button"
                      onClick={() => openQuickView(product)}
                      className="flex-1 py-2.5 bg-white text-[#1a1714] text-[9px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a1714] hover:text-white transition-colors"
                    >
                      Quick View
                    </button>
                    <button
                      type="button"
                      onClick={() => !isOutOfStock && addToCart(product)}
                      disabled={isOutOfStock}
                      className={`flex-1 py-2.5 text-[9px] uppercase tracking-[0.2em] font-medium transition-colors ${
                        isOutOfStock
                          ? 'bg-[#2a2724]/90 text-[#a8a199] cursor-not-allowed'
                          : 'bg-[#1a1714] text-white hover:bg-[#a11826]'
                      }`}
                    >
                      {isOutOfStock ? 'Sold Out' : 'Acquire'}
                    </button>
                  </div>
                </div>

                {/* Product Metadata */}
                <div className="pt-4 flex flex-col space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#8e857b]">
                      {product.categoryLabel}
                    </span>
                    <span className="font-mono text-xs font-medium text-[#1a1714]">
                      {product.formattedPrice}
                    </span>
                  </div>

                  <Link
                    href={`/products/${product.id}`}
                    className="font-serif text-lg sm:text-xl text-[#1a1714] font-normal hover:text-[#a11826] transition-colors block"
                  >
                    {product.name}
                  </Link>

                  <p className="text-[11px] text-[#5c544d] font-light truncate">
                    {product.material}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-[#8e857b] border-t border-[#e8e3db]/60">
                    <div className="flex items-center gap-2">
                      <span>{product.color}</span>
                      {product.stockState && (
                        <StockBadge
                          status={product.stockState.status}
                          remaining={product.stockState.remaining}
                          variant="pill"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => !isOutOfStock && addToCart(product)}
                      disabled={isOutOfStock}
                      className={`uppercase tracking-[0.16em] font-medium transition-colors ${
                        isOutOfStock
                          ? 'text-[#a8a199] cursor-not-allowed'
                          : 'text-[#1a1714] hover:text-[#a11826]'
                      }`}
                    >
                      {isOutOfStock ? 'Sold Out' : '+ Add to Bag'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
