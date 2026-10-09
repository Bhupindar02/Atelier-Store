'use client';

import React from 'react';
import Image from 'next/image';
import { HERO_CAMPAIGN } from '@/data/fashion-data';

export default function HeroCampaign() {
  return (
    <section className="relative w-full overflow-hidden bg-[#11100e] text-white">
      {/* ── HERO EDITORIAL IMAGE CONTAINER ── */}
      <div className="relative w-full h-[88vh] min-h-[620px] max-h-[960px]">
        <Image
          src={HERO_CAMPAIGN.image}
          alt="Spring Summer 2026 Haute Couture Campaign"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.88] contrast-[1.04] transition-transform duration-1000 ease-out hover:scale-[1.02]"
        />

        {/* Elegant luxury gradient vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* ── EDITORIAL CONTENT OVERLAY ── */}
        <div className="absolute inset-0 flex flex-col justify-end items-center text-center px-6 pb-16 sm:pb-24 z-10">
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Season Eyebrow */}
            <div className="inline-flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#d4af6a]/80" />
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] font-medium text-[#f2ede6]">
                {HERO_CAMPAIGN.seasonTag}
              </span>
              <span className="w-8 h-[1px] bg-[#d4af6a]/80" />
            </div>

            {/* Campaign Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[-0.01em] leading-[1.05] text-[#faf9f7] drop-shadow-sm">
              {HERO_CAMPAIGN.headline}
            </h1>

            {/* Subtitle / Narrative */}
            <p className="max-w-xl mx-auto text-sm sm:text-base text-[#e8e3db] font-light leading-relaxed tracking-wide opacity-90 hidden sm:block">
              {HERO_CAMPAIGN.subheadline}
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#collections"
                className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4 bg-white text-[#1a1714] text-[11px] font-medium tracking-[0.22em] uppercase hover:bg-[#a11826] hover:text-white transition-all duration-300"
              >
                {HERO_CAMPAIGN.primaryCta}
              </a>
              <a
                href="#products"
                className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4 bg-transparent text-white border border-white/60 text-[11px] font-medium tracking-[0.22em] uppercase hover:bg-white hover:text-[#1a1714] transition-all duration-300"
              >
                {HERO_CAMPAIGN.secondaryCta}
              </a>
            </div>
          </div>

          {/* Scroll down indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-[9px] tracking-[0.25em] uppercase text-[#e8e3db]">Scroll</span>
            <div className="w-[1px] h-6 bg-gradient-to-b from-[#e8e3db] to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
