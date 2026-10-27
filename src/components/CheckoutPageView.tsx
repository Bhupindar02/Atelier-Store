'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useSession } from '@/lib/auth-client';

export default function CheckoutPageView() {
  const searchParams = useSearchParams();
  const isCancelled =
    searchParams.get('cancelled') === 'true' ||
    searchParams.get('checkout_cancelled') === 'true';

  const { data: session } = useSession();
  const {
    cart,
    cartTotal,
    cartCount,
    cartWarnings,
    isValidatingCart,
    refreshCartValidation,
  } = useStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictItem, setConflictItem] = useState<{
    message: string;
  } | null>(null);
  const [showCancelledNotice, setShowCancelledNotice] = useState(isCancelled);

  const shippingThreshold = 500;
  const isComplimentaryShipping = cartTotal >= shippingThreshold;
  const shippingFee = isComplimentaryShipping ? 0 : 120;
  const finalTotal = cartTotal + shippingFee;

  const handleInitiateCheckout = async () => {
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    setErrorMessage(null);
    setConflictItem(null);
    setCheckoutStep('Revalidating Atelier ledger & archive stock...');

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
        })),
      };

      setCheckoutStep('Securing encrypted Stripe payment session...');

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 409 || data.conflict) {
          setConflictItem({
            message:
              data.message ||
              'One or more pieces exceed available inventory. Please adjust your quantity.',
          });
          await refreshCartValidation();
        } else {
          setErrorMessage(
            data.message || 'Unable to initialize payment gateway. Please try again.'
          );
        }
        setIsCheckingOut(false);
        setCheckoutStep('');
        return;
      }

      setCheckoutStep('Redirecting to secure Stripe payment gateway...');

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Checkout URL was not returned by gateway.');
      }
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      setErrorMessage(
        'A network interruption occurred while connecting to the payment processor. Please retry.'
      );
      setIsCheckingOut(false);
      setCheckoutStep('');
    }
  };

  // ── Empty Bag State ──────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#faf9f7] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#e8e3db] p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#faf9f7] border border-[#e8e3db] flex items-center justify-center text-[#d4af6a] font-serif text-2xl">
            ✦
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b] font-medium block">
              Maison Ledger
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#1a1714]">
              Your Acquisition Bag is Empty
            </h1>
            <p className="text-xs text-[#787065] leading-relaxed max-w-xs mx-auto">
              You have not added any pieces to your acquisition bag. Explore our collections to reserve handcrafted creations.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-[#a11826] transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] py-10 sm:py-16">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e8e3db]">
          <div className="space-y-1">
            <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-medium text-[#8e857b]">
              <Link href="/" className="hover:text-[#1a1714] transition-colors">
                Maison Atelier
              </Link>
              <span>/</span>
              <Link href="/cart" className="hover:text-[#1a1714] transition-colors">
                Bag
              </Link>
              <span>/</span>
              <span className="text-[#1a1714]">Secure Checkout</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1a1714]">
              Finalize Acquisition
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {isValidatingCart && (
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#d4af6a] flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 border border-[#d4af6a] border-t-transparent rounded-full animate-spin" />
                <span>Syncing Ledger...</span>
              </span>
            )}
            <span className="font-mono text-xs text-[#787065]">
              {cartCount} Piece{cartCount === 1 ? '' : 's'} Selected
            </span>
            <Link
              href="/cart"
              className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#8e857b] hover:text-[#1a1714] transition-colors underline underline-offset-4"
            >
              Modify Bag
            </Link>
          </div>
        </div>

        {/* ── Cart Warnings from Inventory Ledger ─────────── */}
        {cartWarnings.length > 0 && (
          <div className="p-4 bg-[#fffbeb] border border-[#f59e0b]/40 text-[#92400e] text-xs space-y-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] block">
              Ledger Allocation Notice
            </span>
            {cartWarnings.map((warning, idx) => (
              <p key={idx} className="font-light">{warning}</p>
            ))}
          </div>
        )}

        {/* ── Cancellation Notice ─────────────────────────── */}
        {showCancelledNotice && (
          <div
            id="checkout-cancelled-notice"
            className="p-4 bg-[#fffbeb] border border-[#f59e0b]/40 text-[#92400e] text-xs flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="text-[#d97706] font-serif text-lg leading-none mt-0.5">✦</span>
              <div className="space-y-0.5">
                <p className="font-semibold uppercase tracking-wider text-[11px]">
                  Acquisition Session Suspended
                </p>
                <p className="font-light text-[#78350f]">
                  Your payment was not completed at Stripe checkout. Your selected creations and archive allocations remain safely preserved in your bag.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCancelledNotice(false)}
              className="text-[#92400e] hover:text-[#1a1714] text-sm font-bold cursor-pointer px-2"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Conflict / Stock Failure Alert ─────────────── */}
        {conflictItem && (
          <div
            id="checkout-conflict-notice"
            className="p-5 bg-[#fef2f2] border border-[#f87171]/50 text-[#a11826] text-xs space-y-2 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">⚠</span>
              <p className="font-semibold uppercase tracking-wider text-[11px]">
                Inventory Allocation Notice
              </p>
            </div>
            <p className="font-light leading-relaxed">{conflictItem.message}</p>
            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/cart"
                className="inline-block px-4 py-2 bg-[#a11826] text-white text-[10px] uppercase tracking-wider font-medium hover:bg-[#85131f] transition-colors"
              >
                Return to Bag & Adjust
              </Link>
              <button
                type="button"
                onClick={() => setConflictItem(null)}
                className="text-[10px] uppercase tracking-wider text-[#a11826] underline underline-offset-4 cursor-pointer"
              >
                Dismiss Notice
              </button>
            </div>
          </div>
        )}

        {/* ── Generic Gateway Error Banner ────────────────── */}
        {errorMessage && (
          <div
            id="checkout-error-notice"
            className="p-5 bg-[#fef2f2] border border-[#f87171]/50 text-[#a11826] text-xs space-y-2 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">✕</span>
              <p className="font-semibold uppercase tracking-wider text-[11px]">
                Payment Gateway Communication Error
              </p>
            </div>
            <p className="font-light">{errorMessage}</p>
            <button
              type="button"
              onClick={handleInitiateCheckout}
              className="mt-1 px-4 py-2 bg-[#1a1714] text-white text-[10px] uppercase tracking-wider font-medium hover:bg-[#a11826] transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* ── Main Two-Column Layout ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Client Credentials & Guarantees */}
          <div className="lg:col-span-7 space-y-8">
            {/* Client Profile Card */}
            <div className="bg-white border border-[#e8e3db] p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-baseline border-b border-[#e8e3db] pb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b] font-medium">
                  Client Credentials
                </span>
                {session?.user ? (
                  <span className="text-[9px] uppercase tracking-widest font-mono text-[#1a3d2e] bg-[#f0fdf4] px-2 py-0.5 border border-[#16a34a]/30">
                    Privileged Client Session
                  </span>
                ) : (
                  <Link
                    href={`/auth/sign-in?callbackUrl=${encodeURIComponent('/checkout')}`}
                    className="text-[10px] uppercase tracking-wider text-[#a11826] hover:underline"
                  >
                    Sign In for Account Privileges →
                  </Link>
                )}
              </div>

              {session?.user ? (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#1a1714] text-[#d4af6a] flex items-center justify-center font-serif text-lg shrink-0">
                    {session.user.name?.[0] || '✦'}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#1a1714] font-serif">
                      {session.user.name}
                    </p>
                    <p className="text-xs font-mono text-[#787065]">{session.user.email}</p>
                    <p className="text-[10px] text-[#8e857b] font-light">
                      This purchase will be registered under your client portfolio.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#5c544d] leading-relaxed">
                    You are checking out as a <strong>Guest Collector</strong>. Your email and shipping address will be securely recorded via Stripe Checkout to generate your sealed certificate of authenticity.
                  </p>
                  <p className="text-[10px] text-[#8e857b]">
                    Have an Atelier portfolio?{' '}
                    <Link
                      href={`/auth/sign-in?callbackUrl=${encodeURIComponent('/checkout')}`}
                      className="text-[#1a1714] font-medium underline underline-offset-4"
                    >
                      Authenticate here
                    </Link>{' '}
                    to link this numbered SKU.
                  </p>
                </div>
              )}
            </div>

            {/* Delivery & Logistics Protocol */}
            <div className="bg-white border border-[#e8e3db] p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#e8e3db] pb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b] font-medium block">
                  Logistics Protocol
                </span>
                <h3 className="font-serif text-lg font-light text-[#1a1714] mt-1">
                  White-Glove Armored Courier
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#faf9f7] border border-[#e8e3db] space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-mono text-[#8e857b] block">
                    Transit Standard
                  </span>
                  <p className="font-medium text-[#1a1714]">2–4 Business Days</p>
                  <p className="text-[10px] text-[#787065] font-light">
                    Direct hand-delivery requiring recipient signature.
                  </p>
                </div>
                <div className="p-4 bg-[#faf9f7] border border-[#e8e3db] space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-mono text-[#8e857b] block">
                    Packaging Protocol
                  </span>
                  <p className="font-medium text-[#1a1714]">Armored & Wax-Sealed</p>
                  <p className="text-[10px] text-[#787065] font-light">
                    Discrete tamper-evident casing with archival tissue.
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-[#8e857b] font-light">
                Destination address and recipient details will be entered and validated on the next step via Stripe&apos;s encrypted interface.
              </p>
            </div>

            {/* Maison Guarantees */}
            <div className="bg-[#181714] text-[#f5f2eb] border border-[#2b2823] p-6 sm:p-8 space-y-5">
              <span className="text-[9px] tracking-[0.25em] uppercase font-semibold text-[#d4af6a] block">
                MAISON ATELIER GUARANTEES
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#a0978d] font-light">
                <div className="space-y-1">
                  <span className="text-[#d4af6a] text-sm block">✦</span>
                  <strong className="text-white block font-normal">Authenticity Certificate</strong>
                  <p className="text-[10px]">Signed archival documentation with every numbered SKU.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#d4af6a] text-sm block">✦</span>
                  <strong className="text-white block font-normal">30-Day Salon Return</strong>
                  <p className="text-[10px]">Complimentary white-glove returns across global boutiques.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#d4af6a] text-sm block">✦</span>
                  <strong className="text-white block font-normal">Paris Restoration</strong>
                  <p className="text-[10px]">Lifetime evaluation at our Parisian archival atelier.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Acquisition Ledger & Action */}
          <div className="lg:col-span-5 space-y-6 sticky top-8">
            <div className="bg-white border border-[#e8e3db] p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="border-b border-[#e8e3db] pb-4 flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b] font-medium">
                  Acquisition Ledger
                </span>
                <span className="font-mono text-xs text-[#787065]">
                  {cartCount} item{cartCount === 1 ? '' : 's'}
                </span>
              </div>

              {/* Itemized Piece List */}
              <div className="divide-y divide-[#e8e3db] max-h-80 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.size}-${idx}`}
                    className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                  >
                    <div className="relative w-16 h-20 bg-[#f2ede6] border border-[#e8e3db] shrink-0 overflow-hidden">
                      {item.product.primaryImage ? (
                        <Image
                          src={item.product.primaryImage}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#8e857b]">
                          ✦
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-[#8e857b] font-mono block">
                        SKU: {item.product.sku}
                      </span>
                      <h4 className="font-serif text-sm font-light text-[#1a1714] truncate">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-[#787065] font-light">
                          Size: {item.size || 'One Size'} · Qty: {item.quantity}
                        </p>
                        {item.maxAvailable <= 0 && (
                          <span className="text-[8px] uppercase tracking-wider font-mono px-1.5 py-0.5 bg-[#fce8e6] text-[#a11826] border border-[#a11826]/30">
                            Sold Out · Please Remove
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-semibold text-[#1a1714] block">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-[#8e857b] font-mono">
                        ${item.product.price.toLocaleString()} ea
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-3 pt-4 border-t border-[#e8e3db] text-xs">
                <div className="flex justify-between text-[#5c544d]">
                  <span>Authoritative Subtotal</span>
                  <span className="font-mono text-[#1a1714] font-medium">
                    ${cartTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-[#5c544d]">
                  <span>White-Glove Armored Courier</span>
                  <span className="font-mono text-[#1a3d2e] font-medium">
                    {isComplimentaryShipping ? 'COMPLIMENTARY' : '$120'}
                  </span>
                </div>

                <div className="flex justify-between text-[#5c544d]">
                  <span>Archival Wax-Sealed Packaging</span>
                  <span className="font-mono text-[#1a3d2e]">INCLUDED</span>
                </div>

                <div className="pt-3 border-t border-[#e8e3db] flex justify-between items-baseline">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#1a1714] block">
                      Total Acquisition Due
                    </span>
                    <span className="text-[9px] text-[#8e857b] font-light">
                      Settled via Stripe · Excl. Local Import Tax
                    </span>
                  </div>
                  <span className="font-mono text-2xl font-medium text-[#1a1714]">
                    ${finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Active Step Progress (When Loading) */}
              {isCheckingOut && checkoutStep && (
                <div className="p-4 bg-[#faf9f7] border border-[#d4af6a]/50 text-xs space-y-2">
                  <div className="flex items-center gap-2.5 text-[#1a1714]">
                    <div className="w-3.5 h-3.5 border-2 border-[#d4af6a] border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="font-medium">{checkoutStep}</span>
                  </div>
                  <p className="text-[10px] text-[#787065] pl-6 font-light">
                    Communicating with Maison ledger and Stripe payment network.
                  </p>
                </div>
              )}

              {/* Primary Checkout Action CTA */}
              {cart.some((item) => item.maxAvailable <= 0) ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-4 bg-[#e8e3db] text-[#8e857b] text-[11px] uppercase tracking-[0.22em] font-medium cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm"
                >
                  <span>Remove Sold Out Pieces to Finalize Acquisition</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="initiate-stripe-checkout-button"
                  onClick={handleInitiateCheckout}
                  disabled={isCheckingOut || cart.length === 0}
                  className="w-full py-4 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-[#a11826] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connecting to Stripe...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Stripe Payment</span>
                      <span className="text-sm">→</span>
                    </>
                  )}
                </button>
              )}

              <div className="text-center space-y-1">
                <p className="text-[10px] text-[#8e857b] font-light flex items-center justify-center gap-1.5">
                  <span>🔒</span>
                  <span>End-to-End 256-Bit Encrypted Transaction</span>
                </p>
                <p className="text-[9px] text-[#a0978d] font-mono">
                  Maison Atelier accepts Visa, Mastercard, Amex, Apple Pay & Google Pay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
