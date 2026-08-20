# POS & Inventory Management System

A fully-functional POS and Inventory Management System with role-based dashboard screens for **Admin**, **Inventory Manager**, and **Cashier**.

## Running the Application Locally

The project consists of a `server/` (Node.js/Express + SQLite/Postgres) and a `client/` (React + Tailwind CSS + Vite) folder.

### 1. Set up Environment Variables

Copy the example env file and fill in your own values:
```bash
cd server
cp .env.example .env
```

Open `server/.env` and set the required variables:
```env
PORT=8080
JWT_SECRET=your_strong_random_secret_here

# Seed passwords (used when running npm run seed)
ADMIN_PASSWORD=your_admin_password
MANAGER_PASSWORD=your_manager_password
CASHIER_PASSWORD=your_cashier_password

# Set to true to use SQLite (recommended for local development)
USE_SQLITE=true
```

### 2. Run the Backend Server
```bash
cd server
npm install
npm run seed     # Creates database tables and seed users using your .env passwords
npm start        # Launches the API on http://localhost:8080
```

### 3. Run the Frontend Client
```bash
cd client
npm install
npm run dev      # Launches Vite on http://localhost:3000
```

---

## Configuration

- All backend settings live in `server/.env` (never committed to Git — see `.gitignore`).
- Use `server/.env.example` as a template.
- To connect to PostgreSQL instead of SQLite: set `USE_SQLITE=false` and fill in the `DB_*` variables in your `.env`.
- Set `VITE_API_BASE` in Vercel environment variables to point to your deployed backend URL.
