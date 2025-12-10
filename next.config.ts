import type { NextConfig } from "next";

// Expose the publishable Stripe key to the client so Stripe.js can initialize
// (production deployments must still set one of these env vars).
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.STRIPE_TEST_PUBLIC_KEY ||
      process.env.STRIPE_PUBLIC_KEY ||
      "",
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
      process.env.STRIPE_PUBLIC_KEY ||
      process.env.STRIPE_TEST_PUBLIC_KEY ||
      "",
  },
};

export default nextConfig;
