import Link from "next/link";

const services = [
  {
    title: "Exterior Detailing",
    description: "Wash, decontamination, polish, seal, ceramic boosts.",
    href: "/admin/services/exterior",
  },
  {
    title: "Interior Detailing",
    description: "Steam clean, stain removal, leather care, odor reset.",
    href: "/admin/services/interior",
  },
  {
    title: "Full Packages",
    description: "Bundle exterior + interior packages with upsells.",
    href: "/admin/services/packages",
  },
  {
    title: "Add-Ons",
    description: "Engine bay, headlight restore, pet hair removal.",
    href: "/admin/services/addons",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Services
          <span>Organize service tiers, pricing, and durations.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">Seasonal Pricing</button>
          <button className="admin-button primary">Add Service</button>
        </div>
      </section>

      <section className="admin-grid cols-2">
        {services.map((service) => (
          <Link className="admin-card" href={service.href} key={service.title}>
            <h3>{service.title}</h3>
            <div style={{ color: "#5b647a" }}>{service.description}</div>
            <div style={{ marginTop: "12px", color: "#0ea5a4" }}>
              View details -&gt;
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
