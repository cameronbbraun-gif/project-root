import { NextResponse } from "next/server";
import { getDbSafe } from "@/lib/mongodb";
import React from "react";
import { render } from "@react-email/render";
import { resend } from "@/lib/resend";
import SupportReplyEmail from "@/email/template/supportreplyemail";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
const s3Bucket = process.env.S3_BUCKET;
const s3Client =
  s3Region && s3Bucket
    ? new S3Client({
        region: s3Region,
        ...(process.env.AWS_S3_ENDPOINT
          ? {
              endpoint: process.env.AWS_S3_ENDPOINT,
              forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === "true",
            }
          : {}),
      })
    : null;

function getS3KeyFromUrl(url) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname || "";
    if (path.startsWith("/")) return path.slice(1);
    return path;
  } catch {
    return null;
  }
}

async function signPhotoUrl(url) {
  if (!s3Client || !s3Bucket) return url;
  const key = getS3KeyFromUrl(url);
  if (!key) return url;
  try {
    const command = new GetObjectCommand({ Bucket: s3Bucket, Key: key });
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch {
    return url;
  }
}

function parseId(id) {
  const [type, raw] = String(id || "").split(":");
  return { type, raw };
}

export async function GET(req, { params }) {
  const { id } = await params;
  const { type, raw } = parseId(id);
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { ObjectId } = await import("mongodb");
  let doc;
  try {
    doc =
      type === "quote"
        ? await db.collection("quotes").findOne({ _id: new ObjectId(raw) })
        : await db.collection("contacts").findOne({ _id: new ObjectId(raw) });
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (type === "contact") {
    return NextResponse.json({
      type: "contact",
      name: `${doc.first_name || ""} ${doc.last_name || ""}`.trim(),
      email: doc.email || "",
      message: doc.message || "",
    });
  }

  const photos = Array.isArray(doc.photos) ? doc.photos : [];
  const signedPhotos = await Promise.all(photos.map((url) => signPhotoUrl(String(url))));

  return NextResponse.json({
    type: "quote",
    name: `${doc.first_name || ""} ${doc.last_name || ""}`.trim(),
    email: doc.email || "",
    phone: doc.phone || "",
    vehicleType: doc.vehicle_type || "",
    vehicleMake: doc.vehicle_make || "",
    vehicleModel: doc.vehicle_model || "",
    vehicleYear: doc.vehicle_year || "",
    service: doc.service || "",
    message: doc.message || "",
    photos: signedPhotos,
  });
}

export async function POST(req, { params }) {
  const { id } = await params;
  const { type, raw } = parseId(id);
  const db = await getDbSafe();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const action = String(payload?.action || "").toLowerCase();
  const subject = String(payload?.subject || "").trim();
  const message = String(payload?.message || "").trim();

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }

  const { ObjectId } = await import("mongodb");
  let original;
  try {
    original =
      type === "quote"
        ? await db.collection("quotes").findOne({ _id: new ObjectId(raw) })
        : await db.collection("contacts").findOne({ _id: new ObjectId(raw) });
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!original) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const replyDoc = {
    sourceType: type,
    sourceId: raw,
    subject,
    message,
    updatedAt: new Date(),
    status: action === "send" ? "sent" : "draft",
    sentAt: action === "send" ? new Date() : null,
  };

  await db.collection("support_replies").updateOne(
    { sourceType: type, sourceId: raw },
    { $set: replyDoc, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );

  if (action === "send") {
    const email = String(original.email || "").trim();
    if (!email) {
      return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
    }
    const html = await render(
      React.createElement(SupportReplyEmail, {
        name: `${original.first_name || ""} ${original.last_name || ""}`.trim(),
        subject,
        message,
        originalType: type,
        originalMessage: original.message || "",
      })
    );
    const fromAddress =
      process.env.RESEND_SUPPORT_EMAIL ||
      "Detail Geeks Auto Spa <support@detailgeeksautospa.com>";
    await resend.emails.send({
      from: fromAddress,
      to: [email],
      subject,
      html,
      replyTo: "support@detailgeeksautospa.com",
    });
  }

  return NextResponse.json({ ok: true });
}
