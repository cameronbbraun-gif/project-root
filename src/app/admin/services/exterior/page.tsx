const exteriorPackages = [
  { name: "Express Wash", duration: "45 min", price: "$59" },
  { name: "Ultimate Exterior", duration: "2 hrs", price: "$199" },
  { name: "Ceramic Boost", duration: "3 hrs", price: "$289" },
];

export default function ExteriorServicesPage() {
  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Exterior Detailing
          <span>Paint correction, protection, and polish services.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">Update Pricing</button>
          <button className="admin-button primary">New Exterior Service</button>
        </div>
      </section>

      <section className="admin-card">
        <h3>Exterior Packages</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Duration</th>
              <th>Base Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exteriorPackages.map((pkg) => (
              <tr key={pkg.name}>
                <td>{pkg.name}</td>
                <td>{pkg.duration}</td>
                <td>{pkg.price}</td>
                <td>
                  <span className="admin-status confirmed">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
