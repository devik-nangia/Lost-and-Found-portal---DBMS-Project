# PRD: Lost & Found Item Management System (Campus-Based)

## Project Overview

Build a full-stack web application for managing lost and found items on a university campus. The system allows students to report lost items, submit found items, and file claims — while admins resolve and verify those claims. The app uses React + Vite on the frontend, Node.js + Express on the backend, and SQLite (via `better-sqlite3`) as the database.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | SQLite via `better-sqlite3` |
| API Style | REST (JSON) |

---

## Aesthetic Direction

Design the UI with a clean, modern **campus/institutional** feel — think card-based layouts, a neutral background (off-white or light gray), with a strong accent color (deep blue or teal). Use a distinctive font pairing: a bold sans-serif display font (e.g., `DM Sans` or `Outfit`) for headings and a readable body font (e.g., `Lora` or `Source Serif 4`) for content. Add subtle animations on page transitions and card hover states. The dashboard should feel like a polished admin tool — not a toy. No purple gradients. No generic Inter/Roboto.

---

## Folder Structure

```
lost-found/
├── client/                      ← React + Vite frontend
│   ├── public/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── ReportLost.jsx
│       │   ├── ReportFound.jsx
│       │   ├── Claims.jsx
│       │   └── AdminPanel.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ItemCard.jsx
│       │   ├── ClaimCard.jsx
│       │   └── StatusBadge.jsx
│       ├── App.jsx
│       └── main.jsx
│
└── server/                      ← Express backend
    ├── db/
    │   ├── database.js           ← SQLite connection
    │   └── schema.sql            ← Table definitions
    ├── routes/
    │   ├── users.js
    │   ├── lostItems.js
    │   ├── foundItems.js
    │   ├── claims.js
    │   └── admin.js
    ├── seed.js                   ← Optional: seed sample data
    └── index.js                  ← Express entry point
```

---

## Database Schema

The schema must follow the ER diagram exactly. Implement the following tables in `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS USER (
  UserID    INTEGER PRIMARY KEY AUTOINCREMENT,
  Name      TEXT NOT NULL,
  Email     TEXT NOT NULL UNIQUE,
  Phone     TEXT,
  Department TEXT
);

CREATE TABLE IF NOT EXISTS ADMIN (
  AdminID       INTEGER PRIMARY KEY AUTOINCREMENT,
  Name          TEXT NOT NULL,
  ContactNumber TEXT
);

CREATE TABLE IF NOT EXISTS LOST_ITEM (
  LostItemID  INTEGER PRIMARY KEY AUTOINCREMENT,
  ItemName    TEXT NOT NULL,
  Category    TEXT,
  Description TEXT,
  DateLost    DATE NOT NULL,
  Is_Matched  INTEGER DEFAULT 0,         -- 0 = unmatched, 1 = matched
  UserID      INTEGER NOT NULL,
  FOREIGN KEY (UserID) REFERENCES USER(UserID)
);

CREATE TABLE IF NOT EXISTS FOUND_ITEM (
  FoundItemID INTEGER PRIMARY KEY AUTOINCREMENT,
  ItemName    TEXT NOT NULL,
  Category    TEXT,
  Description TEXT,
  DateFound   DATE NOT NULL,
  Is_Matched  INTEGER DEFAULT 0,
  AdminID     INTEGER NOT NULL,          -- Admin uploads found item
  FOREIGN KEY (AdminID) REFERENCES ADMIN(AdminID)
);

CREATE TABLE IF NOT EXISTS MATCHES_WITH (
  LostItemID  INTEGER NOT NULL,
  FoundItemID INTEGER NOT NULL,
  PRIMARY KEY (LostItemID, FoundItemID),
  FOREIGN KEY (LostItemID)  REFERENCES LOST_ITEM(LostItemID),
  FOREIGN KEY (FoundItemID) REFERENCES FOUND_ITEM(FoundItemID)
);

CREATE TABLE IF NOT EXISTS CLAIM (
  ClaimID     INTEGER PRIMARY KEY AUTOINCREMENT,
  ClaimDate   DATE NOT NULL,
  Status      TEXT CHECK(Status IN ('Pending', 'Verified', 'Rejected')) DEFAULT 'Pending',
  UserID      INTEGER NOT NULL,          -- User initiates claim
  FoundItemID INTEGER NOT NULL,          -- Claim is on a found item
  AdminID     INTEGER,                   -- Admin resolves claim
  FOREIGN KEY (UserID)      REFERENCES USER(UserID),
  FOREIGN KEY (FoundItemID) REFERENCES FOUND_ITEM(FoundItemID),
  FOREIGN KEY (AdminID)     REFERENCES ADMIN(AdminID)
);
```

---

## Relationships (from ER Diagram)

| Relationship | Type | Description |
|---|---|---|
| USER — Reports — LOST_ITEM | 1:N | One user can report many lost items |
| USER — Initiates — CLAIM | 1:N | One user can file many claims |
| ADMIN — Resolves — CLAIM | 1:N | One admin can resolve many claims |
| ADMIN — Uploads — FOUND_ITEM | 1:N | One admin can upload many found items |
| LOST_ITEM — Matches_With — FOUND_ITEM | 1:1 | A lost item matches with at most one found item |

---

## REST API Endpoints

### Users
- `GET    /api/users`              — List all users
- `POST   /api/users`              — Register a new user
- `GET    /api/users/:id`          — Get user by ID

### Lost Items
- `GET    /api/lost-items`         — List all lost items (optionally filter by category or is_matched)
- `POST   /api/lost-items`         — Report a new lost item
- `GET    /api/lost-items/:id`     — Get a specific lost item
- `PATCH  /api/lost-items/:id`     — Update is_matched flag

### Found Items
- `GET    /api/found-items`        — List all found items
- `POST   /api/found-items`        — Admin submits a found item
- `GET    /api/found-items/:id`    — Get a specific found item
- `PATCH  /api/found-items/:id`    — Update is_matched flag

### Claims
- `GET    /api/claims`             — List all claims (optionally filter by status)
- `POST   /api/claims`             — User files a claim on a found item
- `PATCH  /api/claims/:id/status`  — Admin updates claim status (Verified / Rejected)

### Matches
- `POST   /api/matches`            — Admin creates a match between a lost and found item (updates both Is_Matched flags)
- `GET    /api/matches`            — List all matches

### Admin
- `GET    /api/admin`              — List all admins
- `POST   /api/admin`              — Register a new admin

---

## Pages and Features

### 1. Dashboard (`/`)
- Summary cards: total lost items, total found items, pending claims, resolved matches
- Recent activity feed (latest lost/found reports and claims)
- Navigation to all other pages

### 2. Report Lost Item (`/report-lost`)
- Form: ItemName, Category (dropdown), Description, DateLost, UserID (dropdown from existing users)
- On submit: POST to `/api/lost-items`
- Show success message and redirect to dashboard

### 3. Report Found Item (`/report-found`) — Admin only
- Form: ItemName, Category (dropdown), Description, DateFound, AdminID (dropdown)
- On submit: POST to `/api/found-items`

### 4. Browse Items (`/browse`)
- Two tabs: Lost Items | Found Items
- Each tab shows a grid of ItemCards
- Filter by Category
- ItemCard shows: ItemName, Category, Date, Description, Matched/Unmatched badge

### 5. File a Claim (`/claims/new`)
- Dropdown to select a Found Item (only unmatched ones)
- Dropdown to select User
- ClaimDate auto-filled to today
- On submit: POST to `/api/claims`

### 6. Claims List (`/claims`)
- Table of all claims with columns: ClaimID, User, Found Item, Date, Status
- Status shown as colored badge (Pending = yellow, Verified = green, Rejected = red)

### 7. Admin Panel (`/admin`)
- Table of all claims with approve/reject buttons (PATCH `/api/claims/:id/status`)
- Section to create a match: select a LostItemID and FoundItemID, click "Match" (POST `/api/matches`)
- On match creation, both items' Is_Matched flags are set to 1

---

## Components

### `ItemCard.jsx`
Displays a single lost or found item. Props: `itemName`, `category`, `description`, `date`, `isMatched`. Shows a green "Matched" or gray "Unmatched" badge.

### `StatusBadge.jsx`
Colored pill badge for claim status. Yellow for Pending, Green for Verified, Red for Rejected.

### `Navbar.jsx`
Top navigation bar with links: Dashboard, Browse, Report Lost, Report Found, Claims, Admin Panel.

### `ClaimCard.jsx`
Shows claim details in card or table row format.

---

## Backend Setup Notes

- In `db/database.js`, open (or create) `lost_found.db` using `better-sqlite3`, read and execute `schema.sql` on startup so tables are always initialized.
- Run Express on port `3001`.
- Enable CORS so the React dev server (port `5173`) can reach the API.
- All responses in JSON. Use HTTP status codes correctly (200, 201, 400, 404, 500).

---

## Seed Data (Optional but recommended)

In `seed.js`, insert:
- 3 sample users with different departments
- 2 sample admins
- 5 lost items across different categories (Books, Electronics, ID Cards, Accessories, Other)
- 4 found items
- 2 claims (one Pending, one Verified)
- 1 match record

---

## Categories (use consistently across frontend and backend)

`Books`, `Electronics`, `ID Cards`, `Accessories`, `Clothing`, `Keys`, `Other`

---

## Non-Functional Requirements

- The app must run fully offline (no external DB server, SQLite file only)
- No authentication required (out of scope; UserID and AdminID are selected from dropdowns)
- All SQL queries must be written as raw SQL strings (no ORM), since this is a DBMS course project
- Keep all SQL in one place: route handlers in `server/routes/` call `db.prepare(...).run(...)` or `.all()` directly
- Frontend should handle loading and error states for all API calls
