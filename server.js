// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// SQLite setup
const db = new sqlite3.Database('./healthdata.db', (err) => {
  if (err) return console.error(err.message);
  console.log('✅ Connected to the SQLite database.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS health_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    steps INTEGER,
    restingHR INTEGER,
    sleepminutes INTEGER
  )
`);

// POST endpoint to receive data from Apple Shortcut
app.post('/log-health', (req, res) => {
  const { steps, restingHR, sleepminutes } = req.body;

  const stmt = db.prepare(`INSERT INTO health_data (steps, restingHR, sleepminutes) VALUES (?, ?, ?)`);
  stmt.run(steps, restingHR, sleepminutes, function (err) {
    if (err) {
      console.error('❌ DB Insert Error:', err.message);
      return res.status(500).json({ error: 'Failed to save data.' });
    }

    console.log('✅ Health data saved.');
    res.status(200).json({ success: true, id: this.lastID });
  });
});

// GET endpoint to retrieve data (for future frontend)
app.get('/health-history', (req, res) => {
  db.all(`SELECT * FROM health_data ORDER BY timestamp DESC`, [], (err, rows) => {
    if (err) {
      console.error('❌ DB Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch data.' });
    }

    res.status(200).json(rows);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
