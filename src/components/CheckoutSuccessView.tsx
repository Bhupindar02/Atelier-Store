'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';

interface OrderItem {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  productSnapshot: {
    name: string;
    sku: string;
    material: string;
    color: string;
    primaryImage: string;
    categoryLabel?: string;
  };
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  stripePaymentIntentId?: string | null;
  customerEmail: string;
  customerName?: string | null;
  currency: string;
  subtotalCents: number;
  shippingFeeCents: number;
  totalCents: number;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  } | null;
  createdAt: string;
  items: OrderItem[];
}

interface CheckoutSuccessViewProps {
  sessionId?: string;
  orderId?: string;
}

export function CheckoutSuccessView({ sessionId, orderId }: CheckoutSuccessViewProps) {
  const { clearCart } = useStore();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId || orderId));
  const [isManuallyChecking, setIsManuallyChecking] = useState(false);
  const [error, setError] = useState<string | null>(
    sessionId || orderId ? null : 'No acquisition reference was provided.'
  );
  const [pollCount, setPollCount] = useState(0);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const cartClearedRef = useRef(false);

  const queryParam = sessionId
    ? `session_id=${encodeURIComponent(sessionId)}`
    : orderId
    ? `order_id=${encodeURIComponent(orderId)}`
    : '';

  const checkOrderStatus = useCallback(async () => {
    if (!queryParam) return;

    try {
      const res = await fetch(`/api/orders/status?${queryParam}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);

        // If order has been certified as paid by the webhook
        if (data.order.paymentStatus === 'paid') {
          if (!cartClearedRef.current) {
            clearCart();
            cartClearedRef.current = true;
          }
          setLoading(false);
          setIsManuallyChecking(false);
          return true;
        }
      } else {
        if (!order) {
          setError(data.message || 'The specified acquisition could not be located.');
        }
      }
    } catch (err) {
      console.error('Error fetching order status:', err);
    } finally {
      setIsManuallyChecking(false);
    }
    return false;
  }, [queryParam, clearCart, order]);

  // Initial and reactive polling loop
  useEffect(() => {
    if (!queryParam) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const runPoll = async () => {
      const isPaid = await checkOrderStatus();
      if (!isMounted) return;

      if (!isPaid && pollCount < 20) {
        setPollCount((prev) => prev + 1);
        timeoutId = setTimeout(runPoll, 2500);
      } else {
        setLoading(false);
      }
    };

    runPoll();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [queryParam, pollCount, checkOrderStatus]);

  const handleManualRefresh = async () => {
    setIsManuallyChecking(true);
    await checkOrderStatus();
  };

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2500);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // ── Missing or Error State ──────────────────────────────
  if (error && !order) {
    return (
      <div className="min-h-[75vh] bg-[#faf9f7] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#e8e3db] p-8 text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#fef2f2] text-[#a11826] border border-[#f87171]/30 flex items-center justify-center font-serif text-2xl">
            !
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b] font-medium block">
              Maison Ledger Notice
            </span>
            <h1 className="font-serif text-2xl font-light text-[#1a1714]">
              Acquisition Record Unavailable
            </h1>
            <p className="text-xs text-[#787065] leading-relaxed max-w-xs mx-auto">
              {error}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors"
            >
              Explore Collections
            </Link>
            <Link
              href="/cart"
              className="px-6 py-3 bg-[#faf9f7] border border-[#d6cfc5] text-[#1a1714] text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a1714] hover:text-white transition-colors"
            >
              View Shopping Bag
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment Failed or Expired State ─────────────────────
  const isFailedOrCancelled =
    order &&
    (order.paymentStatus === 'failed' ||
      order.status === 'cancelled' ||
      order.status === 'failed');

  if (isFailedOrCancelled) {
    return (
      <div className="min-h-[75vh] bg-[#faf9f7] flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-[#e8e3db] p-10 text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#fef2f2] text-[#a11826] border border-[#f87171]/30 flex items-center justify-center font-serif text-2xl">
            ✕
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b] font-medium block">
              Payment Not Certified
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#1a1714]">
              Acquisition Cancelled or Expired
            </h1>
            <p className="text-xs text-[#787065] leading-relaxed max-w-sm mx-auto">
              The payment session for reference{' '}
              <strong className="text-[#1a1714] font-mono">{order.orderNumber}</strong> was
              cancelled or did not receive payment confirmation. No charges were captured, and
              archival stock reservations have been released.
            </p>
          </div>

          <div className="p-4 bg-[#faf9f7] border border-[#e8e3db] text-xs font-mono text-[#5c544d] space-y-1">
            <div>Order Reference: <strong>{order.orderNumber}</strong></div>
            <div>Status: <span className="uppercase text-[#a11826] font-semibold">{order.status}</span></div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/cart"
              className="px-8 py-3.5 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors"
            >
              Return to Bag & Retry
            </Link>
            <Link
              href="/account"
              className="px-8 py-3.5 bg-[#faf9f7] border border-[#d6cfc5] text-[#1a1714] text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a1714] hover:text-white transition-colors"
            >
              Client Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Pending State (Awaiting Stripe Webhook Clearance) ────
  const isPending = loading || !order || order.paymentStatus !== 'paid';

  if (isPending) {
    return (
      <div className="min-h-[85vh] bg-[#faf9f7] flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white border border-[#e8e3db] p-8 sm:p-12 text-center space-y-8 shadow-sm relative overflow-hidden">
          {/* Subtle gold shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d4af6a]/40 via-[#d4af6a] to-[#d4af6a]/40 animate-pulse" />

          {/* Luxury Orbital Seal */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border border-[#d4af6a]/30 rounded-full animate-spin [animation-duration:8s]" />
            <div className="absolute -inset-1 border border-dashed border-[#d4af6a]/20 rounded-full animate-spin [animation-duration:16s] [animation-direction:reverse]" />
            <div className="relative w-20 h-20 rounded-full border border-[#d4af6a] flex items-center justify-center bg-[#faf9f7] shadow-inner">
              <span className="text-[#d4af6a] font-serif text-3xl">✦</span>
            </div>
          </div>

          {/* Status Headings */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fffbeb] border border-[#f59e0b]/40 text-[#92400e] text-[10px] uppercase tracking-widest font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-ping" />
              <span>Cryptographic Clearance in Progress</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1a1714]">
              Awaiting Payment Confirmation
            </h1>
            <p className="text-xs text-[#787065] max-w-md mx-auto font-light leading-relaxed">
              Your payment authorization has been submitted. The Maison Atelier archival ledger is
              currently awaiting signed cryptographic confirmation from Stripe.
            </p>
          </div>

          {/* Process Timeline Stepper */}
          <div className="border-t border-b border-[#e8e3db] py-6 text-left">
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#8e857b] font-medium block mb-4 text-center">
              Acquisition Lifecycle
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#f0fdf4] border border-[#16a34a]/30 space-y-1">
                <span className="text-[9px] font-mono font-medium text-[#166534] block">
                  ✓ STEP 1: COMPLETED
                </span>
                <p className="font-medium text-[#1a1714]">Cart & Inventory Lock</p>
                <p className="text-[10px] text-[#787065]">Allocations reserved.</p>
              </div>

              <div className="p-3 bg-[#fffbeb] border border-[#f59e0b]/40 space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-semibold text-[#92400e] block">
                    ● STEP 2: VERIFYING
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#d97706] animate-pulse" />
                </div>
                <p className="font-medium text-[#1a1714]">Stripe Webhook Sync</p>
                <p className="text-[10px] text-[#787065]">Awaiting signature receipt.</p>
              </div>

              <div className="p-3 bg-[#faf9f7] border border-[#e8e3db] space-y-1 opacity-70">
                <span className="text-[9px] font-mono text-[#8e857b] block">
                  ○ STEP 3: QUEUED
                </span>
                <p className="font-medium text-[#1a1714]">Archival Certificate</p>
                <p className="text-[10px] text-[#787065]">Numbered deed issue.</p>
              </div>
            </div>
          </div>

          {/* Pending Order Snapshot (if retrieved) */}
          {order && (
            <div className="bg-[#faf9f7] border border-[#e8e3db] p-5 text-left text-xs space-y-3">
              <div className="flex justify-between items-baseline border-b border-[#e8e3db] pb-2">
                <span className="text-[10px] uppercase tracking-wider text-[#8e857b] font-mono">
                  Order Reference:
                </span>
                <span className="font-mono font-semibold text-[#1a1714]">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#787065]">Client Contact:</span>
                <span className="font-mono text-[#1a1714]">{order.customerEmail}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#787065]">Amount in Settlement:</span>
                <span className="font-mono font-medium text-[#1a1714]">
                  ${(order.totalCents / 100).toLocaleString()} USD
                </span>
              </div>
              {order.items.length > 0 && (
                <div className="text-[11px] text-[#787065] pt-1">
                  Reserving: {order.items.map((i) => i.productSnapshot.name).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Real-Time Sync Indicator & Manual Trigger */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 text-xs text-[#787065]">
              <div className="w-3.5 h-3.5 border-2 border-[#d4af6a] border-t-transparent rounded-full animate-spin" />
              <span>
                Synchronizing with ledger... (Attempt {pollCount} of 20)
              </span>
            </div>

            <p className="text-[10px] text-[#8e857b] font-light max-w-sm mx-auto leading-relaxed">
              This page updates automatically upon webhook confirmation. You may also query the
              ledger immediately below.
            </p>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isManuallyChecking}
              className="px-6 py-2.5 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isManuallyChecking ? 'Checking Ledger Now...' : 'Check Ledger Status Now'}
            </button>
          </div>

          {/* Guidance if taking longer */}
          {pollCount >= 10 && (
            <div className="p-4 bg-[#faf9f7] border border-[#e8e3db] text-xs text-[#5c544d] space-y-1 text-left">
              <p className="font-medium text-[#1a1714]">Taking longer than expected?</p>
              <p className="text-[11px] font-light">
                If your banking institution required secondary 3D Secure verification, notification
                clearance can take up to a minute. Your order reference is{' '}
                <strong className="font-mono text-[#1a1714]">{order?.orderNumber}</strong>. You will
                receive an official dispatch confirmation email once completed.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Confirmed Order State (Official Certificate of Acquisition) ────
  return (
    <div className="min-h-screen bg-[#faf9f7] py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-8 print:max-w-none print:space-y-4">
        {/* Printable Official Certificate Document */}
        <div
          id="acquisition-certificate"
          className="bg-white border border-[#e8e3db] p-8 sm:p-14 shadow-sm relative overflow-hidden print:border-none print:shadow-none print:p-0"
        >
          {/* Subtle gold foil top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#d4af6a] print:hidden" />

          {/* Certificate Header with Archival Crest */}
          <div className="text-center space-y-4 pb-8 border-b border-[#e8e3db]">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#1a1714] text-[#d4af6a] flex items-center justify-center font-serif text-2xl font-light tracking-widest shadow-sm">
              MA
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#8e857b] font-medium block">
                ACTE D&apos;ACQUISITION OFFICIEL · MAISON ATELIER
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1a1714]">
                Certificate of Acquisition
              </h1>
              <p className="text-xs text-[#787065] max-w-md mx-auto font-light leading-relaxed">
                This certifies that the numbered creation(s) itemized below have been authenticated,
                purchased, and recorded in the permanent Maison Atelier archives.
              </p>
            </div>

            {/* Official Verification Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#f0fdf4] border border-[#16a34a]/30 text-[#166534] text-[10px] uppercase tracking-widest font-mono font-medium mt-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Payment Authenticated & Ledger Sealed</span>
            </div>
          </div>

          {/* Certificate Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-b border-[#e8e3db] text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8e857b] block font-mono">
                Deed Reference
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-semibold text-[#1a1714] text-sm">
                  {order.orderNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  title="Copy Reference"
                  className="text-[#8e857b] hover:text-[#1a1714] text-xs cursor-pointer print:hidden"
                  aria-label="Copy order reference"
                >
                  {copiedNumber ? '✓' : '⧉'}
                </button>
              </div>
              {copiedNumber && (
                <span className="text-[9px] text-emerald-700 font-mono block">Copied</span>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8e857b] block font-mono">
                Certified Date
              </span>
              <span className="font-mono text-[#1a1714] mt-0.5 block">
                {order.createdAt
                  ? new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(new Date(order.createdAt))
                  : 'Certified'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8e857b] block font-mono">
                Settlement
              </span>
              <span className="font-mono font-semibold text-[#1a1714] text-sm mt-0.5 block">
                ${(order.totalCents / 100).toLocaleString()} USD
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8e857b] block font-mono">
                Logistics Tier
              </span>
              <span className="font-mono text-[#1a3d2e] font-semibold uppercase mt-0.5 block">
                {order.status}
              </span>
            </div>
          </div>

          {/* Delivery & Client Dossier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-[#e8e3db] text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b] font-medium block mb-1">
                Client Dossier
              </span>
              <div className="space-y-0.5 text-[#1a1714]">
                {order.customerName && <p className="font-medium">{order.customerName}</p>}
                <p className="font-mono text-[#5c544d]">{order.customerEmail}</p>
                <p className="text-[10px] text-[#8e857b]">Registered Privileged Client</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b] font-medium block mb-1">
                Armored Courier Destination
              </span>
              {order.shippingAddress ? (
                <div className="text-[#3a3530] font-light space-y-0.5">
                  {order.shippingAddress.line1 && <p>{order.shippingAddress.line1}</p>}
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
                    <p className="font-mono uppercase text-[10px] text-[#787065]">
                      {order.shippingAddress.country}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[#787065] font-light">
                  Direct courier handover confirmed per encrypted client dossier.
                </p>
              )}
            </div>
          </div>

          {/* Itemized Archival Pieces */}
          <div className="py-6 border-b border-[#e8e3db] space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b] font-medium block">
              Itemized Pieces & Allocated SKUs
            </span>

            <div className="divide-y divide-[#e8e3db]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-16 h-20 bg-[#f2ede6] border border-[#e8e3db] shrink-0 overflow-hidden">
                      {item.productSnapshot.primaryImage ? (
                        <Image
                          src={item.productSnapshot.primaryImage}
                          alt={item.productSnapshot.name}
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

                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-[#8e857b] font-mono block">
                        SKU: {item.productSnapshot.sku} · Size: {item.size}
                      </span>
                      <h3 className="font-serif text-base font-light text-[#1a1714] truncate">
                        {item.productSnapshot.name}
                      </h3>
                      <p className="text-xs text-[#787065] font-light">
                        {item.productSnapshot.material} · {item.productSnapshot.color}
                      </p>
                      <p className="text-[11px] text-[#5c544d] font-mono">
                        Quantity: {item.quantity} × ${(item.unitPriceCents / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-sm font-semibold text-[#1a1714]">
                      ${(item.lineTotalCents / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown Ledger */}
          <div className="py-6 border-b border-[#e8e3db] space-y-2.5 text-xs">
            <div className="flex justify-between text-[#5c544d]">
              <span>Authoritative Subtotal</span>
              <span className="font-mono text-[#1a1714]">
                ${(order.subtotalCents / 100).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-[#5c544d]">
              <span>White-Glove Armored Courier Delivery</span>
              <span className="font-mono text-[#1a3d2e] font-medium">
                {order.shippingFeeCents === 0
                  ? 'COMPLIMENTARY'
                  : `$${(order.shippingFeeCents / 100).toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between text-[#5c544d]">
              <span>Archival Wax-Sealed Packaging Protocol</span>
              <span className="font-mono text-[#1a3d2e]">INCLUDED</span>
            </div>

            <div className="pt-3 border-t border-[#e8e3db] flex justify-between items-baseline">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1a1714] block">
                  Total Settled Acquisition
                </span>
                <span className="text-[9px] text-[#8e857b] font-mono">
                  Verified via Stripe · {order.stripePaymentIntentId || 'Encrypted Settlement'}
                </span>
              </div>
              <span className="font-mono text-2xl font-medium text-[#1a1714]">
                ${(order.totalCents / 100).toLocaleString()} USD
              </span>
            </div>
          </div>

          {/* Maison Guarantees & Handover Protocol */}
          <div className="pt-6 space-y-4">
            <div className="p-4 bg-[#faf9f7] border border-[#e8e3db] flex items-start gap-3.5 text-xs text-[#5c544d]">
              <span className="text-[#d4af6a] text-lg leading-none mt-0.5">✦</span>
              <div className="space-y-1">
                <p className="font-medium text-[#1a1714]">
                  White-Glove Courier Handover Protocol
                </p>
                <p className="font-light leading-relaxed">
                  Your piece is being prepared by our Parisian packaging specialists in armored,
                  discreet tamper-evident casing. A signed Certificate of Authenticity and
                  numbered provenance record will accompany your parcel. Direct signature is
                  required upon delivery.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[10px] text-[#8e857b] font-mono uppercase tracking-wider pt-2 border-t border-[#e8e3db]/60">
              <span>Maison Atelier · 12 Place Vendôme, Paris</span>
              <span>Archives Ref: {order.id}</span>
            </div>
          </div>
        </div>

        {/* Post-Purchase Action Suite (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center print:hidden">
          <button
            type="button"
            onClick={handlePrintCertificate}
            className="w-full sm:w-auto px-8 py-4 bg-[#faf9f7] border border-[#d6cfc5] text-[#1a1714] text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a1714] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Print Official Certificate</span>
            <span className="text-sm">⎙</span>
          </button>

          <Link
            href="/account"
            className="w-full sm:w-auto px-8 py-4 bg-[#1a1714] text-white text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-[#a11826] transition-colors text-center shadow-sm"
          >
            View in Client Portfolio
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 bg-transparent text-[#787065] text-[11px] uppercase tracking-[0.2em] font-medium hover:text-[#1a1714] transition-colors text-center underline underline-offset-4"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
