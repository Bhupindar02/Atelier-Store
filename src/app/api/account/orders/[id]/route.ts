import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { getOrderById } from '@/db/queries/orders';
import type { SerializedCustomerOrder } from '@/types/orders';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to view order details.' },
        { status: 401 }
      );
    }

    const { id: orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required.' },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order record not found in ledger.' },
        { status: 404 }
      );
    }

    // Strict security check: The server MUST only return an order if it belongs to the authenticated customer
    if (order.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied. You do not possess clearance for this acquisition record.',
        },
        { status: 403 }
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

    return NextResponse.json({
      success: true,
      order: serializedOrder,
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

    console.error('Error in GET /api/account/orders/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Internal ledger query error.' },
      { status: 500 }
    );
  }
}
