"use client";

import { useEffect, useState } from "react";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value || 0)
  );

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendMessage, setSendMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/admin/customers/invoices")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setInvoices(Array.isArray(data?.invoices) ? data.invoices : []);
      })
      .catch(() => {
        if (!active) return;
        setInvoices([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Invoices
          <span>Track payments, balances, and outstanding invoices.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">Send Reminder</button>
          <button className="admin-button primary">Create Invoice</button>
        </div>
      </section>

      <section className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ color: "#5b647a" }}>
                  Loading invoices...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: "#5b647a" }}>
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.reference}</td>
                  <td>
                    <strong>{invoice.customerName}</strong>
                    <div style={{ color: "#5b647a", fontSize: "0.8rem" }}>
                      {invoice.customerEmail}
                    </div>
                  </td>
                  <td>{formatMoney(invoice.amount)}</td>
                  <td>
                    <span className="admin-pill">{invoice.status}</span>
                  </td>
                  <td>
                    <button
                      className="admin-link-button"
                      type="button"
                      onClick={async () => {
                        setSendMessage(null);
                        const res = await fetch(
                          `/api/admin/customers/invoices/${invoice.id}`
                        );
                        const data = await res.json().catch(() => null);
                        if (!res.ok || !data?.invoiceHtml) return;
                        setPreviewHtml(data.invoiceHtml);
                        setPreviewId(invoice.id);
                        setPreviewOpen(true);
                      }}
                    >
                      View
                    </button>
                    <span style={{ margin: "0 6px", color: "#cbd5f5" }}>|</span>
                    <button
                      className="admin-link-button"
                      type="button"
                      disabled={sendingId === invoice.id}
                      onClick={async () => {
                        setSendingId(invoice.id);
                        setSendMessage(null);
                        try {
                          const res = await fetch(
                            `/api/admin/customers/invoices/${invoice.id}`,
                            { method: "POST" }
                          );
                          const data = await res.json().catch(() => null);
                          if (!res.ok) {
                            setSendMessage(data?.error || "Unable to send invoice.");
                          } else {
                            setSendMessage("Invoice sent.");
                          }
                        } catch {
                          setSendMessage("Unable to send invoice.");
                        } finally {
                          setSendingId(null);
                        }
                      }}
                    >
                      {sendingId === invoice.id ? "Sending..." : "Send"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {sendMessage && (
          <div style={{ marginTop: "10px", color: "#5b647a" }}>{sendMessage}</div>
        )}
      </section>

      {previewOpen && previewHtml && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal" style={{ maxWidth: "860px" }}>
            <div className="admin-modal-header">
              <h3>Invoice Preview</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="admin-button primary"
                  type="button"
                  onClick={async () => {
                    if (!previewId) return;
                    const res = await fetch(
                      `/api/admin/customers/invoices/${previewId}?format=pdf`
                    );
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "invoice.pdf";
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  Download PDF
                </button>
                <button
                  className="admin-button"
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <div style={{ height: "70vh", border: "1px solid #e5e9f2" }}>
              <iframe
                title="Invoice Preview"
                style={{ width: "100%", height: "100%", border: "none" }}
                srcDoc={previewHtml}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
