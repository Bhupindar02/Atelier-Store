import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-server';
import { db } from '@/db';
import { categories, products, stocks } from '@/db/schema';
import AdminActionCockpit from '@/components/AdminActionCockpit';
import SignOutButton from '@/components/SignOutButton';

export const metadata: Metadata = {
  title: 'Atelier Administration Console | Maison Atelier',
  description: 'Maison Atelier executive administration cockpit and catalog inventory oversight.',
};

async function AdminContent() {
  const session = await requireAdmin('/admin');

  // Query live catalog metrics
  let categoryList: (typeof categories.$inferSelect)[] = [];
  let productList: (typeof products.$inferSelect)[] = [];
  let stockList: (typeof stocks.$inferSelect)[] = [];

  try {
    [categoryList, productList, stockList] = await Promise.all([
      db.select().from(categories),
      db.select().from(products),
      db.select().from(stocks),
    ]);
  } catch (err) {
    console.warn('Admin dashboard DB fetch fallback:', err);
  }

  const lowStockCount = stockList.filter(
    (s) => s.status === 'low_stock' || s.quantity <= 3
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-[#181714] border border-[#2b2823] p-8 sm:p-12 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#2b2823]">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#d4af6a] animate-pulse" />
              <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#d4af6a]">
                MAISON ATELIER · EXECUTIVE CONSOLE
              </span>
              <span className="text-[8px] tracking-[0.2em] uppercase px-2.5 py-0.5 bg-[#d4af6a]/10 border border-[#d4af6a]/40 text-[#d4af6a] font-mono">
                ROLE: {(session.user.role || 'ADMIN').toUpperCase()}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">
              Atelier Control Cockpit
            </h1>
            <p className="text-xs text-[#a0978d] font-light">
              Authenticated Administrator: <strong className="text-[#f5f2eb]">{session.user.name}</strong> ({session.user.email})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/account"
              className="px-4 py-2.5 border border-[#3a3530] text-[#a0978d] text-[10px] uppercase tracking-[0.2em] hover:text-white hover:border-[#a0978d] transition-colors"
            >
              Client View
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 border border-[#3a3530] text-[#a0978d] text-[10px] uppercase tracking-[0.2em] hover:text-white hover:border-[#a0978d] transition-colors"
            >
              Storefront
            </Link>
            <SignOutButton
              className="px-4 py-2.5 bg-[#a11826] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#80131e] transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#a0978d]">Collections</span>
            <p className="text-3xl font-serif text-[#d4af6a]">{categoryList.length}</p>
            <p className="text-[10px] text-[#6b645b]">Active Department Taxonomies</p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#a0978d]">Total Products</span>
            <p className="text-3xl font-serif text-white">{productList.length}</p>
            <p className="text-[10px] text-[#6b645b]">Artisanal SKUs in Catalog</p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#a0978d]">Tracked Inventories</span>
            <p className="text-3xl font-serif text-white">{stockList.length}</p>
            <p className="text-[10px] text-[#6b645b]">1:1 Stock Ledger Records</p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#a0978d]">Critical / Low Stock</span>
            <p className={`text-3xl font-serif ${lowStockCount > 0 ? 'text-[#f87171]' : 'text-[#7ee787]'}`}>
              {lowStockCount}
            </p>
            <p className="text-[10px] text-[#6b645b]">Requires Concierge Alert</p>
          </div>
        </div>
      </div>

      {/* Admin Action Cockpit Component */}
      <AdminActionCockpit />

      {/* Catalog Audit Overview Table */}
      <div className="bg-[#181714] border border-[#2b2823] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#2b2823]">
          <div>
            <span className="text-[9px] tracking-[0.25em] uppercase font-semibold text-[#d4af6a] block mb-1">
              CURRENT ATELIER CATALOG
            </span>
            <h3 className="font-serif text-xl font-light text-white">
              Inventory & Access Status
            </h3>
          </div>
          <span className="text-xs font-mono text-[#a0978d]">
            {productList.length} active creations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2b2823] text-[#a0978d] uppercase tracking-[0.15em] text-[10px]">
                <th className="py-3 pr-4">Creation Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 pl-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23201b] font-light">
              {productList.slice(0, 8).map((product) => {
                const stock = stockList.find((s) => s.productId === product.id);
                return (
                  <tr key={product.id} className="hover:bg-[#201e19] transition-colors">
                    <td className="py-3 pr-4 font-normal text-white">{product.name}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#a0978d]">{product.sku}</td>
                    <td className="py-3 px-4 font-mono text-[#d4af6a]">{product.price}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono ${
                        stock?.status === 'in_stock'
                          ? 'text-[#7ee787] bg-[#7ee787]/10'
                          : stock?.status === 'low_stock'
                          ? 'text-[#fbbf24] bg-[#fbbf24]/10'
                          : 'text-[#a0978d] bg-[#3a3530]/20'
                      }`}>
                        {stock?.status || 'unrecorded'}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        className="text-[10px] text-[#d4af6a] hover:underline"
                      >
                        Inspect ↗
                      </Link>
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

function AdminSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
      <div className="bg-[#181714] border border-[#2b2823] p-8 sm:p-12 h-64" />
      <div className="bg-[#181714] border border-[#2b2823] p-8 sm:p-12 h-96" />
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#11100e] text-[#f5f2eb] py-12 sm:py-16">
      <Suspense fallback={<AdminSkeleton />}>
        <AdminContent />
      </Suspense>
    </div>
  );
}
