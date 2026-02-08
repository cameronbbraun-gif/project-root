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
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const reportId = `RPT-GEN-${monthKey.replace("-", "")}-${Date.now()
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

  const monthStats = { revenue: 0, bookings: 0, completed: 0, cancelled: 0, refunds: 0 };
  const prevStats = { revenue: 0, bookings: 0 };
  const customerCounts = new Map();
  const serviceRevenue = new Map();
  let addOnAttach = 0;
  let addOnTotal = 0;
  const peakDayCounts = new Map();
  const peakHourCounts = new Map();

  for (const booking of bookings) {
    const status = String(booking?.status || "").toLowerCase();
    const dateKey = getDateKeyFromBooking(booking);
    if (!dateKey) continue;
    const revenue = computeTotalPaid(booking?.pricing);
    const inMonth = dateKey.startsWith(monthKey);
    const inPrev = dateKey.startsWith(prevMonthKey);

    if (inMonth) {
      monthStats.revenue += revenue;
      monthStats.bookings += 1;
      if (status === "completed") monthStats.completed += 1;
      if (status === "cancelled" || status === "canceled") monthStats.cancelled += 1;
    }
    if (inPrev) {
      prevStats.revenue += revenue;
      prevStats.bookings += 1;
    }

    const email = String(booking?.customer?.email || "").trim().toLowerCase();
    if (email) customerCounts.set(email, (customerCounts.get(email) || 0) + 1);

    const serviceName = String(booking?.service?.packageName || "Service");
    serviceRevenue.set(serviceName, (serviceRevenue.get(serviceName) || 0) + revenue);

    if (Array.isArray(booking?.service?.addons) && booking.service.addons.length) {
      addOnAttach += 1;
    }
    addOnTotal += 1;

    const day = new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
    });
    peakDayCounts.set(day, (peakDayCounts.get(day) || 0) + 1);
    const time = booking?.schedule?.time || "";
    const hour = String(time).split(":")[0];
    if (hour) peakHourCounts.set(hour, (peakHourCounts.get(hour) || 0) + 1);
  }

  const revenueChange =
    prevStats.revenue > 0
      ? ((monthStats.revenue - prevStats.revenue) / prevStats.revenue) * 100
      : 0;
  const bookingsChange =
    prevStats.bookings > 0
      ? ((monthStats.bookings - prevStats.bookings) / prevStats.bookings) * 100
      : 0;
  const profitChange = revenueChange;

  const totalCustomers = customerCounts.size || 0;
  const returningCustomers = Array.from(customerCounts.values()).filter((c) => c > 1).length;
  const repeatRate = totalCustomers ? (returningCustomers / totalCustomers) * 100 : 0;
  const avgBookingValue = monthStats.bookings ? monthStats.revenue / monthStats.bookings : 0;
  const revenuePerCustomer = totalCustomers ? monthStats.revenue / totalCustomers : 0;
  const costPerBooking = 0;

  let topService = "";
  let topRevenue = 0;
  let lowService = "";
  let lowRevenue = Number.MAX_VALUE;
  for (const [name, value] of serviceRevenue.entries()) {
    if (value > topRevenue) {
      topRevenue = value;
      topService = name;
    }
    if (value < lowRevenue) {
      lowRevenue = value;
      lowService = name;
    }
  }

  let peakDay = "";
  let peakDayCount = 0;
  for (const [day, count] of peakDayCounts.entries()) {
    if (count > peakDayCount) {
      peakDayCount = count;
      peakDay = day;
    }
  }

  let peakHour = "";
  let peakHourCount = 0;
  for (const [hour, count] of peakHourCounts.entries()) {
    if (count > peakHourCount) {
      peakHourCount = count;
      peakHour = hour;
    }
  }

  const refundRate = monthStats.bookings
    ? (monthStats.refunds / monthStats.bookings) * 100
    : 0;
  const cancellationRate = monthStats.bookings
    ? (monthStats.cancelled / monthStats.bookings) * 100
    : 0;
  const failedPaymentRate = 0;

  const flags = [];
  if (Math.abs(revenueChange) >= 25) {
    flags.push(`Unusual ${revenueChange > 0 ? "spike" : "drop"} in revenue`);
  }
  if (bookingsChange > 20 && Math.abs(revenueChange) < 5) {
    flags.push("Booking volume high but revenue flat");
  }
  if (!flags.length) {
    flags.push("No unusual spikes detected");
  }

  const sections = [
    {
      title: "Comparisons",
      rows: [
        { label: "Profit vs last month", value: `${profitChange.toFixed(1)}%` },
        { label: "Revenue vs last month", value: `${revenueChange.toFixed(1)}%` },
        { label: "Bookings vs last month", value: `${bookingsChange.toFixed(1)}%` },
      ],
    },
    {
      title: "Efficiency",
      rows: [
        { label: "Average booking value", value: `$${avgBookingValue.toFixed(2)}` },
        { label: "Revenue per customer", value: `$${revenuePerCustomer.toFixed(2)}` },
        { label: "Cost per booking", value: `$${costPerBooking.toFixed(2)} (not tracked)` },
      ],
    },
    {
      title: "Conversions",
      rows: [
        { label: "Site visits → quotes", value: "Not tracked" },
        { label: "Quotes → bookings", value: "Not tracked" },
        { label: "Bookings → paid", value: "Not tracked" },
      ],
    },
    {
      title: "Service Performance",
      rows: [
        { label: "Top revenue service", value: topService || "No data" },
        { label: "Lowest performing service", value: lowService || "No data" },
        {
          label: "Add-on attach rate",
          value: addOnTotal ? `${((addOnAttach / addOnTotal) * 100).toFixed(1)}%` : "0%",
        },
      ],
    },
    {
      title: "Time Analysis",
      rows: [
        { label: "Peak booking day", value: peakDay || "No data" },
        { label: "Peak booking hour", value: peakHour ? `${peakHour}:00` : "No data" },
        { label: "Slowest booking period", value: "Not tracked" },
      ],
    },
    {
      title: "Customer Behavior",
      rows: [
        {
          label: "New vs returning ratio",
          value: `${(totalCustomers - returningCustomers) || 0} new / ${returningCustomers} returning`,
        },
        { label: "Repeat booking rate", value: `${repeatRate.toFixed(1)}%` },
      ],
    },
    {
      title: "Quality Signals",
      rows: [
        { label: "Refund rate (%)", value: `${refundRate.toFixed(1)}%` },
        { label: "Cancellation rate (%)", value: `${cancellationRate.toFixed(1)}%` },
        { label: "Failed payment rate (%)", value: `${failedPaymentRate.toFixed(1)}%` },
      ],
    },
    {
      title: "Flags / Alerts",
      rows: flags.map((flag, idx) => ({ label: `Flag ${idx + 1}`, value: flag })),
    },
    {
      title: "Accounting Metadata",
      rows: [
        { label: "Currency", value: "USD" },
        { label: "Business name", value: "Detail Geeks Auto Spa" },
        { label: "Internal report ID", value: reportId },
        { label: "Generated", value: generatedAt },
      ],
    },
  ];

  const html = await render(
    React.createElement(ReportTemplate, {
      title: "Generated Report",
      subtitle: "Operational and performance insights.",
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
      "Content-Disposition": `attachment; filename=generated-report-${monthKey}.pdf`,
    },
  });
}
