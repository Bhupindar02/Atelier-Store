import React from 'react';
import HeroCampaign from '@/components/HeroCampaign';
import EditorialStory from '@/components/EditorialStory';
import FeaturedCollections from '@/components/FeaturedCollections';
import ProductFocusSection from '@/components/ProductFocusSection';
import SpotlightProduct from '@/components/SpotlightProduct';
import EditorialJournal from '@/components/EditorialJournal';
import CraftsmanshipBanner from '@/components/CraftsmanshipBanner';
import { getDbProducts, getDbCategories, getDbSpotlightProduct } from '@/db/queries/products';

export default async function Home() {
  const [products, categories, spotlightProduct] = await Promise.all([
    getDbProducts(),
    getDbCategories(),
    getDbSpotlightProduct(),
  ]);

  return (
    <>
      {/* 1. Large Editorial Imagery Campaign (Gucci Style) */}
      <HeroCampaign />

      {/* 2. Editorial Triptych Narrative */}
      <EditorialStory />

      {/* 3. Featured Collections Showcase */}
      <FeaturedCollections />

      {/* 4. Interactive Product Focus Section */}
      <ProductFocusSection initialProducts={products} initialCategories={categories} />

      {/* 5. Masterpiece Savoir-Faire Spotlight */}
      <SpotlightProduct spotlightProduct={spotlightProduct} />

      {/* 6. Editorial Journal Chronicles */}
      <EditorialJournal />

      {/* 7. Dedicated Client Concierge & Craftsmanship */}
      <CraftsmanshipBanner />
    </>
  );
}
