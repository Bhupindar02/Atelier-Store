'use client';

import React from 'react';
import Image from 'next/image';

export default function EditorialStory() {
  return (
    <section className="bg-[#faf9f7] py-20 sm:py-32 border-b border-[#e8e3db]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Asymmetric Editorial Image Duo */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
            <div className="sm:col-span-8 relative aspect-[3/4] overflow-hidden bg-[#f2ede6] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
                alt="Editorial model in tailored ivory overcoat"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out hover:scale-105"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[9px] tracking-[0.22em] uppercase font-medium text-[#1a1714]">
                VILLA D&apos;ESTE · LAKE COMO
              </div>
            </div>

            <div className="sm:col-span-4 space-y-4">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f2ede6] shadow-sm">
                <Image
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop"
                  alt="Artisanal leather craft closeup"
                  fill
                  sizes="(max-width: 1024px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                />
              </div>
              <p className="text-[11px] text-[#8e857b] tracking-wider uppercase">
                Plate 04 / 12 — Hand-painted edges & saddlery stitching
              </p>
            </div>
          </div>

          {/* Right: Curated Narrative & Typography */}
          <div className="lg:col-span-5 space-y-8 lg:pl-6">
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.3em] font-medium uppercase text-[#a11826]">
                THE MAISON PERSPECTIVE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#1a1714] leading-[1.12]">
                An obsession with form, proportion, and noble materials.
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#5c544d] font-light leading-relaxed">
              Every creation begins not on paper, but directly upon the mannequin. Our master artisans in Florence sculpt each volume by hand, honoring a century of Tuscan tanning heritage while stripping away unnecessary decoration in pursuit of purest silhouette.
            </p>

            <div className="pt-2 border-t border-[#e8e3db] grid grid-cols-2 gap-6">
              <div>
                <span className="block font-serif text-2xl text-[#1a1714]">100%</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b]">
                  Full-Grain Italian Calfskin
                </span>
              </div>
              <div>
                <span className="block font-serif text-2xl text-[#1a1714]">18h</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b]">
                  Handwork Per Handbag
                </span>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="#spotlight"
                className="inline-flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase font-medium text-[#1a1714] group hover:text-[#a11826] transition-colors"
              >
                <span>EXPLORE THE ATELIER ARCHIVE</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
