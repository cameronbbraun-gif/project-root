import { NextResponse } from "next/server";
import { getDbSafe } from "@/lib/mongodb";

function buildId(type, id) {
  return `${type}:${id}`;
}

function computeStatus(reply) {
  if (!reply) return "Open";
  const state = String(reply.status || "").toLowerCase();
  if (state === "sent") return "Closed";
  if (state === "draft") return "Pending";
  return "Open";
}

export async function GET() {
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ tickets: [] }, { status: 200 });
  }

  const contacts = await db
    .collection("contacts")
    .find({})
    .project({ first_name: 1, last_name: 1, email: 1, message: 1, createdAt: 1 })
    .toArray();

  const quotes = await db
    .collection("quotes")
    .find({})
    .project({
      first_name: 1,
      last_name: 1,
      email: 1,
      phone: 1,
      vehicle_type: 1,
      vehicle_make: 1,
      vehicle_model: 1,
      vehicle_year: 1,
      service: 1,
      message: 1,
      photos: 1,
      createdAt: 1,
    })
    .toArray();

  const replyDocs = await db
    .collection("support_replies")
    .find({})
    .project({ sourceType: 1, sourceId: 1, status: 1 })
    .toArray();

  const replyMap = new Map(
    replyDocs.map((r) => [buildId(r.sourceType, r.sourceId), r])
  );

  const tickets = [
    ...contacts.map((c) => ({
      id: buildId("contact", c._id.toString()),
      subject: "Support",
      name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Customer",
      email: c.email || "",
      createdAt: c.createdAt || null,
      status: computeStatus(replyMap.get(buildId("contact", c._id.toString()))),
      type: "contact",
    })),
    ...quotes.map((q) => ({
      id: buildId("quote", q._id.toString()),
      subject: "Quote",
      name: `${q.first_name || ""} ${q.last_name || ""}`.trim() || "Customer",
      email: q.email || "",
      createdAt: q.createdAt || null,
      status: computeStatus(replyMap.get(buildId("quote", q._id.toString()))),
      type: "quote",
    })),
  ];

  tickets.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return NextResponse.json({ tickets }, { status: 200 });
}
