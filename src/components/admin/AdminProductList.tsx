'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteProductAction, updateProductQuickAction } from '@/app/admin/actions';
import type { AdminProductSummary, AdminCategorySummary } from '@/db/queries/admin';

interface AdminProductListProps {
  initialProducts: AdminProductSummary[];
  categories: AdminCategorySummary[];
}

export default function AdminProductList({
  initialProducts,
  categories,
}: AdminProductListProps) {
  const [productsList, setProductsList] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Quick edit modal state
  const [quickEditProduct, setQuickEditProduct] = useState<AdminProductSummary | null>(null);
  const [quickPrice, setQuickPrice] = useState<number>(0);
  const [quickCategoryId, setQuickCategoryId] = useState<string>('');
  const [quickQuantity, setQuickQuantity] = useState<number>(0);
  const [quickStatus, setQuickStatus] = useState<string>('in_stock');

  // Filtered products
  const filteredProducts = productsList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      item.categoryId === selectedCategory ||
      item.categorySlug === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || item.stockStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the catalog? This will also remove its inventory ledger record.`)) {
      return;
    }

    setStatusMessage(null);
    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (res.success) {
        setStatusMessage({ text: res.message || 'Product deleted.' });
        setProductsList((prev) => prev.filter((p) => p.id !== id));
      } else {
        setStatusMessage({ text: res.error || 'Failed to delete product.', isError: true });
      }
    });
  };

  const openQuickEdit = (p: AdminProductSummary) => {
    setQuickEditProduct(p);
    setQuickPrice(p.price);
    setQuickCategoryId(p.categoryId);
    setQuickQuantity(p.stockQuantity);
    setQuickStatus(p.stockStatus);
  };

  const handleSaveQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditProduct) return;

    setStatusMessage(null);
    startTransition(async () => {
      const res = await updateProductQuickAction(quickEditProduct.id, {
        price: quickPrice,
        categoryId: quickCategoryId,
        stockQuantity: quickQuantity,
        stockStatus: quickStatus as 'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock',
      });

      if (res.success) {
        setStatusMessage({ text: res.message || 'Product updated.' });
        const matchedCat = categories.find((c) => c.id === quickCategoryId);
        setProductsList((prev) =>
          prev.map((p) =>
            p.id === quickEditProduct.id
              ? {
                  ...p,
                  price: quickPrice,
                  categoryId: quickCategoryId,
                  categoryName: matchedCat?.name || p.categoryName,
                  stockQuantity: quickQuantity,
                  stockStatus: quickStatus,
                }
              : p
          )
        );
        setQuickEditProduct(null);
      } else {
        setStatusMessage({ text: res.error || 'Failed to update product.', isError: true });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
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

      {/* Filter and Search Bar */}
      <div className="bg-[#181714] border border-[#2b2823] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full md:w-auto relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU, or material..."
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

          {/* Availability Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
          >
            <option value="all">All Availability States</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (≤ 3)</option>
            <option value="made_to_order">Made to Order</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-[#d4af6a] text-[#12110e] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#e6c382] transition-colors whitespace-nowrap"
          >
            + Create Product
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#181714] border border-[#2b2823] overflow-hidden">
        <div className="p-4 border-b border-[#2b2823] flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.2em] text-white font-medium">
            Catalog Directory
          </h2>
          <span className="text-[10px] text-[#8c8275] font-mono">
            Showing {filteredProducts.length} of {productsList.length} products
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-[#8c8275]">
            <p className="text-xs uppercase tracking-widest">No products match your criteria.</p>
            <p className="text-[10px] text-[#6b645b] mt-1">Try clearing filters or search query.</p>
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
                  <th className="py-3 px-4">Stock & Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2823]/60 text-xs text-[#a0978d]">
                {filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1f1d18] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 bg-[#23201b] shrink-0 border border-[#2b2823]">
                          {item.primaryImage ? (
                            <Image
                              src={item.primaryImage}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized
                            />
                          ) : null}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-serif text-white text-sm font-normal">
                              {item.name}
                            </p>
                            {item.isSpotlight && (
                              <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-[#d4af6a]/15 text-[#d4af6a] border border-[#d4af6a]/30">
                                Spotlight
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#6b645b]">
                            {item.material} · {item.color}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#d4af6a]">
                      {item.sku}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider bg-[#23201b] border border-[#3a3530] text-[#cfc7bc]">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-serif text-white text-sm">
                      ${item.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.stockStatus === 'in_stock'
                              ? 'bg-[#7ee787]'
                              : item.stockStatus === 'low_stock'
                              ? 'bg-[#f87171]'
                              : item.stockStatus === 'made_to_order'
                              ? 'bg-[#e3b341]'
                              : 'bg-[#6b645b]'
                          }`}
                        />
                        <span className="capitalize text-[11px] text-[#cfc7bc]">
                          {item.stockStatus.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-[#6b645b] font-mono">
                          ({item.stockQuantity} qty)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openQuickEdit(item)}
                          className="px-2 py-1 text-[9px] uppercase tracking-wider border border-[#3a3530] text-[#cfc7bc] hover:border-[#d4af6a] hover:text-[#d4af6a] transition-colors cursor-pointer"
                          title="Quick update price, category or availability"
                        >
                          Quick
                        </button>
                        <Link
                          href={`/admin/products/${item.id}/edit`}
                          className="px-2.5 py-1 text-[9px] uppercase tracking-wider border border-[#3a3530] text-[#cfc7bc] hover:border-[#d4af6a] hover:text-[#d4af6a] transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/products/${item.id}`}
                          target="_blank"
                          className="px-2 py-1 text-[9px] uppercase tracking-wider text-[#6b645b] hover:text-white transition-colors"
                          title="View on storefront"
                        >
                          ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={isPending}
                          className="px-2 py-1 text-[9px] uppercase tracking-wider text-[#8c8275] hover:text-[#f87171] transition-colors cursor-pointer"
                          title="Delete from catalog"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Edit Modal */}
      {quickEditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveQuickEdit}
            className="bg-[#181714] border border-[#d4af6a]/40 w-full max-w-lg p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2823]">
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#d4af6a]">
                  QUICK CATALOG OVERRIDE
                </span>
                <h3 className="font-serif text-lg text-white">
                  {quickEditProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditProduct(null)}
                className="text-[#8c8275] hover:text-white text-base px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
                  Retail Price ($ USD) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white font-serif focus:outline-none focus:border-[#d4af6a]"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
                  Collection Category *
                </label>
                <select
                  value={quickCategoryId}
                  onChange={(e) => setQuickCategoryId(e.target.value)}
                  className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quickQuantity}
                  onChange={(e) => {
                    const q = parseInt(e.target.value, 10) || 0;
                    setQuickQuantity(q);
                    if (q === 0) setQuickStatus('out_of_stock');
                    else if (q <= 3 && quickStatus !== 'made_to_order') setQuickStatus('low_stock');
                    else if (q > 3 && (quickStatus === 'out_of_stock' || quickStatus === 'low_stock')) {
                      setQuickStatus('in_stock');
                    }
                  }}
                  className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af6a]"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[#8c8275] mb-1">
                  Availability Status *
                </label>
                <select
                  value={quickStatus}
                  onChange={(e) => setQuickStatus(e.target.value)}
                  className="w-full bg-[#100f0c] border border-[#3a3530] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af6a]"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock (≤ 3)</option>
                  <option value="made_to_order">Made to Order</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2b2823]">
              <Link
                href={`/admin/products/${quickEditProduct.id}/edit`}
                className="text-[9px] uppercase tracking-wider text-[#d4af6a] hover:underline"
              >
                Open Full Editor →
              </Link>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuickEditProduct(null)}
                  className="px-4 py-2 border border-[#3a3530] text-[9px] uppercase tracking-wider text-[#8c8275]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#d4af6a] text-[#12110e] text-[9px] uppercase tracking-wider font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Updating…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
