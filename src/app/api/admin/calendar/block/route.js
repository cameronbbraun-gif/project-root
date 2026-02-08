import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbSafe } from "@/lib/mongodb";

const schema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
  allDay: z.boolean().optional(),
  times: z.array(z.string()).optional(),
});

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

export async function POST(req) {
  try {
    const body = await req.json();
    const { dates, allDay = false, times = [] } = schema.parse(body);

    const db = await getDbSafe();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const now = new Date();
    const inserts = [];

    for (const date of dates) {
      if (allDay) {
        inserts.push({
          date,
          start: 0,
          end: 24 * 60,
          type: "block",
          createdAt: now,
        });
        continue;
      }

      for (const t of times) {
        const start = timeToMinutes(t);
        if (!Number.isFinite(start)) continue;
        inserts.push({
          date,
          start,
          end: start + 30,
          type: "block",
          createdAt: now,
        });
      }
    }

    if (inserts.length === 0) {
      return NextResponse.json({ error: "No valid times provided" }, { status: 400 });
    }

    await db.collection("blocked_times").insertMany(inserts);
    return NextResponse.json({ ok: true, inserted: inserts.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ ok: true, blocks: [] }, { status: 200 });
  }

  const blocks = await db
    .collection("blocked_times")
    .find({})
    .project({ date: 1, start: 1, end: 1 })
    .sort({ date: 1, start: 1 })
    .toArray();

  return NextResponse.json({
    ok: true,
    blocks: blocks.map((b) => ({
      id: b._id.toString(),
      date: b.date,
      start: b.start,
      end: b.end,
    })),
  });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { ObjectId } = await import("mongodb");
  try {
    await db.collection("blocked_times").deleteOne({ _id: new ObjectId(id) });
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
