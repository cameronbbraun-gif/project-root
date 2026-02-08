import { NextResponse } from "next/server";
import { getDbSafe } from "@/lib/mongodb";

function formatDateKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function parseDateTimeText(value) {
  if (!value || typeof value !== "string") return null;
  const [datePart] = value.split(" at ");
  if (!datePart) return null;
  const date = new Date(datePart);
  if (Number.isNaN(date.getTime())) return null;
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
  let dateKey = schedule.date;
  if (!dateKey) {
    dateKey = parseDateTimeText(schedule.dateTimeText);
  }
  return dateKey || "";
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

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getRangeConfig(range, earliestKey) {
  const now = new Date();
  const rangeKey = (range || "30d").toLowerCase();
  if (rangeKey === "lifetime") {
    let start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    if (earliestKey) {
      const earliestDate = new Date(`${earliestKey}T00:00:00`);
      if (!Number.isNaN(earliestDate.getTime())) {
        start = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
      }
    }
    return { start, bucket: "month" };
  }
  if (rangeKey === "year") {
    return { start: new Date(now.getFullYear(), now.getMonth() - 11, 1), bucket: "month" };
  }
  if (rangeKey === "90d") {
    return { start: new Date(now.getTime() - 89 * 86400000), bucket: "week" };
  }
  if (rangeKey === "7d") {
    return { start: new Date(now.getTime() - 6 * 86400000), bucket: "day" };
  }
  if (rangeKey === "1d") {
    return { start: new Date(now.getTime() - 86400000), bucket: "day" };
  }
  return { start: new Date(now.getTime() - 29 * 86400000), bucket: "day" };
}

function bucketKeyForDate(dateKey, bucket) {
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  if (bucket === "month") return formatMonthKey(date);
  if (bucket === "week") return formatDateKey(startOfWeek(date));
  return formatDateKey(date);
}

export async function GET(req) {
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const range = String(searchParams.get("range") || "30d");

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

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

  let monthRevenue = 0;
  let prevMonthRevenue = 0;
  let totalRevenue = 0;
  let totalCount = 0;

  const serviceCounts = new Map();
  const rangeServiceCounts = new Map();
  let exteriorCount = 0;
  let interiorCount = 0;
  let packageCount = 0;
  let addonCount = 0;

  let rangeExterior = 0;
  let rangeInterior = 0;
  let rangePackages = 0;
  let rangeAddons = 0;

  const emailCounts = new Map();
  const emailCountsWindow = new Map();

  const windowStart = new Date(now.getFullYear(), 0, 1);
  const windowEnd = new Date(now.getFullYear(), 3, 30, 23, 59, 59, 999);
  const windowStartKey = formatDateKey(windowStart);
  const windowEndKey = formatDateKey(windowEnd);

  let earliestDateKey = "";
  for (const booking of bookings) {
    const status = String(booking?.status || "").toLowerCase();
    if (status === "cancelled" || status === "canceled") continue;

    const dateKey = getDateKeyFromBooking(booking);
    if (dateKey && (!earliestDateKey || dateKey < earliestDateKey)) {
      earliestDateKey = dateKey;
    }
    const revenue = computeTotalPaid(booking?.pricing);
    if (Number.isFinite(revenue)) {
      totalRevenue += revenue;
      totalCount += 1;
      if (dateKey.startsWith(monthKey)) monthRevenue += revenue;
      if (dateKey.startsWith(prevMonthKey)) prevMonthRevenue += revenue;
    }

    const serviceName = String(booking?.service?.packageName || "").trim();
    if (serviceName) {
      serviceCounts.set(serviceName, (serviceCounts.get(serviceName) || 0) + 1);
      const lower = serviceName.toLowerCase();
      const isExterior = lower.includes("exterior");
      const isInterior = lower.includes("interior");
      const isPackage = lower.includes("maintenance") || lower.includes("show room") || lower.includes("showroom");
      if (isExterior && !isInterior) exteriorCount += 1;
      if (isInterior && !isExterior) interiorCount += 1;
      if (isPackage) packageCount += 1;
    }

    if (Array.isArray(booking?.service?.addons) && booking.service.addons.length) {
      addonCount += 1;
    }

    const email = String(booking?.customer?.email || "").trim().toLowerCase();
    if (email) {
      emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
      if (dateKey && dateKey >= windowStartKey && dateKey <= windowEndKey) {
        emailCountsWindow.set(email, (emailCountsWindow.get(email) || 0) + 1);
      }
    }
  }

  let topService = "";
  let topCount = 0;
  for (const [service, count] of serviceCounts.entries()) {
    if (count > topCount) {
      topCount = count;
      topService = service;
    }
  }

  const avgTicket = totalCount ? totalRevenue / totalCount : 0;
  const repeatCustomers = Array.from(emailCounts.values()).filter((c) => c > 1).length;
  const totalCustomers = emailCounts.size || 0;
  const repeatRate = totalCustomers ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

  const repeatCustomersWindow = Array.from(emailCountsWindow.values()).filter((c) => c > 1).length;
  const totalCustomersWindow = emailCountsWindow.size || 0;
  const repeatRateWindow = totalCustomersWindow
    ? Math.round((repeatCustomersWindow / totalCustomersWindow) * 100)
    : 0;

  const revenueDelta =
    prevMonthRevenue > 0 ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;
  const repeatDelta = repeatRate - repeatRateWindow;

  const rangeConfig = getRangeConfig(range, earliestDateKey);
  const rangeStartKey = formatDateKey(rangeConfig.start);
  const rangeBucket = rangeConfig.bucket;
  const rangeSeries = new Map();
  const rangeAddonSeries = new Map();
  const peakHours = new Array(24).fill(0);

  for (const booking of bookings) {
    const status = String(booking?.status || "").toLowerCase();
    if (status === "cancelled" || status === "canceled") continue;
    const dateKey = getDateKeyFromBooking(booking);
    if (!dateKey) continue;
    if (dateKey < rangeStartKey) continue;

    const bucketKey = bucketKeyForDate(dateKey, rangeBucket);
    if (!bucketKey) continue;

    const revenue = computeTotalPaid(booking?.pricing);
    const existing = rangeSeries.get(bucketKey) || { revenue: 0, bookings: 0 };
    existing.revenue += revenue;
    existing.bookings += 1;
    rangeSeries.set(bucketKey, existing);

    const addonRevenue =
      Array.isArray(booking?.service?.addonDetails) && booking.service.addonDetails.length
        ? booking.service.addonDetails.reduce((sum, item) => sum + Number(item?.price || 0), 0)
        : Array.isArray(booking?.service?.addons)
          ? booking.service.addons.reduce(
              (sum, name) => sum + Number(booking?.pricing?.addonPrices?.[name] || 0),
              0
            )
          : 0;
    rangeAddonSeries.set(bucketKey, (rangeAddonSeries.get(bucketKey) || 0) + addonRevenue);

    const serviceName = String(booking?.service?.packageName || "").trim();
    if (serviceName) {
      rangeServiceCounts.set(serviceName, (rangeServiceCounts.get(serviceName) || 0) + 1);
      const lower = serviceName.toLowerCase();
      const isExterior = lower.includes("exterior");
      const isInterior = lower.includes("interior");
      const isPackage = lower.includes("maintenance") || lower.includes("show room") || lower.includes("showroom");
      if (isExterior && !isInterior) rangeExterior += 1;
      if (isInterior && !isExterior) rangeInterior += 1;
      if (isPackage) rangePackages += 1;
    }
    if (Array.isArray(booking?.service?.addons) && booking.service.addons.length) {
      rangeAddons += 1;
    }

    const time = booking?.schedule?.time;
    const minutes = timeToMinutes(time);
    if (Number.isFinite(minutes)) {
      const hour = Math.floor(minutes / 60);
      if (hour >= 0 && hour < 24) peakHours[hour] += 1;
    }
  }

  const totalServiceCount = totalCount || 1;
  const performance = {
    exterior: Math.round((exteriorCount / totalServiceCount) * 100),
    interior: Math.round((interiorCount / totalServiceCount) * 100),
    packages: Math.round((packageCount / totalServiceCount) * 100),
    addons: Math.round((addonCount / totalServiceCount) * 100),
  };

  const rangeTotal = Array.from(rangeSeries.values()).reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const rangeBookings = Array.from(rangeSeries.values()).reduce(
    (sum, item) => sum + item.bookings,
    0
  );
  const rangeAvgTicket = rangeBookings ? rangeTotal / rangeBookings : 0;

  const rangeKeys = Array.from(rangeSeries.keys()).sort();
  const chartLabels = rangeKeys.map((key) => key);
  const revenueSeries = rangeKeys.map((key) => Number(rangeSeries.get(key)?.revenue || 0));
  const bookingSeries = rangeKeys.map((key) => Number(rangeSeries.get(key)?.bookings || 0));
  const avgTicketSeries = rangeKeys.map((key) => {
    const entry = rangeSeries.get(key);
    if (!entry || !entry.bookings) return 0;
    return entry.revenue / entry.bookings;
  });
  const addonRevenueSeries = rangeKeys.map((key) => Number(rangeAddonSeries.get(key) || 0));

  const rangeServiceList = Array.from(rangeServiceCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const peakMax = Math.max(...peakHours, 1);
  const peakBookingTimes = peakHours.map((count, idx) => ({
    hour: idx,
    count,
    percent: Math.round((count / peakMax) * 100),
  }));

  const rangeTotalCount = rangeBookings || 1;
  const rangePerformance = {
    exterior: Math.round((rangeExterior / rangeTotalCount) * 100),
    interior: Math.round((rangeInterior / rangeTotalCount) * 100),
    packages: Math.round((rangePackages / rangeTotalCount) * 100),
    addons: Math.round((rangeAddons / rangeTotalCount) * 100),
  };

  return NextResponse.json({
    monthRevenue,
    revenueDelta,
    avgTicket,
    topService,
    repeatRate,
    repeatDelta,
    performance,
    range: {
      labels: chartLabels,
      revenueSeries,
      bookingSeries,
      avgTicketSeries,
      addonRevenueSeries,
      totalRevenue: rangeTotal,
      totalBookings: rangeBookings,
      avgTicket: rangeAvgTicket,
      serviceMix: rangePerformance,
      revenueByService: rangeServiceList,
      peakBookingTimes,
    },
  });
}
