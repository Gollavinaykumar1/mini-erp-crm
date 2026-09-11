# Mini ERP + CRM Operations Portal

A production-quality internal business management system built as a full-stack web application. It combines **ERP** (inventory, stock movements, sales challans) with **CRM** (customer management, follow-ups) functionality, role-based access control, and atomic database transactions.

---

## Business Problem

Small and mid-sized businesses often struggle with:
- Tracking customer relationships and follow-up schedules
- Managing product stock levels across warehouses
- Creating and confirming sales challans without overselling
- Providing different levels of access to different staff roles

This portal solves all of the above in a single cohesive internal tool.

---

## Features

- **JWT Authentication** — Secure stateless login with bcrypt password hashing
- **Role-Based Access Control (RBAC)** — Four roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`
- **Customer CRM** — Full customer lifecycle management with follow-up notes and scheduled dates
- **Product Management** — Product catalog with SKU, category, pricing, and stock levels
- **Inventory Tracking** — Manual IN/OUT stock movements with reasons and audit trail
- **Sales Challans** — Create draft challans, add multiple products, confirm to deduct stock atomically
- **Low Stock Alerts** — Dashboard shows products below minimum stock threshold
- **Pagination & Search** — All list views support server-side pagination and search
- **Responsive UI** — Clean admin dashboard works on desktop and tablet

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router DOM v6 |
| Styling | Vanilla CSS (custom design system, no Tailwind) |
| HTTP Client | Axios with JWT interceptors |
| Backend | Node.js 18, Express, TypeScript |
| ORM | Prisma 5 |
| Database | PostgreSQL 15+ |
| Auth | JWT (`jsonwebtoken`), bcrypt |
| Validation | Zod |
| Icons | Lucide React |
| Dev Server | ts-node-dev |

---

## Architecture

```
mini-erp-crm/
├── backend/                  # Express API server
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # Prisma migration files
│   │   └── seed.ts           # Seed script for test data
│   └── src/
│       ├── controllers/      # Route handler logic
│       ├── middleware/        # Auth, RBAC, error handling
│       ├── routes/           # Express route definitions
│       ├── validators/       # Zod request validation schemas
│       ├── app.ts            # Express app setup
│       └── server.ts         # Entry point
├── frontend/                 # React SPA
│   └── src/
│       ├── context/          # AuthContext (global auth state)
│       ├── components/       # Shared components (ProtectedRoute)
│       ├── layouts/          # Admin Layout with sidebar nav
│       ├── pages/            # Module pages (Customers, Products, etc.)
│       ├── services/         # Axios API client
│       └── types/            # TypeScript types
├── postman/                  # Postman collection
├── docker-compose.yml        # Full stack Docker setup
└── README.md
```

---

## Database Schema

```
User          — id, email, passwordHash, name, role (ADMIN|SALES|WAREHOUSE|ACCOUNTS)
Customer      — id, customerName, mobileNumber, email, businessName, gstNumber,
                customerType (RETAIL|WHOLESALE|DISTRIBUTOR), status (LEAD|ACTIVE|INACTIVE),
                address, followUpDate
Followup      — id, customerId→Customer, note, followUpDate, createdBy→User
Product       — id, productName, sku (unique), category, unitPrice, currentStock,
                minimumStock, warehouseLocation
StockMovement — id, productId→Product, quantity, movementType (IN|OUT),
                reason, createdBy→User
Challan       — id, challanNumber (unique), customerId→Customer, totalQuantity,
                status (DRAFT|CONFIRMED|CANCELLED), createdBy→User
ChallanItem   — id, challanId→Challan, productId→Product, productName (snapshot),
                sku (snapshot), unitPrice (snapshot), quantity
```

> **Product Snapshot**: When a challan is created, `productName`, `sku`, and `unitPrice` are copied into `ChallanItem`. This preserves the historical record even if the product is later renamed or repriced.

---

## Authentication & RBAC

| Role | Customers | Products | Inventory | Challans |
|---|---|---|---|---|
| ADMIN | Full access | Full access | Full access | Full access |
| SALES | Read + Write | Read only | Read only | Create + Confirm |
| WAREHOUSE | No access | Read + Write | Full access | Read + Confirm |
| ACCOUNTS | Read only | Read only | Read only | Read only |

Authentication flow:
1. Client POSTs credentials to `/api/auth/login`
2. Server verifies password with bcrypt and returns a signed JWT
3. Client stores JWT in `localStorage` and sends it as `Authorization: Bearer <token>` on every request
4. `authenticate` middleware verifies the JWT on every protected route
5. `authorize(roles[])` middleware checks the user's role against allowed roles

---

## API Overview

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Any | Get current user |

### Customers
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/customers` | Any | List with pagination & search |
| GET | `/api/customers/:id` | Any | Get customer + followups |
| POST | `/api/customers` | ADMIN, SALES | Create customer |
| PUT | `/api/customers/:id` | ADMIN, SALES | Update customer |
| POST | `/api/customers/:id/followups` | ADMIN, SALES | Add follow-up note |

### Products
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Any | List with pagination & search |
| GET | `/api/products/:id` | Any | Get product by ID |
| POST | `/api/products` | ADMIN, WAREHOUSE | Create product |
| PUT | `/api/products/:id` | ADMIN, WAREHOUSE | Update product |

### Inventory
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/inventory/movements` | Any | List movements with pagination |
| POST | `/api/inventory/movements` | ADMIN, WAREHOUSE | Create IN or OUT movement |

### Challans
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/challans` | Any | List with pagination & filter |
| GET | `/api/challans/:id` | Any | Get challan with items |
| POST | `/api/challans` | ADMIN, SALES | Create draft challan |
| POST | `/api/challans/:id/confirm` | ADMIN, SALES, WAREHOUSE | Confirm challan (atomic) |
| POST | `/api/challans/:id/cancel` | ADMIN, SALES | Cancel draft challan |

---

## Local Setup

### Prerequisites
- Node.js v18 or higher
- PostgreSQL 15 or higher (local, Neon, or Supabase)
- npm

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd mini-erp-crm

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Variables

**Backend** — copy and fill in your values:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/mini_erp_crm?schema=public"
JWT_SECRET="your_very_long_random_secret_here_minimum_32_chars"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

**Frontend** — copy and optionally edit:
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

**Create the database** (if using local PostgreSQL):
```sql
CREATE DATABASE mini_erp_crm;
```

**Run migrations** (creates all tables):
```bash
cd backend
npx prisma migrate dev --name init
```

**Seed test data**:
```bash
npm run seed
```

### 4. Run the Application

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

---

## Test Credentials

All passwords are `password123`.

| Email | Role | Access |
|---|---|---|
| admin@erp.com | ADMIN | Full access to everything |
| sales@erp.com | SALES | Customers, Challans (create/confirm) |
| warehouse@erp.com | WAREHOUSE | Products, Inventory, Challans (confirm) |
| accounts@erp.com | ACCOUNTS | Read-only access to all modules |

---

## Docker Setup

Docker Compose spins up the entire stack including a PostgreSQL container.

> Note: The Docker PostgreSQL runs on port **5433** (to avoid conflicting with your local PostgreSQL on 5432).

```bash
# Copy and fill in Docker env vars
cp .env.docker.example .env.docker

# Build and start all services
docker compose --env-file .env.docker up --build

# Services will be available at:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:5000/api
# Database:  localhost:5433
```

**After startup**, run the seed script manually once:
```bash
docker exec mini_erp_backend node -e "require('child_process').execSync('npx ts-node prisma/seed.ts', {stdio: 'inherit'})"
```

Or connect to the container and run it:
```bash
docker exec -it mini_erp_backend sh
# Inside container:
npx ts-node prisma/seed.ts
```

---

## Postman API Testing

1. Open Postman and click **Import**
2. Select `postman/mini-erp-crm.postman_collection.json`
3. The collection includes a `baseUrl` variable (default: `http://localhost:5000/api`)
4. Run **"Login (Admin)"** first — it automatically saves the JWT token to the `token` variable
5. All other requests automatically use this token

---

## Deployment

### Backend → Render

1. Push the project to GitHub
2. Create a new **Web Service** on Render
3. **Root Directory**: `backend`
4. **Build Command**: `npm install && npx prisma generate && npm run build`
5. **Start Command**: `npm start`
6. **Environment Variables** (add in Render dashboard):
   ```
   DATABASE_URL   = <your Neon/Supabase connection string>
   JWT_SECRET     = <long random secret>
   PORT           = 10000
   CORS_ORIGIN    = <your Vercel frontend URL>
   ```

### Frontend → Vercel

1. Create a new project on Vercel from the same GitHub repo
2. **Root Directory**: `frontend`
3. **Framework Preset**: Vite (auto-detected)
4. **Environment Variables** (add in Vercel dashboard):
   ```
   VITE_API_URL = <your Render backend URL>/api
   ```
5. Deploy — Vercel handles the build automatically

### Database → Neon.tech (Recommended)

1. Sign up at [neon.tech](https://neon.tech/)
2. Create a new project and database named `mini_erp_crm`
3. Copy the connection string from the dashboard
4. Use it as `DATABASE_URL` in both Render and local `.env`
5. Run migrations on first deploy via Render's build command

---

## Business Logic Explanation

### Challan Confirmation (Atomic Transaction)

When a challan is confirmed, the following operations happen inside a single **`prisma.$transaction`** call:

1. Fetch the challan and its items
2. For **every** item, check that `product.currentStock >= item.quantity`
3. If **any** item has insufficient stock, the entire transaction is aborted — **no stock is changed**
4. If all items pass the check, for **each** item:
   - Create an `OUT` stock movement record (audit trail)
   - Decrement `product.currentStock` by `item.quantity`
5. Update challan status to `CONFIRMED`

This guarantees atomicity: either everything succeeds together, or nothing changes at all.

### Product Snapshot in ChallanItem

At the time a challan is created (not confirmed), the product's `productName`, `sku`, and `unitPrice` are copied into each `ChallanItem` record. This means:
- Historical challans show the price **at the time of sale**, not the current price
- Renaming or repricing a product does not corrupt old challans
- This is standard practice for invoicing systems

### Stock Cannot Go Negative

Enforced at two levels:
1. **Manual movements** (`POST /inventory/movements`) — the controller checks `currentStock - quantity >= 0` before proceeding
2. **Challan confirmation** — checks all item quantities against current stock before deducting anything

---

## Assumptions & Design Decisions

- Challan cancellation is only allowed for `DRAFT` status (confirmed challans would require stock reversal which is out of scope)
- GST number and address are optional fields on Customer
- All monetary values are stored as `Float` (suitable for INR pricing in this context)
- `followUpDate` on Customer is updated automatically when a new follow-up is added
- The ADMIN role always bypasses role checks and can access everything

---

## Known Limitations

- No file upload / attachment support for challans (out of scope)
- No email notifications for follow-up reminders (out of scope)
- Challan confirmation does not generate a PDF invoice (out of scope)
- No refresh token mechanism (JWT expires in 7 days)
- No soft-delete for customers or products

---

## Production Considerations

- Set a strong, randomly-generated `JWT_SECRET` (minimum 64 characters)
- Use SSL/TLS for the database connection string in production
- Enable HTTPS on both frontend (Vercel handles this) and backend (Render handles this)
- Set `CORS_ORIGIN` exactly to the frontend production URL (no trailing slash)
- Run `npx prisma migrate deploy` (not `migrate dev`) in production
- Consider adding rate limiting to the auth endpoints
