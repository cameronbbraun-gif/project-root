import { NextResponse } from "next/server";
import { getDbSafe } from "@/lib/mongodb";

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

function timeToMinutes(time) {
  if (!time || typeof time !== "string") return null;
  const [raw, periodRaw] = time.trim().split(" ");
  if (!raw || !periodRaw) return null;
  const [hRaw, mRaw] = raw.split(":").map(Number);
  if (!Number.isFinite(hRaw) || !Number.isFinite(mRaw)) return null;
  let h = hRaw;
  const period = periodRaw.toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + mRaw;
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

export async function GET(req, { params }) {
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const { ObjectId } = await import("mongodb");
  let booking;
  try {
    booking = await db
      .collection("bookings")
      .findOne({ _id: new ObjectId(id) });
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const customer = booking?.customer || {};
  const service = booking?.service || {};
  const schedule = booking?.schedule || {};
  const pricing = booking?.pricing || {};

  return NextResponse.json({
    id: booking._id.toString(),
    reference: booking?.reference || "",
    customerName: customer.name || "",
    customerEmail: customer.email || "",
    customerPhone: customer.phone || "",
    serviceName: service.packageName || "Detail",
    dateLabel: buildDateLabel(schedule),
    status: computeStatus(booking),
    totalPaid: computeTotalPaid(pricing),
    notes: booking?.notes?.instructions || "",
    addons: Array.isArray(service.addonDetails)
      ? service.addonDetails.map((addon) => ({
          name: addon.name || "Addon",
          price: Number(addon.price || 0),
        }))
      : Array.isArray(service.addons)
        ? service.addons.map((name) => ({
            name,
            price: Number(pricing.addonPrices?.[name] || 0),
          }))
        : [],
    address: [service?.serviceAddress?.street,
      service?.serviceAddress?.city,
      service?.serviceAddress?.state,
      service?.serviceAddress?.zip]
      .filter(Boolean)
      .join(" "),
    vehicle: service.vehicleLine || "",
  });
}

export async function PUT(req, { params }) {
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updates = {
    "customer.name": String(body?.customerName || "").trim(),
    "customer.email": String(body?.customerEmail || "").trim(),
    "customer.phone": String(body?.customerPhone || "").trim(),
    "service.packageName": String(body?.serviceName || "").trim(),
    "service.vehicleLine": String(body?.vehicle || "").trim(),
  };

  if (typeof body?.address === "string") {
    const parts = body.address.split(",").map((part) => part.trim());
    updates["service.serviceAddress.street"] = parts[0] || "";
    updates["service.serviceAddress.city"] = parts[1] || "";
    updates["service.serviceAddress.state"] = parts[2] || "";
    updates["service.serviceAddress.zip"] = parts[3] || "";
  }

  const { ObjectId } = await import("mongodb");
  let booking;
  try {
    await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    booking = await db
      .collection("bookings")
      .findOne({ _id: new ObjectId(id) });
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const customer = booking?.customer || {};
  const service = booking?.service || {};
  const schedule = booking?.schedule || {};
  const pricing = booking?.pricing || {};

  return NextResponse.json({
    id: booking._id.toString(),
    reference: booking?.reference || "",
    customerName: customer.name || "",
    customerEmail: customer.email || "",
    customerPhone: customer.phone || "",
    serviceName: service.packageName || "Detail",
    dateLabel: buildDateLabel(schedule),
    status: computeStatus(booking),
    totalPaid: computeTotalPaid(pricing),
    notes: booking?.notes?.instructions || "",
    addons: Array.isArray(service.addonDetails)
      ? service.addonDetails.map((addon) => ({
          name: addon.name || "Addon",
          price: Number(addon.price || 0),
        }))
      : Array.isArray(service.addons)
        ? service.addons.map((name) => ({
            name,
            price: Number(pricing.addonPrices?.[name] || 0),
          }))
        : [],
    address: [
      service?.serviceAddress?.street,
      service?.serviceAddress?.city,
      service?.serviceAddress?.state,
      service?.serviceAddress?.zip,
    ]
      .filter(Boolean)
      .join(" "),
    vehicle: service.vehicleLine || "",
  });
}
