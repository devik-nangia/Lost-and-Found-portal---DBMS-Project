const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/lost-items — List all lost items (filter by category or is_matched)
router.get('/', (req, res) => {
  try {
    let query = 'SELECT li.*, u.Name as UserName FROM LOST_ITEM li JOIN USER u ON li.UserID = u.UserID';
    const conditions = [];
    const params = [];

    if (req.query.category) {
      conditions.push('li.Category = ?');
      params.push(req.query.category);
    }
    if (req.query.is_matched !== undefined) {
      conditions.push('li.Is_Matched = ?');
      params.push(parseInt(req.query.is_matched));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY li.DateLost DESC';

    const items = db.prepare(query).all(...params);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/lost-items — Report a new lost item
router.post('/', (req, res) => {
  const { ItemName, Category, Description, DateLost, UserName, Email, Phone, Department, UserID } = req.body;
  if (!ItemName || !DateLost || (!UserName && !UserID)) {
    return res.status(400).json({ error: 'ItemName, DateLost, and UserName are required' });
  }
  try {
    let userId = UserID;
    // If UserName is provided, look up or create the user
    if (UserName && !UserID) {
      let user = db.prepare('SELECT UserID FROM USER WHERE Name = ?').get(UserName);
      if (!user) {
        const email = Email || `${UserName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`;
        const insertResult = db.prepare(
          'INSERT INTO USER (Name, Email, Phone, Department) VALUES (?, ?, ?, ?)'
        ).run(UserName, email, Phone || null, Department || null);
        userId = insertResult.lastInsertRowid;
      } else {
        userId = user.UserID;
        // Update Phone and Department if provided
        if (Phone || Department) {
          db.prepare(
            'UPDATE USER SET Phone = COALESCE(?, Phone), Department = COALESCE(?, Department) WHERE UserID = ?'
          ).run(Phone || null, Department || null, userId);
        }
      }
    }
    const result = db.prepare(
      'INSERT INTO LOST_ITEM (ItemName, Category, Description, DateLost, UserID) VALUES (?, ?, ?, ?, ?)'
    ).run(ItemName, Category || null, Description || null, DateLost, userId);
    res.status(201).json({ LostItemID: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/lost-items/:id — Get a specific lost item
router.get('/:id', (req, res) => {
  try {
    const item = db.prepare(
      'SELECT li.*, u.Name as UserName FROM LOST_ITEM li JOIN USER u ON li.UserID = u.UserID WHERE li.LostItemID = ?'
    ).get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Lost item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/lost-items/:id — Update is_matched flag
router.patch('/:id', (req, res) => {
  const { Is_Matched } = req.body;
  if (Is_Matched === undefined) {
    return res.status(400).json({ error: 'Is_Matched is required' });
  }
  try {
    const result = db.prepare('UPDATE LOST_ITEM SET Is_Matched = ? WHERE LostItemID = ?').run(Is_Matched, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Lost item not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
