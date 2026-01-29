import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export function getResend() {
  return resend;
}

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
