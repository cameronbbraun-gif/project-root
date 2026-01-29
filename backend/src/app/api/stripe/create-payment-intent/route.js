import Stripe from "stripe";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, {
      methods: "POST, OPTIONS",
      headers: "Content-Type, Authorization",
    }),
  });
}

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Stripe secret key is not configured. Set STRIPE_SECRET_KEY.");
}

const isTestKey = stripeSecretKey.startsWith("sk_test_");
const isLiveKey = stripeSecretKey.startsWith("sk_live_");

if (!isTestKey && !isLiveKey) {
  throw new Error("STRIPE_SECRET_KEY must start with sk_test_ or sk_live_.");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(req) {
  try {
    const origin = req.headers.get("origin") || "";
    const headers = corsHeaders(origin, {
      methods: "POST, OPTIONS",
      headers: "Content-Type, Authorization",
    });

    const body = await req.json();

    const {
      amount,             // expected in dollars
      email,
      name,
      description,
      metadata = {}
    } = body || {};

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid amount" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          }
        }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert dollars to cents
      currency: "usd",
      description: description || "Detail Geeks deposit",
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: email || undefined,
      metadata: {
        ...metadata,
        customer_name: name || "",
        mode: isLiveKey ? "live" : "test",
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        }
      }
    );
  } catch (err) {
    console.error("[Stripe] create-payment-intent error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to create payment intent" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(req.headers?.get?.("origin") || "", {
            methods: "POST, OPTIONS",
            headers: "Content-Type, Authorization",
          }),
        }
      }
    );
  }
}
