const db = require('./db/database');

// Clear existing data
db.exec('DELETE FROM MATCHES_WITH');
db.exec('DELETE FROM CLAIM');
db.exec('DELETE FROM LOST_ITEM');
db.exec('DELETE FROM FOUND_ITEM');
db.exec('DELETE FROM ADMIN');
db.exec('DELETE FROM USER');

// Reset autoincrement counters
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('USER','ADMIN','LOST_ITEM','FOUND_ITEM','CLAIM')");

// -- Users --
const insertUser = db.prepare('INSERT INTO USER (Name, Email, Phone, Department) VALUES (?, ?, ?, ?)');
insertUser.run('Aarav Sharma', 'aarav@university.edu', '9876543210', 'Computer Science');
insertUser.run('Priya Patel', 'priya@university.edu', '9876543211', 'Mechanical Engineering');
insertUser.run('Rohan Mehta', 'rohan@university.edu', '9876543212', 'Electrical Engineering');

// -- Admins --
const insertAdmin = db.prepare('INSERT INTO ADMIN (Name, ContactNumber) VALUES (?, ?)');
insertAdmin.run('Dr. Kapoor', '9000000001');
insertAdmin.run('Campus Security Office', '9000000002');

// -- Lost Items --
const insertLost = db.prepare('INSERT INTO LOST_ITEM (ItemName, Category, Description, DateLost, UserID) VALUES (?, ?, ?, ?, ?)');
insertLost.run('Data Structures Textbook', 'Books', 'Blue hardcover, "Introduction to Algorithms" by Cormen. Has sticky notes in chapter 4.', '2026-03-15', 1);
insertLost.run('MacBook Charger', 'Electronics', '67W USB-C MagSafe charger, white cable with a red sticker on the plug.', '2026-03-18', 1);
insertLost.run('Student ID Card', 'ID Cards', 'University ID card for Priya Patel, Mechanical Engineering dept.', '2026-03-19', 2);
insertLost.run('Black Wristwatch', 'Accessories', 'Casio digital watch with a black rubber strap, scratched face.', '2026-03-20', 3);
insertLost.run('Denim Jacket', 'Clothing', 'Blue denim jacket, size M, has a small pin on the left lapel.', '2026-03-21', 2);

// -- Found Items --
const insertFound = db.prepare('INSERT INTO FOUND_ITEM (ItemName, Category, Description, DateFound, AdminID) VALUES (?, ?, ?, ?, ?)');
insertFound.run('Algorithms Textbook', 'Books', 'Found in Library Hall B, blue hardcover with sticky notes.', '2026-03-16', 1);
insertFound.run('USB-C Charger', 'Electronics', 'White MagSafe charger found in Lecture Hall 3, has a red sticker.', '2026-03-19', 2);
insertFound.run('University ID Card', 'ID Cards', 'Found near the cafeteria. Name reads "Priya Patel".', '2026-03-20', 1);
insertFound.run('Set of Keys', 'Keys', 'Small keyring with 3 keys and a bottle opener, found in parking lot.', '2026-03-21', 2);

// -- Claims --
const insertClaim = db.prepare('INSERT INTO CLAIM (ClaimDate, Status, UserID, FoundItemID, AdminID) VALUES (?, ?, ?, ?, ?)');
insertClaim.run('2026-03-17', 'Verified', 1, 1, 1);       // Aarav claimed the Algorithms textbook — Verified
insertClaim.run('2026-03-20', 'Pending', 2, 3, null);      // Priya claimed the ID card — Pending

// -- Matches --
const insertMatch = db.prepare('INSERT INTO MATCHES_WITH (LostItemID, FoundItemID) VALUES (?, ?)');
insertMatch.run(1, 1);  // Data Structures Textbook ↔ Algorithms Textbook

// Mark matched items
db.prepare('UPDATE LOST_ITEM SET Is_Matched = 1 WHERE LostItemID = 1').run();
db.prepare('UPDATE FOUND_ITEM SET Is_Matched = 1 WHERE FoundItemID = 1').run();

console.log('✓ Seed data inserted successfully');
console.log('  - 3 users, 2 admins');
console.log('  - 5 lost items, 4 found items');
console.log('  - 2 claims (1 Verified, 1 Pending)');
console.log('  - 1 match');
