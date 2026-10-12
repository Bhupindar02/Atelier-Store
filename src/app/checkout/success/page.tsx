import { Suspense } from 'react';
import { Metadata } from 'next';
import { CheckoutSuccessView } from '@/components/CheckoutSuccessView';

export const metadata: Metadata = {
  title: 'Certificate of Acquisition | Maison Atelier',
  description: 'Your luxury purchase has been confirmed and registered in the Maison Atelier archival ledger.',
};

interface PageProps {
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
}

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const sessionId = resolvedParams.session_id || '';
  const orderId = resolvedParams.order_id || '';
  return <CheckoutSuccessView sessionId={sessionId} orderId={orderId} />;
}

export default function CheckoutSuccessPage({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-6">
          <div className="text-center font-serif text-lg text-[#787065] animate-pulse">
            Retrieving Maison ledger certificate...
          </div>
        </div>
      }
    >
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
