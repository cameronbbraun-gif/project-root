import { NextResponse } from "next/server";
import { getDbSafe } from "@/lib/mongodb";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDateKey(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function formatServiceAddress(address) {
  if (!address || typeof address !== "object") return "";
  return [address.street, address.city, address.state, address.zip]
    .filter(Boolean)
    .join(" ");
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

function minutesToTime(minutes) {
  if (!Number.isFinite(minutes)) return "";
  let hrs = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hrs >= 12 ? "PM" : "AM";
  if (hrs === 0) hrs = 12;
  if (hrs > 12) hrs -= 12;
  return `${hrs}:${String(mins).padStart(2, "0")} ${period}`;
}

function formatTimeRange(startTime, durationMinutes) {
  const startMinutes = timeToMinutes(startTime);
  if (!Number.isFinite(startMinutes)) return startTime || "";
  const duration = Number(durationMinutes || 0) || 180;
  const endMinutes = startMinutes + duration;
  return `${startTime} - ${minutesToTime(endMinutes)}`;
}

function getWeekStart(date) {
  const day = date.getDay(); // 0 Sun, 1 Mon
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const startParam = searchParams.get("start");
  const startDate = startParam ? new Date(`${startParam}T00:00:00`) : new Date();
  const weekStart = getWeekStart(startDate);
  const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);

  if (Number.isNaN(weekStart.getTime())) {
    return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
  }

  const fromKey = formatDateKey(weekStart);
  const toKey = formatDateKey(weekEnd);

  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ ok: true, days: [] }, { status: 200 });
  }

  const bookings = await db
    .collection("bookings")
    .find({
      $or: [
        { "schedule.date": { $gte: fromKey, $lte: toKey } },
        {
          "schedule.date": { $in: [null, ""] },
          "schedule.dateTimeText": { $exists: true },
        },
      ],
    })
    .project({
      schedule: 1,
      customer: 1,
      service: 1,
    })
    .toArray();

  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(weekStart.getTime() + index * DAY_MS);
    return {
      dateKey: formatDateKey(date),
      dayLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
      details: [],
    };
  });

  for (const booking of bookings) {
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
    if (dateKey < fromKey || dateKey > toKey) continue;

    const day = days.find((item) => item.dateKey === dateKey);
    if (!day) continue;

    const customer = booking?.customer || {};
    const service = booking?.service || {};
    const address = formatServiceAddress(service.serviceAddress);
    const timeRange = formatTimeRange(time, schedule.durationMinutes);

    day.details.push({
      customerName: customer.name || "Unknown",
      customerEmail: customer.email || "",
      customerPhone: customer.phone || "",
      service: service.packageName || "Detail",
      time: timeRange,
      address,
    });
  }

  return NextResponse.json({ ok: true, days });
}
