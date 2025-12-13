import type { NextConfig } from "next";

// Expose the publishable Stripe keys to the client so Stripe.js can initialize.
// Prefer the live key when present, otherwise fall back to the test key.
const testKey =
  process.env.STRIPE_TEST_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY ||
  "";
const liveKey =
  process.env.STRIPE_PUBLIC_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
  "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY: testKey,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: liveKey || testKey,
  },
};

export default nextConfig;
