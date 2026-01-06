import Stripe from "stripe";

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
    Vary: "Origin",
  };
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "https://detailgeeksautospa.com";
  return new Response(null, { status: 204, headers: corsHeaders(allow) });
}

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Stripe secret key is not configured. Set STRIPE_SECRET_KEY (test key).");
}

if (!stripeSecretKey.startsWith("sk_test_")) {
  throw new Error("STRIPE_SECRET_KEY must be a test key (sk_test_...).");
}

const stripe = new Stripe(stripeSecretKey);

export async function POST(req) {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "https://detailgeeksautospa.com";

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON payload" }),
      { status: 400, headers: corsHeaders(allow) }
    );
  }

  const code = String(body?.code || "").trim();
  if (!code) {
    return new Response(
      JSON.stringify({ error: "Missing promotion code" }),
      { status: 400, headers: corsHeaders(allow) }
    );
  }

  try {
    const promos = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });

    const promo = promos.data?.[0];
    const coupon = promo?.coupon;
    const percentOff = coupon?.percent_off;

    if (promo && promo.active && coupon?.valid) {
      if (!percentOff) {
        return new Response(
          JSON.stringify({ valid: false, reason: "percent_only" }),
          { status: 200, headers: corsHeaders(allow) }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          code: promo.code || code,
          percentOff,
          promotionCodeId: promo.id,
          couponId: coupon.id,
        }),
        { status: 200, headers: corsHeaders(allow) }
      );
    }

    let couponById = null;
    try {
      couponById = await stripe.coupons.retrieve(code);
    } catch {
      couponById = null;
    }

    if (couponById?.valid) {
      if (!couponById.percent_off) {
        return new Response(
          JSON.stringify({ valid: false, reason: "percent_only" }),
          { status: 200, headers: corsHeaders(allow) }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          code,
          percentOff: couponById.percent_off,
          couponId: couponById.id,
        }),
        { status: 200, headers: corsHeaders(allow) }
      );
    }

    return new Response(
      JSON.stringify({ valid: false, reason: "not_found" }),
      { status: 200, headers: corsHeaders(allow) }
    );
  } catch (err) {
    console.error("[Stripe] validate-promo error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to validate promotion code" }),
      { status: 500, headers: corsHeaders(allow) }
    );
  }
}
