import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { products } from "./products";

// ── Orders Table ──────────────────────────────────────────
export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // e.g. 'ord_123456789'
  orderNumber: text("order_number").notNull().unique(), // e.g. 'ATL-2026-1001'
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }), // Associated authenticated customer
  status: text("status").notNull().default("pending"), // 'pending' | 'processing' | 'completed' | 'cancelled'
  paymentStatus: text("payment_status").notNull().default("unpaid"), // 'unpaid' | 'paid' | 'failed' | 'refunded'
  stripeSessionId: text("stripe_session_id").unique(), // Explicit Stripe Checkout Session ID
  stripePaymentIntentId: text("stripe_payment_intent_id"), // Explicit Stripe PaymentIntent ID
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name"),
  currency: text("currency").notNull().default("usd"),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingFeeCents: integer("shipping_fee_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  shippingAddress: jsonb("shipping_address").$type<{
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Order Items Table ─────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(), // e.g. 'orditem_123456789'
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  size: text("size").notNull().default("One Size"),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(), // Historical snapshot in cents
  lineTotalCents: integer("line_total_cents").notNull(), // quantity * unitPriceCents
  productSnapshot: jsonb("product_snapshot").$type<{
    name: string;
    sku: string;
    material: string;
    color: string;
    primaryImage: string;
    categoryLabel?: string;
  }>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Processed Webhook Events (Idempotency Ledger) ─────────
export const processedWebhookEvents = pgTable("processed_webhook_events", {
  id: text("id").primaryKey(), // Stripe event ID e.g. 'evt_1O...'
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
});

// ── Drizzle Relations ─────────────────────────────────────
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const userOrdersRelations = relations(user, ({ many }) => ({
  orders: many(orders),
}));
