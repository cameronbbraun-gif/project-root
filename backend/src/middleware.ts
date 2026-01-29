import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsHeaders } from "@/lib/cors";

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const res = new NextResponse(null, { status: 200 });
  const headers = corsHeaders(origin, {
    methods: "GET,POST,OPTIONS",
    headers: "Content-Type, Authorization, X-Requested-With",
  });
  Object.entries(headers).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  // If it's a preflight request, return early with 200 and CORS headers
  if (req.method === "OPTIONS") {
    return res;
  }

  // For non-OPTIONS, continue but include CORS headers on the response
  const next = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) => {
    next.headers.set(key, value);
  });
  return next;
}

// Apply to ALL API routes to be safe (covers /api/quote/*)
export const config = {
  matcher: ["/api/:path*"],
};
