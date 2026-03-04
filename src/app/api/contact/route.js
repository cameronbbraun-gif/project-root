import { NextResponse } from "next/server";
import { getDbSafe } from "@/lib/mongodb";
import ContactEmail from "@/email/template/contactemail";
import {
  CONTACT_CSRF_COOKIE,
  getRequestIp,
  isAllowedContactOrigin,
  tokensMatch,
  validateSameOriginRequest,
} from "@/lib/contact-security";

export const runtime = "nodejs";

console.log("[contact] route init cwd=", process.cwd());

const CONTACT_DB_NAME = "detailgeeks_db";
let overrideClientPromise;

async function getContactDb() {
  const db = await getDbSafe();
  if (db && db.databaseName === CONTACT_DB_NAME) {
    return db;
  }
  const uri = process.env.MONGODB_URI || "";
  if (!uri) return null;
  if (!overrideClientPromise) {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(uri);
    overrideClientPromise = client.connect();
  }
  const client = await overrideClientPromise;
  return client.db(CONTACT_DB_NAME);
}

async function readBody(req) {
  const contentType = (req.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    try {
      return await req.json();
    } catch (err) {
      return null;
    }
  }

  try {
    return await req.formData();
  } catch (err) {
    if (!contentType) {
      try {
        return await req.json();
      } catch (_) {}
      try {
        return await req.formData();
      } catch (_) {}
    }
    return null;
  }
}

function readField(data, key) {
  if (!data) return "";
  if (typeof data.get === "function") {
    const value = data.get(key);
    return typeof value === "string" ? value.trim() : "";
  }
  const value = data[key];
  return typeof value === "string" ? value.trim() : "";
}

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

async function verifyRecaptchaToken(token, req) {
  const siteKey = (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "").trim();
  const secret = (process.env.RECAPTCHA_SECRET_KEY || "").trim();
  if (!siteKey || !secret) {
    console.error("[contact] recaptcha misconfigured", {
      hasSiteKey: Boolean(siteKey),
      hasSecret: Boolean(secret),
    });
    return {
      ok: false,
      status: 503,
      message: "reCAPTCHA is temporarily unavailable. Please try again later.",
    };
  }

  if (!token) {
    return {
      ok: false,
      status: 403,
      message: "Please complete the reCAPTCHA challenge.",
    };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  const remoteIp = getRequestIp(req);
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`reCAPTCHA verification failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.success) {
    console.warn("[contact] recaptcha rejected:", payload?.["error-codes"] || []);
    return {
      ok: false,
      status: 403,
      message: "reCAPTCHA verification failed. Please try again.",
    };
  }

  return { ok: true };
}

async function sendResendEmail({ to, subject, html, replyTo }) {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const from = (process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || "").trim();

  const masked = apiKey ? `${apiKey.slice(0, 3)}…(${apiKey.length})` : "<empty>";
  console.log("[email] env check:", { from, apiKey: masked });

  if (!apiKey) throw new Error("RESEND_API_KEY is not set in environment");
  if (!from) throw new Error("RESEND_FROM_EMAIL / FROM_EMAIL is not set in environment");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${text}`);
  }
  return res.json();
}

function corsHeaders(origin) {
  const allow = isAllowedContactOrigin(origin) ? origin : "http://localhost:3000";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  if (!isAllowedContactOrigin(origin)) {
    console.warn("[contact] rejected preflight origin", { origin });
    return NextResponse.json(
      { msg: ["Forbidden"] },
      { status: 403, headers: { Vary: "Origin" } }
    );
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req) {
  const originCheck = validateSameOriginRequest(req);
  const headers = originCheck.ok
    ? corsHeaders(originCheck.origin)
    : { Vary: "Origin" };

  if (!originCheck.ok) {
    console.warn("[contact] rejected same-origin check", {
      source: originCheck.source,
      value: originCheck.raw,
      ip: getRequestIp(req) || "unknown",
    });
    return NextResponse.json(
      { msg: ["Forbidden"] },
      { status: 403, headers }
    );
  }

  const body = await readBody(req);
  if (!body) {
    return NextResponse.json(
      { msg: ["Invalid request body. Please submit the form again."] },
      { status: 400, headers }
    );
  }

  const first_name = readField(body, "first_name");
  const last_name = readField(body, "last_name");
  const email = readField(body, "email");
  const message = readField(body, "message");
  const csrfToken = readField(body, "csrf_token");
  const website = readField(body, "website");
  const recaptchaToken =
    readField(body, "g-recaptcha-response") || readField(body, "recaptchaToken");
  const csrfCookie = req.cookies?.get(CONTACT_CSRF_COOKIE)?.value || "";

  console.log("first_name:", first_name);
  console.log("last_name:", last_name);
  console.log("email:", email);
  console.log("message:", message);

  const missing = [];
  if (!first_name) missing.push("first_name");
  if (!last_name)  missing.push("last_name");
  if (!email)      missing.push("email");
  if (!message)    missing.push("message");

  if (email) {
    const at = email.indexOf("@");
    const dot = email.lastIndexOf(".");
    if (at < 1 || dot <= at + 1 || dot === email.length - 1) {
      return NextResponse.json(
        { msg: ["Please enter a valid email address."] },
        { status: 400, headers }
      );
    }
  }

  if (missing.length) {
    return NextResponse.json(
      { msg: [`Missing fields: ${missing.join(", ")}`] },
      { status: 400, headers }
    );
  }

  if (!csrfToken || !tokensMatch(csrfToken, csrfCookie)) {
    console.warn("[contact] rejected csrf token", {
      hasBodyToken: Boolean(csrfToken),
      hasCookieToken: Boolean(csrfCookie),
      ip: getRequestIp(req) || "unknown",
      origin: originCheck.origin,
    });
    return NextResponse.json(
      { msg: ["Forbidden"] },
      { status: 403, headers }
    );
  }

  try {
    const recaptchaCheck = await verifyRecaptchaToken(recaptchaToken, req);
    if (!recaptchaCheck.ok) {
      return NextResponse.json(
        { msg: [recaptchaCheck.message] },
        { status: recaptchaCheck.status, headers }
      );
    }

    if (website) {
      console.warn("[contact] honeypot triggered", {
        ip: getRequestIp(req) || "unknown",
        origin: originCheck.origin,
      });
      return NextResponse.json(
        { msg: ["Message received. Thank you!"], success: true },
        { headers }
      );
    }

    const db = await getContactDb();
    if (db) {
      const now = new Date();
      try {
        await db.collection("contacts").insertOne({
          first_name,
          last_name,
          email,
          message,
          createdAt: now,
          updatedAt: now,
          recaptchaVerifiedAt: now,
          ip: getRequestIp(req) || "unknown",
          ua: req.headers.get("user-agent") || "unknown",
        });
      } catch (dbErr) {
        console.error("[contact] db insert failed:", dbErr);
      }
    } else {
      console.warn("[contact] db unavailable; skipping insert");
    }

    const ownerEmail = process.env.RESEND_OWNER_EMAIL;

    const { renderToStaticMarkup } = await import("react-dom/server");
    const React = await import("react");

    const confirmationHtml = renderToStaticMarkup(
      React.createElement(ContactEmail, {
        firstName: first_name,
        lastName: last_name,
        email,
        message,
      })
    );

    const confirmation = sendResendEmail({
      to: email,
      subject: "We received your message",
      html: confirmationHtml,
    });

    const notifyOwner = ownerEmail
      ? sendResendEmail({
          to: ownerEmail,
          subject: "New contact form submission",
          html: `
            <p><b>From:</b> ${esc(first_name)} ${esc(last_name)} &lt;${esc(email)}&gt;</p>
            <p><b>Message:</b></p>
            <blockquote style="margin:0;padding:8px 12px;border-left:3px solid #ddd">
              ${esc(message).replace(/\n/g, "<br/>")}
            </blockquote>
          `,
          replyTo: email,
        })
      : Promise.resolve();

    Promise.allSettled([confirmation, notifyOwner]).then((results) => {
      results.forEach((r) => {
        if (r.status === "rejected") console.error("[email] send error:", r.reason);
      });
    });

    return NextResponse.json(
      { msg: ["Message received. Thank you!"], success: true },
      { headers }
    );
  } catch (error) {
    console.error("[contact] server error:", error);
    return NextResponse.json(
      { msg: ["Internal server error"] },
      { status: 500, headers }
    );
  }
}
