'use client';

import React from 'react';

export default function CraftsmanshipBanner() {
  const services = [
    {
      title: "PRIVATE APPOINTMENTS",
      description: "Reserve a private salon viewing in Paris, Milan, or New York with a dedicated client advisor.",
      action: "BOOK CONSULTATION",
    },
    {
      title: "BESPOKE MONOGRAMMING",
      description: "Complimentary hot-stamping in 24k gold leaf or tone-on-tone blind deboss upon your leather creation.",
      action: "DISCOVER PERSONALIZATION",
    },
    {
      title: "ARCHIVAL RESTORATION",
      description: "Lifetime care, edge re-lacquering, and rejuvenation through our Florentine master restorer workshops.",
      action: "LEARN MORE",
    },
    {
      title: "WHITE-GLOVE DELIVERY",
      description: "Complimentary insured door-to-door courier service with signature velvet packaging and climate control.",
      action: "SHIPPING POLICIES",
    },
  ];

  return (
    <section id="concierge" className="py-20 sm:py-28 bg-[#1a1714] text-[#faf9f7] border-b border-[#2d2924]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-[10px] tracking-[0.35em] uppercase font-semibold text-[#d4af6a]">
            MAISON ATELIER
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#faf9f7]">
            Dedicated Client Concierge
          </h2>
          <p className="text-xs sm:text-sm text-[#b0a79d] font-light leading-relaxed">
            The standard of excellence extends far beyond our garments. Experience an uncompromising dedication to personal service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((svc, i) => (
            <div
              key={i}
              className="p-8 bg-[#221f1a] border border-[#332f29] flex flex-col justify-between space-y-6 hover:border-[#d4af6a]/50 transition-colors"
            >
              <div className="space-y-3">
                <span className="font-mono text-xs text-[#d4af6a]">0{i + 1}</span>
                <h3 className="font-sans text-xs uppercase tracking-[0.22em] font-medium text-white">
                  {svc.title}
                </h3>
                <p className="text-xs text-[#a0978d] font-light leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#332f29]">
                <button
                  type="button"
                  className="text-[9px] uppercase tracking-[0.25em] text-[#d4af6a] hover:text-white transition-colors"
                >
                  {svc.action} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
