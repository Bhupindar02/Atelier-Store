import React, { Suspense } from 'react';
import HeroCampaign from '@/components/HeroCampaign';
import EditorialStory from '@/components/EditorialStory';
import FeaturedCollections from '@/components/FeaturedCollections';
import ProductFocusSection from '@/components/ProductFocusSection';
import SpotlightProduct from '@/components/SpotlightProduct';
import EditorialJournal from '@/components/EditorialJournal';
import CraftsmanshipBanner from '@/components/CraftsmanshipBanner';
import { getDbProducts, getDbCategories, getDbSpotlightProduct } from '@/db/queries/products';

function ProductFocusSkeleton() {
  return (
    <section className="py-24 sm:py-32 bg-[#faf9f7] border-b border-[#e8e3db] animate-pulse">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="h-3 w-32 bg-[#e8e3db] mx-auto" />
          <div className="h-10 w-80 max-w-full bg-[#e8e3db] mx-auto" />
          <div className="h-4 w-96 max-w-full bg-[#f2ede6] mx-auto" />
        </div>
        <div className="flex justify-center gap-3 mb-12">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-[#e8e3db]" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-[#f2ede6]" />
              <div className="h-4 w-1/3 bg-[#e8e3db]" />
              <div className="h-6 w-2/3 bg-[#e8e3db]" />
              <div className="h-4 w-1/4 bg-[#e8e3db]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function DynamicProductFocus() {
  const [products, categories] = await Promise.all([
    getDbProducts(),
    getDbCategories(),
  ]);

  return <ProductFocusSection initialProducts={products} initialCategories={categories} />;
}

function SpotlightSkeleton() {
  return (
    <section className="py-24 sm:py-32 bg-[#f2ede6] border-b border-[#e8e3db] animate-pulse">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="text-center mb-16 space-y-2">
          <div className="h-3 w-40 bg-[#e0dad0] mx-auto" />
          <div className="h-10 w-72 max-w-full bg-[#e0dad0] mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 aspect-square bg-[#e8e3db]" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-4 w-28 bg-[#e0dad0]" />
            <div className="h-10 w-3/4 bg-[#e0dad0]" />
            <div className="h-6 w-24 bg-[#e0dad0]" />
            <div className="h-20 bg-[#e8e3db]" />
            <div className="h-12 w-48 bg-[#e0dad0]" />
          </div>
        </div>
      </div>
    </section>
  );
}

async function DynamicSpotlight() {
  const spotlightProduct = await getDbSpotlightProduct();

  return <SpotlightProduct spotlightProduct={spotlightProduct} />;
}

export default function Home() {
  return (
    <>
      {/* 1. Large Editorial Imagery Campaign (Gucci Style) */}
      <HeroCampaign />

      {/* 2. Editorial Triptych Narrative */}
      <EditorialStory />

      {/* 3. Featured Collections Showcase */}
      <FeaturedCollections />

      {/* 4. Interactive Product Focus Section */}
      <Suspense fallback={<ProductFocusSkeleton />}>
        <DynamicProductFocus />
      </Suspense>

      {/* 5. Masterpiece Savoir-Faire Spotlight */}
      <Suspense fallback={<SpotlightSkeleton />}>
        <DynamicSpotlight />
      </Suspense>

      {/* 6. Editorial Journal Chronicles */}
      <EditorialJournal />

      {/* 7. Dedicated Client Concierge & Craftsmanship */}
      <CraftsmanshipBanner />
    </>
  );
}
