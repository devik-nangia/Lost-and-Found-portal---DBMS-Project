const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/users — List all users
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM USER');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users — Register a new user
router.post('/', async (req, res) => {
  const { Name, Email, Phone, Department } = req.body;
  if (!Name || !Email) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }
  try {
    const result = await db.query(
      'INSERT INTO USER (Name, Email, Phone, Department) VALUES (?, ?, ?, ?)',
      [Name, Email, Phone || null, Department || null]
    );
    res.status(201).json({ UserID: Number(result.lastInsertRowid) });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id — Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM USER WHERE UserID = ?', [req.params.id]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
