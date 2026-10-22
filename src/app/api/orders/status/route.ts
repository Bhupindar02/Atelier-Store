import { NextResponse } from 'next/server';
import { getOrderBySessionId, getOrderById } from '@/db/queries/orders';
import { getServerSession } from '@/lib/auth-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');

    if (!sessionId && !orderId) {
      return NextResponse.json(
        { success: false, message: 'Missing session_id or order_id parameter.' },
        { status: 400 }
      );
    }

    const order = sessionId
      ? await getOrderBySessionId(sessionId)
      : orderId
      ? await getOrderById(orderId)
      : null;

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order record not found.' },
        { status: 404 }
      );
    }

    // Security: If querying by orderId and order belongs to a registered customer, verify authentication
    if (orderId && !sessionId && order.userId) {
      const session = await getServerSession();
      if (!session || (session.user.id !== order.userId && session.user.role !== 'admin')) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized to access this acquisition record.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        stripePaymentIntentId: order.stripePaymentIntentId,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        currency: order.currency,
        subtotalCents: order.subtotalCents,
        shippingFeeCents: order.shippingFeeCents,
        totalCents: order.totalCents,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          lineTotalCents: item.lineTotalCents,
          productSnapshot: item.productSnapshot,
        })),
      },
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
    console.error('Error retrieving order status:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve order status.' },
      { status: 500 }
    );
  }
}
