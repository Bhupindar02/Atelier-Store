'use client';

import React from 'react';
import Image from 'next/image';
import { EDITORIAL_JOURNALS } from '@/data/fashion-data';

export default function EditorialJournal() {
  return (
    <section id="editorial" className="py-24 sm:py-32 bg-[#faf9f7] border-b border-[#e8e3db]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 pb-6 border-b border-[#e8e3db]">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.3em] font-medium uppercase text-[#a11826]">
              CHRONICLES & ESSAYS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#1a1714]">
              The Atelier Journal
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-[#5c544d] font-light leading-relaxed">
            Dispatches from our Tuscan ateliers, interviews with patternmakers, and reflections on the craft of modern dressing.
          </p>
        </div>

        {/* 3-Column Articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {EDITORIAL_JOURNALS.map((story) => (
            <article
              key={story.id}
              className="group flex flex-col space-y-5 cursor-pointer"
            >
              {/* 16:10 or 3:2 landscape image frame */}
              <div className="relative aspect-[16/11] overflow-hidden bg-[#e8e3db] border border-[#e8e3db]">
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Story Metadata */}
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-[#8e857b]">
                    <span>{story.eyebrow}</span>
                    <span>•</span>
                    <span>{story.readTime}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-[#1a1714] font-normal leading-snug mt-2 group-hover:text-[#a11826] transition-colors">
                    {story.title}
                  </h3>

                  <p className="text-xs text-[#5c544d] mt-2.5 font-light leading-relaxed">
                    {story.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#e8e3db]/60">
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1714] group-hover:text-[#a11826] transition-colors">
                    <span>Read Chronicle</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
