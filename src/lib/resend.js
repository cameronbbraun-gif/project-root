import { Resend } from "resend";

// Lazy singleton so we don't throw at import time
let _resend;
export function getResend() {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set in environment");
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

// Export a proxy named `resend` so existing code can do `resend.emails.send(...)`
// without initializing until first use.
export const resend = new Proxy({}, {
  get(_target, prop) {
    const inst = getResend();
    const val = inst[prop];
    return typeof val === 'function' ? val.bind(inst) : val;
  }
});

export async function sendMailWithResend({ to, subject, html, from, replyTo }) {
  const client = getResend();
  const sender = from || process.env.RESEND_FROM_EMAIL;
  if (!sender) {
    throw new Error("RESEND_FROM_EMAIL is not set in environment");
  }

  const res = await client.emails.send({
    to: Array.isArray(to) ? to : [to],
    from: sender,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  return res;
}

export function esc(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}
