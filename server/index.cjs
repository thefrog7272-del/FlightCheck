const express = require('express');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || '/data/db.json';
const API_PORT = process.env.API_PORT || 3001;

const DEFAULT_DB = {
  custom_planes: [],
  custom_checklists: {},
  deleted_static_planes: [],
  checklist_progress: {},
};

// Ensure the db file (and parent directory) exist on startup
function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

ensureDb();

const app = express();
app.use(express.json({ limit: '10mb' }));

// GET /api/db — return full db contents
app.get('/api/db', (_req, res) => {
  try {
    res.json(readDb());
  } catch (err) {
    res.status(500).json({ error: 'Failed to read database', details: err.message });
  }
});

// PUT /api/db — replace full db contents
app.put('/api/db', (req, res) => {
  try {
    writeDb(req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write database', details: err.message });
  }
});

// PATCH /api/db/:key — update a single top-level key
app.patch('/api/db/:key', (req, res) => {
  try {
    const db = readDb();
    const { key } = req.params;
    if (!(key in DEFAULT_DB)) {
      return res.status(400).json({ error: `Unknown key: ${key}` });
    }
    db[key] = req.body;
    writeDb(db);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update database', details: err.message });
  }
});

// DELETE /api/db — reset db to defaults
app.delete('/api/db', (_req, res) => {
  try {
    writeDb({ ...DEFAULT_DB });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset database', details: err.message });
  }
});

app.listen(API_PORT, () => {
  console.log(`FlightCheck API listening on port ${API_PORT}`);
  console.log(`Database path: ${DB_PATH}`);
});
