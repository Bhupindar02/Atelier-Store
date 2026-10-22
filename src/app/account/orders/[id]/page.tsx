import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth-server';
import { getOrderById } from '@/db/queries/orders';
import { OrderDetailView } from '@/components/OrderDetailView';
import type { SerializedCustomerOrder } from '@/types/orders';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Acquisition Dossier · ${id} | Maison Atelier`,
    description: 'Individual acquisition dossier, item quantities, pricing breakdown, and archival order state.',
  };
}

async function OrderDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth(`/account/orders/${id}`);

  const order = await getOrderById(id);

  // Security: The server must ONLY return an order if it belongs to the authenticated customer
  if (!order || (order.userId !== session.user.id && session.user.role !== 'admin')) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#fef2f2] text-[#a11826] border border-[#f87171]/30 flex items-center justify-center font-serif text-2xl">
          !
        </div>
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8e857b] font-medium block">
            Security Clearance Restricted
          </span>
          <h1 className="font-serif text-2xl font-light text-[#1a1714]">
            Acquisition Record Unavailable
          </h1>
          <p className="text-xs text-[#787065] leading-relaxed">
            This acquisition record does not exist or is registered to another client profile. Access is strictly confined to the verified authenticated owner.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/account?tab=orders"
            className="inline-block px-6 py-3 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors"
          >
            Return to Private Acquisitions →
          </Link>
        </div>
      </div>
    );
  }

  const serializedOrder: SerializedCustomerOrder = {
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
  };

  return <OrderDetailView order={serializedOrder} />;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <div className="min-h-screen bg-[#faf9f7] py-12 sm:py-16">
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-8">
            <div className="h-4 bg-[#e8e3db] w-48" />
            <div className="bg-white border border-[#e8e3db] p-8 sm:p-12 h-96 space-y-6">
              <div className="h-8 bg-[#e8e3db] w-64" />
              <div className="h-4 bg-[#e8e3db] w-40" />
              <div className="h-32 bg-[#faf9f7] border border-[#e8e3db]" />
            </div>
          </div>
        }
      >
        <OrderDetailContent params={params} />
      </Suspense>
    </div>
  );
}
