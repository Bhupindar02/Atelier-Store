import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { getOrdersByUserId } from '@/db/queries/orders';
import type { SerializedCustomerOrder } from '@/types/orders';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to access order history.' },
        { status: 401 }
      );
    }

    // Strictly fetch orders belonging exclusively to the authenticated customer
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

    return NextResponse.json({
      success: true,
      orders: serializedOrders,
    });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'digest' in err &&
      typeof (err as { digest: unknown }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('NEXT_')
    ) {
      throw err;
    }

    console.error('Error fetching account orders:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve order history from ledger.' },
      { status: 500 }
    );
  }
}
