import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getDbNewArrivals, getDbCategories } from '@/db/queries/products';
import NewArrivalsCatalog from '@/components/NewArrivalsCatalog';

export const metadata: Metadata = {
  title: 'New Arrivals — Spring/Summer 2026 Collection | MAISON ATELIER',
  description:
    'Discover the latest haute couture creations, full-grain Tuscan leather goods, and sartorial prototypes crafted in our Italian ateliers.',
  openGraph: {
    title: 'Nouvelles Créations — MAISON ATELIER',
    description:
      'The newest architectural silhouettes and Italian craftsmanship debuted for Spring/Summer 2026.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2400&auto=format&fit=crop',
        width: 1200,
        height: 1600,
        alt: 'Maison Atelier New Arrivals Spring 2026',
      },
    ],
  },
};

function CatalogSkeleton() {
  return (
    <div className="bg-[#faf9f7] min-h-screen py-16 animate-pulse">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-12">
        <div className="h-4 w-40 bg-[#e8e3db]" />
        <div className="h-16 w-3/4 max-w-xl bg-[#e8e3db]" />
        <div className="h-10 w-full bg-[#f2ede6]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-[#f2ede6]" />
              <div className="h-4 w-1/3 bg-[#e8e3db]" />
              <div className="h-6 w-2/3 bg-[#e8e3db]" />
              <div className="h-4 w-1/4 bg-[#e8e3db]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function NewArrivalsContent() {
  const [products, categories] = await Promise.all([
    getDbNewArrivals(),
    getDbCategories(),
  ]);

  return <NewArrivalsCatalog initialProducts={products} categories={categories} />;
}

export default function NewArrivalsPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <NewArrivalsContent />
    </Suspense>
  );
}
