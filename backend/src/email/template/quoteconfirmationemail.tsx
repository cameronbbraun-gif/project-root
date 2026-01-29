import * as React from "react";

export type QuoteConfirmationEmailProps = {
  firstName?: string;
  lastName?: string;
  email?: string;
  service?: string;
  vehicleYear?: string | number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleType?: string;
  ticketId?: string;
  photosCount?: number;
};

export default function QuoteConfirmationEmail({
  firstName = "",
  lastName = "",
  email = "",
  service = "",
  vehicleYear = "",
  vehicleMake = "",
  vehicleModel = "",
  vehicleType = "",
  ticketId = "",
  photosCount = 0,
}: QuoteConfirmationEmailProps) {
  // Brand / design tokens
  const brand = {
    bg: "#0B1220", // header background
    primary: "#2563EB", // accents / links
    text: "#0F172A", // slate-900
    subtext: "#475569", // slate-600
    border: "#E2E8F0", // slate-200
    surface: "#FFFFFF",
    subtle: "#F8FAFC", // slate-50
  } as const;

  // Layout wrappers
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

  const detailList: React.CSSProperties = {
    border: `1px solid ${brand.border}`,
    borderRadius: 10,
    background: brand.subtle,
    padding: 12,
  };

  const detailRow: React.CSSProperties = {
    display: "flex",
    gap: 8,
    fontSize: 14,
    lineHeight: "22px",
  };

  const dt: React.CSSProperties = {
    minWidth: 88,
    color: brand.subtext,
  };

  const dd: React.CSSProperties = {
    color: brand.text,
    flex: 1,
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
          {/* Header */}
          <div style={header}>
            <div style={brandRow}>
              <div style={brandName}>Detail Geeks Auto Spa</div>
            </div>
          </div>

          {/* Body */}
          <div style={body}>
            <h1 style={h1}>We received your quote request</h1>
            <p style={lead}>
              Hi {firstName || "there"}, thanks for reaching out — we received your
              request and will get back to you shortly.
            </p>

            {/* Details */}
            <div style={sectionTitle}>Your details</div>
            <div style={detailList}>
              <div style={detailRow}>
                <div style={dt}>Name</div>
                <div style={dd}>
                  {firstName} {lastName}
                </div>
              </div>
              <div style={detailRow}>
                <div style={dt}>Email</div>
                <div style={dd}>{email}</div>
              </div>
              <div style={detailRow}>
                <div style={dt}>Service</div>
                <div style={dd}>{service}</div>
              </div>
              <div style={detailRow}>
                <div style={dt}>Vehicle</div>
                <div style={dd}>
                  {vehicleYear} {vehicleMake} {vehicleModel} ({vehicleType})
                </div>
              </div>
              <div style={detailRow}>
                <div style={dt}>Photos</div>
                <div style={dd}>{photosCount}</div>
              </div>
              {ticketId ? (
                <div style={detailRow}>
                  <div style={dt}>Ticket ID</div>
                  <div style={dd}>{ticketId}</div>
                </div>
              ) : null}
            </div>

            <p style={{ marginTop: 20, color: brand.subtext, fontSize: 13 }}>
              — Detail Geeks Team
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={footer}>
          You’re receiving this email because you requested a quote. If you didn’t submit this request, you can safely ignore this message.
          <div style={{ marginTop: 8 }}>
            © {new Date().getFullYear()} Detail Geeks Auto Spa • All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
}