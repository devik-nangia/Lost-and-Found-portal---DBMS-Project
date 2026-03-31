require('dotenv').config();
const { createClient } = require('@libsql/client');
const path = require('path');

const client = createClient({
  url: process.env.TURSO_URL || `file:${path.join(__dirname, '..', 'lost_found.db')}`,
  authToken: process.env.TURSO_TOKEN,
});

// Thin async wrapper: returns { rows, rowsAffected, lastInsertRowid }
const query = (sql, args = []) => client.execute({ sql, args });

// Batch wrapper for atomic multi-statement operations (transactions)
// stmts: [{ sql, args }, ...]
const batch = (stmts) => client.batch(stmts, 'write');

module.exports = { query, batch, client };
