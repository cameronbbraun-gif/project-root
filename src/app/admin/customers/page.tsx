"use client";

import { useEffect, useState } from "react";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

function formatDateLabel(dateKey: string) {
  if (!dateKey) return "—";
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [lastVisitFilter, setLastVisitFilter] = useState("all");
  const [activeCustomer, setActiveCustomer] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"cars" | "addresses" | "bookings">("cars");
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<any | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageStatus, setMessageStatus] = useState<string | null>(null);
  const [messageSending, setMessageSending] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    vip: 0,
    repeatRate: 0,
    newThisMonth: 0,
    newPrevMonth: 0,
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tierFilter !== "all") params.set("tier", tierFilter);
    if (lastVisitFilter !== "all") params.set("lastVisit", lastVisitFilter);
    fetch(`/api/admin/customers?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        const list: any[] = Array.isArray(data?.customers) ? data.customers : [];
        setCustomers(list);
        const vipCount = list.filter((c: any) => c.status === "VIP").length;
        const repeat = list.filter((c: any) => c.bookingCount >= 2).length;
        const repeatRate = list.length ? Math.round((repeat / list.length) * 100) : 0;
        setStats({
          total: Number(data?.stats?.total || list.length),
          vip: vipCount,
          repeatRate,
          newThisMonth: Number(data?.stats?.newThisMonth || 0),
          newPrevMonth: Number(data?.stats?.newPrevMonth || 0),
        });
      })
      .catch(() => {
        if (!active) return;
        setCustomers([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, tierFilter, lastVisitFilter]);

  const monthDelta = stats.newThisMonth - stats.newPrevMonth;
  const monthNote =
    monthDelta === 0
      ? "No change from previous month"
      : `${monthDelta > 0 ? "+" : ""}${monthDelta} from previous month`;

  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Customers
          <span>Keep track of customer history and loyalty tiers.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">Segments</button>
          <button className="admin-button primary">Add Customer</button>
        </div>
      </section>

      <section className="admin-grid cols-3">
        <div className="admin-card">
          <h3>Total Customers</h3>
          <div className="admin-stat-value">{stats.total}</div>
          <div className="admin-stat-note">{monthNote}</div>
        </div>
        <div className="admin-card">
          <h3>Loyalty Tier</h3>
          <div className="admin-stat-value">{stats.vip} VIPs</div>
          <div className="admin-stat-note">Top 20% spenders</div>
        </div>
        <div className="admin-card">
          <h3>Repeat Rate</h3>
          <div className="admin-metric-bar">
            <span style={{ width: `${stats.repeatRate}%` }} />
          </div>
          <div className="admin-stat-note">
            {stats.repeatRate}% repeat bookings
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-filters" style={{ marginBottom: "12px" }}>
          <select
            className="admin-select"
            value={tierFilter}
            onChange={(event) => setTierFilter(event.target.value)}
          >
            <option value="all">All tiers</option>
            <option value="VIP">VIP</option>
            <option value="Active">Active</option>
            <option value="New">New</option>
          </select>
          <input
            className="admin-input"
            placeholder="Search name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="admin-select"
            value={lastVisitFilter}
            onChange={(event) => setLastVisitFilter(event.target.value)}
          >
            <option value="all">Last visit</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Status</th>
              <th>Last Visit</th>
              <th>Lifetime Spend</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ color: "#5b647a" }}>
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: "#5b647a" }}>
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.email}>
                  <td>
                    <strong>{customer.name}</strong>
                    <div style={{ color: "#5b647a", fontSize: "0.8rem" }}>
                      {customer.email}
                    </div>
                  </td>
                  <td>
                    <span className="admin-pill">{customer.status}</span>
                  </td>
                  <td>{formatDateLabel(customer.lastVisit)}</td>
                  <td>{formatMoney(customer.totalSpend)}</td>
                  <td>
                    <button
                      className="admin-link-button"
                      type="button"
                      onClick={() => {
                        setActiveCustomer(customer);
                        setActiveTab("cars");
                      }}
                    >
                      View
                    </button>
                    <span style={{ margin: "0 6px", color: "#cbd5f5" }}>|</span>
                    <button
                      className="admin-link-button"
                      type="button"
                      onClick={() => {
                        setMessageTarget(customer);
                        setMessageOpen(true);
                        setMessageStatus(null);
                        setMessageSubject("");
                        setMessageBody("");
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

      {activeCustomer && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <h3 style={{ marginBottom: "4px" }}>{activeCustomer.name}</h3>
                <div style={{ color: "#5b647a", fontSize: "0.9rem" }}>
                  {activeCustomer.email}
                </div>
                {activeCustomer.phone && (
                  <div style={{ color: "#5b647a", fontSize: "0.85rem" }}>
                    {activeCustomer.phone}
                  </div>
                )}
              </div>
              <button
                className="admin-button"
                type="button"
                onClick={() => setActiveCustomer(null)}
              >
                Close
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {(["cars", "addresses", "bookings"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`admin-button ${activeTab === tab ? "primary" : ""}`}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "cars" && (
              <div
                style={{
                  maxHeight: "280px",
                  overflowY: "auto",
                  display: "grid",
                  gap: "10px",
                }}
              >
                {activeCustomer.vehicles?.length ? (
                  activeCustomer.vehicles.map((car: any, idx: number) => (
                    <div
                      key={`${car.raw || car.make}-${idx}`}
                      style={{
                        border: "1px solid #e5e9f2",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        background: "#f9fafc",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {[car.year, car.make, car.model].filter(Boolean).join(" ") ||
                          car.raw ||
                          "Vehicle"}
                      </div>
                      <div style={{ color: "#5b647a", fontSize: "0.85rem" }}>
                        {[car.color, car.type].filter(Boolean).join(" • ") ||
                          "No extra details"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#5b647a" }}>No vehicles on record.</div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div
                style={{
                  maxHeight: "280px",
                  overflowY: "auto",
                  display: "grid",
                  gap: "10px",
                }}
              >
                {activeCustomer.addresses?.length ? (
                  activeCustomer.addresses.map((address: string) => (
                    <div
                      key={address}
                      style={{
                        border: "1px solid #e5e9f2",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        background: "#f9fafc",
                      }}
                    >
                      {address}
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#5b647a" }}>No addresses on record.</div>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div
                style={{
                  maxHeight: "280px",
                  overflowY: "auto",
                  display: "grid",
                  gap: "10px",
                }}
              >
                {activeCustomer.bookings?.length ? (
                  activeCustomer.bookings.map((booking: any, idx: number) => (
                    <div
                      key={`${booking.reference}-${idx}`}
                      style={{
                        border: "1px solid #e5e9f2",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        background: "#f9fafc",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {booking.packageName || "Detail"}{" "}
                        {booking.reference ? `• ${booking.reference}` : ""}
                      </div>
                      <div style={{ color: "#5b647a", fontSize: "0.85rem" }}>
                        {booking.dateTimeText || "Date not listed"}
                      </div>
                      <div style={{ color: "#5b647a", fontSize: "0.85rem" }}>
                        {booking.addons?.length
                          ? `Add-ons: ${booking.addons.join(", ")}`
                          : "No add-ons"}
                      </div>
                      <div style={{ marginTop: "6px", fontWeight: 600 }}>
                        {formatMoney(booking.totalPaid || 0)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#5b647a" }}>No bookings yet.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {messageOpen && messageTarget && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal" style={{ maxWidth: "560px" }}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ marginBottom: "4px" }}>Message Customer</h3>
                <div style={{ color: "#5b647a", fontSize: "0.9rem" }}>
                  {messageTarget.name} · {messageTarget.email}
                </div>
              </div>
              <button
                className="admin-button"
                type="button"
                onClick={() => {
                  setMessageOpen(false);
                  setMessageStatus(null);
                  setMessageSubject("");
                  setMessageBody("");
                }}
              >
                Close
              </button>
            </div>

            <div className="admin-form" style={{ marginTop: "8px" }}>
              <div>
                <label>Subject</label>
                <input
                  value={messageSubject}
                  onChange={(event) => setMessageSubject(event.target.value)}
                  placeholder="Subject line"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label>Message</label>
                <textarea
                  rows={6}
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  placeholder="Write your message..."
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {messageStatus && (
              <div style={{ color: "#5b647a", marginTop: "8px" }}>
                {messageStatus}
              </div>
            )}

            <button
              className="admin-button primary"
              style={{ marginTop: "14px", width: "100%" }}
              disabled={messageSending}
              onClick={async () => {
                if (!messageSubject.trim() || !messageBody.trim()) {
                  setMessageStatus("Subject and message are required.");
                  return;
                }
                setMessageSending(true);
                setMessageStatus(null);
                try {
                  const res = await fetch("/api/admin/customers/message", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: messageTarget.email,
                      name: messageTarget.name,
                      subject: messageSubject,
                      message: messageBody,
                    }),
                  });
                  const payload = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setMessageStatus(payload?.error || "Unable to send message.");
                    setMessageSending(false);
                    return;
                  }
                  setMessageStatus("Message sent.");
                  setMessageSending(false);
                } catch {
                  setMessageStatus("Unable to send message.");
                  setMessageSending(false);
                }
              }}
            >
              {messageSending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
