import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin') || '';
  const allowed = new Set([
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:3000'
  ]);

  const res = new NextResponse(null, { status: 200 });
  // Reflect the allowed origin or fall back to *
  if (allowed.has(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    res.headers.set('Access-Control-Allow-Origin', '*');
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  res.headers.set('Access-Control-Max-Age', '86400');
  res.headers.set('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');

  // If it's a preflight request, return early with 200 and CORS headers
  if (req.method === 'OPTIONS') {
    return res;
  }

  // For non-OPTIONS, continue but include CORS headers on the response
  const next = NextResponse.next();
  res.headers.forEach((value, key) => next.headers.set(key, value));
  return next;
}

// Apply to ALL API routes to be safe (covers /api/quote/*)
export const config = {
  matcher: ['/api/:path*'],
};