export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { putFileToS3 } from '@/lib/s3';

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://detailgeeksautospa.com",
  "https://www.detailgeeksautospa.com",
];

function corsHeaders(req) {
  const origin = req.headers?.get?.('origin') || '';
  const allowOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : "https://detailgeeksautospa.com";
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
  };
}

function json(req, data, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(req),
    },
  });
}

function isFileLike(v) {
  return v && typeof v === 'object' && typeof v.arrayBuffer === 'function';
}

function firstFileFromFormData(form) {
  const direct = form.get('file');
  if (isFileLike(direct)) return direct;
  const alt1 = form.get('files');
  if (isFileLike(alt1)) return alt1;
  const alt2 = form.get('files[]');
  if (isFileLike(alt2)) return alt2;
  for (const [, value] of form.entries()) {
    if (isFileLike(value)) return value;
  }
  return null;
}

function sanitizeBatch(b) {
  return String(b || '')
    .toLowerCase()
    .replace(/[^a-z0-9-_:t]/g, '-')
    .slice(0, 72) || new Date().toISOString().replace(/[:.]/g, '-');
}

export async function OPTIONS(req) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('multipart/form-data')) {
      return json(req, { ok: false, error: 'Expected multipart/form-data with a file field' }, 400);
    }

    const form = await req.formData();
    const file = firstFileFromFormData(form);
    const batch = sanitizeBatch(form.get('batch'));

    if (!isFileLike(file)) {
      return json(req, { ok: false, error: "No file found. Use field name 'file' or 'files' and send as FormData." }, 400);
    }

    const prefix = `quotes/${batch}`;
    const { url, key } = await putFileToS3({ file, prefix });

    return json(req, {
      ok: true,
      batch,
      file: { url, key, name: file.name, size: file.size, type: file.type },
    });
  } catch (err) {
    console.error('[quote/upload] error:', err);
    const msg = err && err.message ? err.message : String(err);
    return json(req, { ok: false, error: msg }, 500);
  }
}
