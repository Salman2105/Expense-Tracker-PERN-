# 💰 Expense Tracker

A full-stack personal expense tracking application built on the **PERN**
stack (PostgreSQL, Express, React, Node.js) — track income and expenses,
organize them by category, and see where your money goes on a live
dashboard.

<p align="left">
  <img alt="node" src="https://img.shields.io/badge/node-24.x-339933?logo=node.js&logoColor=white">
  <img alt="express" src="https://img.shields.io/badge/express-5-000000?logo=express&logoColor=white">
  <img alt="prisma" src="https://img.shields.io/badge/prisma-7-2D3748?logo=prisma&logoColor=white">
  <img alt="postgres" src="https://img.shields.io/badge/postgresql-15-336791?logo=postgresql&logoColor=white">
  <img alt="react" src="https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black">
  <img alt="tests" src="https://img.shields.io/badge/tests-58%20passing-brightgreen">
  <img alt="license" src="https://img.shields.io/badge/license-ISC-blue">
</p>

---

## ✨ Features

- 🔐 **Authentication** — registration, login, JWT sessions, account
  status, and self-service soft account deletion with a scheduled
  hard-delete cleanup job after a retention window
- 🗂️ **Categories** — global default categories plus per-user custom
  categories, each tagged `INCOME` or `EXPENSE`
- 💸 **Transactions** — full CRUD with pagination, filtering by type /
  category / date range, and strict ownership + type-consistency checks
- 📊 **Dashboard** — total income/expenses, current balance, this month's
  spending, per-category breakdown, and transaction counts
- ⚙️ **User settings** — theme, currency, language, and notification
  preferences, auto-provisioned with sensible defaults
- 🛡️ **Hardened by default** — Helmet, CORS allowlisting, HTTP parameter
  pollution protection, request-body size limits, and rate-limited auth
  endpoints
- 📜 **Self-documenting API** — Swagger UI at `/api-docs`

## 🏗️ Tech Stack

| Layer         | Technology |
|---------------|------------|
| Frontend      | React 19, Vite, ESLint |
| Backend       | Node.js, Express 5 |
| Database      | PostgreSQL, Prisma ORM (`@prisma/adapter-pg`) |
| Auth          | JWT (`jsonwebtoken`), `bcrypt` password hashing |
| Validation    | Custom Express middleware, per-resource |
| Logging       | Winston (console + rotating log files) |
| API docs      | `swagger-jsdoc` + `swagger-ui-express` |
| Scheduling    | `node-cron` (account cleanup job) |
| Testing       | Jest + Supertest (58 API tests) |
| Linting       | ESLint 10 (flat config) |

## 📁 Project Structure

```
Expense Tracker/
├── frontend/                 React + Vite client
│   └── src/
├── Server/                   Express + Prisma API
│   ├── config/                env, database, Prisma client, Swagger setup
│   ├── prisma/                 schema, migrations, seed script
│   ├── src/
│   │   ├── app.js               Express app wiring (middleware, routes)
│   │   ├── routes/               endpoint definitions per resource
│   │   ├── controllers/          HTTP request/response handling
│   │   ├── services/             business logic + orchestration
│   │   ├── repositories/         all Prisma queries, one file per model
│   │   ├── middleware/           auth, validation, rate limiting, logging
│   │   ├── constants/            shared cross-cutting constants
│   │   ├── utils/                AppError, JWT helpers, logger, response shape
│   │   └── jobs/                 scheduled account-cleanup job
│   ├── tests/                  Jest + Supertest API tests
│   └── REPORT.md               Backend refactor write-up (architecture,
│                                 quality gates, documented behavior changes)
└── README.md                 you are here
```

## 🧬 Data Model

```
User ──1:1── UserSettings
 │
 ├──1:N── Category ──1:N── Transaction
 │                              │
 └──────────────1:N─────────────┘
```

- `User.status`: `ACTIVE` | `SUSPENDED`
- `Category.type` / `Transaction.type`: `INCOME` | `EXPENSE`
- `UserSettings.theme`: `LIGHT` | `DARK` | `SYSTEM`
- Categories with `isDefault = true` and no `userId` are global and
  available to every user; custom categories belong to exactly one user.

## 🚀 Getting Started

### Prerequisites

- Node.js 24+
- A PostgreSQL 15+ instance (local, Docker, or hosted)

### 1. Clone & install

```bash
git clone https://github.com/Salman2105/Expense-Tracker-PERN-.git
cd "Expense Tracker"

cd Server && npm install
cd ../frontend && npm install
```

### 2. Configure the backend

Create `Server/.env`:

```env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<database>

JWT_SECRET=<a random string, at least 32 characters>
JWT_EXPIRES_IN=7d

LOG_LEVEL=info
```

Don't have Postgres running locally? The quickest option is Docker:

```bash
docker run -d --name expense-tracker-db \
  -e POSTGRES_USER=expense -e POSTGRES_PASSWORD=expense_pw \
  -e POSTGRES_DB=expense_tracker -p 5432:5432 postgres:15-alpine
```

### 3. Set up the database

```bash
cd Server
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts   # optional: seeds global default categories
```

### 4. Run it

```bash
# backend — http://localhost:3000
cd Server
npm run dev

# frontend — http://localhost:5173 (in a separate terminal)
cd frontend
npm run dev
```

Once the backend is running, interactive API docs are available at
`http://localhost:3000/api-docs`.

## 🧪 Testing & Quality

From `Server/`:

```bash
npm test        # Jest + Supertest — 58 API tests against a live Postgres DB
npm run lint     # ESLint
```

The test suite needs a reachable `DATABASE_URL`; point it at a disposable
database, since tests reset the relevant tables between runs.

## 📡 API Overview

All endpoints are prefixed with `/api` and return
`{ success, message?, data? }` on success or
`{ success: false, message, error?: { code } }` on failure.

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Account | `GET /account/status`, `DELETE /account/delete` |
| Users | `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/password` |
| Settings | `GET/POST/PATCH /users/me/settings` |
| Categories | `GET/POST /categories`, `PATCH/DELETE /categories/:categoryId` |
| Transactions | `GET/POST /transactions`, `GET/PATCH/DELETE /transactions/:transactionId` |
| Dashboard | `GET /dashboard` |

Every route except registration/login requires a `Authorization: Bearer <token>`
header. See `/api-docs` for full request/response schemas.

## 🔒 Security Notes

- Passwords are hashed with `bcrypt` (cost factor 12); JWTs are signed with
  `HS256` and expire per `JWT_EXPIRES_IN`.
- Auth endpoints are rate-limited (10 requests / 15 minutes per IP).
- Soft-deleted accounts are anonymized and permanently purged after a
  30-day retention window by a nightly scheduled job.
- Centralized error handling ensures unexpected (5xx) errors never leak
  internal messages or stack traces to clients.

## 📝 Recent Backend Refactor

The backend recently went through a full clean-architecture / SOLID
refactor — see [`Server/REPORT.md`](Server/REPORT.md) for the complete
before/after breakdown, every deliberate behavior change (all documented
and test-verified), and known issues left for a product decision.

## 📄 License

ISC
