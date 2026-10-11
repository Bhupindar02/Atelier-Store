import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getDbProducts, getDbCategories } from '@/db/queries/products';
import ProductSearchCatalog from '@/components/ProductSearchCatalog';

export const metadata: Metadata = {
  title: 'Search Creations & Archives — MAISON ATELIER',
  description:
    'Search our complete luxury collections by silhouette, noble Italian materials, and bespoke tailoring.',
};

function SearchSkeleton() {
  return (
    <div className="bg-[#faf9f7] min-h-screen animate-pulse">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-16 pb-20 space-y-8">
        <div className="h-4 w-32 bg-[#e8e3db]" />
        <div className="h-12 w-3/4 max-w-lg bg-[#e8e3db]" />
        <div className="h-14 w-full max-w-2xl bg-[#e8e3db]" />
      </div>
      <div className="h-14 border-b border-[#e8e3db] bg-white/50" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-[#f2ede6]" />
              <div className="h-3 w-1/3 bg-[#e8e3db] mx-auto" />
              <div className="h-5 w-2/3 bg-[#e8e3db] mx-auto" />
              <div className="h-4 w-1/4 bg-[#e8e3db] mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function SearchContent({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const [products, categories] = await Promise.all([
    getDbProducts(),
    getDbCategories(),
  ]);

  return (
    <ProductSearchCatalog
      initialProducts={products}
      categories={categories}
      initialQuery={resolvedParams.q || ''}
      initialCategory={resolvedParams.category || 'all'}
    />
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string }>;
}) {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}
