"use client";

import { useEffect, useState } from "react";

type BookingRow = {
  id: string;
  customerName: string;
  serviceName: string;
  dateLabel: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  totalPaid: number;
};

type BookingDetails = BookingRow & {
  reference?: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  addons: Array<{ name: string; price: number }>;
  vehicle: string;
  notes?: string;
  editing?: boolean;
};

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function BookingsPage() {
  const [stats, setStats] = useState({
    todayCount: 0,
    monthCount: 0,
    capacityPercent: 0,
  });
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<BookingDetails | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsDebug, setDetailsDebug] = useState(false);
  const [detailsPayload, setDetailsPayload] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createReference, setCreateReference] = useState("");
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    packageName: "Show Room Detail",
    addons: [] as string[],
    vehicleType: "sedan",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleColor: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressZip: "",
    notes: "",
    date: "",
    time: "",
  });

  const addonCatalog = [
    { name: "Pet Hair Removal", key: "addonPetHair" },
    { name: "Fabric Protection Coating", key: "addonFabricProtect" },
    { name: "Iron Decontamination", key: "addonIronDecon" },
  ];

  const packageKeyMap: Record<string, string> = {
    "Show Room Detail": "showroom",
    "Full Exterior Detail": "fullExterior",
    "Quick Exterior Detail": "quickExterior",
    "Full Interior Detail": "fullInterior",
    "Quick Interior Detail": "quickInterior",
    "Maintenance Detail": "maintenance",
  };

  const pricesByVehicle: Record<string, Record<string, number>> = {
    sedan: {
      quickExterior: 49,
      fullExterior: 99,
      quickInterior: 59,
      fullInterior: 109,
      maintenance: 99,
      showroom: 179,
      addonPetHair: 29,
      addonFabricProtect: 29,
      addonIronDecon: 39,
    },
    suv: {
      quickExterior: 59,
      fullExterior: 109,
      quickInterior: 69,
      fullInterior: 119,
      maintenance: 109,
      showroom: 189,
      addonPetHair: 29,
      addonFabricProtect: 29,
      addonIronDecon: 39,
    },
    truck: {
      quickExterior: 69,
      fullExterior: 119,
      quickInterior: 79,
      fullInterior: 139,
      maintenance: 119,
      showroom: 199,
      addonPetHair: 29,
      addonFabricProtect: 29,
      addonIronDecon: 39,
    },
  };

  const vehicleLabelMap: Record<string, string> = {
    sedan: "Sedan",
    suv: "SUV",
    truck: "Large SUV/Truck",
  };

  const getPackagePrice = (vehicleType: string, packageName: string) => {
    const key = packageKeyMap[packageName];
    if (!key) return 0;
    return pricesByVehicle[vehicleType]?.[key] ?? pricesByVehicle.sedan[key] ?? 0;
  };

  const getAddonPrice = (vehicleType: string, addonName: string) => {
    const key = addonCatalog.find((addon) => addon.name === addonName)?.key;
    if (!key) return 0;
    return pricesByVehicle[vehicleType]?.[key] ?? pricesByVehicle.sedan[key] ?? 0;
  };
  const pageSize = 10;

  useEffect(() => {
    let active = true;
    fetch("/api/admin/bookings?stats=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setStats({
          todayCount: Number(data.todayCount || 0),
          monthCount: Number(data.monthCount || 0),
          capacityPercent: Number(data.capacityPercent || 0),
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setListLoading(true);
    const params = new URLSearchParams({
      list: "1",
      page: String(page),
      limit: String(pageSize),
    });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (packageFilter !== "all") params.set("package", packageFilter);
    if (dateFilter) params.set("date", dateFilter);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    fetch(`/api/admin/bookings?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        setTotalPages(Number(data.totalPages || 1));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setListLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, statusFilter, packageFilter, dateFilter, searchQuery, refreshKey]);

  useEffect(() => {
    if (!createOpen) return;
    let active = true;
    fetch("/api/admin/bookings?reference=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.reference) return;
        setCreateReference(data.reference);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [createOpen]);
  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Bookings
          <span>Manage incoming requests and confirm upcoming jobs.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">Bulk Actions</button>
          <button
            className="admin-button primary"
            onClick={() => {
              setCreateOpen(true);
              setCreateMessage(null);
            }}
          >
            Create Booking
          </button>
        </div>
      </section>

      <section className="admin-grid cols-3">
        <div className="admin-card">
          <h3>Today</h3>
          <div className="admin-stat-value">{stats.todayCount} bookings</div>
        </div>
        <div className="admin-card">
          <h3>This Month</h3>
          <div className="admin-stat-value">{stats.monthCount} bookings</div>
        </div>
        <div className="admin-card">
          <h3>Capacity</h3>
          <div className="admin-metric-bar">
            <span style={{ width: `${stats.capacityPercent}%` }} />
          </div>
          <div className="admin-stat-note">
            {stats.capacityPercent}% filled for this week
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-filters" style={{ marginBottom: "12px" }}>
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value);
            }}
          >
            <option value="all">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="admin-select"
            value={packageFilter}
            onChange={(event) => {
              setPage(1);
              setPackageFilter(event.target.value);
            }}
          >
            <option value="all">Detail packages</option>
            <option value="Show Room Detail">Show Room Detail</option>
            <option value="Full Exterior Detail">Full Exterior Detail</option>
            <option value="Quick Exterior Detail">Quick Exterior Detail</option>
            <option value="Full Interior Detail">Full Interior Detail</option>
            <option value="Quick Interior Detail">Quick Interior Detail</option>
            <option value="Maintenance Detail">Maintenance Detail</option>
          </select>
          <input
            className="admin-input"
            type="date"
            value={dateFilter}
            onChange={(event) => {
              setPage(1);
              setDateFilter(event.target.value);
            }}
          />
          <input
            className="admin-input"
            placeholder="Search name, email, phone, address, vehicle"
            value={searchQuery}
            onChange={(event) => {
              setPage(1);
              setSearchQuery(event.target.value);
            }}
          />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <tr>
                <td colSpan={6}>Loading bookings...</td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={6}>No bookings found.</td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const statusClass =
                  booking.status === "Completed"
                    ? "confirmed"
                    : booking.status === "Scheduled"
                      ? "pending"
                      : "cancelled";
                return (
                  <tr key={booking.id}>
                    <td>{booking.customerName}</td>
                    <td>{booking.serviceName}</td>
                    <td>{booking.dateLabel}</td>
                    <td>
                      <span className={`admin-status ${statusClass}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{formatMoney(booking.totalPaid)}</td>
                    <td>
                      <button
                        className="admin-button"
                        style={{ padding: "6px 10px" }}
                        type="button"
                        onClick={async () => {
                          setDetailsError(null);
                          setDetailsPayload(null);
                          setDetailsLoading(true);
                          setActiveBooking({
                            ...booking,
                            customerEmail: "",
                            customerPhone: "",
                            address: "",
                            addons: [],
                            vehicle: "",
                          });
                          const res = await fetch(
                            `/api/admin/bookings/${booking.id}`
                          );
                          const rawText = await res.text().catch(() => "");
                          let data = null;
                          try {
                            data = rawText ? JSON.parse(rawText) : null;
                          } catch {
                            data = null;
                          }
                          setDetailsPayload(rawText || null);
                          if (res.ok && data) {
                            setActiveBooking(data);
                          } else {
                            setDetailsError(
                              data?.error || "Unable to load booking details."
                            );
                          }
                          setDetailsLoading(false);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "12px",
          }}
        >
          <button
            className="admin-button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <div style={{ color: "#5b647a", fontSize: "0.85rem" }}>
            Page {page} of {totalPages}
          </div>
          <button
            className="admin-button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </section>
      {activeBooking && (
        <div
          className="admin-backdrop"
          style={{ opacity: 1, pointerEvents: "auto" }}
          onClick={() => setActiveBooking(null)}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: "560px",
              width: "92%",
              margin: "10vh auto",
              position: "relative",
              cursor: "auto",
              maxHeight: "75vh",
              overflow: "auto",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3>Booking Details</h3>
                {activeBooking.reference && (
                  <div style={{ color: "#5b647a", fontSize: "0.85rem" }}>
                    {activeBooking.reference}
                  </div>
                )}
              </div>
              <button
                className="admin-button"
                type="button"
                onClick={() =>
                  setActiveBooking((prev) =>
                    prev ? { ...prev, editing: !prev.editing } : prev
                  )
                }
              >
                {activeBooking.editing ? "Cancel Edit" : "Edit"}
              </button>
            </div>
            <div style={{ marginTop: "8px", color: "#5b647a" }}>
              {activeBooking.dateLabel || "Schedule pending"}
            </div>
            {detailsError && (
              <div style={{ marginTop: "8px", color: "#b91c1c" }}>
                {detailsError}
              </div>
            )}
            <div style={{ marginTop: "8px" }}>
              <button
                className="admin-button"
                type="button"
                onClick={() => setDetailsDebug((prev) => !prev)}
              >
                {detailsDebug ? "Hide debug" : "Show debug"}
              </button>
            </div>
            {detailsDebug && (
              <pre
                style={{
                  marginTop: "8px",
                  padding: "10px",
                  background: "#f9fafc",
                  border: "1px solid #e5e9f2",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {detailsPayload || "No response"}
              </pre>
            )}
            {detailsLoading ? (
              <div style={{ marginTop: "16px", color: "#5b647a" }}>
                Loading booking details...
              </div>
            ) : (
              <>
                <div className="admin-grid cols-2" style={{ marginTop: "16px" }}>
                  <div className="admin-card" style={{ boxShadow: "none" }}>
                    <h3>Customer</h3>
                    <div className="admin-form">
                      <div>
                        <label>Name</label>
                        {activeBooking.editing ? (
                          <input
                            value={activeBooking.customerName}
                            onChange={(event) =>
                              setActiveBooking((prev) =>
                                prev
                                  ? { ...prev, customerName: event.target.value }
                                  : prev
                              )
                            }
                          />
                        ) : (
                          <div>{activeBooking.customerName || "Not provided"}</div>
                        )}
                      </div>
                      <div>
                        <label>Email</label>
                        {activeBooking.editing ? (
                          <input
                            value={activeBooking.customerEmail}
                            onChange={(event) =>
                              setActiveBooking((prev) =>
                                prev
                                  ? { ...prev, customerEmail: event.target.value }
                                  : prev
                              )
                            }
                          />
                        ) : (
                          <div>{activeBooking.customerEmail || "Not provided"}</div>
                        )}
                      </div>
                      <div>
                        <label>Phone</label>
                        {activeBooking.editing ? (
                          <input
                            value={activeBooking.customerPhone}
                            onChange={(event) =>
                              setActiveBooking((prev) =>
                                prev
                                  ? { ...prev, customerPhone: event.target.value }
                                  : prev
                              )
                            }
                          />
                        ) : (
                          <div>{activeBooking.customerPhone || "Not provided"}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="admin-card" style={{ boxShadow: "none" }}>
                    <h3>Service</h3>
                    <div className="admin-form">
                      <div>
                        <label>Package</label>
                        {activeBooking.editing ? (
                          <input
                            value={activeBooking.serviceName}
                            onChange={(event) =>
                              setActiveBooking((prev) =>
                                prev
                                  ? { ...prev, serviceName: event.target.value }
                                  : prev
                              )
                            }
                          />
                        ) : (
                          <div>{activeBooking.serviceName || "Not provided"}</div>
                        )}
                      </div>
                      <div>
                        <label>Address</label>
                        {activeBooking.editing ? (
                          <input
                            value={activeBooking.address}
                            onChange={(event) =>
                              setActiveBooking((prev) =>
                                prev ? { ...prev, address: event.target.value } : prev
                              )
                            }
                          />
                        ) : (
                          <div>{activeBooking.address || "Not provided"}</div>
                        )}
                      </div>
                      <div>
                        <label>Vehicle</label>
                        {activeBooking.editing ? (
                          <input
                            value={activeBooking.vehicle}
                            onChange={(event) =>
                              setActiveBooking((prev) =>
                                prev ? { ...prev, vehicle: event.target.value } : prev
                              )
                            }
                          />
                        ) : (
                          <div>{activeBooking.vehicle || "Not provided"}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="admin-card"
                  style={{ marginTop: "12px", boxShadow: "none" }}
                >
                  <h3>Payment & Add-ons</h3>
                  <div style={{ fontWeight: 600 }}>
                    Total Paid: {formatMoney(activeBooking.totalPaid)}
                  </div>
                  {activeBooking.addons.length === 0 ? (
                    <div style={{ color: "#5b647a", marginTop: "6px" }}>
                      No add-ons
                    </div>
                  ) : (
                    <ul style={{ paddingLeft: "18px", marginTop: "6px" }}>
                      {activeBooking.addons.map((addon) => (
                        <li key={addon.name}>
                          {addon.name} ({formatMoney(addon.price)})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div
                  className="admin-card"
                  style={{ marginTop: "12px", boxShadow: "none" }}
                >
                  <h3>Notes</h3>
                  <div style={{ color: "#5b647a" }}>
                    {activeBooking.notes?.trim()
                      ? activeBooking.notes
                      : "No notes provided"}
                  </div>
                </div>
              </>
            )}
            {activeBooking.editing && (
              <button
                className="admin-button primary"
                style={{ marginTop: "16px", width: "100%" }}
                type="button"
                onClick={async () => {
                  const res = await fetch(
                    `/api/admin/bookings/${activeBooking.id}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        customerName: activeBooking.customerName,
                        customerEmail: activeBooking.customerEmail,
                        customerPhone: activeBooking.customerPhone,
                        serviceName: activeBooking.serviceName,
                        address: activeBooking.address,
                        vehicle: activeBooking.vehicle,
                      }),
                    }
                  );
                  const data = await res.json().catch(() => null);
                  if (res.ok && data) {
                    setActiveBooking({ ...data, editing: false });
                    setBookings((prev) =>
                      prev.map((item) =>
                        item.id === data.id
                          ? {
                              ...item,
                              customerName: data.customerName,
                              serviceName: data.serviceName,
                            }
                          : item
                      )
                    );
                  }
                }}
              >
                Save Changes
              </button>
            )}
            <button
              className="admin-button"
              style={{ marginTop: "10px", width: "100%" }}
              type="button"
              onClick={() => setActiveBooking(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {createOpen && (
        <div
          className="admin-backdrop"
          style={{ opacity: 1, pointerEvents: "auto" }}
          onClick={() => {
            setCreateOpen(false);
            setCreateMessage(null);
          }}
        >
          <div
            className="admin-card"
            style={{
              maxWidth: "700px",
              width: "92%",
              margin: "8vh auto",
              position: "relative",
              cursor: "auto",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3>Create Booking</h3>
                {createReference && (
                  <div style={{ color: "#5b647a", fontSize: "0.85rem" }}>
                    {createReference}
                  </div>
                )}
              </div>
              <button className="admin-button" onClick={() => setCreateOpen(false)}>
                Close
              </button>
            </div>
            <div className="admin-card" style={{ marginTop: "16px", boxShadow: "none" }}>
              <h3>Vehicle</h3>
              <div className="admin-form">
                <div>
                  <label>Vehicle type</label>
                  <select
                    value={createForm.vehicleType}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        vehicleType: event.target.value,
                      }))
                    }
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="truck">Large SUV/Truck</option>
                  </select>
                </div>
                <div className="admin-grid cols-2">
                  <div>
                    <label>Make</label>
                    <input
                      value={createForm.vehicleMake}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          vehicleMake: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label>Model</label>
                    <input
                      value={createForm.vehicleModel}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          vehicleModel: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-grid cols-2">
                  <div>
                    <label>Year</label>
                    <input
                      value={createForm.vehicleYear}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          vehicleYear: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label>Color</label>
                    <input
                      value={createForm.vehicleColor}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          vehicleColor: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-card" style={{ marginTop: "12px", boxShadow: "none" }}>
              <h3>Customer</h3>
              <div className="admin-form">
                <div className="admin-grid cols-2">
                  <div>
                    <label>First name</label>
                    <input
                      value={createForm.firstName}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          firstName: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label>Last name</label>
                    <input
                      value={createForm.lastName}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          lastName: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-grid cols-2">
                  <div>
                    <label>Email</label>
                    <input
                      value={createForm.email}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input
                      value={createForm.phone}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-card" style={{ marginTop: "12px", boxShadow: "none" }}>
              <h3>Detail Package</h3>
              <div className="admin-form">
                <div>
                  <label>Package</label>
                  <select
                    value={createForm.packageName}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        packageName: event.target.value,
                      }))
                    }
                  >
                    <option value="Show Room Detail">Show Room Detail</option>
                    <option value="Full Exterior Detail">Full Exterior Detail</option>
                    <option value="Quick Exterior Detail">Quick Exterior Detail</option>
                    <option value="Full Interior Detail">Full Interior Detail</option>
                    <option value="Quick Interior Detail">Quick Interior Detail</option>
                    <option value="Maintenance Detail">Maintenance Detail</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="admin-card" style={{ marginTop: "12px", boxShadow: "none" }}>
              <h3>Add-ons</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "8px",
                }}
              >
                {addonCatalog.map((addon) => {
                  const checked = createForm.addons.includes(addon.name);
                  const addonPrice = getAddonPrice(createForm.vehicleType, addon.name);
                  return (
                    <label
                      key={addon.name}
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        border: "1px solid #e5e9f2",
                        borderRadius: "10px",
                        padding: "8px 10px",
                        background: checked ? "#f4f6fb" : "#fff",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setCreateForm((prev) => ({
                            ...prev,
                            addons: checked
                              ? prev.addons.filter((item) => item !== addon.name)
                              : [...prev.addons, addon.name],
                          }))
                        }
                      />
                      <span>
                        {addon.name} (${addonPrice})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="admin-card" style={{ marginTop: "12px", boxShadow: "none" }}>
              <h3>Address</h3>
              <div className="admin-form">
                <div>
                  <label>Street</label>
                  <input
                    value={createForm.addressStreet}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        addressStreet: event.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>City</label>
                  <input
                    value={createForm.addressCity}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        addressCity: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="admin-grid cols-2">
                  <div>
                    <label>State</label>
                    <input
                      value={createForm.addressState}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          addressState: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label>ZIP</label>
                    <input
                      value={createForm.addressZip}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          addressZip: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-card" style={{ marginTop: "12px", boxShadow: "none" }}>
              <h3>Schedule</h3>
              <div className="admin-form">
                <div>
                  <label>Date</label>
                  <input
                    type="date"
                    value={createForm.date}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        date: event.target.value,
                        time: "",
                      }))
                    }
                  />
                </div>
                <div>
                  <label>Time</label>
                  <select
                    value={createForm.time}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        time: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select time</option>
                    {(() => {
                      const date = createForm.date
                        ? new Date(`${createForm.date}T00:00:00`)
                        : null;
                      const isWeekend = date
                        ? date.getDay() === 0 || date.getDay() === 6
                        : false;
                      const month = date ? date.getMonth() : 0;
                      const isJuneJuly = month === 5 || month === 6;
                      const startHour = isJuneJuly || isWeekend ? 8 : 14;
                      const startMinute = isJuneJuly || isWeekend ? 0 : 30;
                      const slots: string[] = [];
                      for (let h = startHour; h <= 17; h += 1) {
                        for (const m of [0, 30]) {
                          if (h === startHour && m < startMinute) continue;
                          if (h === 17 && m > 0) continue;
                          const period = h >= 12 ? "PM" : "AM";
                          const h12 = h % 12 === 0 ? 12 : h % 12;
                          slots.push(
                            `${h12}:${String(m).padStart(2, "0")} ${period}`
                          );
                        }
                      }
                      return slots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
                <div>
                  <label>Notes</label>
                  <textarea
                    rows={4}
                    value={createForm.notes}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="admin-card" style={{ marginTop: "12px", boxShadow: "none" }}>
              <h3>Total</h3>
              {(() => {
                const adjustedBase = getPackagePrice(
                  createForm.vehicleType,
                  createForm.packageName
                );
                const addonsTotal = createForm.addons.reduce((sum, name) => {
                  return sum + getAddonPrice(createForm.vehicleType, name);
                }, 0);
                return (
                  <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                    {formatMoney(adjustedBase + addonsTotal)}
                  </div>
                );
              })()}
              {createMessage && (
                <div style={{ marginTop: "8px", color: "#b91c1c" }}>
                  {createMessage}
                </div>
              )}
              <button
                className="admin-button primary"
                style={{ marginTop: "12px", width: "100%" }}
                disabled={createSaving}
                onClick={async () => {
                  setCreateSaving(true);
                  setCreateMessage(null);
                  const adjustedBase = getPackagePrice(
                    createForm.vehicleType,
                    createForm.packageName
                  );
                  const addonDetails = createForm.addons.map((name) => ({
                    name,
                    price: getAddonPrice(createForm.vehicleType, name),
                  }));
                  const addonsTotal = addonDetails.reduce(
                    (sum, item) => sum + item.price,
                    0
                  );
                  const total = adjustedBase + addonsTotal;
                  const vehicleLine = [
                    createForm.vehicleYear,
                    createForm.vehicleMake,
                    createForm.vehicleModel,
                  ]
                    .filter(Boolean)
                    .join(" ")
                    .trim();
                  const fullVehicleLine = [
                    vehicleLine,
                    createForm.vehicleColor ? `(${createForm.vehicleColor})` : "",
                    vehicleLabelMap[createForm.vehicleType] || createForm.vehicleType,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  try {
                    const res = await fetch("/api/admin/bookings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        customer: {
                          firstName: createForm.firstName,
                          lastName: createForm.lastName,
                          email: createForm.email,
                          phone: createForm.phone,
                        },
                        service: {
                          packageName: createForm.packageName,
                          packagePrice: adjustedBase,
                          addons: createForm.addons,
                          addonDetails,
                          vehicleLine: fullVehicleLine,
                          serviceAddress: {
                            street: createForm.addressStreet,
                            city: createForm.addressCity,
                            state: createForm.addressState,
                            zip: createForm.addressZip,
                          },
                        },
                        schedule: {
                          date: createForm.date,
                          time: createForm.time,
                        },
                        pricing: {
                          total,
                          deposit: 0,
                          balance: total,
                          addonPrices: addonDetails.reduce((acc, item) => {
                            acc[item.name] = item.price;
                            return acc;
                          }, {} as Record<string, number>),
                        },
                        notes: {
                          instructions: createForm.notes,
                        },
                      }),
                    });
                    const data = await res.json().catch(() => null);
                    if (!res.ok) {
                      setCreateMessage(data?.error || "Unable to create booking.");
                      setCreateSaving(false);
                      return;
                    }
                    setCreateOpen(false);
                    setCreateForm((prev) => ({
                      ...prev,
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      addons: [],
                      vehicleType: "sedan",
                      vehicleMake: "",
                      vehicleModel: "",
                      vehicleYear: "",
                      vehicleColor: "",
                      addressStreet: "",
                      addressCity: "",
                      addressState: "",
                      addressZip: "",
                      notes: "",
                      date: "",
                      time: "",
                    }));
                    setRefreshKey((prev) => prev + 1);
                  } catch {
                    setCreateMessage("Unable to create booking.");
                  } finally {
                    setCreateSaving(false);
                  }
                }}
              >
                {createSaving ? "Saving..." : "Save Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
