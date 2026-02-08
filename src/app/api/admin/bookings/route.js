import { NextResponse } from "next/server";
import React from "react";
import { render } from "@react-email/render";
import { getDbSafe } from "@/lib/mongodb";
import { renderInvoiceHtml } from "@/app/template/invoice";
import BookingConfirmationEmail from "@/email/template/bookingconfirmationemail";
import { resend } from "@/lib/resend";

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function parseDateTimeText(value) {
  if (!value || typeof value !== "string") return null;
  const [datePart, timePart] = value.split(" at ");
  if (!datePart || !timePart) return null;
  const date = new Date(datePart);
  if (Number.isNaN(date.getTime())) return null;
  return { date: formatDateKey(date), time: timePart.trim() };
}

function inferDurationMinutes(serviceName) {
  const compact = String(serviceName || "").toLowerCase().replace(/\s+/g, "");
  if (compact.includes("showroom")) return 300;
  if (compact.includes("fullexterior")) return 180;
  if (compact.includes("quickexterior")) return 120;
  if (compact.includes("fullinterior")) return 180;
  if (compact.includes("quickinterior")) return 120;
  if (compact.includes("maintenance")) return 180;
  return 180;
}

function timeToMinutes(time) {
  if (!time || typeof time !== "string") return null;
  const cleaned = time.trim();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return null;
  const hRaw = Number(match[1]);
  const mRaw = Number(match[2] || 0);
  const periodRaw = match[3];
  if (!Number.isFinite(hRaw) || !Number.isFinite(mRaw)) return null;
  let h = hRaw;
  const period = String(periodRaw).toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + mRaw;
}

function computeBlockWindow(schedule, serviceName) {
  const date = schedule?.date || "";
  const time = schedule?.time || "";
  if (!date || !time) return null;
  const start = timeToMinutes(time);
  if (!Number.isFinite(start)) return null;
  let duration = Number(schedule?.durationMinutes || 0);
  if (!duration || duration <= 0) {
    duration = inferDurationMinutes(serviceName);
  }
  const end = start + duration;
  return { date, start, end };
}

function buildDateLabel(schedule) {
  if (schedule?.dateTimeText) return schedule.dateTimeText;
  if (schedule?.date && schedule?.time) return `${schedule.date} - ${schedule.time}`;
  return "";
}

function computeStatus(booking) {
  const raw = String(booking?.status || "").toLowerCase();
  if (raw === "cancelled" || raw === "canceled" || booking?.cancelled) {
    return "Cancelled";
  }

  const schedule = booking?.schedule || {};
  let dateKey = schedule.date;
  let time = schedule.time;
  if (!dateKey || !time) {
    const parsed = parseDateTimeText(schedule.dateTimeText);
    if (parsed) {
      dateKey = parsed.date;
      time = parsed.time;
    }
  }
  if (!dateKey || !time) return "Scheduled";
  const todayKey = formatDateKey(new Date());
  if (dateKey < todayKey) return "Completed";
  if (dateKey > todayKey) return "Scheduled";
  const startMinutes = timeToMinutes(time);
  if (!Number.isFinite(startMinutes)) return "Scheduled";
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return startMinutes <= nowMinutes ? "Completed" : "Scheduled";
}

function computeTotalPaid(pricing) {
  if (!pricing) return 0;
  const total = Number(pricing.total || 0);
  if (total > 0) return total;
  const deposit = Number(pricing.deposit || 0);
  const balance = Number(pricing.balance || 0);
  return deposit + balance;
}

function getWeekStart(date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getDayAvailability(date) {
  const month = date.getMonth();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isJuneJuly = month === 5 || month === 6;

  if (isJuneJuly || isWeekend) {
    return { start: 8 * 60, end: 17 * 60 };
  }
  return { start: 14 * 60 + 30, end: 17 * 60 };
}

function overlapMinutes(aStart, aEnd, bStart, bEnd) {
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  return Math.max(0, end - start);
}

function formatServiceAddress(address) {
  if (!address || typeof address !== "object") return "";
  return [address.street, address.city, address.state, address.zip].filter(Boolean).join(" ");
}

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts.shift() || "",
    lastName: parts.join(" "),
  };
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

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("reference") === "1") {
    const db = await getDbSafe();
    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }
    const reference = await generateReference(db);
    return NextResponse.json({ reference });
  }
  if (searchParams.get("stats") !== "1") {
    if (searchParams.get("list") !== "1") {
      return NextResponse.json({ error: "Unsupported request" }, { status: 400 });
    }
  }

  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json(
      { todayCount: 0, monthCount: 0, capacityPercent: 0 },
      { status: 200 }
    );
  }

  const today = new Date();
  const todayKey = formatDateKey(today);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthFromKey = formatDateKey(monthStart);
  const monthToKey = formatDateKey(monthEnd);

  const weekStart = getWeekStart(today);
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
  const weekFromKey = formatDateKey(weekStart);
  const weekToKey = formatDateKey(weekEnd);

  const monthBookings = await db
    .collection("bookings")
    .find({
      $or: [
        { "schedule.date": { $gte: monthFromKey, $lte: monthToKey } },
        {
          "schedule.date": { $in: [null, ""] },
          "schedule.dateTimeText": { $exists: true },
        },
      ],
    })
    .project({
      schedule: 1,
    })
    .toArray();

  const weekBookings = await db
    .collection("bookings")
    .find({
      $or: [
        { "schedule.date": { $gte: weekFromKey, $lte: weekToKey } },
        {
          "schedule.date": { $in: [null, ""] },
          "schedule.dateTimeText": { $exists: true },
        },
      ],
    })
    .project({
      schedule: 1,
      service: 1,
    })
    .toArray();

  let todayCount = 0;
  let monthCount = 0;
  let bookedMinutes = 0;
  let availableMinutes = 0;

  const availabilityByDate = new Map();
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(weekStart.getTime() + i * 86400000);
    const key = formatDateKey(date);
    const window = getDayAvailability(date);
    availabilityByDate.set(key, window);
    availableMinutes += window.end - window.start;
  }

  for (const booking of monthBookings) {
    const schedule = booking?.schedule || {};
    let dateKey = schedule.date;
    let time = schedule.time;

    if (!dateKey || !time) {
      const parsed = parseDateTimeText(schedule.dateTimeText);
      if (parsed) {
        dateKey = parsed.date;
        time = parsed.time;
      }
    }

    if (!dateKey) continue;
    if (dateKey === todayKey) {
      todayCount += 1;
    }
    if (dateKey >= monthFromKey && dateKey <= monthToKey) {
      monthCount += 1;
    }
  }

  for (const booking of weekBookings) {
    const schedule = booking?.schedule || {};
    let dateKey = schedule.date;
    let time = schedule.time;

    if (!dateKey || !time) {
      const parsed = parseDateTimeText(schedule.dateTimeText);
      if (parsed) {
        dateKey = parsed.date;
        time = parsed.time;
      }
    }

    if (!dateKey || !time) continue;

    if (dateKey < weekFromKey || dateKey > weekToKey) continue;
    const window = availabilityByDate.get(dateKey);
    if (!window) continue;

    const start = timeToMinutes(time);
    if (!Number.isFinite(start)) continue;
    const duration =
      Number(schedule.durationMinutes || 0) ||
      inferDurationMinutes(booking?.service?.packageName);
    const end = start + duration;

    bookedMinutes += overlapMinutes(start, end, window.start, window.end);
  }

  const capacityPercent =
    availableMinutes > 0
      ? Math.min(100, Math.round((bookedMinutes / availableMinutes) * 100))
      : 0;

  if (searchParams.get("stats") === "1") {
    return NextResponse.json({ todayCount, monthCount, capacityPercent });
  }

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || 10)));
  const skip = (page - 1) * limit;
  const statusFilter = String(searchParams.get("status") || "all").toLowerCase();
  const packageFilter = searchParams.get("package") || "all";
  const dateFilter = searchParams.get("date") || "";
  const q = String(searchParams.get("q") || "").trim();

  const filter = {};
  if (packageFilter !== "all") {
    filter["service.packageName"] = packageFilter;
  }
  if (dateFilter) {
    filter.$or = [
      { "schedule.date": dateFilter },
      { "schedule.dateTimeText": new RegExp(dateFilter) },
    ];
  }
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { reference: regex },
          { "customer.name": regex },
          { "customer.email": regex },
          { "customer.phone": regex },
          { "service.vehicleLine": regex },
          { "service.serviceAddress.street": regex },
          { "service.serviceAddress.city": regex },
          { "service.serviceAddress.state": regex },
          { "service.serviceAddress.zip": regex },
        ],
      },
    ];
  }

  const total = await db.collection("bookings").countDocuments(filter);
  const list = await db
    .collection("bookings")
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .project({
      customer: 1,
      service: 1,
      schedule: 1,
      pricing: 1,
      status: 1,
      cancelled: 1,
    })
    .toArray();

  const bookingsList = list
    .map((booking) => ({
    id: booking._id.toString(),
    customerName: booking?.customer?.name || "",
    serviceName: booking?.service?.packageName || "Detail",
    dateLabel: buildDateLabel(booking?.schedule || {}),
    status: computeStatus(booking),
    totalPaid: computeTotalPaid(booking?.pricing),
  }))
    .filter((booking) => {
      if (statusFilter === "all") return true;
      return booking.status.toLowerCase() === statusFilter;
    });

  return NextResponse.json({
    bookings: bookingsList,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

function formatDateTimeText(dateKey, time) {
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return `${dateKey} at ${time}`;
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${dateLabel} at ${time}`;
}

async function generateReference(db) {
  const year = new Date().getFullYear();
  for (let i = 0; i < 5; i += 1) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `BG-${year}-${suffix}`;
    const exists = await db.collection("bookings").findOne({ reference });
    if (!exists) return reference;
  }
  return `BG-${year}-${Date.now().toString().slice(-4)}`;
}

export async function POST(req) {
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const customer = body?.customer || {};
  const service = body?.service || {};
  const schedule = body?.schedule || {};
  const pricing = body?.pricing || {};
  const notes = body?.notes || {};

  if (
    !customer.firstName ||
    !customer.lastName ||
    !customer.email ||
    !customer.phone ||
    !service.packageName ||
    !schedule.date ||
    !schedule.time
  ) {
    return NextResponse.json(
      { error: "Missing required booking fields" },
      { status: 400 }
    );
  }

  const reference = await generateReference(db);
  const now = new Date();
  const fullName = `${customer.firstName} ${customer.lastName}`.trim();

  const doc = {
    reference,
    customer: {
      name: fullName,
      email: customer.email,
      phone: customer.phone,
    },
    service: {
      packageName: service.packageName,
      packagePrice: Number(service.packagePrice || 0),
      addons: Array.isArray(service.addons) ? service.addons : [],
      addonDetails: Array.isArray(service.addonDetails) ? service.addonDetails : [],
      vehicleLine: service.vehicleLine || "",
      serviceAddress: service.serviceAddress || {},
    },
    schedule: {
      dateTimeText: formatDateTimeText(schedule.date, schedule.time),
      date: schedule.date,
      time: schedule.time,
      durationMinutes:
        Number(schedule.durationMinutes || 0) ||
        inferDurationMinutes(service.packageName),
    },
    pricing: {
      total: Number(pricing.total || 0),
      deposit: Number(pricing.deposit || 0),
      balance: Number(pricing.balance || 0),
      addonPrices: pricing.addonPrices || {},
      discountPercent: pricing.discountPercent || 0,
      discountAmount: pricing.discountAmount || 0,
      discountedBalance: pricing.discountedBalance || null,
      promotionCode: pricing.promotionCode || "",
      promotionCodeId: pricing.promotionCodeId || "",
    },
    notes: {
      instructions: notes.instructions || "",
    },
    status: "confirmed",
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("bookings").insertOne(doc);
  const block = computeBlockWindow(doc.schedule, doc?.service?.packageName);
  if (block) {
    await db.collection("blocked_times").updateOne(
      {
        date: block.date,
        start: block.start,
        end: block.end,
        type: "booking",
        reference: doc.reference || null,
      },
      {
        $setOnInsert: {
          date: block.date,
          start: block.start,
          end: block.end,
          type: "booking",
          reference: doc.reference || null,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  const customerEmail = String(doc?.customer?.email || "").trim();
  const resendKey = (process.env.RESEND_API_KEY || "").trim();
  const from =
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    "noreply@detailgeeksautospa.com";
  const siteUrl =
    (process.env.NEXT_PUBLIC_APP_URL || "https://detailgeeksautospa.com").replace(
      /\/$/,
      ""
    );
  if (customerEmail && resendKey) {
    try {
      const invoiceData = buildInvoiceData(doc);
      let invoiceHtml = renderInvoiceHtml(invoiceData);
      invoiceHtml = invoiceHtml.replace(/src="\/images\//g, `src="${siteUrl}/images/`);
      const logoDataUri = `data:image/png;base64,${Buffer.from(
        await import("fs/promises").then((fs) =>
          fs.readFile(`${process.cwd()}/public/images/logo.png`)
        )
      ).toString("base64")}`;
      invoiceHtml = invoiceHtml.replace(
        /src="\/images\/logo\.png"/i,
        `src="${logoDataUri}"`
      );
      let pdfBuffer;
      try {
        pdfBuffer = await renderInvoicePdf(invoiceHtml);
      } catch (err) {
        console.error("[admin bookings] invoice PDF render failed; sending without PDF:", err);
      }
      const attachments =
        pdfBuffer && pdfBuffer.length
          ? [
              {
                filename: `invoice-${String(invoiceData.issueDate || "").replace(
                  /\//g,
                  "-"
                )}.pdf`,
                content: Buffer.from(pdfBuffer).toString("base64"),
                contentType: "application/pdf",
              },
            ]
          : [];

      const { firstName, lastName } = splitName(doc?.customer?.name || "");
      const customerHtml = await render(
        React.createElement(BookingConfirmationEmail, {
          firstName,
          lastName,
          email: doc?.customer?.email || "",
          phone: doc?.customer?.phone || "",
          service: doc?.service?.packageName || "",
          dateTime: doc?.schedule?.dateTimeText || "",
          address: formatServiceAddress(doc?.service?.serviceAddress) || "",
          total: Number(invoiceData?.total || 0),
          balance: Number(doc?.pricing?.balance || 0),
          discountAmount: invoiceData?.discountAmount || undefined,
          discountPercent: invoiceData?.discountPercent || undefined,
          discountedBalance: invoiceData?.discountedBalance,
          promotionCode: invoiceData?.promotionCode || undefined,
          reference: doc?.reference || "",
        })
      );

      await resend.emails.send({
        from,
        to: [customerEmail],
        subject: "Your booking is confirmed",
        html: customerHtml,
        ...(attachments.length ? { attachments } : {}),
      });
    } catch (err) {
      console.error("[admin bookings] email send failed:", err);
    }
  } else if (!resendKey) {
    console.warn("[admin bookings] RESEND_API_KEY missing; skipping email send.");
  } else if (!customerEmail) {
    console.warn("[admin bookings] missing customer email; skipping email send.");
  }
  return NextResponse.json({ ok: true, reference });
}
