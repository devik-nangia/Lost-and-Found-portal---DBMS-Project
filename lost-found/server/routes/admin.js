const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/admin — List all admins
router.get('/', (req, res) => {
  try {
    const admins = db.prepare('SELECT * FROM ADMIN').all();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin — Register a new admin
router.post('/', (req, res) => {
  const { Name, ContactNumber } = req.body;
  if (!Name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const result = db.prepare(
      'INSERT INTO ADMIN (Name, ContactNumber) VALUES (?, ?)'
    ).run(Name, ContactNumber || null);
    res.status(201).json({ AdminID: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
