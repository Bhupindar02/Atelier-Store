'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { PRODUCTS } from '@/data/fashion-data';

export default function CartPageView() {
  const searchParams = useSearchParams();
  const isCancelled = searchParams.get('checkout_cancelled') === 'true';

  const [showCancelledBanner, setShowCancelledBanner] = useState(isCancelled);
  const {
    cart,
    cartTotal,
    cartCount,
    cartWarnings,
    isValidatingCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCartValidation,
    addToCart,
  } = useStore();

  const complimentaryShippingThreshold = 500;
  const isComplimentaryShipping = cartTotal >= complimentaryShippingThreshold;
  const amountToFreeShipping = Math.max(0, complimentaryShippingThreshold - cartTotal);

  // Recommendations for empty bag
  const curatedRecommendations = PRODUCTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#faf9f7] py-10 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-8">
        {/* Cancellation Notice Banner */}
        {showCancelledBanner && (
          <div className="p-4 bg-[#fffbeb] border border-[#f59e0b]/40 text-[#92400e] text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[#d97706] font-serif text-base">✦</span>
              <p>
                <strong>Acquisition Cancelled at Checkout.</strong> Your private selection remains intact in your bag and stock allocations are preserved.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCancelledBanner(false)}
              className="text-[#92400e] hover:text-[#1a1714] text-sm font-bold cursor-pointer"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        )}

        {/* Breadcrumb & Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e8e3db]">
          <div className="space-y-1">
            <nav className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-medium text-[#8e857b]">
              <Link href="/" className="hover:text-[#1a1714] transition-colors">
                Maison Atelier
              </Link>
              <span>/</span>
              <span className="text-[#1a1714]">Shopping Bag</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1a1714]">
              Your Private Selection
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={refreshCartValidation}
                disabled={isValidatingCart}
                className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-[#787065] hover:text-[#1a1714] transition-colors cursor-pointer"
              >
                <svg
                  className={`w-3.5 h-3.5 ${isValidatingCart ? 'animate-spin text-[#d4af6a]' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.3" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>{isValidatingCart ? 'Validating Stock…' : 'Sync Inventory'}</span>
              </button>
            )}

            <Link
              href="/collections"
              className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1714] hover:text-[#a11826] underline underline-offset-4"
            >
              Continue Browsing →
            </Link>
          </div>
        </div>

        {/* Live Inventory Warning Banner */}
        {cartWarnings.length > 0 && (
          <div className="p-4 bg-[#fff3f2] border-l-2 border-[#a11826] text-[#a11826] text-xs space-y-1 animate-fadeIn">
            <span className="text-[10px] uppercase tracking-wider font-semibold block">
              Atelier Inventory Notice
            </span>
            {cartWarnings.map((warning, wIdx) => (
              <p key={wIdx} className="font-light text-[11px] leading-relaxed">
                • {warning}
              </p>
            ))}
          </div>
        )}

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="space-y-16 py-12">
            <div className="text-center max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto bg-white border border-[#e8e3db] flex items-center justify-center text-[#8e857b] shadow-sm">
                <svg className="w-8 h-8 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.56 0 1.036.41 1.119.957Z" />
                </svg>
              </div>
              <h2 className="font-serif text-3xl font-light text-[#1a1714]">
                Your Shopping Bag is Empty
              </h2>
              <p className="text-xs text-[#787065] font-light leading-relaxed">
                You have not selected any masterworks yet. Discover our latest seasonal debuts or timeless permanent leather collection.
              </p>
              <div className="pt-2 flex justify-center gap-4">
                <Link
                  href="/new-arrivals"
                  className="px-6 py-3.5 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors"
                >
                  Explore New Arrivals
                </Link>
                <Link
                  href="/collections"
                  className="px-6 py-3.5 border border-[#d6cfc5] text-[#1a1714] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-white transition-colors"
                >
                  Browse Collections
                </Link>
              </div>
            </div>

            {/* Curated Recommendations */}
            <div className="space-y-6 pt-12 border-t border-[#e8e3db]">
              <div className="text-center space-y-1">
                <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#8e857b]">
                  RECOMMENDED FOR YOU
                </span>
                <h3 className="font-serif text-2xl font-light text-[#1a1714]">
                  Permanent Collection Masterworks
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {curatedRecommendations.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white border border-[#e8e3db] p-4 flex flex-col justify-between group hover:shadow-lg transition-shadow"
                  >
                    <Link href={`/products/${prod.id}`} className="relative aspect-[3/4] bg-[#f2ede6] overflow-hidden block">
                      <Image
                        src={prod.primaryImage}
                        alt={prod.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="pt-4 space-y-1">
                      <span className="text-[9px] uppercase tracking-wider text-[#8e857b]">
                        {prod.categoryLabel}
                      </span>
                      <h4 className="font-serif text-base text-[#1a1714] line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="font-mono text-xs font-medium text-[#1a1714]">
                        {prod.formattedPrice}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => prod.stockState?.status !== 'out_of_stock' && addToCart(prod)}
                      disabled={prod.stockState?.status === 'out_of_stock'}
                      className={`mt-4 w-full py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors ${
                        prod.stockState?.status === 'out_of_stock'
                          ? 'bg-[#e8e3db] text-[#8e857b] cursor-not-allowed'
                          : 'bg-[#faf9f7] border border-[#d6cfc5] text-[#1a1714] hover:bg-[#1a1714] hover:text-white hover:border-[#1a1714] cursor-pointer'
                      }`}
                    >
                      {prod.stockState?.status === 'out_of_stock' ? 'Sold Out' : 'Acquire Creation'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Main Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left 8 Columns: Items List Table */}
            <div className="lg:col-span-8 bg-white border border-[#e8e3db] p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#e8e3db]">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8e857b]">
                  {cartCount} {cartCount === 1 ? 'Item' : 'Items'} in Your Bag
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#a11826] hover:underline cursor-pointer"
                >
                  Empty Bag
                </button>
              </div>

              <div className="divide-y divide-[#e8e3db]/80">
                {cart.map((item, idx) => {
                  const isOutOfStock = item.maxAvailable <= 0;
                  const isAtMaxStock = item.quantity >= item.maxAvailable;
                  const isLowStock = item.maxAvailable > 0 && item.maxAvailable <= 3;

                  return (
                    <div
                      key={`${item.productId}-${item.size}-${idx}`}
                      className={`py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6 items-start ${
                        isOutOfStock ? 'opacity-85' : ''
                      }`}
                    >
                      {/* High-Res Image Thumbnail */}
                      <Link
                        href={`/products/${item.productId}`}
                        className="relative w-28 sm:w-32 aspect-[3/4] bg-[#f2ede6] border border-[#e8e3db] shrink-0 overflow-hidden group"
                      >
                        <Image
                          src={item.product.primaryImage}
                          alt={item.product.name}
                          fill
                          sizes="128px"
                          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                            isOutOfStock ? 'grayscale-[20%]' : ''
                          }`}
                        />
                      </Link>

                      {/* Item Details */}
                      <div className="flex-1 w-full space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8e857b]">
                              {item.product.categoryLabel} · SKU: {item.product.sku}
                            </span>
                            <h3 className="font-serif text-lg sm:text-xl font-light text-[#1a1714]">
                              <Link
                                href={`/products/${item.productId}`}
                                className="hover:text-[#a11826] transition-colors"
                              >
                                {item.product.name}
                              </Link>
                            </h3>
                            <p className="text-xs text-[#787065] font-light">
                              {item.product.material} · {item.product.color}
                            </p>
                          </div>

                          {/* Line Total */}
                          <div className="text-left sm:text-right">
                            <span className="font-mono text-base font-semibold text-[#1a1714] block">
                              ${(item.product.price * item.quantity).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#8e857b] font-mono">
                              ${item.product.price.toLocaleString()} each
                            </span>
                          </div>
                        </div>

                        {/* Selected Size & Inventory State */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <div className="px-2.5 py-1 bg-[#faf9f7] border border-[#d6cfc5] text-[10px] uppercase tracking-wider text-[#3a3530]">
                            Size: <strong className="font-semibold">{item.size || 'Standard'}</strong>
                          </div>

                          {isOutOfStock && (
                            <span className="px-2 py-0.5 bg-[#fce8e6] text-[#a11826] border border-[#a11826]/30 text-[9px] uppercase tracking-wider font-mono">
                              Sold Out · Remove from Bag
                            </span>
                          )}

                          {!isOutOfStock && isLowStock && (
                            <span className="px-2 py-0.5 bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]/30 text-[9px] uppercase tracking-wider font-mono">
                              Only {item.maxAvailable} Pieces Available
                            </span>
                          )}

                          {!isOutOfStock && isAtMaxStock && (
                            <span className="px-2 py-0.5 bg-[#faf9f7] text-[#787065] border border-[#d6cfc5] text-[9px] uppercase tracking-wider font-mono">
                              Max Allocation Reached
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls & Remove */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#e8e3db]/50">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-wider text-[#8e857b]">
                              Quantity:
                            </span>
                            <div className="flex items-center border border-[#d6cfc5] bg-white shadow-xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center text-xs text-[#1a1714] hover:bg-[#f2ede6] transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                {item.quantity === 1 ? '✕' : '−'}
                              </button>
                              <span className="w-9 text-center text-xs font-mono font-medium text-[#1a1714]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                disabled={isAtMaxStock}
                                className="w-8 h-8 flex items-center justify-center text-xs text-[#1a1714] hover:bg-[#f2ede6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                                title={isAtMaxStock ? `Max available in stock (${item.maxAvailable})` : 'Increase'}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId, item.size)}
                            className="text-[10px] uppercase tracking-wider text-[#787065] hover:text-[#a11826] underline underline-offset-4 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 4 Columns: Sticky Order Summary Card */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <div className="bg-white border border-[#e8e3db] p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-6">
                <div>
                  <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#8e857b] block mb-1">
                    ORDER SUMMARY
                  </span>
                  <h3 className="font-serif text-2xl font-light text-[#1a1714]">
                    Estimated Total
                  </h3>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#e8e3db] text-xs">
                  <div className="flex justify-between items-center text-[#5c544d]">
                    <span>Authoritative Subtotal</span>
                    <span className="font-mono text-[#1a1714] font-medium text-sm">
                      ${cartTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#5c544d]">
                    <span>White-Glove Delivery</span>
                    <span className="font-mono text-[#1a3d2e] font-medium">
                      {isComplimentaryShipping ? 'COMPLIMENTARY' : '$120'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#5c544d]">
                    <span>Atelier Gift Packaging</span>
                    <span className="text-[#1a3d2e] font-mono">INCLUDED</span>
                  </div>

                  <div className="pt-3 border-t border-[#e8e3db] flex justify-between items-baseline">
                    <span className="text-sm uppercase tracking-wider font-semibold text-[#1a1714]">
                      Total (Excl. Tax)
                    </span>
                    <span className="font-mono text-2xl font-medium text-[#1a1714]">
                      ${(cartTotal + (isComplimentaryShipping ? 0 : 120)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Free Shipping Alert Bar */}
                <div className="p-3 bg-[#faf9f7] border border-[#e8e3db] text-[10px] space-y-1">
                  {isComplimentaryShipping ? (
                    <p className="text-[#1a3d2e] font-medium flex items-center gap-1.5">
                      <span className="text-emerald-700">✓</span>
                      <span>Complimentary insured courier delivery applied</span>
                    </p>
                  ) : (
                    <p className="text-[#787065]">
                      Add <strong>${amountToFreeShipping.toLocaleString()}</strong> more to qualify for complimentary white-glove courier shipping.
                    </p>
                  )}
                </div>

                {cart.some((item) => item.maxAvailable <= 0) ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 bg-[#e8e3db] text-[#8e857b] text-[11px] uppercase tracking-[0.22em] font-medium cursor-not-allowed flex items-center justify-center gap-2 text-center"
                  >
                    <span>Remove Sold Out Creations to Proceed</span>
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    className="w-full py-4 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-[#a11826] transition-colors flex items-center justify-center gap-2 text-center"
                  >
                    <span>Proceed to Secure Checkout</span>
                    <span className="text-xs">→</span>
                  </Link>
                )}

                <p className="text-[10px] text-[#8e857b] font-light text-center leading-relaxed">
                  Prices and quantities are verified against the Atelier inventory ledger.
                </p>
              </div>

              {/* Maison Atelier Guarantees Card */}
              <div className="bg-[#181714] text-[#f5f2eb] border border-[#2b2823] p-6 space-y-4">
                <span className="text-[9px] tracking-[0.25em] uppercase font-semibold text-[#d4af6a] block">
                  MAISON GUARANTEES
                </span>
                <div className="space-y-3 text-xs text-[#a0978d] font-light">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#d4af6a] mt-0.5">✦</span>
                    <p>Each acquisition is accompanied by a signed Certificate of Authenticity.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#d4af6a] mt-0.5">✦</span>
                    <p>Complimentary 30-day returns and exchanges across our global salons.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#d4af6a] mt-0.5">✦</span>
                    <p>Lifetime artisanal restoration evaluation at our Parisian workshop.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
