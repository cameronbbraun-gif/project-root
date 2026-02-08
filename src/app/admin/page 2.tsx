const bookings = [
  {
    name: "John Smith",
    email: "john.smith@example.com",
    service: "Premium Full Detail",
    vehicle: "SUV",
    date: "Jul 8, 2025",
    time: "10:00 AM - 12:30 PM",
    status: "Confirmed",
    price: "$249.99",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    service: "Full Interior",
    vehicle: "Sedan",
    date: "Jul 8, 2025",
    time: "2:00 PM - 3:30 PM",
    status: "Pending",
    price: "$149.99",
  },
  {
    name: "Michael Brown",
    email: "michaelb@example.com",
    service: "Quick Exterior",
    vehicle: "Truck",
    date: "Jul 9, 2025",
    time: "9:00 AM - 10:00 AM",
    status: "Confirmed",
    price: "$99.99",
  },
  {
    name: "Emily Davis",
    email: "emilyd@example.com",
    service: "Basic Full Detail",
    vehicle: "Compact",
    date: "Jul 9, 2025",
    time: "1:00 PM - 3:00 PM",
    status: "Cancelled",
    price: "$179.99",
  },
];

const calendarDays = [
  { day: "Sun", date: "29", note: "2 bookings" },
  { day: "Mon", date: "30", note: "1 confirmed" },
  { day: "Tue", date: "1", note: "3 bookings" },
  { day: "Wed", date: "2", note: "2 bookings" },
  { day: "Thu", date: "3", note: "1 booking" },
  { day: "Fri", date: "4", note: "1 pending" },
  { day: "Sat", date: "5", note: "-" },
  { day: "Sun", date: "6", note: "3 bookings" },
  { day: "Mon", date: "7", note: "2 confirmed" },
  { day: "Tue", date: "8", note: "1 confirmed" },
  { day: "Wed", date: "9", note: "1 booking" },
  { day: "Thu", date: "10", note: "2 bookings" },
  { day: "Fri", date: "11", note: "-" },
  { day: "Sat", date: "12", note: "-" },
  { day: "Sun", date: "13", note: "Blocked" },
  { day: "Mon", date: "14", note: "Blocked" },
  { day: "Tue", date: "15", note: "1 booking" },
  { day: "Wed", date: "16", note: "-" },
  { day: "Thu", date: "17", note: "1 booking" },
  { day: "Fri", date: "18", note: "-" },
  { day: "Sat", date: "19", note: "-" },
  { day: "Sun", date: "20", note: "2 bookings" },
  { day: "Mon", date: "21", note: "-" },
  { day: "Tue", date: "22", note: "1 booking" },
  { day: "Wed", date: "23", note: "-" },
  { day: "Thu", date: "24", note: "-" },
  { day: "Fri", date: "25", note: "-" },
  { day: "Sat", date: "26", note: "-" },
  { day: "Sun", date: "27", note: "-" },
  { day: "Mon", date: "28", note: "1 booking" },
  { day: "Tue", date: "29", note: "-" },
  { day: "Wed", date: "30", note: "-" },
  { day: "Thu", date: "31", note: "-" },
  { day: "Fri", date: "1", note: "-" },
  { day: "Sat", date: "2", note: "-" },
];

export default function AdminDashboardPage() {
  return (
    <>
      <section className="admin-page-header">
        <div className="admin-page-title">
          Dashboard
          <span>Today's overview for your detailing operations.</span>
        </div>
        <div className="admin-actions">
          <button className="admin-button">Export</button>
          <button className="admin-button primary">+ New Booking</button>
        </div>
      </section>

      <section className="admin-grid cols-4">
        <div className="admin-card admin-stat">
          <div>
            <div className="admin-stat-value">8</div>
            <div className="admin-stat-note">Today's bookings</div>
          </div>
          <div className="admin-pill">+12% vs yesterday</div>
        </div>
        <div className="admin-card admin-stat">
          <div>
            <div className="admin-stat-value">5</div>
            <div className="admin-stat-note">Pending confirmations</div>
          </div>
          <div className="admin-pill">Needs review</div>
        </div>
        <div className="admin-card admin-stat">
          <div>
            <div className="admin-stat-value">$1,840</div>
            <div className="admin-stat-note">This week's revenue</div>
          </div>
          <div className="admin-pill">+8% from last week</div>
        </div>
        <div className="admin-card admin-stat">
          <div>
            <div className="admin-stat-value">12</div>
            <div className="admin-stat-note">Available slots</div>
          </div>
          <div className="admin-pill">Next 7 days</div>
        </div>
      </section>

      <section className="admin-card">
        <h3>Recent Bookings</h3>
        <div className="admin-filters" style={{ marginBottom: "12px" }}>
          <select className="admin-select">
            <option>All Statuses</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
          <select className="admin-select">
            <option>All Services</option>
            <option>Exterior</option>
            <option>Interior</option>
            <option>Packages</option>
          </select>
          <input className="admin-input" type="date" defaultValue="2025-07-08" />
          <input className="admin-input" placeholder="Search by name or email" />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={`${booking.email}-${booking.date}`}>
                <td>
                  <strong>{booking.name}</strong>
                  <div style={{ color: "#5b647a", fontSize: "0.8rem" }}>
                    {booking.email}
                  </div>
                </td>
                <td>
                  {booking.service}
                  <div style={{ color: "#5b647a", fontSize: "0.8rem" }}>
                    {booking.vehicle}
                  </div>
                </td>
                <td>
                  {booking.date}
                  <div style={{ color: "#5b647a", fontSize: "0.8rem" }}>
                    {booking.time}
                  </div>
                </td>
                <td>
                  <span
                    className={`admin-status ${booking.status.toLowerCase()}`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td>{booking.price}</td>
                <td>Edit | Cancel | Confirm</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "12px",
            color: "#5b647a",
            fontSize: "0.8rem",
          }}
        >
          <span>Showing 1-4 of 24 results</span>
          <span>Previous 1 2 3 Next</span>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-page-header">
          <h3>Calendar View</h3>
          <div className="admin-actions">
            <button className="admin-button">Day</button>
            <button className="admin-button">Week</button>
            <button className="admin-button primary">Month</button>
          </div>
        </div>
        <div style={{ margin: "12px 0", color: "#5b647a" }}>
          July 2025 - Tampa, FL
        </div>
        <div className="admin-calendar">
          {calendarDays.map((entry, index) => (
            <div className="admin-calendar-day" key={`${entry.date}-${index}`}>
              <header>
                <span>{entry.day}</span>
                <span>{entry.date}</span>
              </header>
              <div className="admin-calendar-event">{entry.note}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "12px", color: "#5b647a", fontSize: "0.8rem" }}>
          Bookings | Confirmed | Pending | Blocked
        </div>
      </section>
    </>
  );
}
