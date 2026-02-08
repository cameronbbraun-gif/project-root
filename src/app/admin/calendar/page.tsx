"use client";

import { useEffect, useState } from "react";

type WeekDay = {
  dateKey: string;
  dayLabel: string;
  details: Array<{
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    service: string;
    time: string;
    address: string;
  }>;
};

export default function CalendarPage() {
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [activeDay, setActiveDay] = useState<WeekDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
      today.getDate()
    )}`;
  });
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [monthCounts, setMonthCounts] = useState<Record<string, number>>({});
  const [monthLoading, setMonthLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockDates, setBlockDates] = useState<string[]>([]);
  const [blockDateInput, setBlockDateInput] = useState("");
  const [blockAllDay, setBlockAllDay] = useState(false);
  const [blockTimes, setBlockTimes] = useState<string[]>([]);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [blockSaving, setBlockSaving] = useState(false);
  const [existingBlocks, setExistingBlocks] = useState<
    Array<{ id: string; date: string; start: number; end: number }>
  >([]);
  const [googleSyncing, setGoogleSyncing] = useState(false);
  const [googleMessage, setGoogleMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const url = new URL("/api/admin/calendar/week", window.location.origin);
    if (startDate) {
      url.searchParams.set("start", startDate);
    }
    fetch(url.toString())
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        const days = Array.isArray(data?.days) ? data.days : [];
        if (days.length > 0) {
          setWeekDays(days);
          return;
        }
        const today = new Date();
        const day = today.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const start = new Date(today);
        start.setDate(today.getDate() + diff);
        start.setHours(0, 0, 0, 0);
        const fallback = Array.from({ length: 7 }).map((_, index) => {
          const date = new Date(start.getTime() + index * 86400000);
          const pad = (value: number) => String(value).padStart(2, "0");
          const dateKey = `${date.getFullYear()}-${pad(
            date.getMonth() + 1
          )}-${pad(date.getDate())}`;
          return {
            dateKey,
            dayLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
            details: [],
          };
        });
        setWeekDays(fallback);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [startDate, refreshKey]);

  useEffect(() => {
    let active = true;
    const pad = (value: number) => String(value).padStart(2, "0");
    const monthParam = `${monthDate.getFullYear()}-${pad(
      monthDate.getMonth() + 1
    )}`;
    setMonthLoading(true);
    fetch(`/api/admin/calendar/month?month=${monthParam}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setMonthCounts(data?.counts || {});
      })
      .catch(() => {})
      .finally(() => {
        if (active) setMonthLoading(false);
      });
    return () => {
      active = false;
    };
  }, [monthDate, refreshKey]);

  useEffect(() => {
    if (!blockOpen) return;
    let active = true;
    fetch("/api/admin/calendar/block")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setExistingBlocks(Array.isArray(data?.blocks) ? data.blocks : []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [blockOpen, refreshKey]);

  const monthLabel = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const monthValue = `${monthDate.getFullYear()}-${String(
    monthDate.getMonth() + 1
  ).padStart(2, "0")}`;
  const firstOfMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    1
  );
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  ).getDate();
  const startWeekday = firstOfMonth.getDay();
  const calendarCells = Array.from({
    length: Math.ceil((startWeekday + daysInMonth) / 7) * 7,
  }).map((_, index) => {
    const dayNum = index - startWeekday + 1;
    if (dayNum <= 0 || dayNum > daysInMonth) {
      return { key: `empty-${index}`, day: null };
    }
    const pad = (value: number) => String(value).padStart(2, "0");
    const dateKey = `${monthDate.getFullYear()}-${pad(
      monthDate.getMonth() + 1
    )}-${pad(dayNum)}`;
    const count = monthCounts[dateKey] || 0;
    return {
      key: dateKey,
      day: dayNum,
      count,
    };
  });
  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Calendar
          <span>Visualize bay usage, mobile routes, and blocked time.</span>
        </div>
        <div style={{ position: "relative", minHeight: "44px" }}>
          <div className="admin-actions">
            <button
              id="sync-google-button"
              className="admin-button"
              onClick={async () => {
                setGoogleSyncing(true);
                setGoogleMessage("Syncing...");
                try {
                  const res = await fetch("/api/admin/google/sync", {
                    method: "POST",
                  });
                  if (res.status === 401) {
                    window.location.href = "/api/admin/google/connect";
                    return;
                  }
                  const data = await res.json().catch(() => null);
                  if (!res.ok) {
                    setGoogleMessage(data?.error || "Google sync failed.");
                    return;
                  }
                  if (!data?.synced) {
                    setGoogleMessage("Nothing left to sync.");
                    return;
                  }
                  setGoogleMessage(`Synced ${data.synced} bookings to Google.`);
                } catch {
                  setGoogleMessage("Google sync failed.");
                } finally {
                  setGoogleSyncing(false);
                }
              }}
              disabled={googleSyncing}
            >
              {googleSyncing ? "Syncing..." : "Sync Google"}
            </button>
            <button
              className="admin-button primary"
              onClick={() => setBlockOpen(true)}
            >
              Block Time
            </button>
          </div>
          {googleMessage && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: "auto",
                left: 0,
                color: "#5b647a",
                fontSize: "0.85rem",
              }}
            >
              {googleMessage}
            </div>
          )}
        </div>
      </section>
      {googleMessage && <div style={{ height: "2px" }} />}

      <section className="admin-grid cols-2">
        <div className="admin-card">
          <div className="admin-page-header">
            <h3>Week Focus</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.8rem", color: "#5b647a" }}>
                Start week
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="admin-input"
                style={{
                  padding: "6px 10px",
                  fontSize: "0.8rem",
                  width: "150px",
                }}
              />
            </div>
          </div>
          <div className="admin-grid cols-2" style={{ marginTop: "12px" }}>
            {weekDays.map((item) => (
              <div key={item.dateKey}>
                <div style={{ fontWeight: 600 }}>{item.dayLabel}</div>
                <div style={{ fontSize: "0.85rem", color: "#5b647a" }}>
                  {loading
                    ? "Loading..."
                    : item.details.length === 0
                      ? "No bookings"
                      : `${item.details.length} booking${
                          item.details.length === 1 ? "" : "s"
                        }`}
                </div>
                <button
                  className="admin-button"
                  style={{ marginTop: "8px", padding: "6px 10px" }}
                  onClick={() => setActiveDay(item)}
                  disabled={item.details.length === 0}
                >
                  View details
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-card">
          <h3>Routes & Bays</h3>
          <div style={{ marginTop: "14px", color: "#5b647a" }}>
            Bay 1 - 6 jobs - 78% utilization
          </div>
          <div className="admin-metric-bar" style={{ margin: "8px 0 16px" }}>
            <span style={{ width: "78%" }} />
          </div>
          <div style={{ color: "#5b647a" }}>
            Mobile Crew - 4 jobs - 64% utilization
          </div>
          <div className="admin-metric-bar" style={{ marginTop: "8px" }}>
            <span style={{ width: "64%" }} />
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-page-header">
          <h3>Monthly Calendar</h3>
          <div className="admin-actions">
            <button
              className="admin-button"
              onClick={() =>
                setMonthDate(
                  new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1)
                )
              }
            >
              Prev
            </button>
            <input
              type="month"
              className="admin-input"
              value={monthValue}
              onChange={(event) => {
                const value = event.target.value;
                if (!value) return;
                const [year, month] = value.split("-").map(Number);
                if (!Number.isFinite(year) || !Number.isFinite(month)) return;
                setMonthDate(new Date(year, month - 1, 1));
              }}
              style={{
                padding: "6px 10px",
                fontSize: "0.85rem",
                minWidth: "150px",
              }}
              aria-label="Select month"
            />
            <button
              className="admin-button"
              onClick={() =>
                setMonthDate(
                  new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)
                )
              }
            >
              Next
            </button>
          </div>
        </div>
        <div style={{ margin: "12px 0", color: "#5b647a" }}>
          {monthLabel} - Tampa Bay operations
        </div>
        <div className="admin-calendar">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
            <div className="admin-calendar-day" key={`head-${label}`}>
              <header>
                <span>{label}</span>
              </header>
            </div>
          ))}
          {calendarCells.map((cell) => (
            <div className="admin-calendar-day" key={cell.key}>
              <header>
                <span />
                <span>{cell.day ?? ""}</span>
              </header>
              {cell.day && cell.count > 0 && (
                <div className="admin-calendar-event">
                  {monthLoading ? "Loading..." : `${cell.count} booking${
                      cell.count === 1 ? "" : "s"
                    }`}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      {activeDay && (
        <div
          className="admin-backdrop"
          style={{ opacity: 1, pointerEvents: "auto" }}
          onClick={() => setActiveDay(null)}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: "520px",
              width: "90%",
              margin: "8vh auto",
              position: "relative",
              cursor: "auto",
              maxHeight: "70vh",
              overflow: "auto",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3>{activeDay.dayLabel} Details</h3>
            <div style={{ color: "#5b647a", marginBottom: "12px" }}>
              {activeDay.details.length === 0
                ? "No bookings"
                : `${activeDay.details.length} booking${
                    activeDay.details.length === 1 ? "" : "s"
                  }`}
            </div>
            <div className="admin-grid">
              {activeDay.details.map((detail, index) => (
                <div
                  key={`${detail.customerEmail}-${index}`}
                  style={{
                    padding: "12px",
                    border: "1px solid #e5e9f2",
                    borderRadius: "12px",
                    background: "#f9fafc",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{detail.customerName}</div>
                  <div style={{ fontSize: "0.85rem", color: "#5b647a" }}>
                    {detail.customerEmail}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#5b647a" }}>
                    {detail.customerPhone}
                  </div>
                  <div style={{ marginTop: "8px", fontWeight: 600 }}>
                    {detail.service}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#5b647a" }}>
                    {detail.time}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#5b647a" }}>
                    {detail.address}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="admin-button primary"
              style={{ marginTop: "16px", width: "100%" }}
              onClick={() => setActiveDay(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {blockOpen && (
        <div
          className="admin-backdrop"
          style={{ opacity: 1, pointerEvents: "auto" }}
          onClick={() => {
            setBlockOpen(false);
            setBlockMessage(null);
          }}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: "520px",
              width: "92%",
              margin: "10vh auto",
              position: "relative",
              cursor: "auto",
              maxHeight: "75vh",
              overflow: "auto",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Block Time</h3>
            <div style={{ color: "#5b647a", marginBottom: "12px" }}>
              Select dates and times to block from booking.
            </div>
            <div className="admin-form">
              <div>
                <label>Add date</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="date"
                    value={blockDateInput}
                    onChange={(event) => setBlockDateInput(event.target.value)}
                  />
                  <button
                    className="admin-button"
                    type="button"
                    onClick={() => {
                      if (!blockDateInput) return;
                      if (!blockDates.includes(blockDateInput)) {
                        setBlockDates((prev) => [...prev, blockDateInput]);
                      }
                      setBlockDateInput("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
              {blockDates.length > 0 && (
                <div>
                  <label>Selected days</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {blockDates.map((date) => (
                      <button
                        type="button"
                        key={date}
                        className="admin-pill"
                        onClick={() =>
                          setBlockDates((prev) =>
                            prev.filter((item) => item !== date)
                          )
                        }
                      >
                        {date} ×
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label>All day</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={blockAllDay}
                    onChange={(event) => {
                      setBlockAllDay(event.target.checked);
                      if (event.target.checked) setBlockTimes([]);
                    }}
                  />
                  <span style={{ fontSize: "0.85rem", color: "#5b647a" }}>
                    Block the entire day
                  </span>
                </div>
              </div>
              {!blockAllDay && (
                <div>
                  <label>Select times</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {(() => {
                      const datesToCheck = blockDateInput
                        ? Array.from(new Set([...blockDates, blockDateInput]))
                        : blockDates;
                      const restricted =
                        datesToCheck.length > 0 &&
                        datesToCheck.some((date) => isWeekdayRestricted(date));
                      const slots = Array.from({ length: 19 }).map((_, index) => {
                        const hour = 8 + Math.floor(index / 2);
                        const minutes = index % 2 === 0 ? "00" : "30";
                        const h12 =
                          hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        const period = hour >= 12 ? "PM" : "AM";
                        return {
                          label: `${h12}:${minutes} ${period}`,
                          startMinutes: hour * 60 + (minutes === "30" ? 30 : 0),
                        };
                      });
                      const filtered = restricted
                        ? slots.filter((slot) => slot.startMinutes > 14 * 60)
                        : slots;
                      return filtered.map((slot) => {
                        const active = blockTimes.includes(slot.label);
                        return (
                          <button
                            type="button"
                            key={slot.label}
                            className="admin-button"
                            style={{
                              padding: "6px 8px",
                              borderColor: active ? "#1d3753" : "#e5e9f2",
                              background: active ? "#1d3753" : "#fff",
                              color: active ? "#fff" : "#0f172a",
                            }}
                            onClick={() =>
                              setBlockTimes((prev) =>
                                prev.includes(slot.label)
                                  ? prev.filter((item) => item !== slot.label)
                                  : [...prev, slot.label]
                              )
                            }
                          >
                            {slot.label}
                          </button>
                        );
                      });
                    })()}
                  </div>
                  {(blockDates.length > 0 || blockDateInput) &&
                    (blockDateInput
                      ? Array.from(new Set([...blockDates, blockDateInput]))
                      : blockDates
                    ).some((date) => isWeekdayRestricted(date)) && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#5b647a",
                          marginTop: "8px",
                        }}
                      >
                        Weekdays outside June/July only allow times after 2:00 PM.
                      </div>
                    )}
                </div>
              )}
              {existingBlocks.length > 0 && (
                <div>
                  <label>Existing blocks</label>
                  <div
                    style={{
                      display: "grid",
                      gap: "8px",
                    }}
                  >
                    {existingBlocks.map((block) => (
                      <div
                        key={block.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 12px",
                          border: "1px solid #e5e9f2",
                          borderRadius: "10px",
                          background: "#f9fafc",
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", color: "#0f172a" }}>
                          {block.date} · {minutesToLabel(block.start)} -{" "}
                          {minutesToLabel(block.end)}
                        </div>
                        <button
                          className="admin-button"
                          type="button"
                          onClick={async () => {
                            await fetch(
                              `/api/admin/calendar/block?id=${block.id}`,
                              { method: "DELETE" }
                            );
                            setRefreshKey((prev) => prev + 1);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {blockMessage && (
                <div style={{ fontSize: "0.85rem", color: "#b91c1c" }}>
                  {blockMessage}
                </div>
              )}
              <button
                className="admin-button primary"
                style={{ width: "100%" }}
                onClick={async () => {
                  if (blockDates.length === 0) {
                    setBlockMessage("Select at least one date.");
                    return;
                  }
                  if (!blockAllDay && blockTimes.length === 0) {
                    setBlockMessage("Select at least one time.");
                    return;
                  }
                  setBlockSaving(true);
                  setBlockMessage(null);
                  try {
                    const res = await fetch("/api/admin/calendar/block", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        dates: blockDates,
                        allDay: blockAllDay,
                        times: blockTimes,
                      }),
                    });
                    const payload = await res.json().catch(() => null);
                    if (!res.ok) {
                      setBlockMessage(payload?.error || "Unable to block time.");
                      setBlockSaving(false);
                      return;
                    }
                    setBlockDates([]);
                    setBlockTimes([]);
                    setBlockAllDay(false);
                    setBlockOpen(false);
                    setBlockMessage(null);
                    // Refresh month + week data
                    setRefreshKey((prev) => prev + 1);
                  } catch {
                    setBlockMessage("Unable to block time.");
                  } finally {
                    setBlockSaving(false);
                  }
                }}
                disabled={blockSaving}
              >
                {blockSaving ? "Saving..." : "Save blocks"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function minutesToLabel(minutes: number) {
  const hrs24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hrs24 >= 12 ? "PM" : "AM";
  let hrs12 = hrs24 % 12;
  if (hrs12 === 0) hrs12 = 12;
  return `${hrs12}:${String(mins).padStart(2, "0")} ${period}`;
}

function isWeekdayRestricted(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const month = date.getMonth();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const isJuneJuly = month === 5 || month === 6;
  return !isWeekend && !isJuneJuly;
}
