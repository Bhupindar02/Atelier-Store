import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-server';
import { getAdminProducts, getAdminCategories, getAdminMetrics } from '@/db/queries/admin';
import AdminProductList from '@/components/admin/AdminProductList';

export const instant = false;

export const metadata = {
  title: 'Catalog Products | Atelier Administration',
  description: 'Manage Maison Atelier catalog products, pricing, and availability.',
};

export default async function AdminProductsPage() {
  // Defense-in-depth: explicit server-side admin verification
  await requireAdmin('/admin/products');

  const [productsList, categories, metrics] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminMetrics(),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2b2823]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#d4af6a] font-semibold">
              CATALOG MANAGEMENT
            </span>
            <span className="text-xs text-[#6b645b]">·</span>
            <span className="text-xs text-[#a0978d] font-mono">
              {productsList.length} Total SKUs Across {categories.length} Collections
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white font-light">
            Artisanal Products
          </h1>
          <p className="text-xs text-[#8c8275] mt-1">
            Review, edit, and introduce handcrafted leather goods, tailoring, and footwear creations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#d4af6a] text-[#12110e] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#e6c382] transition-colors shadow-lg shadow-[#d4af6a]/10"
          >
            + Create Product
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#181714] border border-[#2b2823] p-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c8275]">Active Products</span>
          <p className="text-2xl font-serif text-white mt-1">{metrics.totalProducts}</p>
        </div>
        <div className="bg-[#181714] border border-[#2b2823] p-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c8275]">Collections</span>
          <p className="text-2xl font-serif text-[#d4af6a] mt-1">{metrics.totalCategories}</p>
        </div>
        <div className="bg-[#181714] border border-[#2b2823] p-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c8275]">Low Inventory</span>
          <p className={`text-2xl font-serif mt-1 ${metrics.lowStockCount > 0 ? 'text-[#f87171]' : 'text-[#7ee787]'}`}>
            {metrics.lowStockCount}
          </p>
        </div>
        <div className="bg-[#181714] border border-[#2b2823] p-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#8c8275]">Total Orders</span>
          <p className="text-2xl font-serif text-white mt-1">{metrics.totalOrders}</p>
        </div>
      </div>

      {/* Interactive Products Table Component */}
      <AdminProductList initialProducts={productsList} categories={categories} />
    </div>
  );
}
