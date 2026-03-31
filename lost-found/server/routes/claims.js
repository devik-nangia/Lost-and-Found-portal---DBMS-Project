const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/claims — List all claims (filter by status)
router.get('/', async (req, res) => {
  try {
    let sql = `
      SELECT c.*, u.Name as UserName, fi.ItemName as FoundItemName, a.Name as AdminName
      FROM CLAIM c
      JOIN USER u ON c.UserID = u.UserID
      JOIN FOUND_ITEM fi ON c.FoundItemID = fi.FoundItemID
      LEFT JOIN ADMIN a ON c.AdminID = a.AdminID
    `;
    const params = [];

    if (req.query.status) {
      sql += ' WHERE c.Status = ?';
      params.push(req.query.status);
    }
    sql += ' ORDER BY c.ClaimDate DESC';

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/claims — User files a claim on a found item
router.post('/', async (req, res) => {
  const { ClaimDate, UserID, UserName, FoundItemID } = req.body;
  if (!ClaimDate || (!UserID && !UserName) || !FoundItemID) {
    return res.status(400).json({ error: 'ClaimDate, UserName, and FoundItemID are required' });
  }
  try {
    let userId = UserID;
    if (UserName && !UserID) {
      let userResult = await db.query('SELECT UserID FROM USER WHERE Name = ?', [UserName]);
      let user = userResult.rows[0];
      if (!user) {
        const email = `${UserName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`;
        const insertResult = await db.query(
          'INSERT INTO USER (Name, Email) VALUES (?, ?)',
          [UserName, email]
        );
        userId = Number(insertResult.lastInsertRowid);
      } else {
        userId = user.UserID;
      }
    }
    const result = await db.query(
      'INSERT INTO CLAIM (ClaimDate, UserID, FoundItemID) VALUES (?, ?, ?)',
      [ClaimDate, userId, FoundItemID]
    );
    res.status(201).json({ ClaimID: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/claims/:id/status — Admin updates claim status
router.patch('/:id/status', async (req, res) => {
  const { Status, AdminID } = req.body;
  if (!Status || !['Pending', 'Verified', 'Rejected'].includes(Status)) {
    return res.status(400).json({ error: 'Status must be Pending, Verified, or Rejected' });
  }
  try {
    const result = await db.query(
      'UPDATE CLAIM SET Status = ?, AdminID = ? WHERE ClaimID = ?',
      [Status, AdminID || null, req.params.id]
    );
    if (result.rowsAffected === 0) return res.status(404).json({ error: 'Claim not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
