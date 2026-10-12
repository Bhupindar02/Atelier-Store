import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe';
import {
  isWebhookEventProcessed,
  recordProcessedWebhookEvent,
  fulfillOrderAndDecrementStock,
  cancelPendingOrder,
} from '@/db/queries/orders';

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured.');
    return NextResponse.json(
      { error: 'Stripe webhook secret is missing.' },
      { status: 500 }
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header.' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  const rawBody = await request.text();

  try {
    const stripeClient = getStripeClient();
    event = stripeClient.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  // Idempotency: skip processing if event was already completed
  const alreadyProcessed = await isWebhookEventProcessed(event.id);
  if (alreadyProcessed) {
    console.log(`Webhook event ${event.id} already processed. Skipping.`);
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Fulfill only if payment was completed
        if (session.payment_status === 'paid') {
          const stripePaymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || null;

          const addressObj = session.customer_details?.address;

          const shippingAddress = addressObj
            ? {
                line1: addressObj.line1 || undefined,
                line2: addressObj.line2 || undefined,
                city: addressObj.city || undefined,
                state: addressObj.state || undefined,
                postalCode: addressObj.postal_code || undefined,
                country: addressObj.country || undefined,
              }
            : undefined;

          await fulfillOrderAndDecrementStock({
            orderId: session.metadata?.orderId || null,
            stripeSessionId: session.id,
            stripePaymentIntentId,
            customerEmail:
              session.customer_details?.email || session.customer_email || null,
            customerName: session.customer_details?.name || null,
            shippingAddress,
          });
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await cancelPendingOrder(session.id);
        break;
      }

      default:
        // Ignore unhandled event types gracefully
        break;
    }

    // Record the event into the idempotency ledger
    await recordProcessedWebhookEvent(event.id, event.type);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
    console.error(`Error processing webhook event ${event.id}:`, err);
    return NextResponse.json(
      { error: 'Internal error processing webhook' },
      { status: 500 }
    );
  }
}
