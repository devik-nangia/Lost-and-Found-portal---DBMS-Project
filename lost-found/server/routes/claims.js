const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/claims — List all claims (filter by status)
router.get('/', (req, res) => {
  try {
    let query = `
      SELECT c.*, u.Name as UserName, fi.ItemName as FoundItemName, a.Name as AdminName
      FROM CLAIM c
      JOIN USER u ON c.UserID = u.UserID
      JOIN FOUND_ITEM fi ON c.FoundItemID = fi.FoundItemID
      LEFT JOIN ADMIN a ON c.AdminID = a.AdminID
    `;
    const params = [];

    if (req.query.status) {
      query += ' WHERE c.Status = ?';
      params.push(req.query.status);
    }
    query += ' ORDER BY c.ClaimDate DESC';

    const claims = db.prepare(query).all(...params);
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/claims — User files a claim on a found item
router.post('/', (req, res) => {
  const { ClaimDate, UserID, UserName, FoundItemID } = req.body;
  if (!ClaimDate || (!UserID && !UserName) || !FoundItemID) {
    return res.status(400).json({ error: 'ClaimDate, UserName, and FoundItemID are required' });
  }
  try {
    let userId = UserID;
    if (UserName && !UserID) {
      let user = db.prepare('SELECT UserID FROM USER WHERE Name = ?').get(UserName);
      if (!user) {
        const email = `${UserName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`;
        const insertResult = db.prepare('INSERT INTO USER (Name, Email) VALUES (?, ?)').run(UserName, email);
        userId = insertResult.lastInsertRowid;
      } else {
        userId = user.UserID;
      }
    }
    const result = db.prepare(
      'INSERT INTO CLAIM (ClaimDate, UserID, FoundItemID) VALUES (?, ?, ?)'
    ).run(ClaimDate, userId, FoundItemID);
    res.status(201).json({ ClaimID: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/claims/:id/status — Admin updates claim status
router.patch('/:id/status', (req, res) => {
  const { Status, AdminID } = req.body;
  if (!Status || !['Pending', 'Verified', 'Rejected'].includes(Status)) {
    return res.status(400).json({ error: 'Status must be Pending, Verified, or Rejected' });
  }
  try {
    const result = db.prepare(
      'UPDATE CLAIM SET Status = ?, AdminID = ? WHERE ClaimID = ?'
    ).run(Status, AdminID || null, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Claim not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
