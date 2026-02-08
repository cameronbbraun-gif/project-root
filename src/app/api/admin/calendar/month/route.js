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
  return { date: formatDateKey(date) };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month"); // YYYY-MM
  if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }

  const [yearRaw, monthRaw] = monthParam.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }

  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const fromKey = formatDateKey(monthStart);
  const toKey = formatDateKey(monthEnd);

  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ ok: true, counts: {} }, { status: 200 });
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
    })
    .toArray();

  const counts = {};

  for (const booking of bookings) {
    const schedule = booking?.schedule || {};
    let dateKey = schedule.date;

    if (!dateKey) {
      const parsed = parseDateTimeText(schedule.dateTimeText);
      if (parsed) {
        dateKey = parsed.date;
      }
    }

    if (!dateKey) continue;
    if (dateKey < fromKey || dateKey > toKey) continue;

    counts[dateKey] = (counts[dateKey] || 0) + 1;
  }

  return NextResponse.json({ ok: true, counts });
}
