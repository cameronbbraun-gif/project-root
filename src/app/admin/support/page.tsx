"use client";

import { useEffect, useState } from "react";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState<any | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const loadTickets = (signal?: AbortSignal) => {
    setLoading(true);
    fetch("/api/admin/messages", { signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    loadTickets(controller.signal);
    const interval = setInterval(() => loadTickets(controller.signal), 30000);
    const onFocus = () => loadTickets(controller.signal);
    window.addEventListener("focus", onFocus);
    return () => {
      controller.abort();
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Support
          <span>Track customer requests and internal notes.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button" onClick={() => loadTickets()}>
            Refresh
          </button>
          <button className="admin-button">Knowledge Base</button>
          <button className="admin-button primary">New Ticket</button>
        </div>
      </section>

      <section className="admin-card">
        <h3>Open Tickets</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Message</th>
              <th>Reply</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ color: "#5b647a" }}>
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: "#5b647a" }}>
                  No support messages found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td></td>
                  <td>{ticket.subject}</td>
                  <td>
                    <span className="admin-pill">{ticket.status}</span>
                  </td>
                  <td>
                    <button
                      className="admin-link-button"
                      type="button"
                      onClick={async () => {
                        const res = await fetch(`/api/admin/messages/${ticket.id}`);
                        const data = await res.json().catch(() => null);
                        if (!res.ok || !data) return;
                        setViewData(data);
                        setViewOpen(true);
                      }}
                    >
                      View
                    </button>
                  </td>
                  <td>
                    <button
                      className="admin-link-button"
                      type="button"
                      onClick={() => {
                        setReplyTarget(ticket);
                        setReplyMessage("");
                        setReplyStatus(null);
                        setReplyOpen(true);
                      }}
                    >
                      Message
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {viewOpen && viewData && (
        <div className="admin-modal-backdrop" onClick={() => setViewOpen(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: "860px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>{viewData.type === "quote" ? "Quote Request" : "Support Message"}</h3>
              <button className="admin-button" onClick={() => setViewOpen(false)}>
                Close
              </button>
            </div>
            {viewData.type === "contact" ? (
              <div className="admin-card" style={{ boxShadow: "none" }}>
                <div style={{ fontWeight: 600 }}>{viewData.name}</div>
                <div style={{ color: "#5b647a" }}>{viewData.email}</div>
                <div style={{ marginTop: "12px" }}>{viewData.message}</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                <div className="admin-card" style={{ boxShadow: "none" }}>
                  <div style={{ fontWeight: 600 }}>{viewData.name}</div>
                  <div style={{ color: "#5b647a" }}>
                    {viewData.email} · {viewData.phone}
                  </div>
                  <div style={{ marginTop: "8px", color: "#5b647a" }}>
                    {viewData.vehicleYear} {viewData.vehicleMake} {viewData.vehicleModel} (
                    {viewData.vehicleType})
                  </div>
                  <div style={{ marginTop: "6px", fontWeight: 600 }}>
                    Desired service: {viewData.service}
                  </div>
                  {viewData.message && (
                    <div style={{ marginTop: "10px" }}>{viewData.message}</div>
                  )}
                </div>
                {viewData.photos?.length ? (
                  <div className="admin-card" style={{ boxShadow: "none" }}>
                    <div style={{ fontWeight: 600, marginBottom: "8px" }}>Photos</div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        overflowX: "auto",
                        paddingBottom: "6px",
                      }}
                    >
                      {viewData.photos.map((url: string) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => {
                            setViewData((prev: any) => ({
                              ...prev,
                              activePhoto: url,
                            }));
                          }}
                          style={{
                            border: "none",
                            padding: 0,
                            background: "none",
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={url}
                            alt="Vehicle"
                            style={{
                              width: "160px",
                              borderRadius: "10px",
                              border: "1px solid #e5e9f2",
                              objectFit: "cover",
                              height: "120px",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    {viewData.activePhoto && (
                      <div
                        className="admin-modal-backdrop"
                        onClick={() =>
                          setViewData((prev: any) => ({
                            ...prev,
                            activePhoto: null,
                          }))
                        }
                      >
                        <div
                          className="admin-modal"
                          style={{ maxWidth: "960px" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="admin-modal-header">
                            <h3>Photo Preview</h3>
                            <button
                              className="admin-button"
                              onClick={() =>
                                setViewData((prev: any) => ({
                                  ...prev,
                                  activePhoto: null,
                                }))
                              }
                            >
                              Close
                            </button>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <button
                              className="admin-button"
                              onClick={() => {
                                const idx = viewData.photos.indexOf(viewData.activePhoto);
                                const next = (idx - 1 + viewData.photos.length) % viewData.photos.length;
                                setViewData((prev: any) => ({
                                  ...prev,
                                  activePhoto: viewData.photos[next],
                                }));
                              }}
                            >
                              Prev
                            </button>
                            <img
                              src={viewData.activePhoto}
                              alt="Vehicle"
                              style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
                            />
                            <button
                              className="admin-button"
                              onClick={() => {
                                const idx = viewData.photos.indexOf(viewData.activePhoto);
                                const next = (idx + 1) % viewData.photos.length;
                                setViewData((prev: any) => ({
                                  ...prev,
                                  activePhoto: viewData.photos[next],
                                }));
                              }}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {replyOpen && replyTarget && (
        <div className="admin-modal-backdrop" onClick={() => setReplyOpen(false)}>
          <div
            className="admin-modal"
            style={{ maxWidth: "720px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Reply to {replyTarget.name}</h3>
              <button className="admin-button" onClick={() => setReplyOpen(false)}>
                Cancel
              </button>
            </div>
            <div className="admin-form">
              <div>
                <label>Message</label>
                <textarea
                  rows={6}
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            {replyStatus && (
              <div style={{ marginTop: "8px", color: "#5b647a" }}>{replyStatus}</div>
            )}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button
                className="admin-button"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  setReplyStatus(null);
                  const subject =
                    replyTarget?.type === "quote" ? "Quote Response" : "Support Response";
                  const res = await fetch(`/api/admin/messages/${replyTarget.id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "save",
                      subject,
                      message: replyMessage,
                    }),
                  });
                  const data = await res.json().catch(() => null);
                  if (!res.ok) {
                    setReplyStatus(data?.error || "Unable to save reply.");
                  } else {
                    setReplyStatus("Draft saved.");
                  }
                  setSaving(false);
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                className="admin-button primary"
                disabled={sending}
                onClick={async () => {
                  setSending(true);
                  setReplyStatus(null);
                  const subject =
                    replyTarget?.type === "quote" ? "Quote Response" : "Support Response";
                  const res = await fetch(`/api/admin/messages/${replyTarget.id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "send",
                      subject,
                      message: replyMessage,
                    }),
                  });
                  const data = await res.json().catch(() => null);
                  if (!res.ok) {
                    setReplyStatus(data?.error || "Unable to send reply.");
                  } else {
                    setReplyStatus("Reply sent.");
                  }
                  setSending(false);
                }}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
