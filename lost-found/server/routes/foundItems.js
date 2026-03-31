const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/found-items — List all found items
router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT fi.*, a.Name as AdminName FROM FOUND_ITEM fi JOIN ADMIN a ON fi.AdminID = a.AdminID';
    const conditions = [];
    const params = [];

    if (req.query.category) {
      conditions.push('fi.Category = ?');
      params.push(req.query.category);
    }
    if (req.query.is_matched !== undefined) {
      conditions.push('fi.Is_Matched = ?');
      params.push(parseInt(req.query.is_matched));
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY fi.DateFound DESC';

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/found-items — Admin submits a found item
router.post('/', async (req, res) => {
  const { ItemName, Category, Description, DateFound, AdminID, SubmittedByName } = req.body;
  if (!ItemName || !DateFound || (!AdminID && !SubmittedByName)) {
    return res.status(400).json({ error: 'ItemName, DateFound, and SubmittedByName are required' });
  }
  try {
    let adminId = AdminID;
    // If SubmittedByName is provided, look up or create the admin
    if (SubmittedByName && !AdminID) {
      let adminResult = await db.query('SELECT AdminID FROM ADMIN WHERE Name = ?', [SubmittedByName]);
      let admin = adminResult.rows[0];
      if (!admin) {
        const insertResult = await db.query(
          'INSERT INTO ADMIN (Name) VALUES (?)',
          [SubmittedByName]
        );
        adminId = Number(insertResult.lastInsertRowid);
      } else {
        adminId = admin.AdminID;
      }
    }
    const result = await db.query(
      'INSERT INTO FOUND_ITEM (ItemName, Category, Description, DateFound, AdminID) VALUES (?, ?, ?, ?, ?)',
      [ItemName, Category || null, Description || null, DateFound, adminId]
    );
    res.status(201).json({ FoundItemID: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/found-items/:id — Get a specific found item
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT fi.*, a.Name as AdminName FROM FOUND_ITEM fi JOIN ADMIN a ON fi.AdminID = a.AdminID WHERE fi.FoundItemID = ?',
      [req.params.id]
    );
    const item = result.rows[0];
    if (!item) return res.status(404).json({ error: 'Found item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/found-items/:id — Update is_matched flag
router.patch('/:id', async (req, res) => {
  const { Is_Matched } = req.body;
  if (Is_Matched === undefined) {
    return res.status(400).json({ error: 'Is_Matched is required' });
  }
  try {
    const result = await db.query(
      'UPDATE FOUND_ITEM SET Is_Matched = ? WHERE FoundItemID = ?',
      [Is_Matched, req.params.id]
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Found item not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
