import { Suspense } from 'react';
import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth-server';
import { getOrdersByUserId } from '@/db/queries/orders';
import CustomerAccountDashboard from '@/components/CustomerAccountDashboard';
import type { SerializedCustomerOrder } from '@/types/orders';

export const metadata: Metadata = {
  title: 'Client Portfolio & Acquisitions | Maison Atelier',
  description: 'Your private client portfolio, archival acquisitions, credentials, and salon preferences at Maison Atelier.',
};

interface AccountPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function AccountContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await requireAuth('/account');
  const resolvedParams = await searchParams;
  const isUnauthorizedAdmin = resolvedParams.error === 'unauthorized_admin';
  const isUnauthorizedOrder = resolvedParams.error === 'unauthorized_order';
  const initialTab =
    resolvedParams.tab === 'orders' ||
    resolvedParams.tab === 'profile' ||
    resolvedParams.tab === 'preferences' ||
    resolvedParams.tab === 'security'
      ? resolvedParams.tab
      : undefined;

  // Authoritatively fetch ONLY orders belonging to the authenticated customer
  const userOrders = await getOrdersByUserId(session.user.id);

  const serializedOrders: SerializedCustomerOrder[] = userOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    stripeSessionId: order.stripeSessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    shippingFeeCents: order.shippingFeeCents,
    totalCents: order.totalCents,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt),
    updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : String(order.updatedAt),
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      lineTotalCents: item.lineTotalCents,
      productSnapshot: item.productSnapshot,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : undefined,
    })),
  }));

  return (
    <CustomerAccountDashboard
      initialSession={session}
      isUnauthorizedAdmin={isUnauthorizedAdmin}
      isUnauthorizedOrder={isUnauthorizedOrder}
      initialOrders={serializedOrders}
      initialTab={initialTab}
    />
  );
}

function AccountSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
      <div className="flex justify-between items-center pb-4 border-b border-[#e8e3db]">
        <div className="h-4 bg-[#e8e3db] w-36" />
        <div className="h-4 bg-[#e8e3db] w-48" />
      </div>
      <div className="bg-white border border-[#e8e3db] p-8 sm:p-12 h-64 space-y-6">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-[#e8e3db]" />
          <div className="space-y-2">
            <div className="h-3 bg-[#e8e3db] w-24" />
            <div className="h-6 bg-[#e8e3db] w-48" />
            <div className="h-3 bg-[#e8e3db] w-64" />
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#e8e3db] p-8 sm:p-12 h-96" />
    </div>
  );
}

export default function AccountPage({ searchParams }: AccountPageProps) {
  return (
    <div className="min-h-screen bg-[#faf9f7] py-12 sm:py-16">
      <Suspense fallback={<AccountSkeleton />}>
        <AccountContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
