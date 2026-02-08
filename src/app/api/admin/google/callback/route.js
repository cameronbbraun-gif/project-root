import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDbSafe } from "@/lib/mongodb";
import "@/lib/env";

async function exchangeCode(code) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    const detail = data?.error_description || data?.error || "Token exchange failed";
    throw new Error(detail);
  }
  return data;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const token = req.cookies?.get("admin_session")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    const data = await exchangeCode(code);
    const expiresAt = Date.now() + (Number(data.expires_in || 0) * 1000);

    await db.collection("admin_google_tokens").updateOne(
      { adminId: decoded.sub },
      {
        $set: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || undefined,
          scope: data.scope,
          tokenType: data.token_type,
          expiresAt,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/admin/calendar?google=connected`);
  } catch (error) {
    console.error("[google] oauth callback failed:", error?.message || error);
    return NextResponse.json(
      { error: "OAuth failed", detail: error?.message || "unknown" },
      { status: 500 }
    );
  }
}
