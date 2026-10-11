'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function Header() {
  const { cartCount, wishlistIds, openCart, openSearch } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ── TOP LUXURY ANNOUNCEMENT TICKER ── */}
      <div className="bg-[#11100e] text-[#e8e3db] text-[10px] tracking-[0.2em] uppercase py-2 px-4 border-b border-[#25221d] relative z-40">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-6">
            <span>PARIS · FIRENZE · NEW YORK</span>
            <span className="opacity-40">|</span>
            <span>COMPLIMENTARY WHITE-GLOVE DELIVERY OVER $500</span>
          </div>
          <div className="w-full sm:w-auto text-center sm:text-right flex items-center justify-center sm:justify-end gap-6 text-[10px]">
            <Link
              href="/new-arrivals"
              className="text-[#d4af6a] font-medium hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>SPRING 2026 DEBUT LIVE</span>
              <span className="opacity-40">·</span>
              <span className="underline decoration-[#d4af6a]/50 underline-offset-4">SHOP NEW ARRIVALS →</span>
            </Link>
            <span className="hidden md:inline opacity-40">|</span>
            <Link href="/#concierge" className="hidden md:inline hover:text-white transition-colors">
              CLIENT SERVICES
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN STICKY NAVIGATION ── */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#faf9f7]/95 backdrop-blur-md shadow-[0_1px_0_0_#e8e3db]'
            : 'bg-[#faf9f7] border-b border-[#e8e3db]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between">
          {/* Mobile Menu Hamburger Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-[#1a1714] hover:text-[#a11826] transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.2" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Left Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] uppercase tracking-[0.18em] font-medium text-[#3a3530]">
            <Link
              href="/new-arrivals"
              className="text-[#a11826] font-semibold hover:opacity-80 transition-opacity flex items-center gap-1.5"
            >
              <span>New Arrivals</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#a11826]" />
            </Link>
            <Link href="/collections" className="hover:text-[#a11826] transition-colors">
              Collections
            </Link>
            <Link href="/collections/handbags" className="hover:text-[#a11826] transition-colors">
              Maroquinerie
            </Link>
            <Link href="/collections/tailoring" className="hover:text-[#a11826] transition-colors">
              Prêt-à-Porter
            </Link>
            <Link href="/#spotlight" className="hover:text-[#a11826] transition-colors">
              Masterpiece
            </Link>
            <Link href="/#editorial" className="hover:text-[#a11826] transition-colors">
              Journal
            </Link>
          </nav>

          {/* Center Brand Identity (Gucci / Saint Laurent inspired wordmark) */}
          <div className="text-center flex-1 lg:flex-initial">
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.28em] font-light text-[#1a1714] block leading-none">
                ATELIER
              </span>
              <span className="font-sans text-[8px] tracking-[0.45em] text-[#8e857b] uppercase mt-1 block">
                HAUTE COUTURE
              </span>
            </Link>
          </div>

          {/* Right Utilities (Search, Wishlist, Bag) */}
          <div className="flex items-center gap-3 sm:gap-5 text-[#1a1714]">
            {/* Search Button */}
            <button
              type="button"
              onClick={openSearch}
              className="p-2 hover:text-[#a11826] transition-colors flex items-center gap-1.5 focus:outline-none"
              aria-label="Search collection"
            >
              <svg className="w-4 h-4 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="square" strokeLinejoin="miter" d="m21 21-4.35-4.35" />
              </svg>
              <span className="hidden xl:inline text-[10px] uppercase tracking-[0.16em] font-medium text-[#3a3530]">
                Search
              </span>
            </button>

            {/* Wishlist Link / Counter */}
            <a
              href="#products"
              className="p-2 hover:text-[#a11826] transition-colors relative flex items-center"
              aria-label="Wishlist items"
            >
              <svg className="w-4 h-4 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#a11826] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center font-mono rounded-full">
                  {wishlistIds.length}
                </span>
              )}
            </a>

            {/* Client Account Link */}
            <Link
              href="/account"
              className="p-2 hover:text-[#a11826] transition-colors relative flex items-center gap-1.5 focus:outline-none"
              aria-label="Client Account"
            >
              <svg className="w-4 h-4 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <span className="hidden xl:inline text-[10px] uppercase tracking-[0.16em] font-medium text-[#3a3530]">
                Client
              </span>
            </Link>

            {/* Shopping Bag Trigger */}
            <button
              type="button"
              onClick={openCart}
              className="p-2 hover:text-[#a11826] transition-colors relative flex items-center gap-1.5 focus:outline-none"
              aria-label="View shopping bag"
            >
              <svg className="w-4 h-4 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.56 0 1.036.41 1.119.957Z" />
              </svg>
              <span className="hidden md:inline text-[10px] uppercase tracking-[0.16em] font-medium text-[#3a3530]">
                Bag ({cartCount})
              </span>
              {cartCount > 0 && (
                <span className="md:hidden absolute -top-0.5 -right-0.5 bg-[#1a1714] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center font-mono rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE SLIDE-OUT MENU DRAWER ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-[340px] bg-[#faf9f7] h-full shadow-2xl flex flex-col p-6 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-[#e8e3db]">
              <span className="font-serif text-xl tracking-[0.2em] font-light text-[#1a1714]">
                ATELIER
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-[#1a1714] hover:text-[#a11826]"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="py-6 flex flex-col gap-4 text-xs tracking-[0.18em] uppercase font-medium text-[#1a1714]">
              <Link
                href="/new-arrivals"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#e8e3db]/80 text-[#a11826] font-semibold flex items-center justify-between"
              >
                <span>New Arrivals</span>
                <span className="text-[9px] px-2 py-0.5 bg-[#a11826]/10 text-[#a11826] font-mono tracking-widest">
                  2026 DEBUT
                </span>
              </Link>
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 border-b border-[#e8e3db]/80 hover:text-[#a11826] transition-colors flex items-center justify-between"
              >
                <span>Client Portfolio</span>
                <span className="text-[9px] px-2 py-0.5 bg-[#1a1714] text-white font-mono tracking-wider">
                  ACCOUNT
                </span>
              </Link>
              <Link
                href="/collections"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-[#e8e3db]/60 hover:text-[#a11826] transition-colors"
              >
                Featured Collections
              </Link>
              <Link
                href="/collections/handbags"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-[#e8e3db]/60 hover:text-[#a11826] transition-colors"
              >
                Leather Goods
              </Link>
              <Link
                href="/collections/tailoring"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-[#e8e3db]/60 hover:text-[#a11826] transition-colors"
              >
                Tailoring & Ready-to-Wear
              </Link>
              <Link
                href="/#spotlight"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-[#e8e3db]/60 hover:text-[#a11826] transition-colors"
              >
                Masterpiece Spotlight
              </Link>
              <Link
                href="/#editorial"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-[#e8e3db]/60 hover:text-[#a11826] transition-colors"
              >
                Atelier Journal
              </Link>
              <Link
                href="/#concierge"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-[#e8e3db]/60 hover:text-[#a11826] transition-colors"
              >
                Client Services & Boutiques
              </Link>
            </div>

            <div className="mt-auto pt-6 border-t border-[#e8e3db] text-xs text-[#8e857b] space-y-3">
              <p className="tracking-widest uppercase font-medium text-[#1a1714]">Personal Concierge</p>
              <p>+33 (0)1 42 68 00 00</p>
              <p>concierge@maison-atelier.com</p>
              <div className="pt-4 flex gap-4 text-[10px] tracking-[0.2em] uppercase">
                <span>EN (US)</span>
                <span>USD ($)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
