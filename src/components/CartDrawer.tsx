'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, cartTotal, cartCount } = useStore();

  if (!isCartOpen) return null;

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
          <div className="p-6 border-b border-[#e8e3db] flex items-center justify-between">
            <div>
              <span className="font-serif text-2xl text-[#1a1714]">Shopping Bag</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b] block mt-0.5">
                {cartCount} {cartCount === 1 ? 'Creation' : 'Creations'} Selected
              </span>
            </div>
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

          {/* Cart Items list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <p className="font-serif text-xl text-[#8e857b]">Your bag is currently empty.</p>
                <p className="text-xs text-[#8e857b] font-light max-w-xs mx-auto">
                  Discover our permanent collection of handcrafted leather goods and ready-to-wear tailoring.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-4 px-6 py-3 bg-[#1a1714] text-white text-[10px] tracking-[0.2em] uppercase hover:bg-[#a11826] transition-colors"
                >
                  Explore Creations
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.size}-${index}`}
                  className="flex gap-4 pb-6 border-b border-[#e8e3db]/70"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 aspect-[3/4] bg-[#f2ede6] flex-shrink-0 border border-[#e8e3db]">
                    <Image
                      src={item.product.primaryImage}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Item info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-base text-[#1a1714]">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          className="text-[#8e857b] hover:text-[#a11826] p-1"
                          aria-label="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[10px] tracking-wider uppercase text-[#8e857b] mt-0.5">
                        {item.size || 'Standard'} · Qty: {item.quantity}
                      </p>
                      <p className="text-[10px] text-[#5c544d] truncate mt-1">
                        {item.product.material}
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-3">
                      <span className="font-mono text-xs font-semibold text-[#1a1714]">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#e8e3db] bg-[#f5f2ed] space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b]">
                  Subtotal (Excl. Tax)
                </span>
                <span className="font-mono text-lg font-medium text-[#1a1714]">
                  ${cartTotal.toLocaleString()}
                </span>
              </div>

              <div className="text-[10px] text-[#5c544d] space-y-1">
                <p>✓ White-Glove Complimentary Shipping Included</p>
                <p>✓ Signature Maison Presentation Packaging</p>
              </div>

              <button
                type="button"
                className="w-full py-4 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-[#a11826] transition-colors"
              >
                Proceed to Checkout
              </button>

              <button
                type="button"
                onClick={closeCart}
                className="w-full py-3 bg-transparent border border-[#d8d0c5] text-[#1a1714] text-[10px] uppercase tracking-[0.2em] font-medium hover:border-[#1a1714] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
