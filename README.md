# Stationery Shop Inventory & Billing Management System

A full-stack web application built as a **Community Engagement Project (CEP)** for a real local stationery shop. It helps the shop owner manage products, inventory, billing, invoices, customers, and sales reports — replacing manual notebooks/registers with a proper digital system.

---

## Problem Statement

Small stationery shops typically track inventory and sales on paper or in scattered notebooks. This leads to:
- No real-time visibility into stock levels (leading to stockouts or overstocking)
- No easy way to generate professional invoices
- No sales history or reporting for business decisions
- Manual, error-prone billing calculations

This project solves that by giving the shop a simple, role-based web application to manage the entire sales & inventory workflow.

## Objectives

- Digitize product & inventory management for a real stationery shop
- Provide a fast billing/POS screen for daily sales
- Automatically update stock on every sale — no manual stock tracking
- Generate professional, downloadable invoices
- Give the owner visibility through a dashboard and reports
- Support two roles (Owner, Staff) with proper access control

## Features

- **Authentication** — JWT-based login, hashed passwords, role-based route protection (backend-enforced, not just hidden buttons)
- **Product & Inventory Management** — full CRUD, categories, search/filter/sort, low-stock indicators
- **Billing / POS** — fast product search, cart, stock validation, discount + GST calculation, multiple payment methods
- **Automatic Stock Deduction** — every completed sale reduces stock atomically on the backend (MongoDB transactions)
- **Stock Management** — purchase/add stock, manual adjustments with reasons, full stock movement audit trail
- **Customers** — optional customer linking on bills, purchase history per customer
- **Sales History** — searchable/filterable list of all past bills
- **Invoices** — unique invoice numbers (`INV-2026-00001`), downloadable PDF, print support
- **Dashboard & Reports** — today's sales, low stock alerts, sales trend chart, best-selling products, stock valuation
- **Settings** — shop info, tax defaults, invoice footer message
- **Staff Management** — owner can create/disable staff accounts

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Axios, Lucide Icons, Recharts, jsPDF
**Backend:** Node.js, Express.js, JWT, bcryptjs
**Database:** MongoDB (Mongoose ODM), designed for MongoDB Atlas
**Deployment target:** Frontend → Vercel · Backend → Render · Database → MongoDB Atlas

## Architecture

```
┌─────────────────┐      HTTPS/JSON       ┌──────────────────┐      Mongoose      ┌─────────────┐
│   React (Vite)   │  ──────────────────►  │  Express.js API   │  ───────────────►  │  MongoDB    │
│   Frontend        │  ◄──────────────────  │  (JWT protected)  │  ◄───────────────  │  Atlas      │
└─────────────────┘      Axios calls       └──────────────────┘                     └─────────────┘
     Vercel                                        Render
```

The frontend never talks to MongoDB directly — every request goes through the Express REST API, which validates roles, stock, and prices before touching the database. This is what makes it safe to trust totals and stock counts: they are always calculated and enforced server-side, never taken from the browser.

## Database Structure

| Collection | Purpose |
|---|---|
| `users` | Owner/staff accounts, hashed passwords, role |
| `products` | Product catalog with pricing, stock, category |
| `bills` | Completed sales — items are a **snapshot** so old invoices stay correct even if a product is later edited/deleted |
| `customers` | Optional customer records |
| `stockmovements` | Audit trail of every stock change (SALE, PURCHASE, RETURN, ADJUSTMENT) |
| `shopsettings` | Singleton document holding shop name, address, tax defaults, etc. |

## Project Structure

```
stationery-shop-system/
├── server/              # Express backend
│   └── src/
│       ├── config/      # DB connection
│       ├── models/      # Mongoose schemas
│       ├── controllers/ # Business logic
│       ├── routes/      # API route definitions
│       ├── middleware/  # Auth, role, error handling
│       └── utils/       # JWT, invoice numbering, seed script
└── client/              # React frontend
    └── src/
        ├── components/  # Reusable UI + layout components
        ├── pages/       # One file per screen
        ├── layouts/     # Dashboard shell (sidebar + navbar)
        ├── routes/      # React Router setup + route guards
        ├── context/     # Auth state
        └── services/    # Axios API calls, one file per resource
```

## Installation & Running Locally

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free tier is enough) — see below

### 1. Set up MongoDB Atlas
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free (M0) cluster
3. Under **Database Access**, create a database user (username + password)
4. Under **Network Access**, allow your IP (or `0.0.0.0/0` for development)
5. Click **Connect → Drivers**, copy the connection string

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/stationery-shop
JWT_SECRET=<generate a random string, see below>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Generate a random JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Seed demo data (creates a default owner + staff login and sample products):
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

Server runs at `http://localhost:5000`. Test it: `GET http://localhost:5000/api/health`

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env` if your backend runs on a different URL:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

App runs at `http://localhost:5173`.

### Default Login (after running `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Owner | owner@shop.com | owner123 |
| Staff | staff@shop.com | staff123 |

**Change these credentials before using this with a real shop.**

## Environment Variables

**server/.env**
| Variable | Description |
|---|---|
| `PORT` | Port the backend runs on |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens — keep this private |
| `JWT_EXPIRES_IN` | Token validity period (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL, used for CORS |

**client/.env**
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API |

Never commit `.env` files — only `.env.example` is tracked in git.

## API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/register` | Register a user | Public |
| GET | `/api/products` | List products (search/filter/sort/paginate) | Owner, Staff |
| POST | `/api/products` | Create product | Owner |
| PUT | `/api/products/:id` | Update product | Owner |
| DELETE | `/api/products/:id` | Delete product | Owner |
| POST | `/api/bills` | Create a bill (deducts stock automatically) | Owner, Staff |
| GET | `/api/bills` | Sales history | Owner, Staff |
| GET | `/api/bills/:id` | Single invoice | Owner, Staff |
| POST | `/api/stock/add` | Add purchased stock | Owner |
| POST | `/api/stock/adjust` | Manual stock adjustment | Owner |
| GET | `/api/stock/movements` | Stock audit trail | Owner |
| GET/POST/PUT/DELETE | `/api/customers` | Customer management | Owner, Staff (delete: Owner) |
| GET | `/api/reports/dashboard` | Dashboard stats | Owner, Staff |
| GET | `/api/reports/sales-chart` | Sales trend | Owner, Staff |
| GET | `/api/reports/best-selling` | Best-selling products | Owner |
| GET | `/api/reports/stock` | Full stock report | Owner |
| GET/POST/PUT/DELETE | `/api/users` | Staff management | Owner only |
| GET/PUT | `/api/settings` | Shop settings | GET: all, PUT: Owner |

All routes except `/auth/login` and `/auth/register` require `Authorization: Bearer <token>`.

## Core Business Logic — Automatic Stock Deduction

This is the most important part of the system for the CEP viva. When a bill is created (`POST /api/bills`):

1. The request contains only `{ productId, quantity }` per item — **never** prices or totals.
2. The backend re-fetches each product from MongoDB and validates stock availability.
3. Prices, tax, and totals are calculated **entirely on the backend**.
4. Stock is deducted and a `StockMovement` audit record is created.
5. All of this happens inside a **MongoDB transaction** — if any item fails validation, nothing is saved (no partial bills, no partial stock changes).
6. The `Bill` document stores a **snapshot** of product name/price/quantity, so it stays correct even if the product is edited or deleted later.

## Deployment

### Backend → Render
1. Push this repo to GitHub
2. Create a new **Web Service** on Render, connect your repo, set root directory to `server`
3. Build command: `npm install` · Start command: `npm start`
4. Add environment variables (`MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_ENV=production`)

### Frontend → Vercel
1. Import the repo into Vercel, set root directory to `client`
2. Framework preset: Vite
3. Add environment variable `VITE_API_BASE_URL` pointing to your deployed Render URL + `/api`
4. Deploy

### After deployment
- Update `CLIENT_URL` in Render's environment variables to your live Vercel URL (for CORS)
- Update `VITE_API_BASE_URL` in Vercel to your live Render URL

## Future Scope

- Barcode scanning for faster billing
- WhatsApp bill sharing
- Advanced GST reports
- Supplier management & expense tracking
- Profit/loss analysis
- Multi-shop support
- Excel import/export for inventory

## Author

B.Sc. Information Technology student — Community Engagement Project, 2026.
