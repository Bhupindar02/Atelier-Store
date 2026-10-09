import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllProducts } from '@/data/fashion-data';
import { getDbProductById } from '@/db/queries/products';
import ProductDetailView from '@/components/ProductDetailView';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getDbProductById(id);

  if (!product) {
    return {
      title: 'Creation Not Found — ATELIER',
    };
  }

  return {
    title: `${product.name} — ATELIER Haute Couture`,
    description: `${product.description} | ${product.material} | ${product.formattedPrice}`,
    openGraph: {
      title: `${product.name} — MAISON ATELIER`,
      description: product.description,
      images: [
        {
          url: product.primaryImage,
          width: 1200,
          height: 1600,
          alt: product.name,
        },
      ],
    },
  };
}

function ProductSkeleton() {
  return (
    <div className="bg-[#faf9f7] min-h-screen py-16 animate-pulse">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 aspect-[3/4] bg-[#f2ede6]" />
        <div className="lg:col-span-5 space-y-6">
          <div className="h-4 w-24 bg-[#e8e3db]" />
          <div className="h-10 w-3/4 bg-[#e8e3db]" />
          <div className="h-6 w-32 bg-[#e8e3db]" />
          <div className="h-32 bg-[#f2ede6]" />
          <div className="h-14 bg-[#1a1714]" />
        </div>
      </div>
    </div>
  );
}

async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getDbProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
