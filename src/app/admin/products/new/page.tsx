import Link from 'next/link';
import { requireAdmin } from '@/lib/auth-server';
import { getAdminCategories } from '@/db/queries/admin';
import AdminProductForm from '@/components/admin/AdminProductForm';

export const instant = false;

export const metadata = {
  title: 'Create Product | Atelier Administration',
  description: 'Introduce a new handcrafted creation to the Maison Atelier catalog.',
};

export default async function AdminNewProductPage() {
  // Defense-in-depth: explicit server-side admin verification
  await requireAdmin('/admin/products/new');

  const categories = await getAdminCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-2">
          <Link href="/admin/products" className="hover:text-white transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-[#d4af6a]">New Creation</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-white font-light">
          Introduce New Product
        </h1>
        <p className="text-xs text-[#8c8275] mt-1">
          Catalog metadata, artisanal storytelling, pricing, and initial inventory ledger entry.
        </p>
      </div>

      {/* Product Creation Form */}
      <AdminProductForm mode="create" categories={categories} />
    </div>
  );
}
