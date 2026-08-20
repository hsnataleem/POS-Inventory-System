# POS & Inventory Management System

A fully-functional POS and Inventory Management System with role-based dashboard screens for **Admin**, **Inventory Manager**, and **Cashier**.

## Running the Application Locally

The project consists of a `server/` (Node.js/Express + SQLite/Postgres) and a `client/` (React + Tailwind CSS + Vite) folder.

### 1. Run the Backend Server
```bash
cd server
npm install
npm run seed     # Syncs database schema and inserts seed users/products
npm start        # Launches the API on http://localhost:5001
```

### 2. Run the Frontend Client
```bash
cd client
npm install
npm run dev      # Launches Vite on http://localhost:3000
```

---

## Seed Accounts and Credentials

Log in with any of these pre-seeded accounts:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` |
| **Inventory Manager** | `manager` | `manager123` |
| **Cashier** | `cashier` | `cashier123` |

---

## Configuration & Credentials customization

All backend settings are saved in [server/.env](file:///Users/macbookpro/Desktop/Final%20Teerop%20Project/server/.env). 

To connect to your own PostgreSQL server instead of SQLite:
1. Open [server/.env](file:///Users/macbookpro/Desktop/Final%20Teerop%20Project/server/.env).
2. Set `USE_SQLITE=false`.
3. Fill in your PostgreSQL database credentials:
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_HOST`
   - `DB_PORT`
4. Re-run `npm run seed` to sync schema and insert seed users/products.
