'use client';

import React from 'react';

export interface StockBadgeProps {
  status: 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock' | 'preorder';
  remaining?: number;
  label?: string;
  variant?: 'pill' | 'banner' | 'card-overlay';
  className?: string;
}

export default function StockBadge({
  status,
  remaining,
  label,
  variant = 'pill',
  className = '',
}: StockBadgeProps) {
  const isOutOfStock = status === 'out_of_stock';
  const isLowStock = status === 'low_stock';
  const isMadeToOrder = status === 'made_to_order';

  // Resolved dynamic label text
  let resolvedLabel = label;
  if (!resolvedLabel) {
    if (isOutOfStock) {
      resolvedLabel = 'Out of Stock · Archive Request';
    } else if (isLowStock) {
      resolvedLabel = typeof remaining === 'number' && remaining > 0
        ? `Only ${remaining} Available`
        : 'Low Stock · Scarcity Notice';
    } else if (isMadeToOrder) {
      resolvedLabel = 'Made to Order · Bespoke Commission';
    } else {
      resolvedLabel = 'In Stock · Atelier Ready';
    }
  }

  // Variant: Card Overlay (positioned on top-left or top-right of image frames)
  if (variant === 'card-overlay') {
    if (isOutOfStock) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#181714]/90 text-[#f5f2eb] border border-[#2b2823] text-[8px] font-mono tracking-[0.2em] uppercase backdrop-blur-xs shadow-sm ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#a0978d]" />
          <span>Sold Out · Archive</span>
        </span>
      );
    }

    if (isLowStock) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fdf2f2]/95 text-[#a11826] border border-[#a11826]/30 text-[8px] font-mono tracking-[0.2em] uppercase backdrop-blur-xs shadow-sm ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a11826] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a11826]" />
          </span>
          <span>{typeof remaining === 'number' && remaining > 0 ? `Only ${remaining} Left` : 'Low Stock'}</span>
        </span>
      );
    }

    if (isMadeToOrder) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#181714]/90 text-[#d4af6a] border border-[#d4af6a]/30 text-[8px] font-mono tracking-[0.2em] uppercase backdrop-blur-xs shadow-sm ${className}`}
        >
          <span className="text-[#d4af6a] text-[9px]">✦</span>
          <span>Made to Order</span>
        </span>
      );
    }

    return null; // Normal in-stock items don't clutter the image frame
  }

  // Variant: Banner (used in Product Detail View or Quick View)
  if (variant === 'banner') {
    return (
      <div
        className={`p-3.5 border space-y-1.5 transition-colors ${
          isOutOfStock
            ? 'bg-[#f7f5f2] border-[#e0dad1] text-[#787065]'
            : isLowStock
            ? 'bg-[#fdf5f5] border-[#f8d7d9] text-[#a11826]'
            : isMadeToOrder
            ? 'bg-[#faf8f2] border-[#e8dfcb] text-[#8a6e1a]'
            : 'bg-[#f5f9f6] border-[#d4e8db] text-[#1a3d2e]'
        } ${className}`}
      >
        <div className="flex items-center gap-2">
          {isOutOfStock && (
            <>
              <span className="w-2 h-2 rounded-full bg-[#8e857b]" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#5c544d]">
                {resolvedLabel}
              </span>
            </>
          )}
          {isLowStock && (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a11826] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#a11826]" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#a11826]">
                {resolvedLabel}
              </span>
            </>
          )}
          {isMadeToOrder && (
            <>
              <span className="text-[#b8962e] text-xs">✦</span>
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#8a6e1a]">
                {resolvedLabel}
              </span>
            </>
          )}
          {!isOutOfStock && !isLowStock && !isMadeToOrder && (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#1a3d2e]">
                {resolvedLabel}
              </span>
            </>
          )}
        </div>
        <p className="text-[11px] text-[#5c544d] font-light leading-relaxed">
          {isOutOfStock
            ? 'This creation is currently reserved or archived. Inquire with our salon concierge for bespoke commissions.'
            : isLowStock
            ? 'Atelier quantities are strictly limited to preserve exclusivity. Immediate acquisition is recommended.'
            : isMadeToOrder
            ? 'Crafted individually upon commission. Please allow 3 to 4 weeks for artisanal creation and white-glove dispatch.'
            : 'Complimentary temperature-controlled white-glove courier delivery.'}
        </p>
      </div>
    );
  }

  // Variant: Pill (compact, used inline with prices or catalog metadata)
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase border rounded-xs ${
        isOutOfStock
          ? 'bg-[#e8e4dc] text-[#5c544d] border-[#d6cfc5]'
          : isLowStock
          ? 'bg-[#fce8e6] text-[#a11826] border-[#f8b4b4]'
          : isMadeToOrder
          ? 'bg-[#fbf7ee] text-[#8a6e1a] border-[#e8dfcb]'
          : 'bg-[#edf7f0] text-[#1a3d2e] border-[#c3e6cb]'
      } ${className}`}
    >
      {isLowStock && <span className="w-1 h-1 rounded-full bg-[#a11826] inline-block" />}
      {isMadeToOrder && <span className="text-[8px] text-[#b8962e]">✦</span>}
      {isOutOfStock && <span className="w-1 h-1 rounded-full bg-[#8e857b] inline-block" />}
      <span>{isLowStock ? `Only ${remaining || 2} Left` : isOutOfStock ? 'Sold Out' : isMadeToOrder ? 'Made to Order' : 'In Stock'}</span>
    </span>
  );
}
