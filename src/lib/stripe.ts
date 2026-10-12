import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('STRIPE_SECRET_KEY is not defined in production environment.');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      typescript: true,
      appInfo: {
        name: 'Maison Atelier Store',
        version: '1.0.0',
      },
    })
  : null;

export function getStripeClient(): Stripe {
  if (!stripe) {
    throw new Error(
      'Stripe client is not configured. Please set STRIPE_SECRET_KEY in your environment.'
    );
  }
  return stripe;
}
