// index.js

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./healthdata.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create the health table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS health (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    steps INTEGER,
    restingHR INTEGER,
    sleepminutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Root route to test if server is running
app.get("/", (req, res) => {
  res.send("Health Tracker API is running 🚀");
});

// Route to insert health data
app.post("/health-data", (req, res) => {
  console.log("Received:", req.body);

  const { steps, restingHR, sleepminutes } = req.body;

  const stmt = db.prepare(
    "INSERT INTO health (steps, restingHR, sleepminutes) VALUES (?, ?, ?)",
  );
  stmt.run(steps, restingHR, sleepminutes, function (err) {
    if (err) {
      console.error("Failed to insert data:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({ success: true, id: this.lastID });
  });
});

// Route to retrieve health data
app.get("/health-data", (req, res) => {
  db.all("SELECT * FROM health ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json(rows);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
