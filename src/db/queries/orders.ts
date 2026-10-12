import { db } from "@/db";
import { orders, orderItems, processedWebhookEvents, stocks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export interface CreatePendingOrderParams {
  orderId: string;
  orderNumber: string;
  userId?: string | null;
  customerEmail: string;
  customerName?: string | null;
  currency?: string;
  subtotalCents: number;
  shippingFeeCents: number;
  totalCents: number;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  metadata?: Record<string, unknown>;
  items: Array<{
    id: string;
    productId: string;
    size: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    productSnapshot: {
      name: string;
      sku: string;
      material: string;
      color: string;
      primaryImage: string;
      categoryLabel?: string;
    };
  }>;
}

/**
 * Creates an immutable pending order and line item records prior to Stripe Checkout Session redirect.
 */
export async function createPendingOrder(params: CreatePendingOrderParams) {
  const [createdOrder] = await db
    .insert(orders)
    .values({
      id: params.orderId,
      orderNumber: params.orderNumber,
      userId: params.userId || null,
      status: "pending",
      paymentStatus: "unpaid",
      customerEmail: params.customerEmail,
      customerName: params.customerName || null,
      currency: params.currency || "usd",
      subtotalCents: params.subtotalCents,
      shippingFeeCents: params.shippingFeeCents,
      totalCents: params.totalCents,
      shippingAddress: params.shippingAddress || null,
      metadata: params.metadata || {},
    })
    .returning();

  if (params.items.length > 0) {
    await db.insert(orderItems).values(
      params.items.map((item) => ({
        id: item.id,
        orderId: createdOrder.id,
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        lineTotalCents: item.lineTotalCents,
        productSnapshot: item.productSnapshot,
      }))
    );
  }

  return createdOrder;
}

/**
 * Links the generated Stripe Checkout Session ID to the order record.
 */
export async function attachStripeSessionToOrder(orderId: string, stripeSessionId: string) {
  const [updated] = await db
    .update(orders)
    .set({
      stripeSessionId,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  return updated;
}

/**
 * Retrieves an order and its items by Stripe Checkout Session ID.
 */
export async function getOrderBySessionId(sessionId: string) {
  return await db.query.orders.findFirst({
    where: eq(orders.stripeSessionId, sessionId),
    with: {
      user: true,
      items: true,
    },
  });
}

/**
 * Retrieves an order and its items by internal order ID.
 */
export async function getOrderById(orderId: string) {
  return await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      user: true,
      items: true,
    },
  });
}

/**
 * Retrieves orders for a customer account.
 */
export async function getOrdersByUserId(userId: string) {
  return await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: {
      items: true,
    },
  });
}

/**
 * Checks if a Stripe webhook event was already processed (Idempotency).
 */
export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  const existing = await db.query.processedWebhookEvents.findFirst({
    where: eq(processedWebhookEvents.id, eventId),
  });
  return Boolean(existing);
}

/**
 * Records an event into the idempotency ledger.
 */
export async function recordProcessedWebhookEvent(eventId: string, eventType: string) {
  await db
    .insert(processedWebhookEvents)
    .values({
      id: eventId,
      eventType,
    })
    .onConflictDoNothing();
}

export interface FulfillOrderParams {
  orderId?: string | null;
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

/**
 * Atomically marks order as paid and decrements inventory in the stocks table.
 * Idempotently short-circuits if the order is already marked as paid.
 */
export async function fulfillOrderAndDecrementStock(params: FulfillOrderParams) {
  let order = await db.query.orders.findFirst({
    where: eq(orders.stripeSessionId, params.stripeSessionId),
    with: {
      items: true,
    },
  });

  if (!order && params.orderId) {
    order = await db.query.orders.findFirst({
      where: eq(orders.id, params.orderId),
      with: {
        items: true,
      },
    });
  }

  if (!order) {
    return { success: false, reason: "order_not_found" };
  }

  // Idempotency: skip decrementing inventory if already paid
  if (order.paymentStatus === "paid") {
    return { success: true, alreadyFulfilled: true, order };
  }

  // Update order status to paid and processing
  const [updatedOrder] = await db
    .update(orders)
    .set({
      status: "processing",
      paymentStatus: "paid",
      stripePaymentIntentId: params.stripePaymentIntentId || order.stripePaymentIntentId,
      customerEmail: params.customerEmail || order.customerEmail,
      customerName: params.customerName || order.customerName,
      shippingAddress: params.shippingAddress || order.shippingAddress,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id))
    .returning();

  // Atomically decrement inventory in stocks table for each item
  for (const item of order.items) {
    const currentStock = await db.query.stocks.findFirst({
      where: eq(stocks.productId, item.productId),
    });

    if (currentStock) {
      const remainingQty = Math.max(0, currentStock.quantity - item.quantity);
      const newStatus =
        remainingQty === 0
          ? "out_of_stock"
          : remainingQty <= 3
          ? "low_stock"
          : currentStock.status;

      await db
        .update(stocks)
        .set({
          quantity: remainingQty,
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(stocks.productId, item.productId));
    }
  }

  return { success: true, order: updatedOrder };
}

/**
 * Marks a pending order as cancelled (e.g. upon checkout.session.expired).
 */
export async function cancelPendingOrder(stripeSessionId: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.stripeSessionId, stripeSessionId),
  });

  if (order && order.status === "pending" && order.paymentStatus === "unpaid") {
    await db
      .update(orders)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));
  }
}
