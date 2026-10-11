import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SignInForm from '@/components/SignInForm';

export const metadata: Metadata = {
  title: 'Client Sign In | Maison Atelier',
  description: 'Access your private client portfolio, orders, and saved masterworks at Maison Atelier.',
};

function SignInFallback() {
  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-[#e8e3db] p-8 sm:p-12 animate-pulse space-y-6">
      <div className="h-4 bg-[#e8e3db] w-28 mx-auto" />
      <div className="h-8 bg-[#e8e3db] w-48 mx-auto" />
      <div className="h-3 bg-[#e8e3db] w-64 mx-auto" />
      <div className="space-y-4 pt-4">
        <div className="h-11 bg-[#faf9f7] border border-[#e8e3db]" />
        <div className="h-11 bg-[#faf9f7] border border-[#e8e3db]" />
        <div className="h-12 bg-[#1a1714]/20" />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col justify-between">
      {/* Top Breadcrumb & Return Bar */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-6 flex items-center justify-between text-xs border-b border-[#e8e3db]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-[#787065] hover:text-[#1a1714] transition-colors"
        >
          <span>←</span>
          <span>Return to Boutique</span>
        </Link>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b]">
          PARIS · FIRENZE · NEW YORK
        </span>
      </div>

      {/* Main Dual-Panel Editorial Content */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center flex-1">
        {/* Left Column: Heritage & Salon Privileges */}
        <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-px bg-[#d4af6a]" />
              <span className="text-[10px] tracking-[0.35em] uppercase font-semibold text-[#8e857b]">
                SALONS PRIVÉS
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1a1714] leading-[1.15]">
              The Private Client Circle
            </h1>
            <p className="text-sm text-[#787065] font-light leading-relaxed max-w-lg">
              Welcome to the digital salon of Maison Atelier. Sign in to access your archival wishlist, tailored sizing consultations, and acquisition provenance.
            </p>
          </div>

          {/* Privilege Pillars */}
          <div className="space-y-4 pt-2 border-t border-[#e8e3db]">
            <div className="flex items-start gap-4">
              <span className="text-sm text-[#d4af6a] font-serif shrink-0 mt-0.5">01</span>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-medium text-[#1a1714]">
                  Archival Reservations
                </h4>
                <p className="text-xs text-[#787065] font-light mt-0.5">
                  Exclusive early access to limited numbered editions and couture runway silhouettes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-sm text-[#d4af6a] font-serif shrink-0 mt-0.5">02</span>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-medium text-[#1a1714]">
                  Dedicated Salon Concierge
                </h4>
                <p className="text-xs text-[#787065] font-light mt-0.5">
                  Direct appointment scheduling with private salons on Rue Saint-Honoré and Via de&apos; Tornabuoni.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-sm text-[#d4af6a] font-serif shrink-0 mt-0.5">03</span>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-medium text-[#1a1714]">
                  White-Glove Logistics
                </h4>
                <p className="text-xs text-[#787065] font-light mt-0.5">
                  Temperature-controlled, armored courier delivery with personal doorstep presentation.
                </p>
              </div>
            </div>
          </div>

          {/* Artisan Epigraph */}
          <div className="p-6 bg-[#f3efe8] border-l-2 border-[#d4af6a] space-y-1">
            <p className="font-serif italic text-sm text-[#3a3530]">
              &ldquo;True luxury is not merely possessed; it is a shared intimacy with the artisans who gave it form.&rdquo;
            </p>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8e857b] block pt-1">
              — Atelier Valmont Master Craftsman
            </span>
          </div>
        </div>

        {/* Right Column: High-Performance Sign-In Card */}
        <div className="lg:col-span-6 w-full">
          <Suspense fallback={<SignInFallback />}>
            <SignInForm />
          </Suspense>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="border-t border-[#e8e3db] py-6 text-center text-[10px] uppercase tracking-[0.2em] text-[#8e857b]">
        <span>Maison Atelier · Haute Maroquinerie & Prêt-à-Porter</span>
      </div>
    </div>
  );
}
