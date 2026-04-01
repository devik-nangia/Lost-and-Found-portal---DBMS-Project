require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { query, client } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/users', require('./routes/users'));
app.use('/api/lost-items', require('./routes/lostItems'));
app.use('/api/found-items', require('./routes/foundItems'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function bootstrap() {
  // Run schema (execute each CREATE TABLE statement individually)
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    await query(stmt);
  }
  console.log('Schema ready');

  // Install triggers (IF NOT EXISTS — safe to run every boot)
  // Trigger 1: auto-set Is_Matched on both items when a match is recorded
  await query(`
    CREATE TRIGGER IF NOT EXISTS trg_auto_match
    AFTER INSERT ON MATCHES_WITH
    BEGIN
      UPDATE LOST_ITEM  SET Is_Matched = 1 WHERE LostItemID  = NEW.LostItemID;
      UPDATE FOUND_ITEM SET Is_Matched = 1 WHERE FoundItemID = NEW.FoundItemID;
    END
  `);

  // Trigger 2: prevent a user from filing duplicate active claims on the same found item
  await query(`
    CREATE TRIGGER IF NOT EXISTS trg_prevent_duplicate_claim
    BEFORE INSERT ON CLAIM
    WHEN (
      SELECT COUNT(*) FROM CLAIM
      WHERE UserID      = NEW.UserID
        AND FoundItemID = NEW.FoundItemID
        AND Status     != 'Rejected'
    ) > 0
    BEGIN
      SELECT RAISE(ABORT, 'User already has an active claim for this item');
    END
  `);

  console.log('Triggers ready');

  // Seed only if empty
  const result = await query('SELECT COUNT(*) as count FROM USER');
  const count = Number(result.rows[0].count);
  if (count === 0) {
    await require('./seed')();
    console.log('Database seeded');
  } else {
    console.log(`Database already has ${count} user(s), skipping seed`);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
