'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '@/data/fashion-data';
import { useStore } from '@/context/StoreContext';
import StockBadge from '@/components/StockBadge';

export default function SearchModal() {
  const router = useRouter();
  const { isSearchOpen, closeSearch, openQuickView } = useStore();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filtered = query.trim() === ''
    ? []
    : PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(query.toLowerCase()) ||
        p.material.toLowerCase().includes(query.toLowerCase()) ||
        p.color.toLowerCase().includes(query.toLowerCase())
      );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      closeSearch();
    }
  };

  const suggestions = [
    'Valmont Structured Tote',
    'Chevalier Blazer',
    'Fluid Silk Gown',
    'Palazzo Loafer',
    'Italian Calfskin',
    'Mulberry Silk',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={closeSearch}
      />

      <div className="min-h-full flex flex-col justify-start p-4 sm:p-8 pt-16 sm:pt-24 max-w-4xl mx-auto relative z-10">
        <div className="bg-[#faf9f7] border border-[#e8e3db] p-8 sm:p-12 shadow-2xl space-y-8">
          {/* Header & Input */}
          <div className="flex items-center justify-between pb-6 border-b border-[#e8e3db]">
            <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-[#8e857b]">
              SEARCH THE MAISON
            </span>
            <button
              type="button"
              onClick={closeSearch}
              className="text-[#1a1714] hover:text-[#a11826] p-2 transition-colors"
              aria-label="Close search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by silhouette, material, or creation..."
              className="w-full bg-transparent border-b-2 border-[#1a1714] py-4 pr-24 text-xl sm:text-2xl font-serif text-[#1a1714] placeholder-[#a0978d] focus:outline-none focus:border-[#a11826] transition-colors"
            />
            {query.trim() && (
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors"
              >
                Search
              </button>
            )}
          </form>

          {/* Quick Suggestions */}
          {query.trim() === '' && (
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#8e857b] block">
                Popular Searches:
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="px-3 py-1.5 bg-[#f2ede6] text-[#1a1714] text-[11px] tracking-wider uppercase border border-[#e8e3db] hover:border-[#1a1714] transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Preview */}
          {query.trim() !== '' && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-[#e8e3db]/60 pb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b]">
                  Live Preview: {filtered.length} {filtered.length === 1 ? 'Creation' : 'Creations'}
                </span>

                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={closeSearch}
                  className="text-[10px] uppercase tracking-widest font-semibold text-[#a11826] hover:underline"
                >
                  View All in Search Archives →
                </Link>
              </div>

              {filtered.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-sm font-light text-[#8e857b] font-serif">
                    No immediate preview matched &ldquo;{query}&rdquo;.
                  </p>
                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    onClick={closeSearch}
                    className="inline-block px-4 py-2 border border-[#1a1714] text-[#1a1714] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a1714] hover:text-white transition-colors"
                  >
                    Search Full Archives
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[45vh] overflow-y-auto pr-2">
                    {filtered.map((item) => (
                      <div
                        key={item.id}
                        className={`flex gap-4 p-3 bg-white border border-[#e8e3db] hover:border-[#1a1714] transition-all group ${
                          item.stockState?.status === 'out_of_stock' ? 'opacity-85' : ''
                        }`}
                      >
                        <Link
                          href={`/products/${item.id}`}
                          onClick={closeSearch}
                          className="relative w-16 aspect-[3/4] bg-[#f2ede6] flex-shrink-0 block overflow-hidden"
                        >
                          <Image
                            src={item.primaryImage}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className={`object-cover group-hover:scale-105 transition-transform ${
                              item.stockState?.status === 'out_of_stock' ? 'grayscale-[20%]' : ''
                            }`}
                          />
                        </Link>
                        <div className="flex-1 flex flex-col justify-center">
                          <span className="text-[9px] uppercase tracking-widest text-[#8e857b]">
                            {item.categoryLabel}
                          </span>
                          <h4 className="font-serif text-base text-[#1a1714] group-hover:text-[#a11826] transition-colors">
                            <Link href={`/products/${item.id}`} onClick={closeSearch}>
                              {item.name}
                            </Link>
                          </h4>
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-medium text-[#1a1714]">
                                {item.formattedPrice}
                              </span>
                              {item.stockState && (
                                <StockBadge
                                  status={item.stockState.status}
                                  remaining={item.stockState.remaining}
                                  variant="pill"
                                />
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                openQuickView(item);
                                closeSearch();
                              }}
                              className="text-[9px] uppercase tracking-wider text-[#8e857b] hover:text-[#1a1714] underline"
                            >
                              Quick View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-center">
                    <Link
                      href={`/search?q=${encodeURIComponent(query.trim())}`}
                      onClick={closeSearch}
                      className="inline-flex items-center justify-center px-6 py-3 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors w-full sm:w-auto"
                    >
                      View All {filtered.length} Results in Dedicated Search Catalog →
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
