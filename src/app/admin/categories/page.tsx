import { requireAdmin } from '@/lib/auth-server';
import { getAdminCategories } from '@/db/queries/admin';
import AdminCategoryManager from '@/components/admin/AdminCategoryManager';

export const instant = false;

export const metadata = {
  title: 'Taxonomy Categories | Atelier Administration',
  description: 'Manage Maison Atelier collection categories and department taxonomy.',
};

export default async function AdminCategoriesPage() {
  // Defense-in-depth: explicit server-side admin verification
  await requireAdmin('/admin/categories');

  const categories = await getAdminCategories();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2b2823]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#d4af6a] font-semibold">
              TAXONOMY DIRECTORY
            </span>
            <span className="text-xs text-[#6b645b]">·</span>
            <span className="text-xs text-[#a0978d] font-mono">
              {categories.length} Active Collections
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white font-light">
            Collections & Categories
          </h1>
          <p className="text-xs text-[#8c8275] mt-1">
            Structure the storefront departments, navigation taxonomies, and catalog classifications.
          </p>
        </div>
      </div>

      {/* Category Manager Component */}
      <AdminCategoryManager initialCategories={categories} />
    </div>
  );
}
