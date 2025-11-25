import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { success } = body;

    if (success) {
      return NextResponse.json({ redirect: "/booking-success.html" });
    } else {
      return NextResponse.json({ redirect: "/booking-error.html" });
    }

  } catch (err) {
    console.error("payment-confirmed route error:", err);
    return NextResponse.json(
      { redirect: "/booking-error.html" },
      { status: 500 }
    );
  }
}
