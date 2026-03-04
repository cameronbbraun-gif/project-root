import { NextResponse } from "next/server";
import {
  CONTACT_CSRF_COOKIE,
  generateCsrfToken,
} from "@/lib/contact-security";

export const runtime = "nodejs";

export async function GET() {
  const csrfToken = generateCsrfToken();
  const response = NextResponse.json(
    { csrfToken },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );

  response.cookies.set(CONTACT_CSRF_COOKIE, csrfToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
