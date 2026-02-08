import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import { hashPassword } from "@/lib/auth";

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(16),
  password: z.string().min(8),
});

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, token, password } = resetSchema.parse(body);

    const admin = await AdminUser.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin || !admin.resetTokenHash || !admin.resetTokenExpires) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (admin.resetTokenExpires.getTime() < Date.now()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    if (tokenHash !== admin.resetTokenHash) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    admin.passwordHash = await hashPassword(password);
    admin.resetTokenHash = undefined;
    admin.resetTokenExpires = undefined;
    await admin.save();

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
