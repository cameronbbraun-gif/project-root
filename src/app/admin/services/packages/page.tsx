const packages = [
  {
    name: "Classic Detail",
    duration: "2.5 hrs",
    price: "$219",
    includes: "Exterior + Interior Refresh",
  },
  {
    name: "Full Detail Plus",
    duration: "4 hrs",
    price: "$349",
    includes: "Paint correction + deep interior",
  },
  {
    name: "Showroom Finish",
    duration: "6 hrs",
    price: "$499",
    includes: "Ceramic boost + premium protection",
  },
];

export default function PackagesPage() {
  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Full Packages
          <span>Bundle the best of interior and exterior services.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">Bundle Builder</button>
          <button className="admin-button primary">New Package</button>
        </div>
      </section>

      <section className="admin-grid cols-3">
        {packages.map((pkg) => (
          <div className="admin-card" key={pkg.name}>
            <h3>{pkg.name}</h3>
            <div style={{ color: "#0ea5a4", fontWeight: 600 }}>{pkg.price}</div>
            <div style={{ color: "#5b647a", marginTop: "8px" }}>
              {pkg.includes}
            </div>
            <div className="admin-pill" style={{ marginTop: "12px" }}>
              {pkg.duration}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
