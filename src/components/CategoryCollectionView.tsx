'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/data/fashion-data';
import { CategoryMeta } from '@/db/queries/products';
import { useStore } from '@/context/StoreContext';
import CraftsmanshipBanner from '@/components/CraftsmanshipBanner';
import StockBadge from '@/components/StockBadge';

interface CategoryCollectionViewProps {
  category: CategoryMeta;
  allCategories: { id: string; name: string; slug: string }[];
  products: Product[];
}

export default function CategoryCollectionView({
  category,
  allCategories,
  products,
}: CategoryCollectionViewProps) {
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [gridColumns, setGridColumns] = useState<2 | 3>(3);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  const { toggleWishlist, isInWishlist, addToCart, openQuickView } = useStore();

  // Filtered & Sorted Products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // In Stock / Available Only Filter
    if (inStockOnly) {
      result = result.filter(
        (p) =>
          p.stockState.status === 'in_stock' ||
          p.stockState.status === 'low_stock' ||
          p.stockState.status === 'made_to_order'
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // Preserves database curated order (newest first)
        break;
    }

    return result;
  }, [products, inStockOnly, sortBy]);

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      {/* ── 1. HAUTE COUTURE CATEGORY HERO BANNER ── */}
      <section className="relative overflow-hidden bg-[#11100e] text-[#f2ede6]">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={category.heroImage}
            alt={category.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-30 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11100e] via-[#11100e]/60 to-[#11100e]/40" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-[#a0978d]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Maison Atelier
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/collections" className="hover:text-white transition-colors">
                  Collections
                </Link>
              </li>
              <li>/</li>
              <li aria-current="page" className="text-[#d4af6a] font-medium">
                {category.name}
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block px-2.5 py-1 text-[9px] font-mono tracking-[0.25em] uppercase font-medium bg-[#d4af6a] text-[#11100e]">
                {category.seasonTag}
              </span>
              <span className="text-[11px] text-[#a0978d] tracking-[0.2em] uppercase font-light">
                {category.heritage}
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05]">
              {category.name}
            </h1>

            <p className="font-serif italic text-base sm:text-xl text-[#d4af6a] font-normal leading-relaxed pt-1">
              {category.subtitle}
            </p>

            <p className="text-xs sm:text-sm text-[#c4b9ae] font-light leading-relaxed max-w-2xl pt-2">
              {category.description}
            </p>
          </div>

          {/* Luxury Highlights Bar */}
          <div className="mt-12 pt-8 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] tracking-[0.2em] uppercase text-[#d4af6a]">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
              <span className="text-white/80">{processedProducts.length} Curated Pieces</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
              <span className="text-white/80">Master Artisan Certified</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
              <span className="text-white/80">White-Glove Courier Delivery</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
              <span className="text-white/80">Lifetime Atelier Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORY SWITCHER TABS ── */}
      <div className="border-b border-[#e8e3db] bg-[#faf9f7]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {allCategories.map((cat) => {
              const isCurrent = category.slug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/collections/${cat.slug}`}
                  className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-medium transition-all duration-200 rounded-sm flex items-center gap-2 ${
                    isCurrent
                      ? 'bg-[#1a1714] text-white shadow-sm'
                      : 'bg-white border border-[#e8e3db] text-[#5c544d] hover:text-[#1a1714] hover:border-[#1a1714]'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 3. STICKY CONTROLS & FILTER TOOLBAR ── */}
      <div className="sticky top-[72px] z-20 bg-[#faf9f7]/95 backdrop-blur-md border-b border-[#e8e3db] py-3 shadow-[0_1px_0_0_#e8e3db]/40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="text-[11px] tracking-[0.18em] uppercase text-[#787065] flex items-center gap-2">
            <span className="font-mono text-[#1a1714] font-semibold">{processedProducts.length}</span>
            <span>Creations in {category.name}</span>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-5 text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">
            {/* In-Stock Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-[#1a1714]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#1a1714] cursor-pointer"
              />
              <span className="hidden sm:inline">In Stock Only</span>
              <span className="sm:hidden">Available</span>
            </label>

            <span className="text-[#e8e3db]">|</span>

            {/* Sorting Select */}
            <div className="flex items-center gap-2">
              <span className="text-[#8e857b] hidden lg:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'name')}
                className="bg-transparent border border-[#e8e3db] px-2.5 py-1 text-[10px] uppercase tracking-wider focus:outline-none focus:border-[#1a1714] text-[#1a1714] cursor-pointer"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="name">Alphabetical (A–Z)</option>
              </select>
            </div>

            <span className="text-[#e8e3db]">|</span>

            {/* Grid Density Toggle */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                type="button"
                onClick={() => setGridColumns(2)}
                aria-label="Two column editorial layout"
                className={`p-1.5 rounded transition-colors ${
                  gridColumns === 2 ? 'text-[#1a1714] bg-[#f2ede6]' : 'text-[#8e857b] hover:text-[#1a1714]'
                }`}
                title="2-column editorial view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v11A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-11zM9 2.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-11z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setGridColumns(3)}
                aria-label="Three column gallery layout"
                className={`p-1.5 rounded transition-colors ${
                  gridColumns === 3 ? 'text-[#1a1714] bg-[#f2ede6]' : 'text-[#8e857b] hover:text-[#1a1714]'
                }`}
                title="3-column gallery view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h1A1.5 1.5 0 0 1 5 2.5v11A1.5 1.5 0 0 1 3.5 15h-1A1.5 1.5 0 0 1 1 13.5v-11zM6.5 2.5A1.5 1.5 0 0 1 8 1h1a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 9 15H8a1.5 1.5 0 0 1-1.5-1.5v-11zM12 2.5A1.5 1.5 0 0 1 13.5 1h1a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-11z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. PRODUCT CATALOG GRID ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          {processedProducts.length === 0 ? (
            <div className="text-center py-24 space-y-4 max-w-md mx-auto">
              <span className="font-serif text-2xl text-[#1a1714] font-light">
                No creations match your current filters
              </span>
              <p className="text-xs text-[#787065] leading-relaxed">
                Please adjust your filter selection or explore our complete collections.
              </p>
              <button
                type="button"
                onClick={() => setInStockOnly(false)}
                className="mt-4 px-6 py-3 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors"
              >
                Reset Availability Filter
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-x-8 gap-y-16 sm:gap-y-20 ${
                gridColumns === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {processedProducts.map((product, index) => {
                const isHovered = hoveredProductId === product.id;
                const wishlisted = isInWishlist(product.id);

                return (
                  <React.Fragment key={product.id}>
                    {/* Editorial Savoir-Faire Inset Tile after 3rd product */}
                    {index === 3 && (
                      <div className="relative aspect-[3/4] bg-[#1a1714] text-white p-8 sm:p-12 flex flex-col justify-between border border-[#2b2621] overflow-hidden group shadow-sm">
                        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d4af6a_1px,transparent_1px)] [background-size:16px_16px]" />
                        <div className="space-y-3 relative z-10">
                          <span className="text-[9px] tracking-[0.3em] uppercase text-[#d4af6a] font-mono">
                            ATELIER HERITAGE
                          </span>
                          <h3 className="font-serif text-2xl sm:text-3xl font-light text-white leading-tight">
                            “Craftsmanship is the refusal to sacrifice time for convenience.”
                          </h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                          <p className="text-xs text-[#a0978d] font-light leading-relaxed">
                            Discover the artisanal techniques behind our {category.name} collection.
                          </p>
                          <Link
                            href="/#editorial"
                            className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-medium text-white hover:text-[#d4af6a] transition-colors"
                          >
                            <span>Read The Journal</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Standard Luxury Product Card */}
                    {(() => {
                      const isOutOfStock = product.stockState.status === 'out_of_stock';

                      return (
                        <div
                          className="group flex flex-col"
                          onMouseEnter={() => setHoveredProductId(product.id)}
                          onMouseLeave={() => setHoveredProductId(null)}
                        >
                          {/* 3:4 Portrait Image Frame */}
                          <div
                            className={`relative aspect-[3/4] overflow-hidden bg-[#f2ede6] border border-[#e8e3db]/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all ${
                              isOutOfStock ? 'opacity-85' : ''
                            }`}
                          >
                            <Link href={`/products/${product.id}`} className="block absolute inset-0">
                              <Image
                                src={product.primaryImage}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className={`object-cover transition-opacity duration-700 ease-in-out ${
                                  isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                                } ${isOutOfStock ? 'grayscale-[20%]' : ''}`}
                              />
                              <Image
                                src={product.secondaryImage}
                                alt={`${product.name} detail view`}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className={`object-cover transition-all duration-700 ease-in-out ${
                                  isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                                } ${isOutOfStock ? 'grayscale-[20%]' : ''}`}
                              />
                            </Link>

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                              {product.badge && (
                                <div className="bg-[#11100e] text-[#f2ede6] px-2.5 py-1 text-[8px] tracking-[0.25em] uppercase font-medium shadow-sm">
                                  {product.badge}
                                </div>
                              )}
                              <StockBadge
                                status={product.stockState.status}
                                remaining={product.stockState.remaining}
                                variant="card-overlay"
                              />
                            </div>

                            {/* Wishlist Button */}
                            <button
                              type="button"
                              onClick={() => toggleWishlist(product.id)}
                              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#1a1714] hover:text-[#a11826] transition-colors shadow-sm focus:outline-none z-10"
                              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                            >
                              <svg
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  wishlisted ? 'fill-[#a11826] text-[#a11826] scale-110' : 'fill-none stroke-current'
                                }`}
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                />
                              </svg>
                            </button>

                            {/* Hover Quick Actions Overlay */}
                            <div
                              className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent transition-all duration-300 flex items-center gap-2 z-10 ${
                                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => openQuickView(product)}
                                className="flex-1 py-2.5 bg-white text-[#1a1714] text-[9px] font-medium tracking-[0.2em] uppercase hover:bg-[#a11826] hover:text-white transition-colors"
                              >
                                Quick View
                              </button>
                              {isOutOfStock ? (
                                <button
                                  type="button"
                                  disabled
                                  className="px-3 py-2.5 bg-[#e8e4dc] text-[#8e857b] text-[9px] font-medium tracking-[0.2em] uppercase cursor-not-allowed flex items-center justify-center border border-[#d6cfc5]"
                                  title="Currently Archived / Out of Stock"
                                >
                                  Sold Out
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => addToCart(product)}
                                  className="px-3 py-2.5 bg-[#1a1714] text-white text-[9px] font-medium tracking-[0.2em] uppercase hover:bg-[#d4af6a] hover:text-[#1a1714] transition-colors flex items-center justify-center"
                                  title="Add to Bag"
                                >
                                  + Bag
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="pt-5 space-y-1.5 text-center">
                            <div className="text-[9px] tracking-[0.25em] uppercase text-[#8e857b]">
                              {product.categoryLabel}
                            </div>

                            <h3 className="font-serif text-base sm:text-lg text-[#1a1714] font-normal tracking-wide group-hover:text-[#a11826] transition-colors">
                              <Link href={`/products/${product.id}`}>{product.name}</Link>
                            </h3>

                            <p className="text-[11px] text-[#787065] font-light truncate max-w-xs mx-auto">
                              {product.material}
                            </p>

                            <div className="pt-1 flex items-center justify-center gap-2">
                              <span className="text-xs font-medium tracking-wider text-[#1a1714]">
                                {product.formattedPrice}
                              </span>
                              <StockBadge
                                status={product.stockState.status}
                                remaining={product.stockState.remaining}
                                variant="pill"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. CLIENT CONCIERGE & CRAFTSMANSHIP BANNER ── */}
      <CraftsmanshipBanner />
    </div>
  );
}
