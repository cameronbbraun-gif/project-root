const DEFAULT_ORIGINS = [
  "https://detailgeeksautospa.com",
  "https://www.detailgeeksautospa.com",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(/[\s,]+/)
  .map((origin) => origin.trim())
  .filter(Boolean);

export const ALLOWED_ORIGINS = Array.from(
  new Set([...envOrigins, ...DEFAULT_ORIGINS])
);

export function resolveCorsOrigin(origin) {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  return ALLOWED_ORIGINS[0] || "*";
}

export function corsHeaders(origin, options = {}) {
  const methods = options.methods || "GET,POST,OPTIONS";
  const headers =
    options.headers || "Content-Type, Authorization, X-Requested-With";

  return {
    "Access-Control-Allow-Origin": resolveCorsOrigin(origin),
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": headers,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
  };
}
