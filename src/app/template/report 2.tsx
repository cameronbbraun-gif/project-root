import * as React from "react";

type ReportRow = { label: string; value: string };
type ReportSection = { title: string; rows: ReportRow[] };

export type ReportTemplateProps = {
  title: string;
  subtitle: string;
  reportId: string;
  generatedAt: string;
  sections: ReportSection[];
};

export default function ReportTemplate({
  title,
  subtitle,
  reportId,
  generatedAt,
  sections,
}: ReportTemplateProps) {
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
    maxWidth: 720,
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
    margin: "8px 0 0",
    color: brand.subtext,
    fontSize: 14,
    lineHeight: "22px",
  };

  const meta: React.CSSProperties = {
    marginTop: 10,
    fontSize: 12,
    color: brand.subtext,
  };

  const sectionTitle: React.CSSProperties = {
    margin: "20px 0 8px",
    fontWeight: 600,
    fontSize: 14,
    color: brand.text,
  };

  const sectionCard: React.CSSProperties = {
    border: `1px solid ${brand.border}`,
    borderRadius: 10,
    background: brand.subtle,
    padding: 12,
    display: "grid",
    gap: 8,
  };

  const row: React.CSSProperties = {
    display: "flex",
    gap: 8,
    fontSize: 13,
    lineHeight: "20px",
  };

  const dt: React.CSSProperties = {
    minWidth: 180,
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
          <div style={header}>
            <div style={brandRow}>
              <div style={brandName}>Detail Geeks Auto Spa</div>
            </div>
          </div>
          <div style={body}>
            <h1 style={h1}>{title}</h1>
            <p style={lead}>{subtitle}</p>
            <div style={meta}>Report ID: {reportId} · Generated: {generatedAt}</div>

            {sections.map((section) => (
              <div key={section.title}>
                <div style={sectionTitle}>{section.title}</div>
                <div style={sectionCard}>
                  {section.rows.map((r) => (
                    <div key={r.label} style={row}>
                      <div style={dt}>{r.label}</div>
                      <div style={dd}>{r.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={footer}>
          This report is generated automatically from Detail Geeks admin data.
        </div>
      </div>
    </div>
  );
}
