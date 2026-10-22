import Stripe from 'stripe';

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_API_KEY ||
  process.env.STRIPE_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('Neither STRIPE_SECRET_KEY nor STRIPE_API_KEY is defined in production environment.');
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
