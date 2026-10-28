'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useSession } from '@/lib/auth-client';

export default function Header() {
  const { cartCount, wishlistIds, openCart, openSearch } = useStore();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

      {/* ── MAIN STICKY NAVIGATION BAR ── */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#faf9f7]/95 backdrop-blur-md shadow-[0_1px_0_0_#e8e3db]'
            : 'bg-[#faf9f7] border-b border-[#e8e3db]'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-[72px] relative flex items-center justify-between">
          {/* Left: Hamburger Menu Trigger (Active across ALL screen sizes) */}
          <div className="flex-1 flex items-center justify-start">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="group p-2 -ml-2 text-[#1a1714] hover:text-[#a11826] transition-colors focus:outline-none flex items-center gap-2.5 cursor-pointer"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
            >
              <div className="w-5 h-3.5 flex flex-col justify-between py-0.5" aria-hidden="true">
                <span className="w-5 h-[1.5px] bg-current transition-all duration-200" />
                <span className="w-3.5 h-[1.5px] bg-current transition-all duration-200 group-hover:w-5" />
                <span className="w-5 h-[1.5px] bg-current transition-all duration-200" />
              </div>
              <span className="text-[10px] tracking-[0.22em] uppercase font-medium text-[#1a1714] group-hover:text-[#a11826] transition-colors hidden sm:inline">
                Menu
              </span>
            </button>
          </div>

          {/* Center Brand Identity: Perfectly Centered on ALL Screen Sizes */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-auto">
            <Link href="/" className="inline-block group focus:outline-none">
              <span className="font-serif text-2xl sm:text-3xl tracking-[0.28em] font-light text-[#1a1714] block leading-none">
                ATELIER
              </span>
              <span className="font-sans text-[8px] tracking-[0.45em] text-[#8e857b] uppercase mt-1 block">
                HAUTE COUTURE
              </span>
            </Link>
          </div>

          {/* Right Utilities (Search, Wishlist, Client Account, Bag) */}
          <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3 md:gap-4 lg:gap-5 text-[#1a1714]">
            {/* Search Button */}
            <button
              type="button"
              onClick={openSearch}
              className="p-2 hover:text-[#a11826] transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
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
              className="p-2 hover:text-[#a11826] transition-colors relative flex items-center focus:outline-none cursor-pointer"
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
              className="p-2 hover:text-[#a11826] transition-colors relative flex items-center gap-1.5 focus:outline-none cursor-pointer"
              aria-label="Client Account"
            >
              <svg className="w-4 h-4 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <span className="hidden xl:inline text-[10px] uppercase tracking-[0.16em] font-medium text-[#3a3530]">
                Client
              </span>
            </Link>

            {/* Admin Console Shortcut */}
            {isAdmin && (
              <Link
                href="/admin"
                className="p-2 text-[#8c6b2d] hover:text-[#1a1714] transition-colors relative flex items-center gap-1.5 focus:outline-none cursor-pointer"
                aria-label="Admin Console"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a] animate-pulse" />
                <span className="hidden md:inline text-[10px] uppercase tracking-[0.16em] font-semibold text-[#8c6b2d] border-b border-[#d4af6a]/50">
                  Admin
                </span>
              </Link>
            )}

            {/* Shopping Bag Trigger */}
            <button
              type="button"
              onClick={openCart}
              className="p-2 hover:text-[#a11826] transition-colors relative flex items-center gap-1.5 focus:outline-none cursor-pointer"
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

      {/* ── LUXURY HAMBURGER NAVIGATION DRAWER (Available on all screens) ── */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Drawer Container */}
        <aside
          className={`fixed top-0 bottom-0 left-0 w-full max-w-[380px] sm:max-w-[420px] bg-[#faf9f7] shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-out border-r border-[#e8e3db] ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Main navigation menu"
        >
          {/* Drawer Top Header */}
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[#e8e3db] bg-white">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="inline-block group"
            >
              <span className="font-serif text-xl tracking-[0.25em] font-light text-[#1a1714] block leading-none">
                ATELIER
              </span>
              <span className="font-sans text-[7px] tracking-[0.4em] text-[#8e857b] uppercase mt-1 block">
                HAUTE COUTURE
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-[#1a1714] hover:text-[#a11826] transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
              aria-label="Close menu"
            >
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium hidden sm:inline">
                Close
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Navigation Links */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
            {/* Primary Category & Collection Links (Original Left-Side Items) */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-[#8e857b] block mb-3">
                COLLECTIONS & RUNWAY
              </span>

              <nav className="flex flex-col space-y-1">
                {/* New Arrivals */}
                <Link
                  href="/new-arrivals"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-3 px-3 -mx-3 border-b border-[#e8e3db]/60 text-[#a11826] font-medium flex items-center justify-between hover:bg-white transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a11826]" />
                    <span className="font-serif text-lg tracking-wide group-hover:translate-x-1 transition-transform">
                      New Arrivals
                    </span>
                  </div>
                  <span className="text-[8px] uppercase tracking-[0.25em] px-2 py-0.5 bg-[#a11826]/10 text-[#a11826] font-mono">
                    2026 DEBUT
                  </span>
                </Link>

                {/* Collections */}
                <Link
                  href="/collections"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-3 px-3 -mx-3 border-b border-[#e8e3db]/60 text-[#1a1714] hover:text-[#a11826] hover:bg-white flex items-center justify-between transition-colors group"
                >
                  <span className="font-serif text-lg tracking-wide group-hover:translate-x-1 transition-transform">
                    All Collections
                  </span>
                  <span className="text-xs text-[#8e857b] font-light">→</span>
                </Link>

                {/* Maroquinerie (Handbags & Leather) */}
                <Link
                  href="/collections/handbags"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-3 px-3 -mx-3 border-b border-[#e8e3db]/60 text-[#1a1714] hover:text-[#a11826] hover:bg-white flex items-center justify-between transition-colors group"
                >
                  <div className="flex flex-col">
                    <span className="font-serif text-lg tracking-wide group-hover:translate-x-1 transition-transform">
                      Maroquinerie
                    </span>
                    <span className="text-[9px] text-[#8e857b] tracking-wider uppercase">
                      Handcrafted Leather Goods & Totes
                    </span>
                  </div>
                  <span className="text-xs text-[#8e857b] font-light">→</span>
                </Link>

                {/* Prêt-à-Porter */}
                <Link
                  href="/collections/tailoring"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-3 px-3 -mx-3 border-b border-[#e8e3db]/60 text-[#1a1714] hover:text-[#a11826] hover:bg-white flex items-center justify-between transition-colors group"
                >
                  <div className="flex flex-col">
                    <span className="font-serif text-lg tracking-wide group-hover:translate-x-1 transition-transform">
                      Prêt-à-Porter
                    </span>
                    <span className="text-[9px] text-[#8e857b] tracking-wider uppercase">
                      Bespoke Tailoring & Silhouettes
                    </span>
                  </div>
                  <span className="text-xs text-[#8e857b] font-light">→</span>
                </Link>

                {/* Masterpiece Focus */}
                <Link
                  href="/#spotlight"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-3 px-3 -mx-3 border-b border-[#e8e3db]/60 text-[#1a1714] hover:text-[#a11826] hover:bg-white flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#d4af6a] text-xs">✦</span>
                    <span className="font-serif text-lg tracking-wide group-hover:translate-x-1 transition-transform">
                      Masterpiece Focus
                    </span>
                  </div>
                  <span className="text-[8px] tracking-[0.2em] uppercase text-[#8e857b]">
                    SAVOIR-FAIRE
                  </span>
                </Link>

                {/* Atelier Journal */}
                <Link
                  href="/#editorial"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-3 px-3 -mx-3 border-b border-[#e8e3db]/60 text-[#1a1714] hover:text-[#a11826] hover:bg-white flex items-center justify-between transition-colors group"
                >
                  <span className="font-serif text-lg tracking-wide group-hover:translate-x-1 transition-transform">
                    Atelier Journal
                  </span>
                  <span className="text-[8px] tracking-[0.2em] uppercase text-[#8e857b]">
                    EDITORIALS
                  </span>
                </Link>
              </nav>
            </div>

            {/* Client Portfolio & Services */}
            <div className="space-y-3 pt-2">
              <span className="text-[9px] uppercase tracking-[0.3em] font-semibold text-[#8e857b] block">
                CLIENT SERVICES & SALONS
              </span>

              <div className="space-y-1.5 text-xs">
                <Link
                  href="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 px-3 -mx-3 rounded-none text-[#1a1714] hover:text-[#a11826] hover:bg-white flex items-center justify-between transition-colors"
                >
                  <span className="tracking-wider uppercase font-medium">
                    {session?.user ? 'Client Portfolio' : 'Client Identification / Sign In'}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 bg-[#1a1714] text-white font-mono tracking-wider">
                    {session?.user ? 'AUTHENTICATED' : 'ACCOUNT'}
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2.5 px-3 -mx-3 rounded-none text-[#8c6b2d] hover:bg-[#d4af6a]/10 flex items-center justify-between transition-colors border-l-2 border-[#d4af6a]"
                  >
                    <span className="tracking-wider uppercase font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4af6a] animate-pulse" />
                      <span>Admin Management Console</span>
                    </span>
                    <span className="text-[8px] px-2 py-0.5 bg-[#d4af6a]/20 text-[#8c6b2d] font-mono font-medium">
                      ADMIN
                    </span>
                  </Link>
                )}

                <Link
                  href="/#concierge"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 px-3 -mx-3 text-[#5c544d] hover:text-[#1a1714] hover:bg-white flex items-center justify-between transition-colors"
                >
                  <span className="tracking-wider uppercase font-medium">
                    Private Salon Appointments & Inquiries
                  </span>
                  <span className="text-xs">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Drawer Bottom Concierge Footer */}
          <div className="p-6 sm:p-8 border-t border-[#e8e3db] bg-white space-y-3">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-[#8e857b]">
              <span>PERSONAL CONCIERGE</span>
              <span>PARIS · NYC · FIRENZE</span>
            </div>
            <div className="text-xs text-[#1a1714] space-y-1">
              <p className="font-mono text-[11px]">+33 (0)1 42 68 00 00</p>
              <p className="text-[#787065] text-[11px]">concierge@maison-atelier.com</p>
            </div>
            <div className="pt-2 flex items-center justify-between text-[9px] tracking-[0.2em] uppercase text-[#8e857b] border-t border-[#e8e3db]/60">
              <span>EN (GLOBAL)</span>
              <span>USD ($)</span>
              <span>WHITE-GLOVE INCLUDED</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

