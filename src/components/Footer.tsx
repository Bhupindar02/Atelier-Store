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
    <footer
      className="bg-[#11100e] text-[#f5f2eb] pt-24 pb-12 border-t border-[#25221d] relative z-10"
      style={{ backgroundColor: '#11100e', color: '#f5f2eb' }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-20">
        {/* Top Newsletter & Salon Invitation */}
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <span
            className="text-[10px] tracking-[0.35em] uppercase font-semibold text-[#d4af6a] block"
            style={{ color: '#d4af6a' }}
          >
            THE PRIVATE SALON
          </span>
          <h3
            className="font-serif text-3xl sm:text-4xl font-light text-white leading-tight"
            style={{ color: '#ffffff' }}
          >
            Receive Private Previews & Atelier Chronicles
          </h3>
          <p
            className="text-xs text-[#cfc7ba] font-light leading-relaxed max-w-lg mx-auto"
            style={{ color: '#cfc7ba' }}
          >
            Invitations to seasonal runway presentations, archival releases, and personal salon viewings across our global flagships.
          </p>

          {subscribed ? (
            <div
              className="p-4 bg-[#1a1714] border border-[#d4af6a]/50 text-xs tracking-wider uppercase"
              style={{ color: '#d4af6a', backgroundColor: '#1a1714' }}
            >
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
                className="flex-1 bg-[#1a1714] border border-[#3e3930] px-4 py-3.5 text-xs text-white placeholder-[#8e857b] focus:outline-none focus:border-[#d4af6a] transition-colors"
                style={{ backgroundColor: '#1a1714', color: '#ffffff' }}
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-white text-[#11100e] text-[10px] uppercase tracking-[0.25em] font-semibold hover:bg-[#d4af6a] hover:text-[#11100e] transition-colors cursor-pointer shrink-0"
                style={{ backgroundColor: '#ffffff', color: '#11100e' }}
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        {/* 4 Multi-column luxury navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 text-xs">
          {/* Column 1: The Maison */}
          <div className="space-y-4">
            <h4
              className="text-[11px] tracking-[0.25em] uppercase font-semibold text-white"
              style={{ color: '#ffffff' }}
            >
              The Maison
            </h4>
            <ul className="space-y-3 font-light">
              <li>
                <Link
                  href="/new-arrivals"
                  className="hover:text-white transition-colors font-medium block"
                  style={{ color: '#d4af6a' }}
                >
                  Nouvelles Créations (New Arrivals)
                </Link>
              </li>
              <li>
                <Link
                  href="/#editorial"
                  className="hover:text-white transition-colors block"
                  style={{ color: '#c7bfb1' }}
                >
                  History & Heritage
                </Link>
              </li>
              <li>
                <Link
                  href="/#editorial"
                  className="hover:text-white transition-colors block"
                  style={{ color: '#c7bfb1' }}
                >
                  Florentine Workshops
                </Link>
              </li>
              <li>
                <Link
                  href="/#editorial"
                  className="hover:text-white transition-colors block"
                  style={{ color: '#c7bfb1' }}
                >
                  Sustainability & Ethics
                </Link>
              </li>
              <li>
                <Link
                  href="/#editorial"
                  className="hover:text-white transition-colors block"
                  style={{ color: '#c7bfb1' }}
                >
                  Artisanal Apprenticeship
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Client Care */}
          <div className="space-y-4">
            <h4
              className="text-[11px] tracking-[0.25em] uppercase font-semibold text-white"
              style={{ color: '#ffffff' }}
            >
              Client Care
            </h4>
            <ul className="space-y-3 font-light">
              <li>
                <a
                  href="#concierge"
                  className="hover:text-white transition-colors block"
                  style={{ color: '#c7bfb1' }}
                >
                  Private Appointments
                </a>
              </li>
              <li>
                <a
                  href="#concierge"
                  className="hover:text-white transition-colors block"
                  style={{ color: '#c7bfb1' }}
                >
                  Complimentary Delivery
                </a>
              </li>
              <li>
                <a
                  href="#concierge"
                  className="hover:text-white transition-colors block"
                  style={{ color: '#c7bfb1' }}
                >
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a
                  href="#concierge"
                  className="hover:text-white transition-colors block"
                  style={{ color: '#c7bfb1' }}
                >
                  Care & Restoration
                </a>
              </li>
              <li>
                <a
                  href="#concierge"
                  className="hover:text-white transition-colors block"
                  style={{ color: '#c7bfb1' }}
                >
                  Authenticity Verification
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Flagship Salons */}
          <div className="space-y-4">
            <h4
              className="text-[11px] tracking-[0.25em] uppercase font-semibold text-white"
              style={{ color: '#ffffff' }}
            >
              Flagship Salons
            </h4>
            <ul className="space-y-3 font-light">
              <li style={{ color: '#c7bfb1' }}>
                <strong className="font-medium block" style={{ color: '#ffffff' }}>Paris</strong>
                <span>18 Place Vendôme</span>
              </li>
              <li style={{ color: '#c7bfb1' }}>
                <strong className="font-medium block" style={{ color: '#ffffff' }}>Milan</strong>
                <span>Via Montenapoleone 7</span>
              </li>
              <li style={{ color: '#c7bfb1' }}>
                <strong className="font-medium block" style={{ color: '#ffffff' }}>New York</strong>
                <span>720 Madison Avenue</span>
              </li>
              <li style={{ color: '#c7bfb1' }}>
                <strong className="font-medium block" style={{ color: '#ffffff' }}>Tokyo</strong>
                <span>Ginza 6-Chome</span>
              </li>
              <li className="pt-1">
                <a
                  href="#concierge"
                  className="hover:text-white transition-colors font-medium inline-block"
                  style={{ color: '#d4af6a' }}
                >
                  Find All Boutiques →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Disclosures */}
          <div className="space-y-4">
            <h4
              className="text-[11px] tracking-[0.25em] uppercase font-semibold text-white"
              style={{ color: '#ffffff' }}
            >
              Legal & Disclosures
            </h4>
            <ul className="space-y-3 font-light">
              <li>
                <span
                  className="hover:text-white transition-colors block cursor-pointer"
                  style={{ color: '#c7bfb1' }}
                >
                  Privacy Policy
                </span>
              </li>
              <li>
                <span
                  className="hover:text-white transition-colors block cursor-pointer"
                  style={{ color: '#c7bfb1' }}
                >
                  Terms of Sale
                </span>
              </li>
              <li>
                <span
                  className="hover:text-white transition-colors block cursor-pointer"
                  style={{ color: '#c7bfb1' }}
                >
                  Cookie Preferences
                </span>
              </li>
              <li>
                <span
                  className="hover:text-white transition-colors block cursor-pointer"
                  style={{ color: '#c7bfb1' }}
                >
                  Modern Slavery Statement
                </span>
              </li>
              <li>
                <span
                  className="hover:text-white transition-colors block cursor-pointer"
                  style={{ color: '#c7bfb1' }}
                >
                  Counterfeiting Notice
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Brand Mark and Copyright Bar */}
        <div
          className="pt-12 border-t border-[#25221d] flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] tracking-wider uppercase"
          style={{ color: '#a8a092' }}
        >
          <div className="flex items-center gap-6">
            <span style={{ color: '#a8a092' }}>© 2026 MAISON ATELIER S.A.</span>
            <span style={{ color: '#d4af6a' }}>✦</span>
            <span style={{ color: '#a8a092' }}>ALL RIGHTS RESERVED</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors" style={{ color: '#a8a092' }}>
              REGION: UNITED STATES (USD $)
            </span>
            <span style={{ color: '#d4af6a' }}>·</span>
            <span className="hover:text-white cursor-pointer transition-colors" style={{ color: '#a8a092' }}>
              LANGUAGE: ENGLISH
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
