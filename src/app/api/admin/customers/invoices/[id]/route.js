import { NextResponse } from "next/server";
import { getDbSafe } from "@/lib/mongodb";
import { renderInvoiceHtml } from "@/app/template/invoice";
import { render } from "@react-email/render";
import React from "react";
import InvoiceEmail from "@/email/template/invoiceemail";

export const runtime = "nodejs";

function formatServiceAddress(address) {
  if (!address || typeof address !== "object") return "";
  return [address.street, address.city, address.state, address.zip].filter(Boolean).join(" ");
}

function computeTotalPaid(pricing) {
  if (!pricing) return 0;
  const total = Number(pricing.total || 0);
  if (total > 0) return total;
  const deposit = Number(pricing.deposit || 0);
  const balance = Number(pricing.balance || 0);
  return deposit + balance;
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

async function loadLogoDataUri() {
  const { readFile } = await import("fs/promises");
  const logoPath = `${process.cwd()}/public/images/logo.png`;
  const logoBuffer = await readFile(logoPath);
  return `data:image/png;base64,${logoBuffer.toString("base64")}`;
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

export async function GET(req, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { ObjectId } = await import("mongodb");
  let booking;
  try {
    booking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const invoiceData = buildInvoiceData(booking);
  try {
    invoiceData.logoSrc = await loadLogoDataUri();
  } catch (err) {
    console.error("[invoices] logo embed failed:", err);
  }
  let html = renderInvoiceHtml(invoiceData);
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://detailgeeksautospa.com").replace(
    /\/$/,
    ""
  );
  if (!html.includes("<base")) {
    html = html.replace("<head>", `<head><base href="${siteUrl}/" />`);
  }
  html = html.replace(/src="\/images\//g, `src="${siteUrl}/images/`);

  if (format === "pdf") {
    const pdf = await renderInvoicePdf(html);
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${booking?.reference || id}.pdf`,
      },
    });
  }

  return NextResponse.json({
    invoiceHtml: html,
    invoiceData,
    customerEmail: booking?.customer?.email || "",
    reference: booking?.reference || "",
  });
}

export async function POST(req, { params }) {
  const { id } = await params;
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { ObjectId } = await import("mongodb");
  let booking;
  try {
    booking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const invoiceData = buildInvoiceData(booking);
  try {
    invoiceData.logoSrc = await loadLogoDataUri();
  } catch (err) {
    console.error("[invoices] logo embed failed:", err);
  }
  let html = renderInvoiceHtml(invoiceData);
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://detailgeeksautospa.com").replace(
    /\/$/,
    ""
  );
  if (!html.includes("<base")) {
    html = html.replace("<head>", `<head><base href="${siteUrl}/" />`);
  }
  html = html.replace(/src="\/images\//g, `src="${siteUrl}/images/`);

  const pdf = await renderInvoicePdf(html);
  const { firstName, lastName } = (() => {
    const parts = String(booking?.customer?.name || "").trim().split(/\s+/);
    return { firstName: parts.shift() || "", lastName: parts.join(" ") };
  })();
  const emailHtml = await render(
    React.createElement(InvoiceEmail, {
      firstName,
      lastName,
      reference: booking?.reference || "",
      total: Number(invoiceData.total || 0),
      balance: Number(booking?.pricing?.balance || 0),
    })
  );

  const { resend } = await import("@/lib/resend");
  const fromAddress =
    process.env.RESEND_SUPPORT_EMAIL ||
    "Detail Geeks Auto Spa <support@detailgeeksautospa.com>";
  const customerEmail = String(booking?.customer?.email || "").trim();
  if (!customerEmail) {
    return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
  }

  await resend.emails.send({
    from: fromAddress,
    to: [customerEmail],
    subject: `Invoice ${booking?.reference || ""}`,
    html: emailHtml,
    attachments: [
      {
        filename: `invoice-${booking?.reference || "booking"}.pdf`,
        content: Buffer.from(pdf).toString("base64"),
        contentType: "application/pdf",
      },
    ],
    replyTo: "support@detailgeeksautospa.com",
  });

  return NextResponse.json({ ok: true });
}
