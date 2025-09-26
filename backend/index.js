const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "http://127.0.0.1:5500" })); // allow your Live Server origin
app.use(express.json());

app.post("/api/contact", (req, res) => {
  const { first_name, last_name, email, message } = req.body || {};
  if (!first_name || !last_name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }
  console.log("Contact form:", { first_name, last_name, email, message });
  // TODO: email or save to DB here
  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));