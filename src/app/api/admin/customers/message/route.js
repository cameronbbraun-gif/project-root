import { NextResponse } from "next/server";
import React from "react";
import { render } from "@react-email/render";
import { resend } from "@/lib/resend";
import CustomerMessageEmail from "@/email/template/customermessageemail";

export const runtime = "nodejs";

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(payload?.email || "").trim();
  const subject = String(payload?.subject || "").trim();
  const message = String(payload?.message || "").trim();
  const name = String(payload?.name || "").trim();

  if (!email || !subject || !message) {
    return NextResponse.json(
      { error: "Email, subject, and message are required." },
      { status: 400 }
    );
  }

  const [firstName, ...rest] = name.split(" ");
  const lastName = rest.join(" ").trim();

  const html = await render(
    React.createElement(CustomerMessageEmail, {
      firstName,
      lastName,
      subject,
      message,
    })
  );

  const fromAddress =
    process.env.RESEND_SUPPORT_EMAIL ||
    "Detail Geeks Auto Spa <support@detailgeeksautospa.com>";

  try {
    await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject,
      html,
      replyTo: "support@detailgeeksautospa.com",
    });
  } catch (err) {
    console.error("[customers message] send failed:", err);
    return NextResponse.json({ error: "Unable to send message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
