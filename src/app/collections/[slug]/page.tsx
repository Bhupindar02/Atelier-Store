import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getDbCategories,
  getDbCategoryBySlug,
  getDbProducts,
} from '@/db/queries/products';
import CategoryCollectionView from '@/components/CategoryCollectionView';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getDbCategories();
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getDbCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Collection Not Found — ATELIER',
    };
  }

  return {
    title: `${category.name} Collection — MAISON ATELIER`,
    description: `${category.subtitle}. ${category.description}`,
    openGraph: {
      title: `${category.name} — Haute Couture & Contemporary Luxury`,
      description: category.description,
      images: [
        {
          url: category.heroImage,
          width: 1200,
          height: 1600,
          alt: category.name,
        },
      ],
    },
  };
}

function CategorySkeleton() {
  return (
    <div className="bg-[#faf9f7] min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="h-96 bg-[#1a1714] relative flex items-center">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 space-y-4">
          <div className="h-4 w-32 bg-white/20" />
          <div className="h-12 w-3/4 max-w-lg bg-white/30" />
          <div className="h-4 w-96 max-w-full bg-white/20" />
        </div>
      </div>
      {/* Filter bar skeleton */}
      <div className="h-14 border-b border-[#e8e3db] bg-white/50" />
      {/* Products grid skeleton */}
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

async function CollectionContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, products, allCategories] = await Promise.all([
    getDbCategoryBySlug(slug),
    getDbProducts(slug),
    getDbCategories(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <CategoryCollectionView
      category={category}
      allCategories={allCategories}
      products={products}
    />
  );
}

export default function CollectionPage({ params }: CollectionPageProps) {
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CollectionContent params={params} />
    </Suspense>
  );
}
