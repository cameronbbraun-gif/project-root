// src/lib/s3.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

// Read envs, but DO NOT throw at import time
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || undefined;
const Bucket = process.env.S3_BUCKET || undefined;

let s3Client = null;

function ensureConfigured() {
  const missing = [];
  if (!region) missing.push("AWS_REGION (or AWS_DEFAULT_REGION)");
  if (!Bucket) missing.push("S3_BUCKET");
  if (missing.length) {
    throw new Error(
      `S3 misconfigured: missing ${missing.join(", ")}. Add to your environment (.env.local in dev) and restart.`
    );
  }
}

function getS3() {
  ensureConfigured();
  if (!s3Client) {
    const endpoint = process.env.AWS_S3_ENDPOINT; // e.g., Cloudflare R2 / MinIO
    const forcePathStyle = process.env.AWS_S3_FORCE_PATH_STYLE === "true";
    s3Client = new S3Client({
      region,
      ...(endpoint ? { endpoint, forcePathStyle } : {}),
      // Credentials auto-resolve from env or shared config:
      // AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN, or IAM role
    });
  }
  return s3Client;
}

export async function putFileToS3({ file, prefix = "uploads" }) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("putFileToS3: invalid file");
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const name = file.name || "file";
  const ext = name.includes(".") ? name.split(".").pop() : "bin";
  const key = `${prefix}/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;

  const client = getS3();
  await client.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: buf,
      ContentType: file.type || "application/octet-stream",
      ...(process.env.S3_OBJECT_ACL ? { ACL: process.env.S3_OBJECT_ACL } : {}),
    })
  );

  const publicBase = process.env.CDN_BASE_URL || (region ? `https://${Bucket}.s3.${region}.amazonaws.com` : "");
  return { url: `${publicBase}/${key}`, key, bucket: Bucket, region: region || null };
}