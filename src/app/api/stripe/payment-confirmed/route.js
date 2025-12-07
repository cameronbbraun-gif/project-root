import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { success } = body;

    if (success) {
      return NextResponse.json({ redirect: "/book/booking-success" });
    } else {
      return NextResponse.json({ redirect: "/book/booking-error" });
    }

  } catch (err) {
    console.error("payment-confirmed route error:", err);
    return NextResponse.json(
      { redirect: "/book/booking-error" },
      { status: 500 }
    );
  }
}
