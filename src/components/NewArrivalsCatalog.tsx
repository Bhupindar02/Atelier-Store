'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/data/fashion-data';
import { useStore } from '@/context/StoreContext';
import CraftsmanshipBanner from '@/components/CraftsmanshipBanner';

interface NewArrivalsCatalogProps {
  initialProducts: Product[];
  categories: { id: string; name: string; slug: string }[];
}

export default function NewArrivalsCatalog({
  initialProducts,
  categories,
}: NewArrivalsCatalogProps) {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategoryParam);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [gridColumns, setGridColumns] = useState<2 | 3>(3);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  const { toggleWishlist, isInWishlist, addToCart, openQuickView } = useStore();

  // Category Tabs
  const filterTabs = useMemo(() => {
    return [
      { id: 'all', label: 'All New Creations', count: initialProducts.length },
      ...categories.map((c) => ({
        id: c.slug,
        label: c.name,
        count: initialProducts.filter((p) => p.category === c.slug).length,
      })),
    ];
  }, [categories, initialProducts]);

  // Filtered & Sorted Products
  const processedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Category Filter
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }

    // In Stock Only Filter
    if (inStockOnly) {
      result = result.filter(
        (p) => p.stockState.status === 'in_stock' || p.stockState.status === 'low_stock'
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
      case 'newest':
      default:
        // Already sorted by latest in database query
        break;
    }

    return result;
  }, [initialProducts, activeCategory, inStockOnly, sortBy]);

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      {/* ── 1. LUXURY EDITORIAL HERO HEADER ── */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-[#e8e3db] bg-gradient-to-b from-[#f5f2ec]/60 to-[#faf9f7]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          {/* Breadcrumb Bar */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-[#8e857b]">
              <li>
                <Link href="/" className="hover:text-[#a11826] transition-colors">
                  Maison Atelier
                </Link>
              </li>
              <li>/</li>
              <li>
                <span className="text-[#3a3530]">Collections</span>
              </li>
              <li>/</li>
              <li aria-current="page" className="text-[#a11826] font-semibold">
                Nouvelles Créations
              </li>
            </ol>
          </nav>

          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-block px-2.5 py-1 text-[9px] font-mono tracking-[0.25em] uppercase font-medium bg-[#11100e] text-[#f2ede6]">
                DEBUT · SPRING / SUMMER 2026
              </span>
              <span className="hidden sm:inline-block text-[11px] text-[#8e857b] tracking-widest uppercase">
                FLORENCE · BIELLA · PARIS
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-light text-[#1a1714] tracking-tight leading-[1.08]">
              Nouvelles Créations
            </h1>

            <p className="text-xs sm:text-base text-[#5c544d] font-light leading-relaxed max-w-2xl pt-2">
              The latest architectural silhouettes, full-grain Florentine leather volumes, and noble Super 140s tailoring fresh from our master artisans. Crafted in strictly limited production runs.
            </p>
          </div>

          {/* Luxury Highlights Bar */}
          <div className="mt-12 pt-8 border-t border-[#e8e3db]/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] tracking-[0.2em] uppercase text-[#3a3530]">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
              <span>Direct from Italian Workshops</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
              <span>Limited Runs of 25 Pieces</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
              <span>Complimentary Courier White-Glove</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a]" />
              <span>Complimentary Salon Alterations</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STICKY INTERACTIVE CONTROLS TOOLBAR ── */}
      <div className="sticky top-[72px] z-20 bg-[#faf9f7]/95 backdrop-blur-md border-b border-[#e8e3db] py-3 shadow-[0_1px_0_0_#e8e3db]/40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center overflow-x-auto gap-2 no-scrollbar pb-1 md:pb-0">
            {filterTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`whitespace-nowrap px-3.5 py-1.5 text-[10px] tracking-[0.18em] uppercase font-medium transition-all duration-200 rounded-sm flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#1a1714] text-white shadow-sm'
                      : 'bg-transparent text-[#787065] hover:text-[#1a1714] hover:bg-[#f2ede6]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`font-mono text-[9px] ${
                      isActive ? 'text-[#d4af6a]' : 'text-[#a0978d]'
                    }`}
                  >
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Filters, Sorter & View Toggle */}
          <div className="flex items-center justify-between md:justify-end gap-4 text-[10px] tracking-[0.16em] uppercase text-[#3a3530]">
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
            <div className="flex items-center gap-1.5">
              <span className="text-[#8e857b] hidden lg:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc' | 'name')}
                className="bg-transparent border border-[#e8e3db] px-2.5 py-1 text-[10px] uppercase tracking-wider focus:outline-none focus:border-[#1a1714] text-[#1a1714] cursor-pointer"
              >
                <option value="newest">Latest Arrivals</option>
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

      {/* ── 3. PRODUCT CATALOG GRID ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          {processedProducts.length === 0 ? (
            <div className="text-center py-24 space-y-4 max-w-md mx-auto">
              <span className="font-serif text-2xl text-[#1a1714] font-light">
                No creations match your current filters
              </span>
              <p className="text-xs text-[#787065] leading-relaxed">
                Please adjust your filter parameters or explore our entire haute couture catalog.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setInStockOnly(false);
                }}
                className="mt-4 px-6 py-3 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors"
              >
                Reset All Filters
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
                    {/* Optional Editorial Inset Tile after product #3 */}
                    {index === 3 && (
                      <div className="relative aspect-[3/4] bg-[#1a1714] text-white p-8 sm:p-12 flex flex-col justify-between border border-[#2b2621] overflow-hidden group">
                        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d4af6a_1px,transparent_1px)] [background-size:16px_16px]" />
                        <div className="space-y-3 relative z-10">
                          <span className="text-[9px] tracking-[0.3em] uppercase text-[#d4af6a] font-mono">
                            SAVOIR-FAIRE CHRONICLES
                          </span>
                          <h3 className="font-serif text-2xl sm:text-3xl font-light text-white leading-tight">
                            “Every curve is calibrated to eighteen hundredths of a millimeter.”
                          </h3>
                        </div>

                        <div className="space-y-4 relative z-10">
                          <p className="text-xs text-[#a0978d] font-light leading-relaxed">
                            Discover the Florence atelier techniques behind our Spring 2026 debut collection.
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
                    <div
                      className="group flex flex-col"
                      onMouseEnter={() => setHoveredProductId(product.id)}
                      onMouseLeave={() => setHoveredProductId(null)}
                    >
                      {/* 3:4 Portrait Image Frame */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#f2ede6] border border-[#e8e3db]/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                        <Link href={`/products/${product.id}`} className="block absolute inset-0">
                          <Image
                            src={product.primaryImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className={`object-cover transition-opacity duration-700 ease-in-out ${
                              isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                            }`}
                          />
                          <Image
                            src={product.secondaryImage}
                            alt={`${product.name} detail view`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className={`object-cover transition-all duration-700 ease-in-out ${
                              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                            }`}
                          />
                        </Link>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                          <div className="bg-[#11100e] text-[#f2ede6] px-2.5 py-1 text-[8px] tracking-[0.25em] uppercase font-medium shadow-sm">
                            NEW ARRIVAL
                          </div>
                          {product.badge && product.badge !== 'NEW ARRIVAL' && (
                            <div className="bg-[#d4af6a] text-[#11100e] px-2 py-0.5 text-[8px] tracking-[0.2em] uppercase font-semibold">
                              {product.badge}
                            </div>
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

                        {/* Floating Action Drawer on Hover */}
                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                          <button
                            type="button"
                            onClick={() => openQuickView(product)}
                            className="flex-1 py-2.5 bg-white text-[#1a1714] text-[9px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a1714] hover:text-white transition-colors"
                          >
                            Quick View
                          </button>
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="flex-1 py-2.5 bg-[#1a1714] text-white text-[9px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors"
                          >
                            Acquire
                          </button>
                        </div>
                      </div>

                      {/* Product Metadata Block */}
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
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1a1714]" />
                            {product.color}
                          </span>

                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="text-[#1a1714] uppercase tracking-[0.16em] font-medium hover:text-[#a11826] transition-colors"
                          >
                            + Add to Bag
                          </button>
                        </div>

                        {/* Stock Status Pill */}
                        <div className="pt-1">
                          <span
                            className={`inline-block text-[9px] tracking-wider uppercase font-mono ${
                              product.stockState.status === 'low_stock'
                                ? 'text-[#a11826]'
                                : 'text-[#8e857b]'
                            }`}
                          >
                            {product.stockState.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. CONCIERGE & CRAFTSMANSHIP BANNER REASSURANCE ── */}
      <CraftsmanshipBanner />
    </div>
  );
}
