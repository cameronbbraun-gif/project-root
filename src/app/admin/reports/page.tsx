"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(value || 0)
  );

export default function ReportsPage() {
  const [stats, setStats] = useState({
    monthRevenue: 0,
    revenueDelta: 0,
    avgTicket: 0,
    topService: "—",
    repeatRate: 0,
    repeatDelta: 0,
    performance: { exterior: 0, interior: 0, packages: 0, addons: 0 },
    range: {
      labels: [] as string[],
      revenueSeries: [] as number[],
      bookingSeries: [] as number[],
      avgTicketSeries: [] as number[],
      addonRevenueSeries: [] as number[],
      totalRevenue: 0,
      totalBookings: 0,
      avgTicket: 0,
      serviceMix: { exterior: 0, interior: 0, packages: 0, addons: 0 },
      revenueByService: [] as Array<{ name: string; count: number }>,
      peakBookingTimes: [] as Array<{ hour: number; count: number; percent: number }>,
    },
  });
  const [range, setRange] = useState("30d");
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/stats?range=${encodeURIComponent(range)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setStats({
          monthRevenue: Number(data.monthRevenue || 0),
          revenueDelta: Number(data.revenueDelta || 0),
          avgTicket: Number(data.avgTicket || 0),
          topService: data.topService || "—",
          repeatRate: Number(data.repeatRate || 0),
          repeatDelta: Number(data.repeatDelta || 0),
          performance: data.performance || {
            exterior: 0,
            interior: 0,
            packages: 0,
            addons: 0,
          },
          range: data.range || {
            labels: [],
            revenueSeries: [],
            bookingSeries: [],
            avgTicketSeries: [],
            addonRevenueSeries: [],
            totalRevenue: 0,
            totalBookings: 0,
            avgTicket: 0,
            serviceMix: { exterior: 0, interior: 0, packages: 0, addons: 0 },
            revenueByService: [],
            peakBookingTimes: [],
          },
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [range]);

  const rangeOptions = [
    { label: "Past day", value: "1d" },
    { label: "7 days", value: "7d" },
    { label: "30 days", value: "30d" },
    { label: "90 days", value: "90d" },
    { label: "Year", value: "year" },
    { label: "Lifetime", value: "lifetime" },
  ];

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          ticks: { color: "#64748b", maxRotation: 0, autoSkip: true },
          title: { display: true, text: "Time", color: "#64748b", font: { size: 12 } },
        },
        y: {
          grid: { color: "rgba(148, 163, 184, 0.2)" },
          ticks: { color: "#64748b" },
          title: { display: true, text: "", color: "#64748b", font: { size: 12 } },
        },
      },
    }),
    []
  );

  const buildLineData = (labels: string[], values: number[], label: string) => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        borderColor: "#1d3753",
        backgroundColor: "rgba(29, 55, 83, 0.15)",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: "#1d3753",
      },
    ],
  });

  const buildBarData = (labels: string[], values: number[], label: string) => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: "rgba(29, 55, 83, 0.75)",
        borderRadius: 8,
      },
    ],
  });

  const chartOptionsWithLabel = (label: string) => ({
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: { ...chartOptions.scales.y.title, text: label },
      },
    },
  });

  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Reports
          <span>Revenue, service performance, and customer insights.</span>
        </div>
        <div className="admin-actions">
          <button
            className="admin-button"
            disabled={monthlyLoading}
            onClick={async () => {
              setMonthlyLoading(true);
              try {
                const res = await fetch("/api/admin/stats/monthly-report");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "monthly-report.pdf";
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
              } finally {
                setMonthlyLoading(false);
              }
            }}
          >
            {monthlyLoading ? "Generating..." : "Monthly PDF"}
          </button>
          <button
            className="admin-button primary"
            disabled={reportLoading}
            onClick={async () => {
              setReportLoading(true);
              try {
                const res = await fetch("/api/admin/stats/generate-report");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "generated-report.pdf";
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
              } finally {
                setReportLoading(false);
              }
            }}
          >
            {reportLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </section>

      <section className="admin-grid cols-3">
        <div className="admin-card">
          <h3>Monthly Revenue</h3>
          <div className="admin-stat-value">{formatMoney(stats.monthRevenue)}</div>
          <div className="admin-stat-note">
            {stats.revenueDelta === 0
              ? "No change vs last month"
              : `${stats.revenueDelta > 0 ? "+" : ""}${stats.revenueDelta}% vs last month`}
          </div>
        </div>
        <div className="admin-card">
          <h3>Average Ticket</h3>
          <div className="admin-stat-value">{formatMoney(stats.avgTicket)}</div>
          <div className="admin-stat-note">
            Top service: {stats.topService || "—"}
          </div>
        </div>
        <div className="admin-card">
          <h3>Repeat Customers</h3>
          <div className="admin-stat-value">{stats.repeatRate}%</div>
          <div className="admin-stat-note">
            {stats.repeatDelta === 0
              ? "No change vs Jan–Apr"
              : `${stats.repeatDelta > 0 ? "+" : ""}${stats.repeatDelta}% vs Jan–Apr`}
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h3>Service Performance</h3>
        <div className="admin-grid cols-2" style={{ marginTop: "16px" }}>
          <div>
            <div style={{ fontWeight: 600 }}>Exterior Details</div>
            <div className="admin-metric-bar" style={{ marginTop: "8px" }}>
              <span style={{ width: `${stats.performance.exterior}%` }} />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Interior Details</div>
            <div className="admin-metric-bar" style={{ marginTop: "8px" }}>
              <span style={{ width: `${stats.performance.interior}%` }} />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Add-Ons</div>
            <div className="admin-metric-bar" style={{ marginTop: "8px" }}>
              <span style={{ width: `${stats.performance.addons}%` }} />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Packages</div>
            <div className="admin-metric-bar" style={{ marginTop: "8px" }}>
              <span style={{ width: `${stats.performance.packages}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="admin-grid cols-2" style={{ marginTop: "18px" }}>
        <div className="admin-card">
          <div className="admin-chart-header">
            <div>
              <h3>Total Revenue</h3>
              <div className="admin-stat-value">
                {formatMoney(stats.range.totalRevenue)}
              </div>
            </div>
            <select
              className="admin-select"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-chart-canvas">
            <Line
              data={buildLineData(stats.range.labels, stats.range.revenueSeries, "Revenue")}
              options={chartOptionsWithLabel("Revenue")}
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-chart-header">
            <div>
              <h3>Bookings Count</h3>
              <div className="admin-stat-value">{stats.range.totalBookings}</div>
            </div>
            <select
              className="admin-select"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-chart-canvas">
            <Line
              data={buildLineData(stats.range.labels, stats.range.bookingSeries, "Bookings")}
              options={chartOptionsWithLabel("Bookings")}
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-chart-header">
            <div>
              <h3>Average Ticket</h3>
              <div className="admin-stat-value">
                {formatMoney(stats.range.avgTicket)}
              </div>
            </div>
            <select
              className="admin-select"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-chart-canvas">
            <Line
              data={buildLineData(stats.range.labels, stats.range.avgTicketSeries, "Avg Ticket")}
              options={chartOptionsWithLabel("Avg Ticket")}
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-chart-header">
            <div>
              <h3>Add-on Revenue</h3>
              <div className="admin-stat-value">
                {formatMoney(
                  stats.range.addonRevenueSeries.reduce(
                    (sum, val) => sum + Number(val || 0),
                    0
                  )
                )}
              </div>
            </div>
            <select
              className="admin-select"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-chart-canvas">
            <Line
              data={buildLineData(stats.range.labels, stats.range.addonRevenueSeries, "Add-ons")}
              options={chartOptionsWithLabel("Add-on Revenue")}
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-chart-header">
            <div>
              <h3>Peak Booking Time</h3>
              <div className="admin-stat-value">
                {stats.range.peakBookingTimes.length
                  ? `${stats.range.peakBookingTimes.reduce((best, cur) =>
                      cur.count > best.count ? cur : best
                    ).hour}:00`
                  : "—"}
              </div>
            </div>
            <select
              className="admin-select"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-chart-canvas">
            <Bar
              data={buildBarData(
                stats.range.peakBookingTimes.map((bucket) => `${bucket.hour}:00`),
                stats.range.peakBookingTimes.map((bucket) => bucket.count),
                "Bookings"
              )}
              options={chartOptionsWithLabel("Bookings")}
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-chart-header">
            <div>
              <h3>Revenue by Service</h3>
              <div className="admin-stat-value">
                {formatMoney(
                  stats.range.revenueSeries.reduce(
                    (sum, item) => sum + Number(item || 0),
                    0
                  )
                )}
              </div>
            </div>
            <select
              className="admin-select"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-chart-canvas">
            <Bar
              data={buildBarData(
                stats.range.revenueByService.map((item) => item.name),
                stats.range.revenueByService.map((item) => item.count),
                "Bookings"
              )}
              options={chartOptionsWithLabel("Bookings")}
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-chart-header">
            <div>
              <h3>Service Mix</h3>
              <div className="admin-stat-value">
                {stats.range.totalBookings} bookings
              </div>
            </div>
            <select
              className="admin-select"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-chart-canvas">
            <Bar
              data={buildBarData(
                Object.keys(stats.range.serviceMix),
                Object.values(stats.range.serviceMix),
                "% Share"
              )}
              options={chartOptionsWithLabel("% Share")}
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-chart-header">
            <div>
              <h3>Repeat Rate</h3>
              <div className="admin-stat-value">{stats.repeatRate}%</div>
            </div>
            <select
              className="admin-select"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-chart-canvas">
            <Line
              data={buildLineData(
                stats.range.labels,
                stats.range.labels.map(() => stats.repeatRate),
                "Repeat Rate"
              )}
              options={chartOptionsWithLabel("% Repeat")}
            />
          </div>
        </div>
      </section>
    </>
  );
}
