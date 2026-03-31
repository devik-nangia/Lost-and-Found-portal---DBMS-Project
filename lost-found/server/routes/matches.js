const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/matches — Create a match between lost and found item
router.post('/', async (req, res) => {
  const { LostItemID, FoundItemID } = req.body;
  if (!LostItemID || !FoundItemID) {
    return res.status(400).json({ error: 'LostItemID and FoundItemID are required' });
  }
  try {
    // Atomic batch: insert match + mark both items as matched
    await db.batch([
      { sql: 'INSERT INTO MATCHES_WITH (LostItemID, FoundItemID) VALUES (?, ?)',
        args: [LostItemID, FoundItemID] },
      { sql: 'UPDATE LOST_ITEM SET Is_Matched = 1 WHERE LostItemID = ?',
        args: [LostItemID] },
      { sql: 'UPDATE FOUND_ITEM SET Is_Matched = 1 WHERE FoundItemID = ?',
        args: [FoundItemID] },
    ]);
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.message.includes('UNIQUE') || err.message.includes('PRIMARY')) {
      return res.status(400).json({ error: 'This match already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/matches — List all matches
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT mw.*, li.ItemName as LostItemName, fi.ItemName as FoundItemName
      FROM MATCHES_WITH mw
      JOIN LOST_ITEM li ON mw.LostItemID = li.LostItemID
      JOIN FOUND_ITEM fi ON mw.FoundItemID = fi.FoundItemID
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
