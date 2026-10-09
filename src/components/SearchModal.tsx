'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PRODUCTS } from '@/data/fashion-data';
import { useStore } from '@/context/StoreContext';

export default function SearchModal() {
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
              className="text-[#1a1714] hover:text-[#a11826] p-2"
              aria-label="Close search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by silhouette, material, or creation..."
              className="w-full bg-transparent border-b-2 border-[#1a1714] py-4 text-xl sm:text-2xl font-serif text-[#1a1714] placeholder-[#a0978d] focus:outline-none focus:border-[#a11826] transition-colors"
            />
          </div>

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

          {/* Search Results */}
          {query.trim() !== '' && (
            <div className="space-y-4 pt-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b] block">
                Found {filtered.length} {filtered.length === 1 ? 'Creation' : 'Creations'}
              </span>

              {filtered.length === 0 ? (
                <p className="text-sm font-light text-[#8e857b] py-8 text-center font-serif">
                  No creations matched &ldquo;{query}&rdquo;. Please contact client services for bespoke requests.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                  {filtered.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        openQuickView(item);
                        closeSearch();
                      }}
                      className="flex gap-4 p-3 bg-white border border-[#e8e3db] hover:border-[#1a1714] cursor-pointer transition-all"
                    >
                      <div className="relative w-16 aspect-[3/4] bg-[#f2ede6] flex-shrink-0">
                        <Image
                          src={item.primaryImage}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <span className="text-[9px] uppercase tracking-widest text-[#8e857b]">
                          {item.categoryLabel}
                        </span>
                        <h4 className="font-serif text-base text-[#1a1714]">{item.name}</h4>
                        <span className="font-mono text-xs font-medium text-[#1a1714]">
                          {item.formattedPrice}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
