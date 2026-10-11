import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import SignUpForm from '@/components/SignUpForm';

export const metadata: Metadata = {
  title: 'Client Registration | Maison Atelier',
  description: 'Create a private client account with Maison Atelier for bespoke consultations and exclusive previews.',
};

function SignUpFallback() {
  return (
    <div className="w-full max-w-lg mx-auto bg-white border border-[#e8e3db] p-8 sm:p-12 animate-pulse space-y-6">
      <div className="h-4 bg-[#e8e3db] w-28 mx-auto" />
      <div className="h-8 bg-[#e8e3db] w-48 mx-auto" />
      <div className="h-3 bg-[#e8e3db] w-64 mx-auto" />
      <div className="space-y-4 pt-4">
        <div className="h-11 bg-[#faf9f7] border border-[#e8e3db]" />
        <div className="h-11 bg-[#faf9f7] border border-[#e8e3db]" />
        <div className="h-11 bg-[#faf9f7] border border-[#e8e3db]" />
        <div className="h-12 bg-[#1a1714]/20" />
      </div>
    </div>
  );
}

export default function SignUpPage() {
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
          MAISON ATELIER · COMPLIMENTARY MEMBERSHIP
        </span>
      </div>

      {/* Main Dual-Panel Editorial Content */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center flex-1">
        {/* Left Column: Heritage & Invitation */}
        <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-px bg-[#d4af6a]" />
              <span className="text-[10px] tracking-[0.35em] uppercase font-semibold text-[#8e857b]">
                MEMBERSHIP INVITATION
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1a1714] leading-[1.15]">
              Begin Your Journey with the Maison
            </h1>
            <p className="text-sm text-[#787065] font-light leading-relaxed max-w-lg">
              Registration opens our private salons to you. Curate your personal portfolio, receive bespoke leather care advice, and safeguard your acquisition certificates.
            </p>
          </div>

          {/* Exclusive Services */}
          <div className="space-y-4 pt-2 border-t border-[#e8e3db]">
            <div className="flex items-start gap-4">
              <span className="text-sm text-[#d4af6a] font-serif shrink-0 mt-0.5">✦</span>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-medium text-[#1a1714]">
                  Bespoke Monogramming & Patina
                </h4>
                <p className="text-xs text-[#787065] font-light mt-0.5">
                  Complimentary artisan hot-stamping and custom leather patina finishing on all leather goods.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-sm text-[#d4af6a] font-serif shrink-0 mt-0.5">✦</span>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-medium text-[#1a1714]">
                  Certificate of Authenticity Vault
                </h4>
                <p className="text-xs text-[#787065] font-light mt-0.5">
                  Permanent digital archival proof of origin, leather tannery provenance, and serial numbers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-sm text-[#d4af6a] font-serif shrink-0 mt-0.5">✦</span>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-medium text-[#1a1714]">
                  Private Fitting Appointments
                </h4>
                <p className="text-xs text-[#787065] font-light mt-0.5">
                  One-on-one appointments with our master tailors at our boutique salons or private residence.
                </p>
              </div>
            </div>
          </div>

          {/* Heritage Assurance */}
          <div className="p-6 bg-[#f3efe8] border-l-2 border-[#d4af6a] space-y-1">
            <p className="font-serif italic text-sm text-[#3a3530]">
              &ldquo;An Atelier creation is not fashion that passes, but a heirloom designed to outlive the era.&rdquo;
            </p>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8e857b] block pt-1">
              — Florentine Guild Standard, 1928
            </span>
          </div>
        </div>

        {/* Right Column: High-Performance Sign-Up Card */}
        <div className="lg:col-span-6 w-full">
          <Suspense fallback={<SignUpFallback />}>
            <SignUpForm />
          </Suspense>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="border-t border-[#e8e3db] py-6 text-center text-[10px] uppercase tracking-[0.2em] text-[#8e857b]">
        <span>Maison Atelier · Confidential Client Portfolio</span>
      </div>
    </div>
  );
}
