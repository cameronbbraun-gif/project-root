import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";

const forgotSchema = z.object({
  email: z.string().email(),
});

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

async function sendResetEmail({ to, resetUrl }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[auth] RESEND_API_KEY missing, skip email send");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const from =
    process.env.RESEND_FROM_EMAIL || "noreply@detailgeeksautospa.com";

  await resend.emails.send({
    from,
    to,
    subject: "Reset your admin password",
    text: `Reset your password: ${resetUrl}`,
  });
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { email } = forgotSchema.parse(body);

    const admin = await AdminUser.findOne({
      email: email.toLowerCase().trim(),
    });

    if (admin) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashToken(token);
      const expires = new Date(Date.now() + 1000 * 60 * 60);

      admin.resetTokenHash = tokenHash;
      admin.resetTokenExpires = expires;
      await admin.save();

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "http://localhost:3000";
      const resetUrl = `${baseUrl}/admin/reset-password?token=${token}&email=${encodeURIComponent(
        admin.email
      )}`;

      await sendResetEmail({ to: admin.email, resetUrl });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
