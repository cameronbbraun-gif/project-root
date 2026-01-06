import { NextResponse } from "next/server";
import Stripe from "stripe";
import { readFile } from "fs/promises";
import React from "react";
import { render } from "@react-email/render";
import { getDb } from "@/lib/mongodb";
import { resend, esc } from "@/lib/resend";
import { renderInvoiceHtml } from "@/app/template/invoice";
import BookingConfirmationEmail from "@/email/template/bookingconfirmationemail";

export const runtime = "nodejs";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://detailgeeksautospa.com",
  "https://www.detailgeeksautospa.com",
  "https://9049494ee0be.ngrok-free.app",
];

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripeClient = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : "https://detailgeeksautospa.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function formatServiceAddress(address) {
  if (!address || typeof address !== "object") return "";
  return [address.street, address.city, address.state, address.zip].filter(Boolean).join(" ");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts.shift() || "",
    lastName: parts.join(" "),
  };
}

function logDebug(debug, label, data) {
  const entry = data !== undefined ? { label, data } : { label };
  debug.push(entry);
  if (data !== undefined) {
    console.log(`[bookings] ${label}`, data);
  } else {
    console.log(`[bookings] ${label}`);
  }
}

function flushDebug(debug, label = "trace") {
  try {
    console.log(`[bookings] ${label}:`, JSON.stringify(debug));
  } catch (err) {
    console.log(`[bookings] ${label} (stringify failed):`, debug);
  }
}

async function loadLogoDataUri(debug) {
  const logoPath = `${process.cwd()}/public/images/logo.png`;
  try {
    const logoBuffer = await readFile(logoPath);
    const dataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    logDebug(debug, "invoice logo embedded");
    return dataUri;
  } catch (err) {
    console.error("[bookings] invoice logo read failed:", err);
    logDebug(debug, "invoice logo embed failed");
    return null;
  }
}

async function sendWithResend(payload, key, debug) {
  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) throw new Error("RESEND_API_KEY is missing");

  try {
    const res = await resend.emails.send(payload);
    if (res?.error) {
      console.error(`[resend] SDK send error (${key}):`, res.error);
      throw res.error;
    }
    logDebug(debug, `[resend] SDK send result (${key})`, res);
    return res;
  } catch (err) {
    console.error(`[resend] SDK send failed (${key}), falling back to HTTP:`, err);
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
    if (!resp.ok || json?.error) {
      console.error(`[resend] HTTP send failed (${key}):`, json);
      throw new Error(json?.error?.message || `Resend HTTP ${resp.status}`);
    }
    logDebug(debug, `[resend] HTTP send result (${key})`, json);
    return json;
  } catch (err) {
    console.error(`[resend] HTTP fallback failed (${key}):`, err);
    throw err;
  }
}

function buildInvoiceData(doc) {
  const total =
    Number(doc?.pricing?.total || 0) ||
    Number(doc?.pricing?.deposit || 0) + Number(doc?.pricing?.balance || 0);
  const addonDetails =
    Array.isArray(doc?.service?.addonDetails) && doc.service.addonDetails.length
      ? doc.service.addonDetails
      : (doc?.service?.addons || []).map((name) => ({
          name,
          price: Number(doc?.pricing?.addonPrices?.[name] || 0),
        }));
  const addonsTotal = addonDetails.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const packageAmountRaw = Number(doc?.service?.packagePrice || 0);
  const computedPackageAmount =
    packageAmountRaw > 0 ? packageAmountRaw : Math.max(0, total - addonsTotal);

  const deposit = Number(doc?.pricing?.deposit || 0);
  const balance = Number(doc?.pricing?.balance || 0);
  const discountAmount = Number(doc?.pricing?.discountAmount || 0);
  const discountPercent = Number(doc?.pricing?.discountPercent || 0);
  const discountedBalance =
    doc?.pricing?.discountedBalance != null
      ? Number(doc?.pricing?.discountedBalance)
      : discountAmount > 0
        ? Math.max(balance - discountAmount, 0)
        : undefined;
  const promotionCode = String(doc?.pricing?.promotionCode || "").trim();
  const issueDate = new Date().toLocaleDateString("en-US");
  return {
    reference: doc.reference || "",
    issueDate,
    serviceDate: doc?.schedule?.dateTimeText || "",
    customerName: doc?.customer?.name || "",
    customerEmail: doc?.customer?.email || "",
    customerPhone: doc?.customer?.phone || "",
    serviceAddress: formatServiceAddress(doc?.service?.serviceAddress) || "",
    deposit,
    balance,
    total,
    ...(discountAmount > 0
      ? {
          discountAmount,
          discountPercent: discountPercent || undefined,
          discountedBalance,
          promotionCode: promotionCode || undefined,
        }
      : {}),
    items: [
      {
        description: doc?.service?.packageName || "Booking",
        amount: computedPackageAmount,
      },
      ...addonDetails.map((item) => ({
        description: item.name || "",
        amount: Number(item.price || 0),
      })),
    ],
    addonPrices: doc?.pricing?.addonPrices || {},
  };
}

function buildOwnerEmailHtml({ doc, invoiceData }) {
  const total = Number(invoiceData?.total || doc?.pricing?.total || 0);
  const deposit = Number(doc?.pricing?.deposit || 0);
  const balance = Number(doc?.pricing?.balance || 0);
  const discountAmount = Number(
    invoiceData?.discountAmount || doc?.pricing?.discountAmount || 0
  );
  const discountPercent = Number(
    invoiceData?.discountPercent || doc?.pricing?.discountPercent || 0
  );
  const promotionCode = String(
    invoiceData?.promotionCode || doc?.pricing?.promotionCode || ""
  ).trim();
  const discountedBalance =
    invoiceData?.discountedBalance != null
      ? Number(invoiceData.discountedBalance)
      : doc?.pricing?.discountedBalance != null
        ? Number(doc.pricing.discountedBalance)
        : discountAmount > 0
          ? Math.max(balance - discountAmount, 0)
          : balance;
  const totalDue = discountAmount > 0 ? deposit + discountedBalance : total;
  const address = formatServiceAddress(doc?.service?.serviceAddress) || "";
  const instructions = String(doc?.notes?.instructions || "").trim();

    return `
    <p><strong>New booking confirmed</strong></p>
    <ul>
      <li><strong>Reference:</strong> ${esc(doc?.reference || "")}</li>
      <li><strong>PaymentIntent ID:</strong> ${esc(doc?.paymentIntentId || "N/A")}</li>
      <li><strong>Customer:</strong> ${esc(doc?.customer?.name || "")}</li>
      <li><strong>Email:</strong> ${esc(doc?.customer?.email || "")}</li>
      <li><strong>Phone:</strong> ${esc(doc?.customer?.phone || "")}</li>
      <li><strong>Service:</strong> ${esc(doc?.service?.packageName || "")}</li>
      <li><strong>Date & time:</strong> ${esc(doc?.schedule?.dateTimeText || "")}</li>
      <li><strong>Address:</strong> ${esc(address)}</li>
      <li><strong>Total:</strong> $${totalDue.toFixed(2)}</li>
      <li><strong>Deposit:</strong> $${deposit.toFixed(2)}</li>
      <li><strong>Balance:</strong> $${balance.toFixed(2)}</li>
      ${discountAmount > 0 ? `<li><strong>Discount:</strong> -$${discountAmount.toFixed(2)}${promotionCode || discountPercent ? ` (${[promotionCode, discountPercent ? `${discountPercent}%` : ""].filter(Boolean).join(" ")})` : ""}</li>` : ""}
      ${discountAmount > 0 ? `<li><strong>Balance (after discount):</strong> $${discountedBalance.toFixed(2)}</li>` : ""}
      <li><strong>Additional Instructions:</strong> ${instructions ? esc(instructions) : "None"}</li>
    </ul>
  `;
}

async function renderInvoicePdf(html) {
  const { default: puppeteer } = await import("puppeteer");
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");
    return await page.pdf({ format: "A4", printBackground: true });
  } finally {
    await browser.close();
  }
}

async function isPaymentSucceeded(paymentIntentId) {
  if (!stripeClient || !paymentIntentId) return false;
  try {
    const intent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    return intent?.status === "succeeded";
  } catch (err) {
    console.error("[bookings] payment status check failed:", err);
    return false;
  }
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req) {
  const origin = req.headers.get("origin") || "";
  const headers = corsHeaders(origin);
  const siteUrl = ALLOWED_ORIGINS.includes(origin) ? origin : "https://detailgeeksautospa.com";
  const debug = [];

  let payload;
  try {
    payload = await req.json();
  } catch {
    flushDebug(debug, "debug (invalid json)");
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload", debug },
      { status: 400, headers }
    );
  }

  const { customer, service, schedule, pricing, paymentIntentId, reference } = payload || {};
  if (!customer || !service || !schedule || !pricing) {
    flushDebug(debug, "debug (missing fields)");
    return NextResponse.json(
      { ok: false, error: "Missing booking details", debug },
      { status: 400, headers }
    );
  }

  logDebug(debug, "request received", {
    reference,
    paymentIntentId,
    customerEmail: customer?.email,
    ownerEmail: process.env.RESEND_OWNER_EMAIL || "",
  });

    const doc = {
      reference: reference || null,
      customer: {
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
      },
    service: {
      packageName: service.packageName || "",
      packagePrice: service.packagePrice ?? null,
      addons: Array.isArray(service.addons) ? service.addons : [],
      addonDetails: Array.isArray(service.addonDetails) ? service.addonDetails : [],
      vehicleLine: service.vehicleLine || "",
      serviceAddress: service.serviceAddress || {},
    },
    schedule: {
      dateTimeText: schedule.dateTimeText || "",
    },
    pricing: {
      total: pricing.total ?? null,
      deposit: pricing.deposit ?? null,
      balance: pricing.balance ?? null,
      addonPrices: pricing.addonPrices || {},
      discountPercent: pricing.discountPercent ?? null,
      discountAmount: pricing.discountAmount ?? null,
      discountedBalance: pricing.discountedBalance ?? null,
      promotionCode: pricing.promotionCode || "",
      promotionCodeId: pricing.promotionCodeId || "",
    },
    notes: {
      instructions: payload?.notes?.instructions || "",
    },
    paymentIntentId: paymentIntentId || null,
    updatedAt: new Date(),
  };

  try {
    const db = await getDb();
    const lookup = paymentIntentId ? { paymentIntentId } : { reference };
    const now = new Date();
    const result = await db.collection("bookings").findOneAndUpdate(
      lookup,
      {
        $set: doc,
        $setOnInsert: {
          createdAt: now,
          emailSent: false,
          emailStatus: { customer: "pending", owner: "pending" },
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    let booking = result?.value;
    if (!booking) {
      // Some driver versions ignore returnDocument; fetch explicitly.
      booking = await db.collection("bookings").findOne(lookup);
      if (booking) {
        logDebug(debug, "booking fetched after upsert", {
          id: booking?._id,
          lookup,
        });
      }
    }

    if (!booking) {
      flushDebug(debug, "debug (no booking value)");
      return NextResponse.json({ ok: true, debug }, { status: 200, headers });
    }

    const emailStatus = {
      customer: booking?.emailStatus?.customer || "pending",
      owner: booking?.emailStatus?.owner || "pending",
    };
    const ownerEmail = (process.env.RESEND_OWNER_EMAIL || "").trim();
    const customerEmail = String(booking?.customer?.email || "").trim();
    const alreadySent =
      emailStatus.customer === "sent" && (ownerEmail ? emailStatus.owner === "sent" : true);

    if (alreadySent) {
      logDebug(debug, "email already sent, skipping.");
      flushDebug(debug, "debug (already sent)");
      return NextResponse.json({ ok: true, debug }, { status: 200, headers });
    }

    if (!paymentIntentId || !stripeClient) {
      if (!stripeClient) {
          logDebug(debug, "STRIPE_SECRET_KEY missing; skipping email send.");
      }
      if (!paymentIntentId) {
        logDebug(debug, "paymentIntentId missing; skipping email send.");
      }
      flushDebug(debug, "debug (missing stripe info)");
      return NextResponse.json({ ok: true, debug }, { status: 200, headers });
    }

    const paymentSucceeded = await isPaymentSucceeded(paymentIntentId);
    if (!paymentSucceeded) {
      logDebug(debug, "payment not succeeded; skipping email send.");
      flushDebug(debug, "debug (payment not succeeded)");
      return NextResponse.json({ ok: true, debug }, { status: 200, headers });
    }

    const resendApiKey = (process.env.RESEND_API_KEY || "").trim();
    const configuredFrom = (process.env.RESEND_FROM_EMAIL || "").trim();
    const fallbackFrom = "onboarding@resend.dev";
    const from = isValidEmail(configuredFrom) ? configuredFrom : fallbackFrom;
    logDebug(debug, "email send prep (pre-render):", {
      hasResendKey: Boolean(resendApiKey),
      fromSet: Boolean(configuredFrom),
      usingFallbackFrom: from === fallbackFrom,
      ownerEmailSet: Boolean(ownerEmail),
      customerEmailSet: Boolean(customerEmail),
      emailStatus,
    });

    if (!resendApiKey) {
      const msg = "RESEND_API_KEY is not set; skipping email send.";
      logDebug(debug, msg);
      return NextResponse.json({ ok: true, debug }, { status: 200, headers });
    }

    if (!resend?.emails?.send || typeof resend.emails.send !== "function") {
      const msg = "resend client is not initialized; skipping email send.";
      logDebug(debug, msg);
      return NextResponse.json({ ok: true, debug }, { status: 200, headers });
    }

    if (!customerEmail && !ownerEmail) {
      const msg = "no recipient emails configured; skipping email send.";
      logDebug(debug, msg);
      return NextResponse.json({ ok: true, debug }, { status: 200, headers });
    }

    const asyncEmail = new URL(req.url).searchParams.get("async") === "1";
    const emailDebug = asyncEmail ? [] : debug;

    const sendEmails = async () => {
      const invoiceData = buildInvoiceData(booking);
      const discountAmount = Number(
        invoiceData?.discountAmount || booking?.pricing?.discountAmount || 0
      );
      const discountPercent = Number(
        invoiceData?.discountPercent || booking?.pricing?.discountPercent || 0
      );
      const discountedBalance =
        invoiceData?.discountedBalance != null
          ? Number(invoiceData.discountedBalance)
          : booking?.pricing?.discountedBalance != null
            ? Number(booking.pricing.discountedBalance)
            : discountAmount > 0
              ? Math.max(Number(booking?.pricing?.balance || 0) - discountAmount, 0)
              : undefined;
      const promotionCode = String(
        invoiceData?.promotionCode || booking?.pricing?.promotionCode || ""
      ).trim();
      const issueDateSafe = String(invoiceData.issueDate || "").replace(/\//g, "-") || "invoice";
      const fileName = `invoice-${issueDateSafe}.pdf`;
      let invoiceHtml = renderInvoiceHtml(invoiceData);
      const logoDataUri = await loadLogoDataUri(emailDebug);
      if (logoDataUri) {
        invoiceHtml = invoiceHtml.replace(
          /src="\/images\/logo\.png"/i,
          `src="${logoDataUri}"`
        );
      }
      invoiceHtml = invoiceHtml.replace(/src="\/images\//g, `src="${siteUrl}/images/`);

      let pdfBuffer;
      try {
        pdfBuffer = await renderInvoicePdf(invoiceHtml);
      } catch (err) {
        console.error("[bookings] invoice PDF render failed; sending without PDF:", err);
        logDebug(emailDebug, "invoice PDF render failed; sending without PDF");
      }

      const attachments =
        pdfBuffer && pdfBuffer.length
          ? [
              {
                filename: fileName,
                content: Buffer.from(pdfBuffer).toString("base64"),
                contentType: "application/pdf",
              },
            ]
          : [];
      if (!attachments.length) {
        logDebug(emailDebug, "no PDF attachment available; proceeding without attachment.");
      }

      const { firstName, lastName } = splitName(booking?.customer?.name);
      const customerHtml = await render(
        React.createElement(BookingConfirmationEmail, {
          firstName,
          lastName,
          email: booking?.customer?.email || "",
          phone: booking?.customer?.phone || "",
          service: booking?.service?.packageName || "",
          dateTime: booking?.schedule?.dateTimeText || "",
          address: formatServiceAddress(booking?.service?.serviceAddress) || "",
          total: Number(invoiceData?.total || 0),
          balance: Number(booking?.pricing?.balance || 0),
          discountAmount: discountAmount || undefined,
          discountPercent: discountPercent || undefined,
          discountedBalance,
          promotionCode: promotionCode || undefined,
          reference: booking?.reference || "",
        })
      );

      const tasks = [];
      if (customerEmail && emailStatus.customer !== "sent") {
        tasks.push({
          key: "customer",
          send: () =>
            sendWithResend(
              {
                from,
                to: customerEmail,
                subject: "Your booking is confirmed",
                html: customerHtml,
                ...(attachments.length ? { attachments } : {}),
              },
              "customer",
              emailDebug
            ),
        });
      }

      if (ownerEmail && emailStatus.owner !== "sent") {
        tasks.push({
          key: "owner",
          send: () =>
            sendWithResend(
              {
                from,
                to: ownerEmail,
                subject: `New booking confirmed${booking?.reference ? ` (${booking.reference})` : ""}`,
                html: buildOwnerEmailHtml({ doc: booking, invoiceData }),
                replyTo: customerEmail || undefined,
              },
              "owner",
              emailDebug
            ),
        });
      }

      if (!tasks.length) {
        logDebug(emailDebug, "no email tasks queued; skipping send.");
        return { nextStatus: { ...emailStatus }, allSent: false };
      }

      logDebug(emailDebug, "sending emails via Resend…", {
        tasks: tasks.map((t) => t.key),
        hasAttachment: Boolean(attachments.length),
      });

      const results = await Promise.allSettled(tasks.map((task) => task.send()));
      const nextStatus = { ...emailStatus };
      results.forEach((result, idx) => {
        const key = tasks[idx].key;
        nextStatus[key] = result.status === "fulfilled" ? "sent" : "failed";
        if (result.status === "rejected") {
          console.error(`[resend] send failed (${key}):`, result.reason);
        }
      });

      const allSent =
        (!customerEmail || nextStatus.customer === "sent") &&
        (!ownerEmail || nextStatus.owner === "sent");

      await db.collection("bookings").updateOne(
        { _id: booking._id },
        {
          $set: {
            emailStatus: nextStatus,
            emailSent: allSent,
            emailAttemptedAt: new Date(),
            ...(allSent ? { emailSentAt: new Date() } : {}),
          },
        }
      );

      logDebug(emailDebug, "email send results", { nextStatus, allSent });
      return { nextStatus, allSent };
    };

    if (asyncEmail) {
      logDebug(debug, "async email dispatch enabled");
      setTimeout(() => {
        sendEmails().catch((err) => console.error("[bookings] async email send error:", err));
      }, 0);
      flushDebug(debug, "debug (queued)");
      return NextResponse.json({ ok: true, queued: true, debug }, { status: 200, headers });
    }

    await sendEmails();
    flushDebug(debug, "debug (done)");
    return NextResponse.json({ ok: true, debug }, { status: 200, headers });
  } catch (err) {
    console.error("[bookings] insert error:", err);
    flushDebug(debug, "debug (catch)");
    return NextResponse.json(
      { ok: false, error: "Unable to save booking", debug },
      { status: 500, headers }
    );
  }
}
