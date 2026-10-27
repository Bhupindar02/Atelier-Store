'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/data/fashion-data';
import { useStore } from '@/context/StoreContext';
import CraftsmanshipBanner from '@/components/CraftsmanshipBanner';
import StockBadge from '@/components/StockBadge';

interface ProductSearchCatalogProps {
  initialProducts: Product[];
  categories: { id: string; name: string; slug: string }[];
  initialQuery?: string;
  initialCategory?: string;
}

export default function ProductSearchCatalog({
  initialProducts,
  categories,
  initialQuery = '',
  initialCategory = 'all',
}: ProductSearchCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(
    initialCategory || searchParams.get('category') || 'all'
  );
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'name'>('relevance');
  const [gridColumns, setGridColumns] = useState<2 | 3>(3);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  const { toggleWishlist, isInWishlist, addToCart, openQuickView } = useStore();

  const currentQueryParam = searchParams.get('q') ?? '';
  const currentCategoryParam = searchParams.get('category') ?? 'all';

  const [prevParams, setPrevParams] = useState({ q: currentQueryParam, cat: currentCategoryParam });
  if (currentQueryParam !== prevParams.q || currentCategoryParam !== prevParams.cat) {
    setPrevParams({ q: currentQueryParam, cat: currentCategoryParam });
    if (currentQueryParam !== query) {
      setQuery(currentQueryParam);
    }
    if (currentCategoryParam !== activeCategory) {
      setActiveCategory(currentCategoryParam);
    }
  }

  // Update URL search parameters smoothly
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    const params = new URLSearchParams(window.location.search);
    if (newQuery.trim()) {
      params.set('q', newQuery.trim());
    } else {
      params.delete('q');
    }
    if (activeCategory !== 'all') {
      params.set('category', activeCategory);
    }
    const queryString = params.toString();
    router.replace(`/search${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    const params = new URLSearchParams(window.location.search);
    if (query.trim()) {
      params.set('q', query.trim());
    }
    if (catId !== 'all') {
      params.set('category', catId);
    } else {
      params.delete('category');
    }
    const queryString = params.toString();
    router.replace(`/search${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  // Popular search tags for quick discovery
  const popularTags = [
    'Tuscan Calfskin',
    'Silk Gown',
    'Chevalier Blazer',
    'Valmont Tote',
    'Blake-Stitched',
    '24k Gold Clasp',
  ];

  // Filter and sort products
  const searchResults = useMemo(() => {
    let list = [...initialProducts];
    const q = query.trim().toLowerCase();

    // 1. Text Search Filter across multiple attributes
    if (q) {
      list = list.filter((p) => {
        const inName = p.name.toLowerCase().includes(q);
        const inCategory = p.categoryLabel.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        const inMaterial = p.material.toLowerCase().includes(q);
        const inColor = p.color.toLowerCase().includes(q);
        const inDesc = p.description.toLowerCase().includes(q);
        const inOrigin = p.origin.toLowerCase().includes(q);
        const inDetails = p.details ? p.details.some((d) => d.toLowerCase().includes(q)) : false;

        return inName || inCategory || inMaterial || inColor || inDesc || inOrigin || inDetails;
      });
    }

    // 2. Category Filter
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    // 3. In-Stock Filter
    if (inStockOnly) {
      list = list.filter(
        (p) =>
          p.stockState.status === 'in_stock' ||
          p.stockState.status === 'low_stock' ||
          p.stockState.status === 'made_to_order'
      );
    }

    // 4. Sorting
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'relevance':
      default:
        if (q) {
          // Prioritize exact name match over description match
          list.sort((a, b) => {
            const aName = a.name.toLowerCase().includes(q);
            const bName = b.name.toLowerCase().includes(q);
            if (aName && !bName) return -1;
            if (!aName && bName) return 1;
            return 0;
          });
        }
        break;
    }

    return list;
  }, [initialProducts, query, activeCategory, inStockOnly, sortBy]);

  // Dynamic category pills with live result counts for the current query
  const categoryTabs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const queryFiltered = q
      ? initialProducts.filter((p) => {
          const inName = p.name.toLowerCase().includes(q);
          const inCategory = p.categoryLabel.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
          const inMaterial = p.material.toLowerCase().includes(q);
          const inColor = p.color.toLowerCase().includes(q);
          const inDesc = p.description.toLowerCase().includes(q);
          return inName || inCategory || inMaterial || inColor || inDesc;
        })
      : initialProducts;

    return [
      { id: 'all', name: 'All Creations', count: queryFiltered.length },
      ...categories.map((c) => ({
        id: c.slug,
        name: c.name,
        count: queryFiltered.filter((p) => p.category === c.slug).length,
      })),
    ];
  }, [categories, initialProducts, query]);

  return (
    <div className="bg-[#faf9f7] min-h-screen">
      {/* ── 1. EDITORIAL SEARCH HERO ── */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-[#e8e3db] bg-gradient-to-b from-[#f2ede6]/70 via-[#f7f4ee]/50 to-[#faf9f7]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-[#8e857b]">
              <li>
                <Link href="/" className="hover:text-[#a11826] transition-colors">
                  Maison Atelier
                </Link>
              </li>
              <li>/</li>
              <li aria-current="page" className="text-[#a11826] font-medium">
                Archives & Search
              </li>
            </ol>
          </nav>

          <div className="max-w-3xl space-y-4">
            <span className="inline-block px-2.5 py-1 text-[9px] font-mono tracking-[0.25em] uppercase font-medium bg-[#11100e] text-[#f2ede6]">
              ATELIER RECHERCHE
            </span>

            <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#1a1714] tracking-tight leading-[1.08]">
              Search the Maison
            </h1>

            <p className="text-xs sm:text-sm text-[#5c544d] font-light leading-relaxed max-w-xl">
              Discover creations by sculptural silhouette, noble Florentine leather, Como silk faille, or artisanal atelier technique.
            </p>
          </div>

          {/* Interactive Search Input Box */}
          <div className="mt-10 max-w-2xl relative">
            <div className="relative flex items-center">
              <svg
                className="w-5 h-5 absolute left-4 text-[#8e857b] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth="1.5"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>

              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search by silhouette, material, or color..."
                className="w-full bg-white border border-[#d6cfc5] pl-12 pr-12 py-4 text-base sm:text-lg font-serif text-[#1a1714] placeholder-[#a0978d] shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus:outline-none focus:border-[#1a1714] focus:ring-1 focus:ring-[#1a1714] transition-all"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => handleQueryChange('')}
                  className="absolute right-4 text-[#8e857b] hover:text-[#1a1714] p-1 transition-colors"
                  aria-label="Clear search query"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Popular Search Suggestions */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#8e857b] font-medium mr-1">
                Suggestions:
              </span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQueryChange(tag)}
                  className={`text-[10px] tracking-wider uppercase px-2.5 py-1 border transition-colors ${
                    query.toLowerCase() === tag.toLowerCase()
                      ? 'bg-[#1a1714] text-white border-[#1a1714]'
                      : 'bg-white/80 border-[#e8e3db] text-[#5c544d] hover:border-[#1a1714] hover:text-[#1a1714]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STICKY FILTER TOOLBAR & CATEGORY TABS ── */}
      <div className="sticky top-[72px] z-20 bg-[#faf9f7]/95 backdrop-blur-md border-b border-[#e8e3db] py-3 shadow-[0_1px_0_0_#e8e3db]/40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center overflow-x-auto gap-2 no-scrollbar pb-1 md:pb-0">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategoryChange(tab.id)}
                  className={`whitespace-nowrap px-3.5 py-1.5 text-[10px] tracking-[0.18em] uppercase font-medium transition-all duration-200 rounded-sm flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#1a1714] text-white shadow-sm'
                      : 'bg-transparent text-[#787065] hover:text-[#1a1714] hover:bg-[#f2ede6]'
                  }`}
                >
                  <span>{tab.name}</span>
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

          {/* Right Toolbar Controls */}
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

            {/* Sorter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8e857b] hidden lg:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'relevance' | 'price-asc' | 'price-desc' | 'name')
                }
                className="bg-transparent border border-[#e8e3db] px-2.5 py-1 text-[10px] uppercase tracking-wider focus:outline-none focus:border-[#1a1714] text-[#1a1714] cursor-pointer"
              >
                <option value="relevance">Relevance</option>
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

      {/* ── 3. PRODUCT SEARCH RESULTS GRID ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          {/* Results Summary Subhead */}
          <div className="mb-10 flex items-center justify-between text-xs text-[#8e857b] tracking-wider uppercase border-b border-[#e8e3db]/60 pb-4">
            <div>
              {query ? (
                <span>
                  Showing {searchResults.length} {searchResults.length === 1 ? 'creation' : 'creations'} for &ldquo;<span className="text-[#1a1714] font-medium">{query}</span>&rdquo;
                </span>
              ) : (
                <span>Showing {searchResults.length} creations across all collections</span>
              )}
            </div>

            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange('')}
                className="text-[10px] text-[#a11826] hover:underline uppercase tracking-widest font-medium"
              >
                Clear Search Query
              </button>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-24 space-y-6 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#f2ede6] flex items-center justify-center mx-auto text-[#8e857b]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-[#1a1714] font-light">
                  No creations matched your inquiry
                </h3>
                <p className="text-xs text-[#787065] leading-relaxed">
                  We could not locate any pieces matching &ldquo;{query}&rdquo;. Check spelling or explore popular haute couture categories below.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleQueryChange('');
                    handleCategoryChange('all');
                    setInStockOnly(false);
                  }}
                  className="px-5 py-2.5 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors"
                >
                  View All Pieces
                </button>
                <Link
                  href="/collections/handbags"
                  className="px-5 py-2.5 border border-[#1a1714] text-[#1a1714] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a1714] hover:text-white transition-colors"
                >
                  Explore Leather Goods
                </Link>
              </div>
            </div>
          ) : (
            <div
              className={`grid gap-x-8 gap-y-16 sm:gap-y-20 ${
                gridColumns === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {searchResults.map((product) => {
                const isHovered = hoveredProductId === product.id;
                const wishlisted = isInWishlist(product.id);

                return (() => {
                  const isOutOfStock = product.stockState.status === 'out_of_stock';

                  return (
                    <div
                      key={product.id}
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

                      {/* Product Meta Details */}
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
                })();
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. CONCIERGE & CRAFTSMANSHIP BANNER ── */}
      <CraftsmanshipBanner />
    </div>
  );
}
