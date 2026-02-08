import * as React from "react";

type CustomerMessageEmailProps = {
  firstName?: string;
  lastName?: string;
  subject?: string;
  message?: string;
};

export default function CustomerMessageEmail({
  firstName = "",
  lastName = "",
  subject = "",
  message = "",
}: CustomerMessageEmailProps) {
  const brand = {
    bg: "#0B1220",
    primary: "#2563EB",
    text: "#0F172A",
    subtext: "#475569",
    border: "#E2E8F0",
    surface: "#FFFFFF",
    subtle: "#F8FAFC",
  } as const;

  const outer: React.CSSProperties = {
    margin: 0,
    padding: 0,
    background: brand.subtle,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    color: brand.text,
  };

  const container: React.CSSProperties = {
    maxWidth: 640,
    margin: "0 auto",
    padding: "24px 16px",
  };

  const card: React.CSSProperties = {
    background: brand.surface,
    border: `1px solid ${brand.border}`,
    borderRadius: 14,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
  };

  const header: React.CSSProperties = {
    background: brand.bg,
    padding: "18px 24px",
    color: "#FFFFFF",
  };

  const brandRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
  };

  const brandName: React.CSSProperties = {
    fontWeight: 600,
    letterSpacing: 0.2,
  };

  const body: React.CSSProperties = {
    padding: "24px",
  };

  const h1: React.CSSProperties = {
    margin: 0,
    fontSize: 20,
    lineHeight: "28px",
    fontWeight: 700,
    color: brand.text,
  };

  const lead: React.CSSProperties = {
    margin: "12px 0 0",
    color: brand.subtext,
    fontSize: 14,
    lineHeight: "22px",
  };

  const sectionTitle: React.CSSProperties = {
    margin: "20px 0 8px",
    fontWeight: 600,
    fontSize: 14,
    color: brand.text,
  };

  const messageWrap: React.CSSProperties = {
    border: `1px solid ${brand.border}`,
    borderRadius: 10,
    background: brand.subtle,
    padding: "14px 16px",
    whiteSpace: "pre-wrap",
    fontSize: 14,
    lineHeight: "22px",
  };

  const footer: React.CSSProperties = {
    marginTop: 16,
    padding: "12px 8px",
    color: brand.subtext,
    fontSize: 12,
    lineHeight: "18px",
    textAlign: "center",
  };

  return (
    <div style={outer}>
      <div style={container}>
        <div style={card}>
          <div style={header}>
            <div style={brandRow}>
              <div style={brandName}>Detail Geeks Auto Spa</div>
            </div>
          </div>
          <div style={body}>
            <h1 style={h1}>{subject || "A message from Detail Geeks"}</h1>
            <p style={lead}>
              Hi {firstName || "there"}
              {lastName ? ` ${lastName}` : ""}, here&apos;s a message from the
              Detail Geeks team.
            </p>
            <div style={sectionTitle}>Message</div>
            <div style={messageWrap}>{message || "No message provided."}</div>
          </div>
        </div>
        <div style={footer}>
          Reply to this email if you have any questions — support@detailgeeksautospa.com
        </div>
      </div>
    </div>
  );
}
