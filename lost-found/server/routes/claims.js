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

// PATCH /api/claims/:id/status — sp_resolve_claim procedure equivalent
// Verifies or rejects a claim. If Verified, also marks the found item as
// matched and auto-rejects all other pending claims for that found item.
router.patch('/:id/status', async (req, res) => {
  const { Status, AdminID } = req.body;
  if (!Status || !['Pending', 'Verified', 'Rejected'].includes(Status)) {
    return res.status(400).json({ error: 'Status must be Pending, Verified, or Rejected' });
  }
  try {
    // Step 1: Get the FoundItemID for this claim
    const claimResult = await db.query(
      'SELECT FoundItemID FROM CLAIM WHERE ClaimID = ?',
      [req.params.id]
    );
    if (!claimResult.rows[0]) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    const foundItemId = claimResult.rows[0].FoundItemID;

    // Step 2: Update this claim's status and assign admin
    await db.query(
      'UPDATE CLAIM SET Status = ?, AdminID = ? WHERE ClaimID = ?',
      [Status, AdminID || null, req.params.id]
    );

    // Step 3 (sp_resolve_claim logic): if Verified, mark found item as matched
    // and reject all other pending claims for it
    if (Status === 'Verified') {
      await db.batch([
        {
          sql: 'UPDATE FOUND_ITEM SET Is_Matched = 1 WHERE FoundItemID = ?',
          args: [foundItemId]
        },
        {
          sql: `UPDATE CLAIM SET Status = 'Rejected'
                WHERE FoundItemID = ? AND ClaimID != ? AND Status = 'Pending'`,
          args: [foundItemId, req.params.id]
        },
      ]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
