'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { SerializedCustomerOrder } from '@/types/orders';

interface OrderDetailViewProps {
  order: SerializedCustomerOrder;
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const [copiedReference, setCopiedReference] = useState(false);

  const handleCopyReference = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedReference(true);
    setTimeout(() => setCopiedReference(false), 2000);
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(order.createdAt));

  const isPaid = order.paymentStatus === 'paid';
  const isPending = order.paymentStatus === 'unpaid' || order.paymentStatus === 'pending';
  const isFailed = order.paymentStatus === 'failed' || order.status === 'cancelled';
  const isProcessing = order.status === 'processing';
  const isCompleted = order.status === 'completed';

  // Determine current lifecycle step for the order state stepper
  let currentStep = 1;
  if (isPaid) {
    currentStep = isCompleted ? 4 : isProcessing ? 3 : 2;
  } else if (isFailed) {
    currentStep = 0;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 print:p-0 print:max-w-none">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs pb-4 border-b border-[#e8e3db] print:hidden">
        <Link
          href="/account?tab=orders"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-[#787065] hover:text-[#1a1714] transition-colors"
        >
          <span>←</span>
          <span>Back to Acquisitions</span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-[#8e857b]">
          <span>Maison Atelier Archival Ledger</span>
          <span className="opacity-40">|</span>
          <span className="font-mono text-[#1a1714] font-medium">{order.orderNumber}</span>
        </div>
      </div>

      {/* Main Order Dossier Card */}
      <div className="bg-white border border-[#e8e3db] p-8 sm:p-12 shadow-sm space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Gold accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af6a]/40 via-[#d4af6a] to-[#d4af6a]/40 print:hidden" />

        {/* Dossier Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#e8e3db]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#8e857b]">
                ARCHIVAL DOSSIER · DEED REFERENCE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#1a1714]">
                {order.orderNumber}
              </h1>
              <button
                type="button"
                onClick={handleCopyReference}
                className="text-xs px-2.5 py-1 bg-[#faf9f7] border border-[#d6cfc5] text-[#5c544d] hover:text-[#1a1714] hover:border-[#1a1714] transition-colors cursor-pointer print:hidden font-mono"
                title="Copy Deed Reference"
              >
                {copiedReference ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-[#787065] font-light">
              Recorded in permanent archives on {formattedDate}
            </p>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
            {/* Payment Status Badge */}
            {isPaid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0fdf4] border border-[#16a34a]/30 text-[#166534] text-[10px] uppercase tracking-widest font-mono font-medium">
                <span>✓</span>
                <span>Payment Certified</span>
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fffbeb] border border-[#f59e0b]/40 text-[#92400e] text-[10px] uppercase tracking-widest font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
                <span>Payment Pending Clearance</span>
              </span>
            ) : isFailed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fef2f2] border border-[#ef4444]/30 text-[#991b1b] text-[10px] uppercase tracking-widest font-mono font-medium">
                <span>✕</span>
                <span>Payment Incomplete</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#faf9f7] border border-[#d6cfc5] text-[#5c544d] text-[10px] uppercase tracking-widest font-mono font-medium">
                <span>{order.paymentStatus}</span>
              </span>
            )}

            {/* Fulfillment Status Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#faf9f7] border border-[#e8e3db] text-[#3a3530] text-[10px] uppercase tracking-widest font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a1714]" />
              <span>Current State: {order.status.toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* ── CURRENT ORDER STATE LIFECYCLE STEPPER ── */}
        <div className="bg-[#faf9f7] border border-[#e8e3db] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#8e857b]">
              Current Order State & Provenance Tracking
            </span>
            <span className="text-[10px] font-mono text-[#5c544d] uppercase">
              {order.status === 'confirmed' || isPaid ? 'Guaranteed Allocation' : 'Clearance Pending'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {/* Step 1: Order Placed */}
            <div className="p-3 bg-white border border-[#16a34a]/30 space-y-1">
              <span className="text-[9px] font-mono font-semibold text-[#166534] block">
                ✓ STEP 1: COMPLETED
              </span>
              <p className="font-medium text-[#1a1714]">Order Placed</p>
              <p className="text-[10px] text-[#787065]">Archival deed sealed.</p>
            </div>

            {/* Step 2: Payment Clearance */}
            <div
              className={`p-3 border space-y-1 ${
                isPaid
                  ? 'bg-white border-[#16a34a]/30'
                  : isPending
                  ? 'bg-[#fffbeb] border-[#f59e0b]/40'
                  : 'bg-[#fef2f2] border-[#ef4444]/30'
              }`}
            >
              <span
                className={`text-[9px] font-mono font-semibold block ${
                  isPaid ? 'text-[#166534]' : isPending ? 'text-[#92400e]' : 'text-[#991b1b]'
                }`}
              >
                {isPaid ? '✓ STEP 2: CERTIFIED' : isPending ? '● STEP 2: CLEARING' : '✕ STEP 2: INCOMPLETE'}
              </span>
              <p className="font-medium text-[#1a1714]">Stripe Settlement</p>
              <p className="text-[10px] text-[#787065]">
                {isPaid ? 'Payment authenticated.' : isPending ? 'Awaiting webhook receipt.' : 'Payment expired/failed.'}
              </p>
            </div>

            {/* Step 3: Workshop Preparation */}
            <div
              className={`p-3 border space-y-1 ${
                currentStep >= 3
                  ? 'bg-white border-[#16a34a]/30'
                  : currentStep === 2
                  ? 'bg-[#faf9f7] border-[#d4af6a]/50'
                  : 'bg-white border-[#e8e3db] opacity-60'
              }`}
            >
              <span
                className={`text-[9px] font-mono font-semibold block ${
                  currentStep >= 3 ? 'text-[#166534]' : currentStep === 2 ? 'text-[#8c6d32]' : 'text-[#8e857b]'
                }`}
              >
                {currentStep >= 3 ? '✓ STEP 3: PREPARED' : currentStep === 2 ? '● STEP 3: IN QUEUE' : '○ STEP 3: QUEUED'}
              </span>
              <p className="font-medium text-[#1a1714]">Artisan Workshop</p>
              <p className="text-[10px] text-[#787065]">Inspection & wax sealing.</p>
            </div>

            {/* Step 4: White-Glove Handover */}
            <div
              className={`p-3 border space-y-1 ${
                currentStep >= 4 ? 'bg-white border-[#16a34a]/30' : 'bg-white border-[#e8e3db] opacity-60'
              }`}
            >
              <span
                className={`text-[9px] font-mono font-semibold block ${
                  currentStep >= 4 ? 'text-[#166534]' : 'text-[#8e857b]'
                }`}
              >
                {currentStep >= 4 ? '✓ STEP 4: DELIVERED' : '○ STEP 4: DISPATCH'}
              </span>
              <p className="font-medium text-[#1a1714]">Courier Delivery</p>
              <p className="text-[10px] text-[#787065]">Direct armored handover.</p>
            </div>
          </div>
        </div>

        {/* Client & Destination Dossier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-b border-[#e8e3db] text-xs">
          {/* Client Details */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#8e857b] block">
              Client Dossier & Settlement
            </span>
            <div className="bg-[#faf9f7] border border-[#e8e3db] p-4 space-y-1.5 text-[#1a1714]">
              {order.customerName && (
                <p className="font-medium text-sm">{order.customerName}</p>
              )}
              <p className="font-mono text-xs text-[#5c544d]">{order.customerEmail}</p>
              <p className="text-[10px] text-[#8e857b]">Registered Privileged Client</p>
              {order.stripePaymentIntentId && (
                <p className="font-mono text-[10px] text-[#8e857b] pt-1 border-t border-[#e8e3db]">
                  Stripe Payment Reference: <span className="text-[#1a1714] font-medium">{order.stripePaymentIntentId}</span>
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#8e857b] block">
              White-Glove Courier Destination
            </span>
            <div className="bg-[#faf9f7] border border-[#e8e3db] p-4 text-[#3a3530] font-light space-y-1">
              {order.shippingAddress ? (
                <>
                  {order.shippingAddress.line1 && <p className="font-medium text-[#1a1714]">{order.shippingAddress.line1}</p>}
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    {[
                      order.shippingAddress.city,
                      order.shippingAddress.state,
                      order.shippingAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {order.shippingAddress.country && (
                    <p className="font-mono uppercase text-[10px] text-[#787065] pt-0.5">
                      {order.shippingAddress.country}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[#787065] italic">
                  Direct salon pickup / Handover details configured with client concierge.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── ITEMIZED ORDER ITEMS, QUANTITIES & PRICES ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#8e857b]">
              Itemized Pieces & Allocated Quantities ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </span>
            <span className="text-[10px] uppercase tracking-wider font-mono text-[#8e857b]">
              Unit Price & Line Total
            </span>
          </div>

          <div className="divide-y divide-[#e8e3db] border-t border-b border-[#e8e3db]">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-18 h-22 bg-[#f2ede6] border border-[#e8e3db] shrink-0 overflow-hidden group">
                    {item.productSnapshot?.primaryImage ? (
                      <Image
                        src={item.productSnapshot.primaryImage}
                        alt={item.productSnapshot.name}
                        fill
                        sizes="72px"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8e857b] text-xs">
                        ✦
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-wider text-[#8e857b] font-mono">
                        SKU: {item.productSnapshot?.sku}
                      </span>
                      <span className="text-[#e8e3db]">·</span>
                      <span className="text-[9px] uppercase tracking-wider text-[#1a1714] font-mono font-medium">
                        Size: {item.size}
                      </span>
                    </div>

                    <Link
                      href={`/products/${item.productId}`}
                      className="font-serif text-base sm:text-lg font-light text-[#1a1714] hover:text-[#a11826] transition-colors block truncate"
                    >
                      {item.productSnapshot?.name}
                    </Link>

                    {item.productSnapshot?.material && (
                      <p className="text-xs text-[#787065] font-light">
                        {item.productSnapshot.material}
                        {item.productSnapshot.color ? ` · ${item.productSnapshot.color}` : ''}
                      </p>
                    )}

                    {/* Quantity Badge */}
                    <div className="pt-1 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 bg-[#faf9f7] border border-[#d6cfc5] text-[10px] font-mono text-[#1a1714] font-medium">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-[11px] text-[#5c544d] font-mono">
                        @ ${(item.unitPriceCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} each
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 pl-22 sm:pl-0 space-y-0.5">
                  <span className="text-[9px] uppercase tracking-wider text-[#8e857b] font-mono block">
                    Line Total
                  </span>
                  <span className="font-mono text-base font-semibold text-[#1a1714]">
                    ${(item.lineTotalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FINANCIAL BREAKDOWN LEDGER & TOTAL ── */}
        <div className="space-y-3 pt-2 text-xs">
          <div className="flex justify-between text-[#5c544d]">
            <span>Authoritative Subtotal</span>
            <span className="font-mono text-[#1a1714]">
              ${(order.subtotalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </span>
          </div>

          <div className="flex justify-between text-[#5c544d]">
            <span>White-Glove Armored Courier Delivery</span>
            <span className="font-mono text-[#166534] font-medium">
              {order.shippingFeeCents === 0
                ? 'COMPLIMENTARY'
                : `$${(order.shippingFeeCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`}
            </span>
          </div>

          <div className="flex justify-between text-[#5c544d]">
            <span>Archival Packaging & Monogram Wax Seal</span>
            <span className="font-mono text-[#166534]">INCLUDED</span>
          </div>

          <div className="pt-4 border-t border-[#e8e3db] flex justify-between items-baseline">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1a1714] block">
                Total Acquisition Value
              </span>
              <span className="text-[9px] text-[#8e857b] font-mono uppercase">
                Settled Currency: {order.currency.toUpperCase()}
              </span>
            </div>
            <span className="font-mono text-2xl sm:text-3xl font-medium text-[#1a1714]">
              ${(order.totalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-[#e8e3db] flex flex-col sm:flex-row gap-3 justify-end items-center print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3 bg-[#faf9f7] border border-[#d6cfc5] text-[#1a1714] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a1714] hover:text-white transition-colors cursor-pointer"
          >
            Print Dossier ⎙
          </button>

          <Link
            href={`/checkout/success?order_id=${order.id}`}
            className="w-full sm:w-auto px-6 py-3 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors text-center"
          >
            Official Certificate of Acquisition →
          </Link>
        </div>
      </div>
    </div>
  );
}
