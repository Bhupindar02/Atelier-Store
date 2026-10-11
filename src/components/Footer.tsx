'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#11100e] text-[#faf9f7] pt-24 pb-12 border-t border-[#25221d]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-20">
        {/* Top Newsletter & Salon Invitation */}
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <span className="text-[10px] tracking-[0.35em] uppercase font-semibold text-[#d4af6a]">
            THE PRIVATE SALON
          </span>
          <h3 className="font-serif text-3xl sm:text-4xl font-light text-white leading-tight">
            Receive Private Previews & Atelier Chronicles
          </h3>
          <p className="text-xs text-[#a0978d] font-light leading-relaxed max-w-md mx-auto">
            Invitations to seasonal runway presentations, archival releases, and personal salon viewings across our global flagships.
          </p>

          {subscribed ? (
            <div className="p-4 bg-[#221f1a] border border-[#d4af6a]/40 text-xs text-[#d4af6a] tracking-wider uppercase">
              Thank you. You have been placed on the Atelier Private Registry.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-[#1c1915] border border-[#38332a] px-4 py-3.5 text-xs text-white placeholder-[#787065] focus:outline-none focus:border-[#d4af6a] transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-white text-[#11100e] text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-[#a11826] hover:text-white transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        {/* 4 Multi-column luxury navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-xs">
          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.25em] uppercase font-semibold text-white">
              The Maison
            </h4>
            <ul className="space-y-2.5 text-[#a0978d] font-light">
              <li><Link href="/new-arrivals" className="text-[#d4af6a] hover:text-white transition-colors font-medium">Nouvelles Créations (New Arrivals)</Link></li>
              <li><Link href="/#editorial" className="hover:text-white transition-colors">History & Heritage</Link></li>
              <li><Link href="/#editorial" className="hover:text-white transition-colors">Florentine Workshops</Link></li>
              <li><Link href="/#editorial" className="hover:text-white transition-colors">Sustainability & Ethics</Link></li>
              <li><Link href="/#editorial" className="hover:text-white transition-colors">Artisanal Apprenticeship</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.25em] uppercase font-semibold text-white">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-[#a0978d] font-light">
              <li><a href="#concierge" className="hover:text-white transition-colors">Private Appointments</a></li>
              <li><a href="#concierge" className="hover:text-white transition-colors">Complimentary Delivery</a></li>
              <li><a href="#concierge" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#concierge" className="hover:text-white transition-colors">Care & Restoration</a></li>
              <li><a href="#concierge" className="hover:text-white transition-colors">Authenticity Verification</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.25em] uppercase font-semibold text-white">
              Flagship Salons
            </h4>
            <ul className="space-y-2.5 text-[#a0978d] font-light">
              <li className="text-white">Paris · 18 Place Vendôme</li>
              <li className="text-white">Milan · Via Montenapoleone 7</li>
              <li className="text-white">New York · 720 Madison Avenue</li>
              <li className="text-white">Tokyo · Ginza 6-Chome</li>
              <li className="text-[#d4af6a] pt-1">
                <a href="#concierge" className="hover:underline">Find All Boutiques →</a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] tracking-[0.25em] uppercase font-semibold text-white">
              Legal & Disclosures
            </h4>
            <ul className="space-y-2.5 text-[#a0978d] font-light">
              <li><span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Terms of Sale</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Cookie Preferences</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Modern Slavery Statement</span></li>
              <li><span className="cursor-pointer hover:text-white transition-colors">Counterfeiting Notice</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Brand Mark and Copyright Bar */}
        <div className="pt-12 border-t border-[#25221d] flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-[#787065] tracking-wider uppercase">
          <div className="flex items-center gap-6">
            <span>© 2026 MAISON ATELIER S.A.</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">REGION: UNITED STATES (USD $)</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer transition-colors">LANGUAGE: ENGLISH</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
