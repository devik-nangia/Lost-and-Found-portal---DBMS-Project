const db = require('./db/database');

module.exports = async function seed() {
  // Clear existing data atomically
  await db.batch([
    { sql: 'DELETE FROM MATCHES_WITH', args: [] },
    { sql: 'DELETE FROM CLAIM',        args: [] },
    { sql: 'DELETE FROM LOST_ITEM',    args: [] },
    { sql: 'DELETE FROM FOUND_ITEM',   args: [] },
    { sql: 'DELETE FROM ADMIN',        args: [] },
    { sql: 'DELETE FROM USER',         args: [] },
  ]);

  // Reset autoincrement counters (ignore error if sqlite_sequence doesn't exist yet)
  try {
    await db.query(
      "DELETE FROM sqlite_sequence WHERE name IN ('USER','ADMIN','LOST_ITEM','FOUND_ITEM','CLAIM')"
    );
  } catch (_) {}

  // -- Users --
  await db.batch([
    { sql: 'INSERT INTO USER (Name, Email, Phone, Department) VALUES (?, ?, ?, ?)',
      args: ['Aarav Sharma', 'aarav@university.edu', '9876543210', 'Computer Science'] },
    { sql: 'INSERT INTO USER (Name, Email, Phone, Department) VALUES (?, ?, ?, ?)',
      args: ['Priya Patel', 'priya@university.edu', '9876543211', 'Mechanical Engineering'] },
    { sql: 'INSERT INTO USER (Name, Email, Phone, Department) VALUES (?, ?, ?, ?)',
      args: ['Rohan Mehta', 'rohan@university.edu', '9876543212', 'Electrical Engineering'] },
  ]);

  // -- Admins --
  await db.batch([
    { sql: 'INSERT INTO ADMIN (Name, ContactNumber) VALUES (?, ?)',
      args: ['Dr. Kapoor', '9000000001'] },
    { sql: 'INSERT INTO ADMIN (Name, ContactNumber) VALUES (?, ?)',
      args: ['Campus Security Office', '9000000002'] },
  ]);

  // -- Lost Items --
  await db.batch([
    { sql: 'INSERT INTO LOST_ITEM (ItemName, Category, Description, DateLost, UserID) VALUES (?, ?, ?, ?, ?)',
      args: ['Data Structures Textbook', 'Books', 'Blue hardcover, "Introduction to Algorithms" by Cormen. Has sticky notes in chapter 4.', '2026-03-15', 1] },
    { sql: 'INSERT INTO LOST_ITEM (ItemName, Category, Description, DateLost, UserID) VALUES (?, ?, ?, ?, ?)',
      args: ['MacBook Charger', 'Electronics', '67W USB-C MagSafe charger, white cable with a red sticker on the plug.', '2026-03-18', 1] },
    { sql: 'INSERT INTO LOST_ITEM (ItemName, Category, Description, DateLost, UserID) VALUES (?, ?, ?, ?, ?)',
      args: ['Student ID Card', 'ID Cards', 'University ID card for Priya Patel, Mechanical Engineering dept.', '2026-03-19', 2] },
    { sql: 'INSERT INTO LOST_ITEM (ItemName, Category, Description, DateLost, UserID) VALUES (?, ?, ?, ?, ?)',
      args: ['Black Wristwatch', 'Accessories', 'Casio digital watch with a black rubber strap, scratched face.', '2026-03-20', 3] },
    { sql: 'INSERT INTO LOST_ITEM (ItemName, Category, Description, DateLost, UserID) VALUES (?, ?, ?, ?, ?)',
      args: ['Denim Jacket', 'Clothing', 'Blue denim jacket, size M, has a small pin on the left lapel.', '2026-03-21', 2] },
  ]);

  // -- Found Items --
  await db.batch([
    { sql: 'INSERT INTO FOUND_ITEM (ItemName, Category, Description, DateFound, AdminID) VALUES (?, ?, ?, ?, ?)',
      args: ['Algorithms Textbook', 'Books', 'Found in Library Hall B, blue hardcover with sticky notes.', '2026-03-16', 1] },
    { sql: 'INSERT INTO FOUND_ITEM (ItemName, Category, Description, DateFound, AdminID) VALUES (?, ?, ?, ?, ?)',
      args: ['USB-C Charger', 'Electronics', 'White MagSafe charger found in Lecture Hall 3, has a red sticker.', '2026-03-19', 2] },
    { sql: 'INSERT INTO FOUND_ITEM (ItemName, Category, Description, DateFound, AdminID) VALUES (?, ?, ?, ?, ?)',
      args: ['University ID Card', 'ID Cards', 'Found near the cafeteria. Name reads "Priya Patel".', '2026-03-20', 1] },
    { sql: 'INSERT INTO FOUND_ITEM (ItemName, Category, Description, DateFound, AdminID) VALUES (?, ?, ?, ?, ?)',
      args: ['Set of Keys', 'Keys', 'Small keyring with 3 keys and a bottle opener, found in parking lot.', '2026-03-21', 2] },
  ]);

  // -- Claims --
  await db.batch([
    { sql: 'INSERT INTO CLAIM (ClaimDate, Status, UserID, FoundItemID, AdminID) VALUES (?, ?, ?, ?, ?)',
      args: ['2026-03-17', 'Verified', 1, 1, 1] },
    { sql: 'INSERT INTO CLAIM (ClaimDate, Status, UserID, FoundItemID, AdminID) VALUES (?, ?, ?, ?, ?)',
      args: ['2026-03-20', 'Pending', 2, 3, null] },
  ]);

  // -- Matches --
  await db.batch([
    { sql: 'INSERT INTO MATCHES_WITH (LostItemID, FoundItemID) VALUES (?, ?)', args: [1, 1] },
    { sql: 'UPDATE LOST_ITEM SET Is_Matched = 1 WHERE LostItemID = 1',         args: [] },
    { sql: 'UPDATE FOUND_ITEM SET Is_Matched = 1 WHERE FoundItemID = 1',        args: [] },
  ]);

  console.log('✓ Seed data inserted successfully');
  console.log('  - 3 users, 2 admins');
  console.log('  - 5 lost items, 4 found items');
  console.log('  - 2 claims (1 Verified, 1 Pending)');
  console.log('  - 1 match');
};
