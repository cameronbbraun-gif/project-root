const staff = [
  { name: "Marcus Hill", role: "Lead Detailer", status: "On site" },
  { name: "Taylor Reed", role: "Mobile Specialist", status: "En route" },
  { name: "Jordan Blake", role: "Detailer", status: "On break" },
  { name: "Riley Nguyen", role: "Customer Success", status: "Remote" },
];

export default function StaffPage() {
  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Staff
          <span>Keep track of your team, shifts, and assignments.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">Shift Planner</button>
          <button className="admin-button primary">Add Team Member</button>
        </div>
      </section>

      <section className="admin-grid cols-2">
        <div className="admin-card">
          <h3>Today's Coverage</h3>
          <div className="admin-form">
            <div>
              <label>Bay 1</label>
              <input defaultValue="Marcus Hill - 8:00 AM - 4:00 PM" />
            </div>
            <div>
              <label>Bay 2</label>
              <input defaultValue="Jordan Blake - 10:00 AM - 6:00 PM" />
            </div>
            <div>
              <label>Mobile</label>
              <input defaultValue="Taylor Reed - 9:00 AM - 5:00 PM" />
            </div>
          </div>
        </div>
        <div className="admin-card">
          <h3>Team Status</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.name}>
                  <td>{member.name}</td>
                  <td>{member.role}</td>
                  <td>
                    <span className="admin-pill">{member.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
