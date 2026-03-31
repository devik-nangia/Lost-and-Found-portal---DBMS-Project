const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/admin — List all admins
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM ADMIN');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin — Register a new admin
router.post('/', async (req, res) => {
  const { Name, ContactNumber } = req.body;
  if (!Name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO ADMIN (Name, ContactNumber) VALUES (?, ?)',
      [Name, ContactNumber || null]
    );
    res.status(201).json({ AdminID: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
