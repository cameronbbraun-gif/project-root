const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://detailgeeksautospa.com",
  "https://www.detailgeeksautospa.com",
];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : "https://detailgeeksautospa.com";

  return new NextResponse(null, { status: 204, headers: corsHeaders(allow) });
}
import { NextResponse } from "next/server";
import { getDbSafe } from "@/lib/mongodb";

import { resend } from "@/lib/resend";
import React from "react";
import QuoteConfirmationEmail from "../../../email/template/quoteconfirmationemail";

async function trySendEmail({ to, subject, html, react, replyTo }) {
  try {
    const payload = {
      from: EMAIL_FROM,
      to,
      subject,
      ...(replyTo ? { replyTo } : {}),
      ...(react ? { react } : {}),
      ...(html ? { html } : {}),
    };
    const res = await resend.emails.send(payload);
    return { ok: true, id: res?.id || null };
  } catch (e) {
    console.error('[resend] send error:', e);
    return { ok: false, error: String(e?.message || e) };
  }
}

const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "";
const EMAIL_TO_OWNER = process.env.RESEND_OWNER_EMAIL || "";

// Build an S3 folder URL for the batch (works for public buckets or CloudFront; otherwise it's still a helpful path)
function s3BatchUrl(batch) {
  if (!batch) return null;
  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (!bucket) return null;
  // Public URL format varies by region; this matches the one used in uploads
  const base =
    region && region !== "us-east-1"
      ? `https://${bucket}.s3.${region}.amazonaws.com`
      : `https://${bucket}.s3.amazonaws.com`;
  return `${base}/quotes/${batch}/`;
}

function ticketIdFromBatch(batch) {
  if (!batch) return null;
  const parts = String(batch).split('-');
  return parts[parts.length - 1] || null;
}

export async function POST(req) {
  try {
    const origin = req.headers.get("origin") || "";
    const allow = ALLOWED_ORIGINS.includes(origin)
      ? origin
      : "https://detailgeeksautospa.com";
    const form = await req.formData();

    // --- Basic server-side validation mirroring form "required" fields ---
    const missing = [];
    const requiredPairs = [
      ['first_name', form.get('first_name')],
      ['last_name', form.get('last_name')],
      ['email', form.get('email')],
      ['phone', form.get('phone')],
      ['vehicle_type', form.get('vehicle_type')],
      ['vehicle_make', form.get('vehicle_make')],
      ['vehicle_model', form.get('vehicle_model')],
      ['vehicle_year', form.get('vehicle_year')],
      ['service', form.get('service')],
      ['agree_to_terms', form.get('agree_to_terms')],
    ];
    for (const [name, val] of requiredPairs) {
      if (!val || (typeof val === 'string' && !val.trim())) missing.push(name);
    }
    if (missing.length) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields', missing },
        { status: 400, headers: corsHeaders(allow) }
      );
    }

    // Fields
    const first_name = form.get("first_name");
    const last_name = form.get("last_name");
    const email = form.get("email");
    const phone = form.get("phone");
    const vehicle_type = form.get("vehicle_type");
    const vehicle_make = form.get("vehicle_make");
    const vehicle_model = form.get("vehicle_model");
    const vehicle_year = form.get("vehicle_year");
    const service = form.get("service");
    const message = form.get("message");
    const agree_to_terms = form.get("agree_to_terms");
    const upload_batch = form.get("upload_batch") || null; // newly added

    const ticket_id = ticketIdFromBatch(upload_batch);

    // URLs from the client-side pre-upload to S3
    const uploadedUrls = form.getAll("uploadedPhotos[]").filter(Boolean);

    const fullName = [first_name, last_name].filter(Boolean).join(' ').trim();
    const batchFolderName = upload_batch ? `quotes/${upload_batch}/` : null;

    const doc = {
      first_name,
      last_name,
      email,
      phone,
      vehicle_type,
      vehicle_make,
      vehicle_model,
      vehicle_year,
      service,
      message,
      agree_to_terms: !!agree_to_terms,
      photos: uploadedUrls,
      photo_count: uploadedUrls.length || 0,
      upload_batch,                 // store the S3 batch "folder" id
      ticket_id,
      createdAt: new Date(),
      ip: req.headers.get("x-forwarded-for") || "unknown",
      ua: req.headers.get("user-agent") || "unknown",
    };

    // 1) Save to Mongo
    const db = await getDbSafe();
    let insertedId = null;
    if (db) {
      try {
        const result = await db.collection("quotes").insertOne(doc);
        insertedId = result?.insertedId || null;
      } catch (dbErr) {
        console.error("[quote] db insert failed:", dbErr);
      }
    } else {
      console.warn("[quote] db unavailable; skipping insert");
    }

    // 2) Send notification to owner
    const ownerHtml = `
      <h2>New Quote Request</h2>
      <p><strong>Name:</strong> ${fullName || "(no name)"}</p>
      <p><strong>Email:</strong> ${email || "(none)"}</p>
      <p><strong>Phone:</strong> ${phone || "(none)"}</p>
      <p><strong>Vehicle:</strong> ${vehicle_year || ""} ${vehicle_make || ""} ${vehicle_model || ""} (${vehicle_type || ""})</p>
      <p><strong>Service:</strong> ${service || ""}</p>
      ${batchFolderName ? `<p><strong>S3 Photo Folder:</strong> ${batchFolderName}${s3BatchUrl(upload_batch) ? `<br><a href="${s3BatchUrl(upload_batch)}">Open folder</a>` : ''}</p>` : ''}
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${(message || "").replace(/\n/g, "<br>")}</p>
      ${
        uploadedUrls?.length
          ? `<p><strong>Photos (${uploadedUrls.length}):</strong><br>${uploadedUrls
              .map((u) => `<a href="${u}">${u}</a>`)
              .join("<br>")}</p>`
          : ""
      }
      <p><em>Quote ID:</em> ${insertedId || "(not saved)"}</p>
    `;
    let ownerSend;
    if (EMAIL_FROM && EMAIL_TO_OWNER) {
      const ownerSubject = `New Quote: ${fullName || 'Customer'} — ${service || 'Service'}${batchFolderName ? ` — ${batchFolderName}` : ''}`;
      ownerSend = await trySendEmail({
        to: EMAIL_TO_OWNER,
        subject: ownerSubject,
        html: ownerHtml,
        replyTo: email || undefined,
      });
    }

    // 3) Send confirmation to customer
    let customerSend;
    if (email && EMAIL_FROM) {
      const customerSubject = 'We received your quote request';
      const customerReact = (
        <QuoteConfirmationEmail
          firstName={first_name || ""}
          lastName={last_name || ""}
          email={email || ""}
          service={service || ""}
          vehicleYear={vehicle_year || ""}
          vehicleMake={vehicle_make || ""}
          vehicleModel={vehicle_model || ""}
          vehicleType={vehicle_type || ""}
          ticketId={ticket_id || ""}
          photosCount={uploadedUrls?.length || 0}
        />
      );
      customerSend = await trySendEmail({
        to: email,
        subject: customerSubject,
        react: customerReact,
      });
    }

    const diag = {
      emailEnv: {
        hasKey: !!process.env.RESEND_API_KEY,
        fromSet: !!EMAIL_FROM,
        ownerSet: !!EMAIL_TO_OWNER,
      },
      ownerEmail: typeof ownerSend !== 'undefined' ? ownerSend : null,
      customerEmail: (email && EMAIL_FROM) ? (typeof customerSend !== 'undefined' ? customerSend : null) : null,
    };
    return NextResponse.json(
      { ok: true, id: insertedId ? String(insertedId) : null, ...diag },
      { status: 200, headers: corsHeaders(allow) }
    );
  } catch (err) {
    console.error("[quote] POST error:", err);
    const origin = req.headers.get("origin") || "";
    const allow = ALLOWED_ORIGINS.includes(origin)
      ? origin
      : "https://detailgeeksautospa.com";
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500, headers: corsHeaders(allow) }
    );
  }
}
