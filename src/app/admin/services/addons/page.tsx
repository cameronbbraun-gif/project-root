const addons = [
  { name: "Engine Bay Detail", price: "$49", duration: "30 min" },
  { name: "Headlight Restoration", price: "$79", duration: "45 min" },
  { name: "Pet Hair Removal", price: "$59", duration: "40 min" },
  { name: "Rain Repellent", price: "$39", duration: "20 min" },
];

export default function AddonsPage() {
  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Add-Ons
          <span>Boost ticket size with targeted upgrades.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">View Performance</button>
          <button className="admin-button primary">New Add-On</button>
        </div>
      </section>

      <section className="admin-card">
        <h3>Most Popular Add-Ons</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Add-On</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Attach Rate</th>
            </tr>
          </thead>
          <tbody>
            {addons.map((addon) => (
              <tr key={addon.name}>
                <td>{addon.name}</td>
                <td>{addon.duration}</td>
                <td>{addon.price}</td>
                <td>32%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
