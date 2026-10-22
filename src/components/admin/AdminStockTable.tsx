'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { updateStockAction } from '@/app/admin/actions';
import type { AdminStockSummary } from '@/db/queries/admin';

interface AdminStockTableProps {
  initialStocks: AdminStockSummary[];
}

export default function AdminStockTable({ initialStocks }: AdminStockTableProps) {
  const [stocksList, setStocksList] = useState(initialStocks);
  const [editingRows, setEditingRows] = useState<Record<string, { quantity: number; status: string }>>({});
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleQuantityChange = (productId: string, val: number) => {
    const current = editingRows[productId] || {
      quantity: stocksList.find((s) => s.productId === productId)?.quantity ?? 0,
      status: stocksList.find((s) => s.productId === productId)?.status ?? 'in_stock',
    };

    const newQuantity = Math.max(0, val);
    const newStatus =
      newQuantity === 0
        ? 'out_of_stock'
        : newQuantity <= 3
        ? 'low_stock'
        : current.status === 'out_of_stock' || current.status === 'low_stock'
        ? 'in_stock'
        : current.status;

    setEditingRows((prev) => ({
      ...prev,
      [productId]: {
        ...current,
        quantity: newQuantity,
        status: newStatus,
      },
    }));
  };

  const handleStatusChange = (productId: string, newStatus: string) => {
    const current = editingRows[productId] || {
      quantity: stocksList.find((s) => s.productId === productId)?.quantity ?? 0,
      status: stocksList.find((s) => s.productId === productId)?.status ?? 'in_stock',
    };

    setEditingRows((prev) => ({
      ...prev,
      [productId]: {
        ...current,
        status: newStatus,
      },
    }));
  };

  const handleSaveStock = (productId: string) => {
    const edited = editingRows[productId];
    if (!edited) return;

    setStatusMessage(null);

    startTransition(async () => {
      const result = await updateStockAction(productId, edited.quantity, edited.status);

      if (result.success) {
        setStatusMessage({ text: result.message || 'Stock updated successfully.' });
        // Update local state
        setStocksList((prev) =>
          prev.map((s) =>
            s.productId === productId
              ? { ...s, quantity: edited.quantity, status: edited.status }
              : s
          )
        );
        // Clear edited row
        setEditingRows((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
      } else {
        setStatusMessage({ text: result.error || 'Failed to update stock.', isError: true });
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

      <div className="bg-[#181714] border border-[#2b2823] overflow-hidden">
        <div className="p-4 border-b border-[#2b2823] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-white font-medium">
              Live Inventory Ledger
            </h2>
            <p className="text-[10px] text-[#8c8275]">
              Real-time stock quantities, safety thresholds, and availability statuses.
            </p>
          </div>
          <span className="text-[10px] text-[#8c8275] font-mono">
            {stocksList.length} Monitored Inventories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2b2823] bg-[#141310] text-[9px] uppercase tracking-[0.2em] text-[#8c8275]">
                <th className="py-3 px-4">Artisanal Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Current Quantity</th>
                <th className="py-3 px-4">Ledger Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2823]/60 text-xs text-[#a0978d]">
              {stocksList.map((item) => {
                const isEdited = Boolean(editingRows[item.productId]);
                const currentQty = isEdited
                  ? editingRows[item.productId].quantity
                  : item.quantity;
                const currentStatus = isEdited
                  ? editingRows[item.productId].status
                  : item.status;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isEdited ? 'bg-[#211e18]' : 'hover:bg-[#1f1d18]'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-[#23201b] shrink-0 border border-[#2b2823]">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-serif text-white text-sm font-normal">
                            {item.productName}
                          </p>
                          <p className="text-[10px] text-[#6b645b]">{item.label}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#d4af6a]">
                      {item.productSku}
                    </td>
                    <td className="py-3 px-4 font-serif text-white">
                      ${item.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.productId, currentQty - 1)}
                          disabled={currentQty <= 0 || isPending}
                          className="w-6 h-6 flex items-center justify-center border border-[#3a3530] text-[#cfc7bc] hover:bg-[#2b2823] disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQty}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.productId,
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-14 bg-[#100f0c] border border-[#3a3530] px-2 py-1 text-center font-mono text-sm text-white focus:outline-none focus:border-[#d4af6a]"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.productId, currentQty + 1)}
                          disabled={isPending}
                          className="w-6 h-6 flex items-center justify-center border border-[#3a3530] text-[#cfc7bc] hover:bg-[#2b2823]"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(item.productId, e.target.value)}
                        className="bg-[#100f0c] border border-[#3a3530] px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock (≤ 3)</option>
                        <option value="made_to_order">Made to Order</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isEdited ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingRows((prev) => {
                                const next = { ...prev };
                                delete next[item.productId];
                                return next;
                              })
                            }
                            className="px-2 py-1 text-[9px] uppercase tracking-wider text-[#8c8275] hover:text-white"
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveStock(item.productId)}
                            disabled={isPending}
                            className="px-3 py-1 bg-[#d4af6a] text-[#12110e] text-[9px] uppercase tracking-wider font-semibold hover:bg-[#e6c382] transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isPending ? 'Saving…' : 'Save'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#6b645b] italic">Synchronized</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
