import { NextResponse } from "next/server";
import React from "react";
import { render } from "@react-email/render";
import { getDbSafe } from "@/lib/mongodb";
import ReportTemplate from "@/app/template/report";

export const runtime = "nodejs";

function formatDateKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function parseDateTimeText(value) {
  if (!value || typeof value !== "string") return "";
  const [datePart] = value.split(" at ");
  if (!datePart) return "";
  const date = new Date(datePart);
  if (Number.isNaN(date.getTime())) return "";
  return formatDateKey(date);
}

function computeTotalPaid(pricing) {
  if (!pricing) return 0;
  const total = Number(pricing.total || 0);
  if (total > 0) return total;
  const deposit = Number(pricing.deposit || 0);
  const balance = Number(pricing.balance || 0);
  return deposit + balance;
}

function getDateKeyFromBooking(booking) {
  const schedule = booking?.schedule || {};
  return schedule.date || parseDateTimeText(schedule.dateTimeText) || "";
}

async function renderPdf(html) {
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

export async function GET() {
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const now = new Date();
  const year = now.getFullYear();
  const monthKey = `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const reportId = `RPT-MONTH-${monthKey.replace("-", "")}-${Date.now()
    .toString()
    .slice(-4)}`;
  const generatedAt = new Date().toLocaleString("en-US");

  const bookings = await db
    .collection("bookings")
    .find({})
    .project({
      schedule: 1,
      service: 1,
      customer: 1,
      pricing: 1,
      status: 1,
    })
    .toArray();

  let grossRevenue = 0;
  let refundAmount = 0;
  let netRevenue = 0;
  let addOnRevenue = 0;
  const revenueByService = new Map();
  let totalBookings = 0;
  let completedBookings = 0;
  let cancelledBookings = 0;
  let refundedBookings = 0;
  const customerCounts = new Map();

  for (const booking of bookings) {
    const status = String(booking?.status || "").toLowerCase();
    const dateKey = getDateKeyFromBooking(booking);
    if (!dateKey.startsWith(monthKey)) continue;

    totalBookings += 1;
    if (status === "cancelled" || status === "canceled") {
      cancelledBookings += 1;
    } else if (status === "completed") {
      completedBookings += 1;
    }

    const revenue = computeTotalPaid(booking?.pricing);
    grossRevenue += revenue;
    netRevenue += revenue;

    const addons =
      Array.isArray(booking?.service?.addonDetails) && booking.service.addonDetails.length
        ? booking.service.addonDetails.reduce((sum, item) => sum + Number(item?.price || 0), 0)
        : Array.isArray(booking?.service?.addons)
          ? booking.service.addons.reduce(
              (sum, name) => sum + Number(booking?.pricing?.addonPrices?.[name] || 0),
              0
            )
          : 0;
    addOnRevenue += addons;

    const serviceName = String(booking?.service?.packageName || "Service");
    revenueByService.set(serviceName, (revenueByService.get(serviceName) || 0) + revenue);

    const email = String(booking?.customer?.email || "").trim().toLowerCase();
    if (email) customerCounts.set(email, (customerCounts.get(email) || 0) + 1);
  }

  const uniqueCustomers = customerCounts.size;
  const returningCustomers = Array.from(customerCounts.values()).filter((c) => c > 1).length;

  const processorFees = 0;
  const platformFees = 0;
  const variableCosts = 0;
  const totalExpenses = processorFees + platformFees + variableCosts;
  const netProfit = netRevenue - totalExpenses;
  const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

  const sections = [
    {
      title: "Time Scope",
      rows: [
        { label: "Month", value: now.toLocaleString("en-US", { month: "long" }) },
        { label: "Year", value: String(year) },
        { label: "Report generated", value: generatedAt },
      ],
    },
    {
      title: "Revenue",
      rows: [
        { label: "Gross revenue (total paid)", value: `$${grossRevenue.toFixed(2)}` },
        {
          label: "Revenue by service",
          value:
            Array.from(revenueByService.entries())
              .map(([name, val]) => `${name}: $${val.toFixed(2)}`)
              .join(" · ") || "No data",
        },
        { label: "Add-on revenue total", value: `$${addOnRevenue.toFixed(2)}` },
        { label: "Refund amount (total $)", value: `$${refundAmount.toFixed(2)}` },
        { label: "Net revenue (after refunds)", value: `$${netRevenue.toFixed(2)}` },
      ],
    },
    {
      title: "Expenses",
      rows: [
        { label: "Payment processor fees (Stripe)", value: `$${processorFees.toFixed(2)}` },
        { label: "Platform fees (hosting, email, etc.)", value: `$${platformFees.toFixed(2)}` },
        { label: "Variable service costs (if tracked)", value: `$${variableCosts.toFixed(2)}` },
        { label: "Total expenses", value: `$${totalExpenses.toFixed(2)}` },
      ],
    },
    {
      title: "Profit",
      rows: [
        { label: "Net profit (revenue − expenses)", value: `$${netProfit.toFixed(2)}` },
        { label: "Profit margin (%)", value: `${profitMargin.toFixed(1)}%` },
      ],
    },
    {
      title: "Bookings",
      rows: [
        { label: "Total bookings", value: String(totalBookings) },
        { label: "Completed bookings", value: String(completedBookings) },
        { label: "Cancelled bookings", value: String(cancelledBookings) },
        { label: "Refunded bookings", value: String(refundedBookings) },
      ],
    },
    {
      title: "Customers",
      rows: [
        { label: "Unique customers count", value: String(uniqueCustomers) },
        { label: "Returning customers count", value: String(returningCustomers) },
      ],
    },
    {
      title: "Payments",
      rows: [
        { label: "Total transactions", value: String(totalBookings) },
        { label: "Failed payments count", value: "0 (not tracked)" },
      ],
    },
    {
      title: "Accounting Metadata",
      rows: [
        { label: "Currency", value: "USD" },
        { label: "Business name", value: "Detail Geeks Auto Spa" },
        { label: "Internal report ID", value: reportId },
      ],
    },
  ];

  const html = await render(
    React.createElement(ReportTemplate, {
      title: "Monthly Report",
      subtitle: "Monthly finance and performance summary.",
      reportId,
      generatedAt,
      sections,
    })
  );

  const pdf = await renderPdf(html);
  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=monthly-report-${monthKey}.pdf`,
    },
  });
}
