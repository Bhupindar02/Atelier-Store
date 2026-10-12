import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { getDbProductById } from '@/db/queries/products';
import { createPendingOrder, attachStripeSessionToOrder } from '@/db/queries/orders';
import { getServerSession } from '@/lib/auth-server';

export interface CheckoutInputItem {
  productId: string;
  size?: string;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawItems: CheckoutInputItem[] = Array.isArray(body?.items) ? body.items : [];

    if (rawItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Your shopping bag is empty.' },
        { status: 400 }
      );
    }

    // Authenticate user if signed in
    const session = await getServerSession();
    const userId = session?.user?.id || null;
    const userEmail = session?.user?.email || null;
    const userName = session?.user?.name || null;

    // Verify Stripe configuration
    let stripeClient;
    try {
      stripeClient = getStripeClient();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Stripe is not configured';
      return NextResponse.json(
        {
          success: false,
          message: `${message}. Please set STRIPE_SECRET_KEY in your .env file to enable checkout.`,
        },
        { status: 503 }
      );
    }

    // Step 1: Revalidate stock and calculate authoritative prices from PostgreSQL
    const validatedItems = [];
    let subtotalCents = 0;

    for (const item of rawItems) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        continue;
      }

      // Fetch trusted product data directly from PostgreSQL
      const product = await getDbProductById(item.productId);
      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Catalog item "${item.productId}" is unavailable or no longer exists.`,
          },
          { status: 400 }
        );
      }

      // Stock validation gate before initiating checkout
      const maxAvailable =
        typeof product.stockState?.remaining === 'number'
          ? product.stockState.remaining
          : 0;

      if (maxAvailable <= 0) {
        return NextResponse.json(
          {
            success: false,
            conflict: true,
            message: `"${product.name}" is currently out of stock. Please remove it from your bag to proceed.`,
          },
          { status: 409 }
        );
      }

      if (item.quantity > maxAvailable) {
        return NextResponse.json(
          {
            success: false,
            conflict: true,
            message: `Only ${maxAvailable} unit(s) of "${product.name}" are currently available in the Maison atelier. Please adjust your bag quantity.`,
          },
          { status: 409 }
        );
      }

      // Pricing strictly from database (in cents)
      const unitPriceCents = product.price * 100;
      const lineTotalCents = unitPriceCents * item.quantity;
      subtotalCents += lineTotalCents;

      validatedItems.push({
        id: `orditem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        productId: product.id,
        size: item.size || 'One Size',
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents,
        product,
        productSnapshot: {
          name: product.name,
          sku: product.sku,
          material: product.material,
          color: product.color,
          primaryImage: product.primaryImage,
          categoryLabel: product.categoryLabel,
        },
      });
    }

    if (validatedItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid items found in bag.' },
        { status: 400 }
      );
    }

    // Step 2: Calculate shipping fees ($0 if subtotal >= $500, else $120)
    const shippingFeeCents = subtotalCents >= 50000 ? 0 : 12000;
    const totalCents = subtotalCents + shippingFeeCents;

    // Step 3: Generate identifiers
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ord_${timestamp}_${randomSuffix}`;
    const orderNumber = `ATL-${new Date().getFullYear()}-${randomSuffix}`;

    // Step 4: Create pending order record in PostgreSQL
    await createPendingOrder({
      orderId,
      orderNumber,
      userId,
      customerEmail: userEmail || 'guest@pending-checkout.atelier',
      customerName: userName,
      currency: 'usd',
      subtotalCents,
      shippingFeeCents,
      totalCents,
      items: validatedItems,
      metadata: {
        itemCount: validatedItems.reduce((acc, i) => acc + i.quantity, 0),
        authenticatedCheckout: Boolean(userId),
      },
    });

    // Step 5: Construct Stripe line items
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get('origin') ||
      'http://localhost:3000';

    const lineItems = validatedItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          description: `${item.product.material} · ${item.product.color} · Size: ${item.size}`,
          images: item.product.primaryImage.startsWith('http')
            ? [item.product.primaryImage]
            : [],
          metadata: {
            productId: item.productId,
            size: item.size,
            sku: item.product.sku,
          },
        },
        unit_amount: item.unitPriceCents,
      },
      quantity: item.quantity,
    }));

    // Step 6: Create Stripe Checkout Session
    const stripeSession = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: orderId,
      customer_email: userEmail || undefined,
      line_items: lineItems,
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: shippingFeeCents,
              currency: 'usd',
            },
            display_name:
              shippingFeeCents === 0
                ? 'Complimentary White-Glove Armored Delivery'
                : 'Insured White-Glove Courier Delivery',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 4 },
            },
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: [
          'US',
          'CA',
          'GB',
          'FR',
          'IT',
          'DE',
          'CH',
          'JP',
          'AE',
          'SG',
          'AU',
        ],
      },
      metadata: {
        orderId,
        orderNumber,
        userId: userId || '',
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?checkout_cancelled=true`,
    });

    if (!stripeSession.url) {
      throw new Error('Failed to generate Stripe checkout URL.');
    }

    // Step 7: Associate Stripe Session ID with our database order record
    await attachStripeSessionToOrder(orderId, stripeSession.id);

    return NextResponse.json({
      success: true,
      url: stripeSession.url,
      orderId,
      orderNumber,
      sessionId: stripeSession.id,
    });
  } catch (err: unknown) {
    console.error('Checkout creation error:', err);
    const errorMessage =
      err instanceof Error ? err.message : 'An error occurred during checkout initiation.';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
