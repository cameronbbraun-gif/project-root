"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navSections = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: "DB", exact: true },
      { label: "Calendar", href: "/admin/calendar", icon: "CL" },
      { label: "Bookings", href: "/admin/bookings", icon: "BK" },
      { label: "Customers", href: "/admin/customers", icon: "CU" },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "Overview", href: "/admin/services", icon: "SV" },
      { label: "Exterior Detailing", href: "/admin/services/exterior", icon: "EX" },
      { label: "Interior Detailing", href: "/admin/services/interior", icon: "IN" },
      { label: "Full Packages", href: "/admin/services/packages", icon: "PK" },
      { label: "Add-Ons", href: "/admin/services/addons", icon: "AO" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Reports", href: "/admin/reports", icon: "RP" },
      { label: "Invoices", href: "/admin/invoices", icon: "IV" },
      { label: "Staff", href: "/admin/staff", icon: "ST" },
      { label: "Support", href: "/admin/support", icon: "SP" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "General Settings", href: "/admin/settings", icon: "GS", exact: true },
      { label: "Profile", href: "/admin/settings/profile", icon: "PR" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-mark">
          <img src="/images/logo.png" alt="Detail Geeks" />
        </div>
      </div>
      {navSections.map((section) => (
        <div className="admin-nav-section" key={section.title}>
          <div className="admin-nav-title">{section.title}</div>
          {section.items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                className={`admin-nav-item${isActive ? " active" : ""}`}
                href={item.href}
                key={item.href}
              >
                <span className="admin-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="admin-sidebar-footer">(c) 2026 Detail Geeks Admin</div>
    </aside>
  );
}
