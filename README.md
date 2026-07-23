<<<<<<< HEAD
# Expense Voucher Management System

A full-stack web app that digitizes ABC Company's expense voucher workflow: employees create and submit vouchers, the Director approves or rejects them, and the Accounts Team monitors everything for reimbursement.

```
expense-voucher-system/
├── server/   → Node.js + Express + Sequelize API
└── client/   → React (Vite) + Tailwind frontend
```

## 1. Tech Stack

| Layer     | Choice |
|-----------|--------|
| Frontend  | React 19, Vite, React Router, Tailwind CSS v4, Axios |
| Backend   | Node.js, Express, Sequelize ORM |
| Database  | SQLite by default (zero-config); PostgreSQL supported via env var |
| Auth      | JWT (JSON Web Tokens), bcrypt password hashing |
| File Upload | Multer (signature images, stored on disk under `server/uploads/signatures`) |

## 2. Setup Instructions

### Prerequisites
- Node.js 18+ and npm

### Backend
```bash
cd server
cp .env.example .env      # defaults work out of the box (SQLite)
npm install
npm run seed               # creates one demo user per role
npm run dev                 # starts API on http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev                 # starts app on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` requests to `http://localhost:5000`, so no CORS configuration is needed in development (see `client/vite.config.js`).

### Demo Logins (created by `npm run seed`)
| Role      | Email                    | Password     |
|-----------|---------------------------|--------------|
| Employee  | employee@company.com      | password123  |
| Director  | director@company.com      | password123  |
| Accounts  | accounts@company.com      | password123  |

### Switching to PostgreSQL
Edit `server/.env`:
```
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_voucher_db
DB_USER=postgres
DB_PASSWORD=postgres
```
Then create the database (`createdb expense_voucher_db`) and restart the server — Sequelize will create the tables automatically on first run (`sequelize.sync()` in `server/server.js`).

## 3. Database Schema

### `users`
| Column        | Type                                   | Notes                     |
|---------------|-----------------------------------------|----------------------------|
| id            | INTEGER, PK, autoincrement              |                            |
| name          | STRING                                  |                            |
| email         | STRING, unique                          | login identifier           |
| password      | STRING                                  | bcrypt hash                |
| role          | ENUM('employee','director','accounts')  |                            |
| department    | STRING                                  | optional                   |
| employeeCode  | STRING                                  | optional                   |

### `vouchers`
| Column               | Type                                                                 | Notes |
|----------------------|------------------------------------------------------------------------|-------|
| id                   | INTEGER, PK                                                            | |
| voucherNumber        | STRING, unique                                                         | auto-generated, e.g. `EV-2026-00001` |
| voucherDate          | DATEONLY                                                               | set at creation |
| expenseDate          | DATEONLY                                                               | mandatory |
| department           | STRING                                                                 | mandatory |
| expenseTitle         | STRING                                                                 | mandatory |
| expenseCategory      | STRING                                                                 | |
| expenseDescription   | TEXT                                                                   | |
| amount               | DECIMAL(12,2)                                                          | mandatory, must be > 0 |
| status               | ENUM('draft','submitted','pending_approval','approved','rejected')    | |
| employeeId           | INTEGER, FK → users.id                                                 | |
| employeeSignatureUrl | STRING                                                                 | required before submit |
| directorSignatureUrl | STRING                                                                 | required before approval |
| approvalDate         | DATE                                                                   | set on approve/reject |
| rejectionReason      | TEXT                                                                   | required on reject |
| approvedById         | INTEGER, FK → users.id                                                 | the director who acted |
| createdAt / updatedAt| DATE                                                                   | audit trail (Sequelize timestamps) |

Tables are created automatically via `sequelize.sync()` on server start — no separate migration step is required for the default SQLite setup.

## 4. Voucher Workflow

```
Draft → (employee submits, signature required) → Pending Approval
Pending Approval → (director approves, signature required) → Approved
Pending Approval → (director rejects, reason required) → Rejected
```
- Only Draft vouchers can be edited or deleted, and only by their owner.
- Once submitted, a voucher is read-only for the employee.
- Approved vouchers are read-only and visible to the Accounts Team.

## 5. API Documentation

Base URL: `http://localhost:5000/api`
All routes except `/auth/login` require `Authorization: Bearer <token>`.

### Auth
| Method | Route          | Access | Description |
|--------|----------------|--------|--------------|
| POST   | `/auth/login`  | Public | Returns `{ token, user }` |
| GET    | `/auth/me`     | Any    | Returns current user profile |

### Vouchers
| Method | Route                        | Access             | Description |
|--------|-------------------------------|---------------------|--------------|
| GET    | `/vouchers`                    | Any                 | List vouchers, scoped to own for employees; supports query params below |
| GET    | `/vouchers/:id`                 | Any (owner/director/accounts) | Voucher detail |
| POST   | `/vouchers`                     | Employee            | Create a Draft voucher |
| PUT    | `/vouchers/:id`                  | Employee (owner)    | Edit a Draft voucher |
| DELETE | `/vouchers/:id`                  | Employee (owner)    | Delete a Draft voucher |
| POST   | `/vouchers/:id/signature`         | Employee (owner)    | Upload employee signature (`multipart/form-data`, field `signature`) |
| POST   | `/vouchers/:id/submit`            | Employee (owner)    | Draft → Pending Approval |
| POST   | `/vouchers/:id/approve`           | Director             | Pending → Approved (`multipart/form-data`, optional field `signature`) |
| POST   | `/vouchers/:id/reject`            | Director             | Pending → Rejected, body `{ rejectionReason }` |

**List query params** (`GET /vouchers`): `voucherNumber`, `employeeName`, `department`, `category`, `status`, `dateFrom`, `dateTo`, `amountMin`, `amountMax`, `sortBy` (`createdAt`\|`amount`\|`expenseDate`\|`status`\|`voucherNumber`), `sortOrder` (`ASC`\|`DESC`).

### Dashboard
| Method | Route         | Access | Description |
|--------|----------------|--------|--------------|
| GET    | `/dashboard`   | Any    | Role-specific aggregated stats |

## 6. Assumptions Made During Development

- **Database default:** SQLite is used by default so the project runs with zero external setup; PostgreSQL is fully supported by switching `DB_DIALECT` in `.env` (Sequelize models are dialect-agnostic).
- **Voucher numbering:** generated server-side as `EV-<year>-<5-digit-sequence>`, resetting each calendar year.
- **"Submitted" vs "Pending Approval":** the spec's workflow diagram shows both as sequential states with no distinct action between them, so submitting a voucher moves it directly to `pending_approval` (the `submitted` enum value is kept in the schema for forward compatibility, e.g. if an intermediate review step is added later).
- **Director signature:** since the Director's signature is a personal asset reused across approvals, it can either be uploaded fresh at the time of approval or (if already on file for a prior approval in the same session) reused — the "Approve" button prompts for a signature file only when one isn't already attached to that voucher.
- **Accounts Team downloads:** listed in the spec as optional; not implemented in this version. The Accounts dashboard and voucher detail views are fully read-only per the spec's restrictions.
- **Search/filter/sort:** implemented as a bonus feature per the spec, available to both the Director and Accounts Team.
- **Employee ID field:** stored as an optional `employeeCode` on the user profile rather than being entered per-voucher, since it's a property of the employee, not the expense.
- **Auth session:** JWT stored in `localStorage` on the client; token expires after 8 hours by default (`JWT_EXPIRES_IN` in `.env`).

## 7. Suggested Screens (implemented)

- **Auth:** Login
- **Employee:** Dashboard, Create Voucher, My Vouchers, Voucher Details, Edit Draft Voucher
- **Director:** Dashboard, Pending Approvals, All Vouchers, Voucher Details (approve/reject)
- **Accounts:** Dashboard, All Vouchers (read-only), Voucher Details
=======
# expense-voucher-system
>>>>>>> d554696e6dd3237998475d05058d22e92100b60f
