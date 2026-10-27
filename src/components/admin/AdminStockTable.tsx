'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { updateStockAction, batchUpdateStockAction } from '@/app/admin/actions';
import type { AdminStockSummary, AdminCategorySummary } from '@/db/queries/admin';

interface AdminStockTableProps {
  initialStocks: AdminStockSummary[];
  categories?: AdminCategorySummary[];
}

export default function AdminStockTable({
  initialStocks,
  categories = [],
}: AdminStockTableProps) {
  const [stocksList, setStocksList] = useState(initialStocks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingRows, setEditingRows] = useState<Record<string, { quantity: number; status: string }>>({});
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Filtered stocks
  const filteredStocks = stocksList.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productSku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || item.categoryId === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const modifiedCount = Object.keys(editingRows).length;

  const handleQuantityChange = (productId: string, val: number) => {
    const current = editingRows[productId] || {
      quantity: stocksList.find((s) => s.productId === productId)?.quantity ?? 0,
      status: stocksList.find((s) => s.productId === productId)?.status ?? 'in_stock',
    };

    const safeVal = isNaN(val) ? 0 : Math.max(0, Math.floor(val));
    const newStatus =
      current.status === 'made_to_order'
        ? 'made_to_order'
        : safeVal === 0
        ? 'out_of_stock'
        : safeVal <= 3
        ? 'low_stock'
        : 'in_stock';

    setEditingRows((prev) => ({
      ...prev,
      [productId]: {
        ...current,
        quantity: safeVal,
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
        setStatusMessage({ text: result.message || 'Inventory updated successfully.' });
        // Update local state
        setStocksList((prev) =>
          prev.map((s) =>
            s.productId === productId
              ? {
                  ...s,
                  quantity: edited.quantity,
                  status: edited.status,
                  label:
                    edited.status === 'out_of_stock'
                      ? 'Out of Stock · Archive Request'
                      : edited.status === 'low_stock'
                      ? `Only ${edited.quantity} Available`
                      : edited.status === 'made_to_order'
                      ? 'Made to Order · Bespoke Commission'
                      : 'In Stock · Atelier Ready',
                }
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

  const handleSaveAllModified = () => {
    if (modifiedCount === 0) return;

    setStatusMessage(null);

    const updates = Object.entries(editingRows).map(([productId, data]) => ({
      productId,
      quantity: data.quantity,
      status: data.status,
    }));

    startTransition(async () => {
      const result = await batchUpdateStockAction(updates);

      if (result.success) {
        setStatusMessage({ text: result.message || 'All modified inventories saved.' });
        // Synchronize state
        setStocksList((prev) =>
          prev.map((s) => {
            const edited = editingRows[s.productId];
            if (!edited) return s;
            return {
              ...s,
              quantity: edited.quantity,
              status: edited.status,
              label:
                edited.status === 'out_of_stock'
                  ? 'Out of Stock · Archive Request'
                  : edited.status === 'low_stock'
                  ? `Only ${edited.quantity} Available`
                  : edited.status === 'made_to_order'
                  ? 'Made to Order · Bespoke Commission'
                  : 'In Stock · Atelier Ready',
            };
          })
        );
        setEditingRows({});
      } else {
        setStatusMessage({ text: result.error || 'Failed to execute batch update.', isError: true });
      }
    });
  };

  const handleResetAll = () => {
    setEditingRows({});
  };

  return (
    <div className="space-y-6">
      {/* Status Feedback Banner */}
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

      {/* Control Bar: Filters, Search & Batch Actions */}
      <div className="bg-[#181714] border border-[#2b2823] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full md:w-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory by product title or SKU..."
            className="w-full bg-[#100f0c] border border-[#3a3530] px-4 py-2 text-xs text-white placeholder-[#6b645b] focus:outline-none focus:border-[#d4af6a] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[#6b645b] hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
            >
              <option value="all">All Collections ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (≤ 3)</option>
            <option value="made_to_order">Made to Order</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          {/* Batch Save Controls */}
          {modifiedCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetAll}
                disabled={isPending}
                className="px-3 py-2 border border-[#3a3530] text-[#8c8275] hover:text-white text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reset ({modifiedCount})
              </button>
              <button
                type="button"
                onClick={handleSaveAllModified}
                disabled={isPending}
                className="px-4 py-2 bg-[#d4af6a] text-[#12110e] text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#e6c382] transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-[#d4af6a]/15"
              >
                {isPending ? 'Saving…' : `Save All (${modifiedCount})`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Inventory Ledger Table */}
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
            Showing {filteredStocks.length} of {stocksList.length} items
          </span>
        </div>

        {filteredStocks.length === 0 ? (
          <div className="py-16 text-center text-[#8c8275]">
            <p className="text-xs uppercase tracking-widest">No inventories match your search or filter.</p>
            <p className="text-[10px] text-[#6b645b] mt-1">Try resetting filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2b2823] bg-[#141310] text-[9px] uppercase tracking-[0.2em] text-[#8c8275]">
                  <th className="py-3 px-4">Artisanal Product</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Collection</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Allocated Quantity</th>
                  <th className="py-3 px-4">Ledger Availability Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2823]/60 text-xs text-[#a0978d]">
                {filteredStocks.map((item) => {
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
                                unoptimized
                              />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-serif text-white text-sm font-normal">
                              {item.productName}
                            </p>
                            <p className="text-[10px] text-[#6b645b] truncate max-w-xs">{item.label}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#d4af6a]">
                        {item.productSku}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider bg-[#23201b] border border-[#3a3530] text-[#cfc7bc]">
                          {item.categoryName}
                        </span>
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
                            className="w-6 h-6 flex items-center justify-center border border-[#3a3530] text-[#cfc7bc] hover:bg-[#2b2823] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
                            className="w-16 bg-[#100f0c] border border-[#3a3530] px-2 py-1 text-center font-mono text-sm text-white focus:outline-none focus:border-[#d4af6a]"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, currentQty + 1)}
                            disabled={isPending}
                            className="w-6 h-6 flex items-center justify-center border border-[#3a3530] text-[#cfc7bc] hover:bg-[#2b2823] cursor-pointer"
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
                          <option value="in_stock">In Stock · Ready</option>
                          <option value="low_stock">Low Stock (≤ 3)</option>
                          <option value="made_to_order">Made to Order</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${item.productId}`}
                            target="_blank"
                            className="px-2 py-1 text-[9px] uppercase tracking-wider text-[#6b645b] hover:text-white transition-colors"
                            title="Preview on storefront"
                          >
                            ↗
                          </Link>
                          {isEdited ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingRows((prev) => {
                                    const next = { ...prev };
                                    delete next[item.productId];
                                    return next;
                                  })
                                }
                                className="px-2 py-1 text-[9px] uppercase tracking-wider text-[#8c8275] hover:text-white cursor-pointer"
                              >
                                Undo
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveStock(item.productId)}
                                disabled={isPending}
                                className="px-3 py-1 bg-[#d4af6a] text-[#12110e] text-[9px] uppercase tracking-wider font-semibold hover:bg-[#e6c382] transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {isPending ? 'Saving…' : 'Save'}
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-[#6b645b] italic pr-1">Synced</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
