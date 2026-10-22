'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { updateOrderStatusAction } from '@/app/admin/actions';
import type { AdminOrderSummary } from '@/db/queries/admin';

interface AdminOrdersListProps {
  initialOrders: AdminOrderSummary[];
}

export default function AdminOrdersList({ initialOrders }: AdminOrdersListProps) {
  const [ordersList, setOrdersList] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderSummary | null>(null);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setStatusMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(
        orderId,
        newStatus as 'pending' | 'processing' | 'completed' | 'cancelled'
      );

      if (result.success) {
        setStatusMessage({ text: result.message || 'Order status updated.' });
        setOrdersList((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        setStatusMessage({ text: result.error || 'Failed to update order status.', isError: true });
      }
    });
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          className={`p-4 border text-xs flex items-center justify-between ${
            statusMessage.isError
              ? 'bg-[#a11826]/10 border-[#a11826]/40 text-[#f87171]'
              : 'bg-[#7ee787]/10 border-[#7ee787]/40 text-[#7ee787]'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-[10px] uppercase tracking-wider underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-[#181714] border border-[#2b2823] overflow-hidden">
        <div className="p-4 border-b border-[#2b2823] flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white font-medium">
            Customer Orders Ledger
          </h2>
          <span className="text-[10px] text-[#8c8275] font-mono">
            {ordersList.length} Total Orders
          </span>
        </div>

        {ordersList.length === 0 ? (
          <div className="py-16 text-center text-[#8c8275]">
            <p className="text-xs uppercase tracking-widest">No customer orders recorded yet.</p>
            <p className="text-[10px] text-[#6b645b] mt-1">
              Confirmed checkout orders will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2b2823] bg-[#141310] text-[9px] uppercase tracking-[0.2em] text-[#8c8275]">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2823]/60 text-xs text-[#a0978d]">
                {ordersList.map((order) => (
                  <tr key={order.id} className="hover:bg-[#1f1d18] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#d4af6a] font-medium">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-[#8c8275]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white text-xs font-medium">
                        {order.customerName || 'Client'}
                      </p>
                      <p className="text-[10px] text-[#6b645b]">{order.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#cfc7bc]">
                      {order.itemsCount} unit{order.itemsCount === 1 ? '' : 's'}
                    </td>
                    <td className="py-3 px-4 font-serif text-white text-sm">
                      ${(order.totalCents / 100).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono border ${
                          order.paymentStatus === 'paid'
                            ? 'bg-[#7ee787]/10 text-[#7ee787] border-[#7ee787]/30'
                            : 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/30'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={isPending}
                        className="bg-[#100f0c] border border-[#3a3530] px-2 py-1 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1 text-[9px] uppercase tracking-wider border border-[#3a3530] text-[#cfc7bc] hover:border-[#d4af6a] hover:text-[#d4af6a] transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181714] border border-[#2b2823] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2b2823]">
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#d4af6a]">
                  ORDER DETAILS
                </span>
                <h3 className="font-serif text-xl text-white">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-[#8c8275] hover:text-white text-base px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#12110e] p-3 border border-[#2b2823]">
                <span className="text-[9px] uppercase tracking-wider text-[#8c8275] block mb-1">
                  Customer
                </span>
                <p className="text-white font-medium">{selectedOrder.customerName || 'N/A'}</p>
                <p className="text-[#8c8275]">{selectedOrder.customerEmail}</p>
              </div>
              <div className="bg-[#12110e] p-3 border border-[#2b2823]">
                <span className="text-[9px] uppercase tracking-wider text-[#8c8275] block mb-1">
                  Payment & Fulfillment
                </span>
                <p className="capitalize text-white">
                  Payment: <span className="font-mono text-[#d4af6a]">{selectedOrder.paymentStatus}</span>
                </p>
                <p className="capitalize text-[#8c8275]">
                  Status: <span className="font-mono text-white">{selectedOrder.status}</span>
                </p>
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#8c8275]">
                Order Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-[#2b2823] border border-[#2b2823] bg-[#12110e]">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 bg-[#23201b] shrink-0 border border-[#2b2823]">
                        {item.primaryImage ? (
                          <Image
                            src={item.primaryImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-xs text-white font-serif">{item.productName}</p>
                        <p className="text-[10px] text-[#6b645b]">
                          Size: {item.size} · Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-serif text-white">
                        ${((item.lineTotalCents || 0) / 100).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-[10px] text-[#6b645b]">
                        ${((item.unitPriceCents || 0) / 100).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-[#2b2823] pt-4 space-y-1 text-xs">
              <div className="flex justify-between text-[#8c8275]">
                <span>Subtotal</span>
                <span>${(selectedOrder.subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8c8275]">
                <span>Shipping</span>
                <span>
                  {selectedOrder.shippingFeeCents === 0
                    ? 'Complimentary'
                    : `$${(selectedOrder.shippingFeeCents / 100).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-serif text-white pt-2 border-t border-[#2b2823]">
                <span>Total</span>
                <span className="text-[#d4af6a]">
                  ${(selectedOrder.totalCents / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-[#d4af6a] text-[#12110e] text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
