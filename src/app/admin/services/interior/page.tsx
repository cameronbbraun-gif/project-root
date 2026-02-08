const interiorPackages = [
  { name: "Interior Refresh", duration: "1 hr", price: "$89" },
  { name: "Deep Interior", duration: "2 hrs", price: "$169" },
  { name: "Pet Hair Rescue", duration: "2.5 hrs", price: "$199" },
];

export default function InteriorServicesPage() {
  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Interior Detailing
          <span>Deep clean cabins with stain removal and odor reset.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">Update Packages</button>
          <button className="admin-button primary">New Interior Service</button>
        </div>
      </section>

      <section className="admin-card">
        <h3>Interior Packages</h3>
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
            {interiorPackages.map((pkg) => (
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
