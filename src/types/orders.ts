export interface SerializedOrderItem {
  id: string;
  orderId: string;
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
  createdAt?: string;
}

export interface SerializedCustomerOrder {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: string; // 'pending' | 'processing' | 'completed' | 'cancelled'
  paymentStatus: string; // 'unpaid' | 'paid' | 'failed' | 'refunded'
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  customerEmail: string;
  customerName?: string | null;
  currency: string;
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
  } | null;
  createdAt: string;
  updatedAt: string;
  items: SerializedOrderItem[];
}
