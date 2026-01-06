import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import ContactEmail from "@/email/template/contactemail";

export const runtime = "nodejs";

console.log("[contact] route init cwd=", process.cwd());

const ALLOWED_ORIGINS = [
  "http://localhost:3000",   
  "http://127.0.0.1:5500", 
  "http://localhost:5500",
  "https://detailgeeksautospa.com",
];

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
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
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "http://localhost:3000";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req) {
  const origin = req.headers.get("origin") || "";
  const headers = corsHeaders(origin);

  const { first_name, last_name, email, message } = await req.json();

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

  try {
    const db = await getDb();
    const now = new Date();
    await db.collection("contacts").insertOne({
      first_name,
      last_name,
      email,
      message,
      createdAt: now,
      updatedAt: now,
      ip: req.headers.get("x-forwarded-for") || "unknown",
      ua: req.headers.get("user-agent") || "unknown",
    });

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
