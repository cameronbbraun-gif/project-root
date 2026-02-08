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
  const [datePart, timePart] = value.split(" at ");
  if (!datePart || !timePart) return null;
  const date = new Date(datePart);
  if (Number.isNaN(date.getTime())) return null;
  return { date: formatDateKey(date), time: timePart.trim() };
}

function computeTotalPaid(pricing) {
  if (!pricing) return 0;
  const total = Number(pricing.total || 0);
  if (total > 0) return total;
  const deposit = Number(pricing.deposit || 0);
  const balance = Number(pricing.balance || 0);
  return deposit + balance;
}

function formatServiceAddress(address) {
  if (!address || typeof address !== "object") return "";
  return [address.street, address.city, address.state, address.zip].filter(Boolean).join(" ");
}

function parseVehicleLine(line = "") {
  const raw = String(line || "").trim();
  if (!raw) return { raw: "" };
  let color = "";
  let type = "";
  let cleaned = raw;
  const colorMatch = cleaned.match(/\(([^)]+)\)/);
  if (colorMatch) {
    color = colorMatch[1].trim();
    cleaned = cleaned.replace(colorMatch[0], "").trim();
  }
  const typeMatch = cleaned.match(/\b(Sedan|SUV|Truck|Large SUV\/Truck)\b/i);
  if (typeMatch) {
    type = typeMatch[0];
    cleaned = cleaned.replace(typeMatch[0], "").trim();
  }
  cleaned = cleaned.replace(/,+/g, " ").replace(/\s+/g, " ").trim();
  const parts = cleaned.split(" ");
  let year = "";
  if (parts[0] && /^\d{4}$/.test(parts[0])) {
    year = parts.shift();
  }
  const make = parts.shift() || "";
  const model = parts.join(" ").trim();
  return { raw, year, make, model, color, type };
}

export async function GET(req) {
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ customers: [] }, { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const search = String(searchParams.get("search") || "").trim().toLowerCase();
  const tier = String(searchParams.get("tier") || "all").toLowerCase();
  const lastVisitWindow = String(searchParams.get("lastVisit") || "all").toLowerCase();

  const bookings = await db
    .collection("bookings")
    .find({
      "customer.email": { $exists: true, $ne: "" },
    })
    .project({
      reference: 1,
      customer: 1,
      schedule: 1,
      service: 1,
      pricing: 1,
      notes: 1,
    })
    .toArray();

  const byEmail = new Map();

  for (const booking of bookings) {
    const email = String(booking?.customer?.email || "").trim().toLowerCase();
    if (!email) continue;
    const name = String(booking?.customer?.name || "").trim();
    const phone = String(booking?.customer?.phone || "").trim();
    const schedule = booking?.schedule || {};
    let dateKey = schedule.date;
    if (!dateKey) {
      const parsed = parseDateTimeText(schedule.dateTimeText);
      if (parsed) dateKey = parsed.date;
    }
    const lastVisitKey = dateKey || "";
    const totalPaid = computeTotalPaid(booking?.pricing);
    const vehicleLine = String(booking?.service?.vehicleLine || "").trim();
    const address = formatServiceAddress(booking?.service?.serviceAddress);
    const addons = Array.isArray(booking?.service?.addons)
      ? booking.service.addons
      : [];

    const entry = byEmail.get(email) || {
      email,
      name: "",
      phone: "",
      bookingCount: 0,
      totalSpend: 0,
      lastVisit: "",
      firstVisit: "",
      vehicles: new Map(),
      addresses: new Set(),
      bookings: [],
    };

    entry.bookingCount += 1;
    entry.totalSpend += Number(totalPaid || 0);
    if (name) entry.name = name;
    if (phone) entry.phone = phone;
    if (lastVisitKey && (!entry.lastVisit || lastVisitKey > entry.lastVisit)) {
      entry.lastVisit = lastVisitKey;
    }
    if (lastVisitKey && (!entry.firstVisit || lastVisitKey < entry.firstVisit)) {
      entry.firstVisit = lastVisitKey;
    }
    if (vehicleLine) {
      const parsedVehicle = parseVehicleLine(vehicleLine);
      entry.vehicles.set(vehicleLine, parsedVehicle);
    }
    if (address) {
      entry.addresses.add(address);
    }

    entry.bookings.push({
      reference: booking?.reference || "",
      dateTimeText: schedule?.dateTimeText || "",
      packageName: booking?.service?.packageName || "",
      addons,
      totalPaid,
    });

    byEmail.set(email, entry);
  }

  const customers = Array.from(byEmail.values()).map((entry) => ({
    email: entry.email,
    name: entry.name || entry.email,
    phone: entry.phone,
    bookingCount: entry.bookingCount,
    totalSpend: Math.round(entry.totalSpend * 100) / 100,
    lastVisit: entry.lastVisit,
    vehicles: Array.from(entry.vehicles.values()),
    addresses: Array.from(entry.addresses.values()),
    bookings: entry.bookings.sort((a, b) =>
      String(b.dateTimeText || "").localeCompare(String(a.dateTimeText || ""))
    ),
    firstVisit: entry.firstVisit,
  }));

  const eligibleForVip = customers.filter((c) => c.bookingCount >= 2);
  const vipCount = Math.max(1, Math.ceil(eligibleForVip.length * 0.2));
  const vipEmails = new Set(
    eligibleForVip
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, vipCount)
      .map((c) => c.email)
  );

  const results = customers
    .map((c) => {
      let status = "New";
      if (c.bookingCount >= 2) status = "Active";
      if (vipEmails.has(c.email)) status = "VIP";
      return {
        ...c,
        status,
      };
    })
    .filter((c) => {
      if (!search) return true;
      return (
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
      );
    })
    .filter((c) => {
      if (tier === "all") return true;
      return c.status.toLowerCase() === tier;
    })
    .filter((c) => {
      if (lastVisitWindow === "all") return true;
      if (!c.lastVisit) return false;
      const days = lastVisitWindow === "30" ? 30 : lastVisitWindow === "90" ? 90 : 0;
      if (!days) return true;
      const lastDate = new Date(`${c.lastVisit}T00:00:00`);
      if (Number.isNaN(lastDate.getTime())) return false;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      cutoff.setHours(0, 0, 0, 0);
      return lastDate >= cutoff;
    })
    .sort((a, b) => b.totalSpend - a.totalSpend);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const newThisMonth = customers.filter((c) => {
    const key = String(c.firstVisit || "").slice(0, 7);
    return key === monthKey;
  }).length;
  const newPrevMonth = customers.filter((c) => {
    const key = String(c.firstVisit || "").slice(0, 7);
    return key === prevMonthKey;
  }).length;

  return NextResponse.json(
    {
      customers: results,
      stats: {
        total: customers.length,
        newThisMonth,
        newPrevMonth,
      },
    },
    { status: 200 }
  );
}
