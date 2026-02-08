import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDbSafe } from "@/lib/mongodb";
import "@/lib/env";

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

function eventIdForBooking(id) {
  return `dg-${String(id).replace(/[^a-zA-Z0-9]/g, "").slice(-24)}`;
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Token refresh failed");
  }
  return data;
}

async function upsertEvent(calendarId, accessToken, eventId, payload) {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events/${encodeURIComponent(eventId)}`;
  const baseHeaders = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const putRes = await fetch(url, {
    method: "PUT",
    headers: baseHeaders,
    body: JSON.stringify(payload),
  });

  if (putRes.ok) {
    return putRes.json();
  }

  const putErr = await putRes.json().catch(() => ({}));
  if (putRes.status !== 404) {
    throw new Error(putErr?.error?.message || "Calendar upsert failed");
  }

  const insertUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?eventId=${encodeURIComponent(eventId)}`;
  const postRes = await fetch(insertUrl, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify(payload),
  });

  if (postRes.ok) {
    return postRes.json();
  }

  const postErr = await postRes.json().catch(() => ({}));
  if (postRes.status === 409) {
    // Event exists; try one more update
    const retryRes = await fetch(url, {
      method: "PUT",
      headers: baseHeaders,
      body: JSON.stringify(payload),
    });
    if (retryRes.ok) {
      return retryRes.json();
    }
    const retryErr = await retryRes.json().catch(() => ({}));
    throw new Error(retryErr?.error?.message || "Calendar update failed");
  }

  throw new Error(postErr?.error?.message || "Calendar insert failed");
}

export async function POST(req) {
  const token = req.cookies?.get("admin_session")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const tokenDoc = await db
    .collection("admin_google_tokens")
    .findOne({ adminId: decoded.sub });

  if (!tokenDoc?.accessToken && !tokenDoc?.refreshToken) {
    return NextResponse.json(
      { error: "Google not connected", needsAuth: true },
      { status: 401 }
    );
  }

  let accessToken = tokenDoc.accessToken;
  if (!accessToken || (tokenDoc.expiresAt && tokenDoc.expiresAt < Date.now())) {
    if (!tokenDoc.refreshToken) {
      return NextResponse.json(
        { error: "Google not connected", needsAuth: true },
        { status: 401 }
      );
    }
    const refreshed = await refreshAccessToken(tokenDoc.refreshToken);
    accessToken = refreshed.access_token;
    const expiresAt = Date.now() + Number(refreshed.expires_in || 0) * 1000;
    await db.collection("admin_google_tokens").updateOne(
      { adminId: decoded.sub },
      {
        $set: {
          accessToken,
          expiresAt,
          updatedAt: new Date(),
        },
      }
    );
  }

  const today = new Date();
  const fromKey = formatDateKey(today);

  const bookings = await db
    .collection("bookings")
    .find({
      $or: [
        { "schedule.date": { $gte: fromKey } },
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
      reference: 1,
      updatedAt: 1,
    })
    .toArray();

  const calendarId = "primary";
  const timezone = "America/New_York";
  let synced = 0;

  const bookingIds = bookings.map((b) => b._id);
  const syncRecords = await db
    .collection("admin_google_sync")
    .find({ adminId: decoded.sub, bookingId: { $in: bookingIds } })
    .project({ bookingId: 1, lastUpdatedAt: 1 })
    .toArray();
  const syncMap = new Map(
    syncRecords.map((rec) => [String(rec.bookingId), rec.lastUpdatedAt || null])
  );

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

    if (!dateKey || !time || dateKey < fromKey) continue;

    const bookingKey = String(booking._id);
    const bookingUpdatedAt = booking?.updatedAt
      ? new Date(booking.updatedAt).getTime()
      : 0;
    const lastSyncedAt = syncMap.get(bookingKey);
    if (lastSyncedAt && bookingUpdatedAt && bookingUpdatedAt <= new Date(lastSyncedAt).getTime()) {
      continue;
    }

    const startMinutes = timeToMinutes(time);
    if (!Number.isFinite(startMinutes)) continue;

    const duration =
      Number(schedule.durationMinutes || 0) ||
      inferDurationMinutes(booking?.service?.packageName);

    const [year, month, day] = dateKey.split("-").map(Number);
    const start = new Date(year, (month || 1) - 1, day || 1);
    start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    const end = new Date(start.getTime() + duration * 60000);

    const serviceName = booking?.service?.packageName || "Detail";
    const customer = booking?.customer || {};
    const summary = `${serviceName} - ${customer.name || "Customer"}`;
    const description = [
      `Customer: ${customer.name || ""}`,
      `Email: ${customer.email || ""}`,
      `Phone: ${customer.phone || ""}`,
      `Service: ${serviceName}`,
      `Reference: ${booking?.reference || ""}`,
    ]
      .filter(Boolean)
      .join("\n");

    const event = {
      summary,
      description,
      start: { dateTime: start.toISOString(), timeZone: timezone },
      end: { dateTime: end.toISOString(), timeZone: timezone },
    };

    const eventId = eventIdForBooking(booking._id);
    await upsertEvent(calendarId, accessToken, eventId, event);
    await db.collection("admin_google_sync").updateOne(
      { adminId: decoded.sub, bookingId: booking._id },
      {
        $set: {
          lastUpdatedAt: booking?.updatedAt || new Date(),
          eventId,
          syncedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
    synced += 1;
  }

  return NextResponse.json({ ok: true, synced });
}
