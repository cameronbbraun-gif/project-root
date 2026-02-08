import * as React from "react";

export type BookingConfirmationEmailProps = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  service?: string;
  dateTime?: string;
  address?: string;
  total?: number;
  balance?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountedBalance?: number;
  promotionCode?: string;
  reference?: string;
};

const formatMoney = (value: number) => `$${Number(value || 0).toFixed(2)}`;

export default function BookingConfirmationEmail({
  firstName = "",
  lastName = "",
  email = "",
  phone = "",
  service = "",
  dateTime = "",
  address = "",
  total = 0,
  balance = 0,
  discountAmount = 0,
  discountPercent,
  discountedBalance,
  promotionCode,
  reference = "",
}: BookingConfirmationEmailProps) {
  const discountValue = Number(discountAmount || 0);
  const hasDiscount = discountValue > 0;
  const effectiveDiscountedBalance =
    discountedBalance != null
      ? Number(discountedBalance)
      : Math.max(balance - discountValue, 0);
  const deposit = Math.max(Number(total || 0) - Number(balance || 0), 0);
  const totalDue = hasDiscount ? deposit + effectiveDiscountedBalance : total;
  const discountLabel = promotionCode
    ? `Discount (${promotionCode}${discountPercent ? ` ${discountPercent}%` : ""})`
    : "Discount";
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
    minWidth: 110,
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

  const noteCard: React.CSSProperties = {
    border: `1px solid ${brand.border}`,
    borderRadius: 10,
    background: "#F1F5F9",
    padding: "12px 14px",
  };

  const noteList: React.CSSProperties = {
    margin: "8px 0 0",
    paddingLeft: 18,
    color: brand.text,
    fontSize: 14,
    lineHeight: "22px",
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
            <h1 style={h1}>Your booking is confirmed</h1>
            <p style={lead}>
              Hi {firstName || "there"}, thanks for booking with us. Your invoice
              PDF is attached to this email.
            </p>

            <div style={sectionTitle}>Booking details</div>
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
                <div style={dt}>Phone</div>
                <div style={dd}>{phone || "-"}</div>
              </div>
              <div style={detailRow}>
                <div style={dt}>Service</div>
                <div style={dd}>{service}</div>
              </div>
              <div style={detailRow}>
                <div style={dt}>Date & time</div>
                <div style={dd}>{dateTime}</div>
              </div>
              <div style={detailRow}>
                <div style={dt}>Address</div>
                <div style={dd}>{address}</div>
              </div>
              <div style={detailRow}>
                <div style={dt}>Total</div>
                <div style={dd}>{formatMoney(totalDue)}</div>
              </div>
              {hasDiscount ? (
                <>
                  <div style={detailRow}>
                    <div style={dt}>{discountLabel}</div>
                    <div style={dd}>- {formatMoney(discountValue)}</div>
                  </div>
                  <div style={detailRow}>
                    <div style={dt}>Balance due</div>
                    <div style={dd}>{formatMoney(effectiveDiscountedBalance)}</div>
                  </div>
                </>
              ) : null}
              <div style={detailRow}>
                <div style={dt}>Reference</div>
                <div style={dd}>{reference}</div>
              </div>
            </div>

          <div style={sectionTitle}>Important notes</div>
          <div style={noteCard}>
            <div style={{ color: brand.subtext, fontSize: 13 }}>
              Please review these reminders before your appointment:
            </div>
            <ul style={noteList}>
              <li>Please ensure your vehicle is accessible and remove all personal items before our arrival.</li>
              <li>Service duration is approximately 4 hours. You're welcome to stay or we can work while you're away.</li>
              <li>Remaining balance of {formatMoney(hasDiscount ? effectiveDiscountedBalance : balance)} can be paid by cash, card, or digital payment on service day.</li>
            </ul>
          </div>

          <p style={{ marginTop: 20, color: brand.subtext, fontSize: 13 }}>
            -- Detail Geeks Team
          </p>
        </div>
        </div>

        <div style={footer}>
          You are receiving this email because you booked a service. If you did
          not submit this request, you can ignore this message.
          <div style={{ marginTop: 8 }}>
            (c) {new Date().getFullYear()} Detail Geeks Auto Spa - All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
}
