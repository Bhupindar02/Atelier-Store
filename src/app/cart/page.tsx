import { Suspense } from 'react';
import type { Metadata } from 'next';
import CartPageView from '@/components/CartPageView';

export const metadata: Metadata = {
  title: 'Shopping Bag | Maison Atelier',
  description: 'Review your selected creations, quantities, and complimentary white-glove delivery options at Maison Atelier.',
};

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf9f7] py-10 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-8 animate-pulse">
        <div className="h-8 bg-[#e8e3db] w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white border border-[#e8e3db] p-8 h-96" />
          <div className="lg:col-span-4 bg-white border border-[#e8e3db] p-8 h-72" />
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartPageView />
    </Suspense>
  );
}
