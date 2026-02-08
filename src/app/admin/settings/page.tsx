export default function SettingsPage() {
  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          General Settings
          <span>Manage business hours, booking rules, and notifications.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">Restore Defaults</button>
          <button className="admin-button primary">Save Changes</button>
        </div>
      </section>

      <section className="admin-grid cols-2">
        <div className="admin-card">
          <h3>Business Hours</h3>
          <div className="admin-form">
            <div>
              <label>Weekdays</label>
              <input defaultValue="8:00 AM - 6:00 PM" />
            </div>
            <div>
              <label>Weekends</label>
              <input defaultValue="9:00 AM - 4:00 PM" />
            </div>
          </div>
        </div>
        <div className="admin-card">
          <h3>Booking Rules</h3>
          <div className="admin-form">
            <div>
              <label>Lead time</label>
              <select defaultValue="24">
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
              </select>
            </div>
            <div>
              <label>Max bookings per day</label>
              <input defaultValue="12" />
            </div>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <h3>Notifications</h3>
        <div className="admin-form">
          <div>
            <label>Admin Alerts</label>
            <input defaultValue="ops@detailgeeks.com" />
          </div>
          <div>
            <label>Customer Reminders</label>
            <input defaultValue="Text + Email" />
          </div>
        </div>
      </section>
    </>
  );
}
