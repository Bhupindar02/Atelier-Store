'use client';

import React from 'react';
import Image from 'next/image';
import { FEATURED_COLLECTIONS } from '@/data/fashion-data';

export default function FeaturedCollections() {
  return (
    <section id="collections" className="py-24 sm:py-32 bg-[#f5f2ed] border-b border-[#e8e3db]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 pb-6 border-b border-[#e0dad1]">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.3em] font-medium uppercase text-[#8e857b]">
              CURATED SELECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1a1714]">
              Featured Collections
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-[#5c544d] font-light leading-relaxed">
            Explorations of form across leather goods, evening tailoring, and seasonal ready-to-wear crafted in historic European workshops.
          </p>
        </div>

        {/* 3-Column Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {FEATURED_COLLECTIONS.map((col) => (
            <div
              key={col.id}
              className="group flex flex-col bg-[#faf9f7] border border-[#e8e3db] transition-all duration-500 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)]"
            >
              {/* Collection Image Frame (3:4 ratio) */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#e8e3db]">
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Discrete Tag */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-medium text-[#1a1714]">
                  {col.season}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#8e857b] block mb-1">
                    {col.subtitle}
                  </span>
                  <h3 className="font-serif text-2xl text-[#1a1714] font-normal tracking-wide group-hover:text-[#a11826] transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-[#5c544d] mt-2 font-light leading-relaxed">
                    {col.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#e8e3db]/60 flex items-center justify-between">
                  <a
                    href="#products"
                    className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-medium text-[#1a1714] group-hover:text-[#a11826] transition-colors"
                  >
                    <span>{col.linkText}</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                  <span className="text-[10px] font-mono text-[#8e857b]">
                    {col.itemCount} PIECES
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
