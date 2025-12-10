import Stripe from "stripe";

// CORS support
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://detailgeeksautospa.com",
  "https://www.detailgeeksautospa.com",
];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "https://detailgeeksautospa.com";
  return new Response(null, { status: 204, headers: corsHeaders(allow) });
}

export const runtime = "nodejs"; 
const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const origin = req.headers.get("origin") || "";
    const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "https://detailgeeksautospa.com";

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
            ...corsHeaders(allow)
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
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(allow)
        }
      }
    );
  } catch (err) {
    console.error("[Stripe] create-payment-intent error:", err);
    const origin = req.headers?.get?.("origin") || "";
    const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "https://detailgeeksautospa.com";
    return new Response(
      JSON.stringify({ error: "Unable to create payment intent" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(allow)
        }
      }
    );
  }
}
