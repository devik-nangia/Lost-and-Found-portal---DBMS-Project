const express = require('express');
const router = express.Router();
const db = require('../db/database');

// POST /api/matches — Create a match between lost and found item
router.post('/', (req, res) => {
  const { LostItemID, FoundItemID } = req.body;
  if (!LostItemID || !FoundItemID) {
    return res.status(400).json({ error: 'LostItemID and FoundItemID are required' });
  }
  try {
    const insertMatch = db.prepare(
      'INSERT INTO MATCHES_WITH (LostItemID, FoundItemID) VALUES (?, ?)'
    );
    const updateLost = db.prepare('UPDATE LOST_ITEM SET Is_Matched = 1 WHERE LostItemID = ?');
    const updateFound = db.prepare('UPDATE FOUND_ITEM SET Is_Matched = 1 WHERE FoundItemID = ?');

    const transaction = db.transaction(() => {
      insertMatch.run(LostItemID, FoundItemID);
      updateLost.run(LostItemID);
      updateFound.run(FoundItemID);
    });
    transaction();

    res.status(201).json({ success: true });
  } catch (err) {
    if (err.message.includes('UNIQUE') || err.message.includes('PRIMARY')) {
      return res.status(400).json({ error: 'This match already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/matches — List all matches
router.get('/', (req, res) => {
  try {
    const matches = db.prepare(`
      SELECT mw.*, li.ItemName as LostItemName, fi.ItemName as FoundItemName
      FROM MATCHES_WITH mw
      JOIN LOST_ITEM li ON mw.LostItemID = li.LostItemID
      JOIN FOUND_ITEM fi ON mw.FoundItemID = fi.FoundItemID
    `).all();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
