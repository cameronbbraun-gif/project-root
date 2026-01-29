import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin, {
      methods: "POST, OPTIONS",
      headers: "Content-Type, Authorization",
    }),
  });
}

export async function POST(req) {
  try {
    const origin = req.headers.get("origin") || "";
    const headers = corsHeaders(origin, {
      methods: "POST, OPTIONS",
      headers: "Content-Type, Authorization",
    });

    const body = await req.json();

    const { success } = body;

    if (success) {
      return NextResponse.json(
        { redirect: "/book/booking-success" },
        { headers }
      );
    } else {
      return NextResponse.json(
        { redirect: "/book/booking-error" },
        { headers }
      );
    }

  } catch (err) {
    console.error("payment-confirmed route error:", err);
    return NextResponse.json(
      { redirect: "/book/booking-error" },
      {
        status: 500,
        headers: corsHeaders(req.headers.get("origin") || "", {
          methods: "POST, OPTIONS",
          headers: "Content-Type, Authorization",
        }),
      }
    );
  }
}
