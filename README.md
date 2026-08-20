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

Default login users after seeding: `admin`, `manager`, `cashier` (passwords from your `.env`).

---

## Deploy to Production (Railway + Vercel)

Deploy the **backend on Railway** first, then the **frontend on Vercel**.

### Step 1 — Push code to GitHub

```bash
git add .
git commit -m "Fix bugs and prepare for deployment"
git push origin main
```

### Step 2 — Deploy backend on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project → Deploy from GitHub repo**.
3. Select this repository.
4. **Important:** Open the service **Settings** and set **Root Directory** to `server`.
   - If you skip this, Railway builds from the repo root and fails with *"Railpack could not determine how to build the app"*.
5. Click **+ New → Database → PostgreSQL** in the same project.
6. Open the **backend service → Variables** and add:

| Variable | Value |
|----------|--------|
| `JWT_SECRET` | A long random string |
| `USE_SQLITE` | `false` |
| `DATABASE_URL` | Reference from Postgres service (`${{Postgres.DATABASE_URL}}`) |
| `ADMIN_PASSWORD` | Password for the `admin` user |
| `MANAGER_PASSWORD` | Password for the `manager` user |
| `CASHIER_PASSWORD` | Password for the `cashier` user |

> Railway sets `PORT` automatically — do not override it.

7. After deploy finishes, open **Settings → Networking → Generate Domain**.
8. Seed the database once (Railway CLI or one-off command):

```bash
npm i -g @railway/cli
railway login
railway link
railway run npm run seed
```

9. Copy your Railway URL, e.g. `https://your-app.up.railway.app`.

### Step 3 — Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project** and import this repository.
3. Set **Root Directory** to `client`.
4. Framework preset: **Vite** (build: `npm run build`, output: `dist`).
5. Add environment variable:

| Name | Value |
|------|--------|
| `VITE_API_BASE` | `https://your-app.up.railway.app/api` |

6. Click **Deploy**.

### Step 4 — Test

1. Open your Vercel URL.
2. Log in with `admin` / your `ADMIN_PASSWORD`.
3. Confirm products load and checkout works.

---

## Configuration

- All backend settings live in `server/.env` (never committed to Git — see `.gitignore`).
- Use `server/.env.example` as a template.
- For PostgreSQL locally: set `USE_SQLITE=false` and fill in `DB_*` or `DATABASE_URL`.
- Set `VITE_API_BASE` in Vercel to your deployed Railway URL with `/api` at the end.
- Product image uploads on Railway use ephemeral disk — files may not survive redeploys.
