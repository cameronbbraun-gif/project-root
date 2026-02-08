"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{
    name: string | null;
    email: string | null;
    role: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setUser(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/forgot-password") ||
    pathname.startsWith("/admin/reset-password")
  ) {
    return <>{children}</>;
  }

  return (
    <div className={`admin-root${sidebarOpen ? " sidebar-open" : ""}`}>
      <div className="admin-sidebar-panel">
        <Sidebar />
      </div>
      <div className="admin-main">
        <div className="admin-banner">
          <div className="admin-banner-logo">
            <img src="/images/logo.png" alt="Detail Geeks" />
          </div>
          <button
            className="admin-hamburger admin-banner-toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
          <button className="admin-banner-button">New Booking</button>
        </div>
        <div className="admin-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="admin-search">
            <span>S</span>
            <input placeholder="Search bookings, customers, invoices..." />
          </div>
          <div className="admin-topbar-actions">
            <div className="admin-chip">Live status: smooth</div>
            <div className="admin-user">
              <div className="admin-avatar" />
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  {user?.name || user?.email || "Admin"}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#5b647a" }}>
                  {user?.role ? user.role : "admin"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <main className="admin-content">{children}</main>
        <footer className="admin-footer">
          <span>(c) 2026 Detail Geeks. All rights reserved.</span>
          <span>Admin Panel v1.0</span>
        </footer>
      </div>
      <div
        className="admin-backdrop"
        onClick={() => setSidebarOpen(false)}
        role="presentation"
      />
    </div>
  );
}
