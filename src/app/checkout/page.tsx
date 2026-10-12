import { Suspense } from 'react';
import type { Metadata } from 'next';
import CheckoutPageView from '@/components/CheckoutPageView';

export const metadata: Metadata = {
  title: 'Secure Checkout | Maison Atelier',
  description: 'Finalize your acquisition with end-to-end encrypted Stripe payment processing and complimentary white-glove armored delivery.',
};

function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf9f7] py-10 sm:py-16">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 space-y-8 animate-pulse">
        <div className="h-6 bg-[#e8e3db] w-48" />
        <div className="h-10 bg-[#e8e3db] w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 bg-white border border-[#e8e3db] h-96 p-8" />
          <div className="lg:col-span-5 bg-white border border-[#e8e3db] h-96 p-8" />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutPageView />
    </Suspense>
  );
}
