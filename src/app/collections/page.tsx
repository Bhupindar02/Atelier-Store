import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import {
  getDbCategories,
  getDbCategoryBySlug,
  getDbProducts,
} from '@/db/queries/products';
import CategoryCollectionView from '@/components/CategoryCollectionView';

export const metadata: Metadata = {
  title: 'Haute Collections — MAISON ATELIER',
  description:
    'Explore the complete collection of handcrafted Tuscan leather goods, bespoke tailoring, ready-to-wear, and accessories from Maison Atelier.',
};

function CollectionsSkeleton() {
  return (
    <div className="bg-[#faf9f7] min-h-screen animate-pulse">
      <div className="h-96 bg-[#11100e] relative flex items-center">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 space-y-4">
          <div className="h-4 w-32 bg-white/20" />
          <div className="h-12 w-3/4 max-w-lg bg-white/30" />
          <div className="h-4 w-96 max-w-full bg-white/20" />
        </div>
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

async function CollectionsContent() {
  const [category, products, allCategories] = await Promise.all([
    getDbCategoryBySlug('all'),
    getDbProducts('all'),
    getDbCategories(),
  ]);

  return (
    <CategoryCollectionView
      category={category!}
      allCategories={allCategories}
      products={products}
    />
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<CollectionsSkeleton />}>
      <CollectionsContent />
    </Suspense>
  );
}
