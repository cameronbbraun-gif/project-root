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

function computeStatus(booking) {
  const raw = String(booking?.status || "").toLowerCase();
  if (raw === "cancelled" || raw === "canceled" || booking?.cancelled) {
    return "Cancelled";
  }
  const schedule = booking?.schedule || {};
  let dateKey = schedule.date || parseDateTimeText(schedule.dateTimeText);
  if (!dateKey) return "Pending";
  const todayKey = formatDateKey(new Date());
  return dateKey < todayKey ? "Paid" : "Pending";
}

export async function GET() {
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ invoices: [] }, { status: 200 });
  }

  const bookings = await db
    .collection("bookings")
    .find({})
    .project({
      reference: 1,
      customer: 1,
      schedule: 1,
      pricing: 1,
      status: 1,
    })
    .toArray();

  const invoices = bookings.map((booking) => ({
    id: booking?._id?.toString(),
    reference: booking?.reference || "—",
    customerName: booking?.customer?.name || "Customer",
    customerEmail: booking?.customer?.email || "",
    amount: computeTotalPaid(booking?.pricing),
    status: computeStatus(booking),
  }));

  return NextResponse.json({ invoices }, { status: 200 });
}
