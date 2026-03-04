import { randomBytes, timingSafeEqual } from "node:crypto";

export const CONTACT_CSRF_COOKIE = "contact_csrf";

export const ALLOWED_CONTACT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://detailgeeksautospa.com",
  "https://www.detailgeeksautospa.com",
];

const DEV_TUNNEL_HOST_SUFFIXES = [
  ".ngrok-free.app",
  ".ngrok.app",
  ".ngrok.io",
];

function getExtraAllowedOrigins() {
  return (process.env.CONTACT_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function generateCsrfToken() {
  return randomBytes(32).toString("hex");
}

export function getRequestIp(req) {
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  return forwardedFor.split(",")[0]?.trim() || "";
}

function parseOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

export function isAllowedContactOrigin(origin) {
  const normalizedOrigin = parseOrigin(origin) || String(origin || "").trim();
  if (!normalizedOrigin) {
    return false;
  }

  if (ALLOWED_CONTACT_ORIGINS.includes(normalizedOrigin)) {
    return true;
  }

  if (getExtraAllowedOrigins().includes(normalizedOrigin)) {
    return true;
  }

  if (process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const url = new URL(normalizedOrigin);
    return (
      url.protocol === "https:" &&
      DEV_TUNNEL_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix))
    );
  } catch {
    return false;
  }
}

export function validateSameOriginRequest(req) {
  const origin = (req.headers.get("origin") || "").trim();
  if (origin) {
    return {
      ok: isAllowedContactOrigin(origin),
      source: "origin",
      origin,
      raw: origin,
    };
  }

  const referer = (req.headers.get("referer") || "").trim();
  if (referer) {
    const refererOrigin = parseOrigin(referer);
    return {
      ok: isAllowedContactOrigin(refererOrigin),
      source: "referer",
      origin: refererOrigin,
      raw: referer,
    };
  }

  return {
    ok: false,
    source: "missing",
    origin: "",
    raw: "",
  };
}

export function tokensMatch(a, b) {
  if (!a || !b) {
    return false;
  }

  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}
