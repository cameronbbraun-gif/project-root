import Stripe from "stripe";

export const runtime = "nodejs"; 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      amount,        
      email,         
      name,         
      description,   
      metadata = {}  
    } = body || {};

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid amount" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,             
      currency: "usd",
      description: description || "Detail Geeks deposit",
      payment_method_types: ["card", "link"],
      automatic_payment_methods: {
        enabled: true       
      },
      receipt_email: email || undefined,
      metadata: {
        ...metadata,
        customer_name: name || "",
      }
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Stripe] create-payment-intent error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to create payment intent" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}