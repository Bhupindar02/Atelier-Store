'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    cartWarnings,
    isValidatingCart,
    refreshCartValidation,
  } = useStore();

  if (!isCartOpen) return null;

  const complimentaryShippingThreshold = 500;
  const isComplimentaryShipping = cartTotal >= complimentaryShippingThreshold;
  const amountToFreeShipping = Math.max(0, complimentaryShippingThreshold - cartTotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf9f7] shadow-2xl flex flex-col border-l border-[#e8e3db]">
          {/* Header */}
          <div className="p-6 border-b border-[#e8e3db] flex items-center justify-between bg-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl text-[#1a1714]">Shopping Bag</span>
                {isValidatingCart && (
                  <span className="w-2 h-2 rounded-full bg-[#d4af6a] animate-ping" title="Validating live stock..." />
                )}
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b] block mt-0.5">
                {cartCount} {cartCount === 1 ? 'Creation' : 'Creations'} Selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={refreshCartValidation}
                  disabled={isValidatingCart}
                  className="p-2 text-[#787065] hover:text-[#1a1714] text-[10px] uppercase tracking-wider"
                  title="Refresh stock and pricing"
                  aria-label="Refresh bag stock"
                >
                  <svg className={`w-4 h-4 ${isValidatingCart ? 'animate-spin text-[#d4af6a]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.3" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={closeCart}
                className="p-2 text-[#1a1714] hover:text-[#a11826] transition-colors"
                aria-label="Close bag"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Complimentary Shipping Progress Notice */}
          {cart.length > 0 && (
            <div className="px-6 py-2.5 bg-[#f3efe8] border-b border-[#e8e3db] text-[10px] uppercase tracking-wider flex items-center justify-between">
              {isComplimentaryShipping ? (
                <span className="text-[#1a3d2e] font-medium flex items-center gap-1.5">
                  <span className="text-emerald-700">✓</span>
                  <span>White-Glove Courier Delivery Included</span>
                </span>
              ) : (
                <span className="text-[#5c544d]">
                  Add ${amountToFreeShipping.toLocaleString()} for Complimentary Delivery
                </span>
              )}
              <span className="font-mono text-[#8e857b]">$500+</span>
            </div>
          )}

          {/* Warnings Banner */}
          {cartWarnings.length > 0 && (
            <div className="p-4 bg-[#fff3f2] border-b border-[#a11826]/20 text-[#a11826] text-xs space-y-1">
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

          {/* Cart Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 mx-auto bg-[#f3efe8] border border-[#e8e3db] flex items-center justify-center text-[#8e857b]">
                  <svg className="w-6 h-6 stroke-[1.2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.67 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.56 0 1.036.41 1.119.957Z" />
                  </svg>
                </div>
                <p className="font-serif text-xl text-[#1a1714]">Your bag is currently empty.</p>
                <p className="text-xs text-[#8e857b] font-light max-w-xs mx-auto leading-relaxed">
                  Discover our permanent collection of handcrafted leather goods, bespoke tailoring, and runway creations.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-4 px-6 py-3 bg-[#1a1714] text-white text-[10px] tracking-[0.2em] uppercase hover:bg-[#a11826] transition-colors cursor-pointer"
                >
                  Explore Creations
                </button>
              </div>
            ) : (
              cart.map((item, index) => {
                const isAtMaxStock = item.quantity >= item.maxAvailable;
                const isLowStock = item.maxAvailable > 0 && item.maxAvailable <= 3;

                return (
                  <div
                    key={`${item.productId}-${item.size}-${index}`}
                    className="flex gap-4 pb-6 border-b border-[#e8e3db]/80 transition-all"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${item.productId}`}
                      onClick={closeCart}
                      className="relative w-20 aspect-[3/4] bg-[#f2ede6] flex-shrink-0 border border-[#e8e3db] group overflow-hidden"
                    >
                      <Image
                        src={item.product.primaryImage}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Item info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/products/${item.productId}`}
                            onClick={closeCart}
                            className="font-serif text-base text-[#1a1714] hover:text-[#a11826] transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId, item.size)}
                            className="text-[#8e857b] hover:text-[#a11826] p-1 transition-colors cursor-pointer"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] tracking-wider uppercase text-[#8e857b]">
                            {item.size || 'Standard'}
                          </span>
                          <span className="text-[#8e857b]/50">·</span>
                          <span className="text-[10px] text-[#5c544d] font-mono">
                            ${item.product.price.toLocaleString()} each
                          </span>
                        </div>

                        {/* Inventory & Stock Constraints */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {isLowStock && (
                            <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]/30">
                              Only {item.maxAvailable} Remaining
                            </span>
                          )}
                          {isAtMaxStock && (
                            <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 bg-[#faf9f7] text-[#787065] border border-[#d6cfc5]">
                              Max Allocation
                            </span>
                          )}
                          {item.warning && (
                            <span className="text-[10px] text-[#a11826] font-light block">
                              {item.warning}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper & Line Price */}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#e8e3db]/40">
                        {/* Interactive Quantity Stepper */}
                        <div className="flex items-center border border-[#d6cfc5] bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-xs text-[#1a1714] hover:bg-[#f2ede6] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            {item.quantity === 1 ? '✕' : '−'}
                          </button>
                          <span className="w-8 text-center text-xs font-mono font-medium text-[#1a1714]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            disabled={isAtMaxStock}
                            className="w-7 h-7 flex items-center justify-center text-xs text-[#1a1714] hover:bg-[#f2ede6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                            title={isAtMaxStock ? `Max available in stock (${item.maxAvailable})` : 'Increase'}
                          >
                            +
                          </button>
                        </div>

                        {/* Authoritative Line Total */}
                        <span className="font-mono text-sm font-semibold text-[#1a1714]">
                          ${(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#e8e3db] bg-white space-y-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b] block">
                    Authoritative Subtotal
                  </span>
                  <span className="text-[10px] text-[#787065] font-light">
                    Excludes local sales tax · Verified with Atelier ledger
                  </span>
                </div>
                <span className="font-mono text-xl font-medium text-[#1a1714]">
                  ${cartTotal.toLocaleString()}
                </span>
              </div>

              <div className="text-[10px] text-[#5c544d] space-y-1 bg-[#faf9f7] p-3 border border-[#e8e3db]">
                <p className="flex items-center gap-1.5">
                  <span className="text-[#a11826]">✦</span>
                  <span>Complimentary armored courier packaging included</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="text-[#a11826]">✦</span>
                  <span>Certificate of Authenticity issued with each numbered SKU</span>
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-4 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-[#a11826] transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <span>Proceed to Checkout</span>
                  <span className="text-xs">→</span>
                </Link>

                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-3 bg-[#faf9f7] border border-[#d6cfc5] text-[#1a1714] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a1714] hover:text-white hover:border-[#1a1714] transition-colors flex items-center justify-center gap-2"
                >
                  <span>View Full Bag Page</span>
                  <span className="text-xs">↗</span>
                </Link>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={closeCart}
                    className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#787065] hover:text-[#1a1714] underline underline-offset-4 cursor-pointer"
                  >
                    Continue Browsing
                  </button>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#a11826] hover:underline cursor-pointer"
                  >
                    Empty Bag
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
