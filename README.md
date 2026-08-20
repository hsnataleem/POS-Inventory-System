# POS & Inventory Management System

A role-based Point-of-Sale and Inventory Management application with separate dashboards and permissions for Admin, Inventory Manager, and Cashier. It supports product categories with category-specific fields, image uploads, checkout/transactions with stock decrement, low-stock detection, and simple analytics.

---

## Quick summary / What this solves
This project helps small retail stores manage products, track stock, perform checkouts, and view basic reports. Roles restrict actions: Admin manages users and settings, Inventory Manager manages products and inventory, and Cashier performs sales.

## Stack
- Language(s): JavaScript (Node.js backend, React frontend)
- Backend: Node.js + Express
- Frontend: React with Vite and Tailwind CSS
- ORM: Sequelize (supports SQLite and Postgres)
- Key libs: express, sequelize, sqlite3/pg, jsonwebtoken, bcryptjs, multer, react-router-dom, tailwindcss

## Repository layout
```
client/                React + Vite frontend (UI)
server/                Backend (Express + Sequelize)
  server.js            Main API server and route definitions
  models.js            Sequelize models (User, Product, Transaction, TransactionItem)
  db.js                DB connection selector (SQLite vs Postgres)
  authMiddleware.js    JWT authentication and role authorization
  seed.js              Seeds default users and sample products
README.md              Documentation (this file)
.gitignore
```

## Features
- Role-based auth: Admin, Inventory Manager, Cashier
- User management (Admin)
- Product CRUD with category-specific metadata (Fragile, Cold, Tech, Cleaning, General)
- Product image upload (uploads/ served statically)
- Checkout/transaction creation with stock decrement and transaction items
- Low-stock detection and simple analytics (top-selling items, totals)
- Support for SQLite (dev) or Postgres (production)
- Simple seeding script to bootstrap users and products

## API (summary)
All API endpoints are rooted at `/api`. Authentication is via Bearer JWT (Authorization: `Bearer <token>`).

- Auth
  - POST /api/auth/login — login (returns token)
  - POST /api/auth/register — register user (Admin-only; seeding creates initial users)
  - GET /api/auth/me — current user (requires auth)
- Users (Admin only)
  - GET /api/users — list users
  - PUT /api/users/:id — update role, isActive, password
- Products
  - GET /api/products — list products (search, filter by category)
  - GET /api/products/sku/:sku — get product by SKU
  - GET /api/products/low-stock — low-stock products (Admin, Inventory Manager)
  - POST /api/products — create product (Admin, Inventory Manager) [multipart/form-data with optional `image` file]
  - PUT /api/products/:id — update product (Admin, Inventory Manager)
  - DELETE /api/products/:id — delete product (Admin, Inventory Manager)
- Transactions / Billing
  - POST /api/transactions/checkout — create a checkout transaction with items (requires auth; Cashier allowed)
  - GET /api/transactions — list transactions (Cashier sees own, others see all)
  - GET /api/transactions/:id — transaction details (with items)
- Analytics
  - GET /api/analytics — totals, top selling, low stock counts (Admin, Inventory Manager)

## Local development (short path)
1. Clone
```bash
git clone https://github.com/hsnataleem/POS-Inventory-System.git
cd POS-Inventory-System
```

2. Backend
```bash
cd server
cp .env.example .env            # create .env from template
# Edit server/.env and set required environment variables (see below)
npm install
npm run seed                    # seeds DB (requires ADMIN_PASSWORD, MANAGER_PASSWORD, CASHIER_PASSWORD to be set)
npm start                       # starts API
```

3. Frontend
```bash
cd client
npm install
npm run dev                     # runs Vite dev server (default http://localhost:3000)
```

Open the client URL, log in with seeded credentials (see "Seeding & default users" below), and the frontend should connect to the backend at the configured API base URL.

## Environment variables (server/.env)
Set the following variables in `server/.env`. Do NOT store actual secrets in the repo or commit them to source control; keep them local or in your deployment platform's secret manager.

Required variables (names only):
- PORT
- JWT_SECRET
- ADMIN_PASSWORD (used by seed script; set securely)
- MANAGER_PASSWORD (used by seed script; set securely)
- CASHIER_PASSWORD (used by seed script; set securely)
- USE_SQLITE (set to `true` for local development to use SQLite)

Optional / deployment variables (names only):
- DB_PATH (path to sqlite file when using SQLite)
- DATABASE_URL (Postgres connection string for production)
- DB_SSL (set to control SSL for Postgres connections)
- VITE_API_BASE (frontend: URL to backend API, set in deployment)

Notes:
- `PORT` and `JWT_SECRET` are required for the server to start.
- Never commit actual secret values (passwords, JWT_SECRET, DB credentials) to the repository.

## Seeding & default users
Run `npm run seed` inside the `server` folder to recreate the DB and insert default data. Before running the seed script, ensure you have set the three password environment variables referenced above. The seed script will fail if those are not provided.

Default users after seeding:
- admin (role: Admin)
- manager (role: Inventory Manager)
- cashier (role: Cashier)

Use the passwords you set in server/.env for each account.

## Deployment notes
Recommended pipeline:
- Backend: Railway (set root directory to `server`) or any Node host. Ensure env vars are provided securely via the platform's environment settings; do not paste secrets in code.
- Frontend: Vercel (root directory `client`, Vite preset). Set `VITE_API_BASE` to `<your-backend-url>/api` in Vercel's environment settings.

Railway tips:
- Set backend service Root Directory to `server`.
- Add a Postgres plugin service and set `DATABASE_URL` using Railway's service variables.
- Seed the DB once using the Railway CLI or a one-off run.

Vercel tips:
- Configure `VITE_API_BASE` as a project environment variable in Vercel settings.
- Build: `npm run build`; output dir: `dist`.

## Files & important code paths
- server/server.js — API routes and core application logic (auth, product endpoints, transactions, analytics)
- server/models.js — Sequelize models and relations
- server/db.js — DB connection selection (SQLite vs Postgres)
- server/authMiddleware.js — JWT verify and role authorization
- server/seed.js — DB seeding and example data
- client/ — front-end application (React + Vite; see client/package.json scripts)

## Troubleshooting & common issues
- If the server complains about missing environment variables, verify required env vars are set in `server/.env` or your deployment environment.
- For production Postgres connections, use the deployment platform's secret manager and verify SSL settings if needed.
- Image uploads are stored in `server/uploads/` and are ephemeral on many PaaS providers; use persistent storage or external object storage for production.

## Contributing
- Open an issue or PR. Describe the bug or feature and include reproduction steps.
- Run server tests (if added) and lint checks; follow code style in the repo.

## License
(If you want a license, add one to the repository. This repo currently has no LICENSE file.)

## Try asking
- How can I add a vendor/store location field to each transaction and show it in the analytics?
- The README mentions product image uploads — where are uploaded files saved and how can I switch to S3-compatible storage?
- Can you add endpoint docs (OpenAPI/Swagger) for the current API surface (server/server.js)?
