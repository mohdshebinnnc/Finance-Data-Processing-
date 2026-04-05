# Finance Dashboard Backend

A RESTful API backend for a finance dashboard system with role-based access control, financial records management, and dashboard analytics.

## Features

- **User Management**: Create, update, and manage users with roles
- **Role-Based Access Control**: Three roles (Viewer, Analyst, Admin) with different permissions
- **Financial Records CRUD**: Full CRUD operations with filtering, sorting, and pagination
- **Dashboard Analytics**: Summary, category breakdown, trends, and recent activity
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Zod schema validation
- **Rate Limiting**: Protection against abuse

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Security**: Helmet, bcryptjs, express-rate-limit

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env` and update the database URL:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/finance_db"
JWT_SECRET="your-super-secret-key-change-in-production-minimum-32-chars"
JWT_EXPIRES_IN="24h"
PORT=3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Seed Data (Optional)

```bash
npm run db:seed
```

This creates test users and sample transactions.

### 5. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@finance.com | password123 |
| Analyst | analyst@finance.com | password123 |
| Viewer | viewer@finance.com | password123 |

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get current user | Yes |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update user |
| PATCH | `/api/users/:id/role` | Update user role |
| PATCH | `/api/users/:id/status` | Update user status |
| DELETE | `/api/users/:id` | Delete user |

### Transactions

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/transactions` | List transactions | All |
| POST | `/api/transactions` | Create transaction | Analyst, Admin |
| GET | `/api/transactions/:id` | Get transaction | All |
| PUT | `/api/transactions/:id` | Update transaction | Analyst, Admin |
| DELETE | `/api/transactions/:id` | Delete transaction | Admin |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Total income/expenses/net |
| GET | `/api/dashboard/by-category` | Category breakdown |
| GET | `/api/dashboard/trends` | Monthly trends |
| GET | `/api/dashboard/recent` | Recent transactions |

## Role Permissions

| Action | Viewer | Analyst | Admin |
|--------|--------|---------|-------|
| View own transactions | ✓ | ✓ | ✓ |
| View all transactions | - | - | ✓ |
| Create transactions | ✗ | ✓ | ✓ |
| Update transactions | ✗ | ✓ | ✓ |
| Delete transactions | ✗ | ✗ | ✓ |
| View dashboard | ✓ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✓ |

## Query Parameters

### Transactions List

```bash
GET /api/transactions?type=INCOME&category=Salary&fromDate=2024-01-01&toDate=2024-12-31&page=1&limit=10&sortBy=date&sortOrder=desc
```

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | INCOME or EXPENSE |
| category | string | Filter by category |
| fromDate | string | Start date (ISO) |
| toDate | string | End date (ISO) |
| minAmount | number | Minimum amount |
| maxAmount | number | Maximum amount |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| sortBy | string | date, amount, createdAt |
| sortOrder | string | asc or desc |

### Dashboard Trends

```bash
GET /api/dashboard/trends?months=6
```

## Example Requests

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@finance.com", "password": "password123"}'
```

### Create Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 5000, "type": "INCOME", "category": "Salary"}'
```

### Get Dashboard Summary

```bash
curl http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Project Structure

```
src/
├── config/
│   └── database.ts         # Prisma client
├── middleware/
│   ├── auth.ts             # JWT authentication
│   ├── rbac.ts             # Role-based access control
│   ├── errorHandler.ts     # Error handling
│   └── rateLimit.ts        # Rate limiting
├── routes/
│   ├── auth.ts             # Auth routes
│   ├── users.ts            # User management routes
│   ├── transactions.ts    # Transaction routes
│   └── dashboard.ts        # Dashboard routes
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── transaction.service.ts
│   └── dashboard.service.ts
├── types/
│   └── index.ts            # TypeScript types
├── utils/
│   ├── ApiError.ts         # Custom error class
│   └── validator.ts        # Zod validation
└── index.ts                # Entry point
```

## Assumptions

1. **Database**: PostgreSQL is used. For SQLite, change provider in schema.prisma
2. **Auth**: Uses JWT tokens with 24-hour expiry
3. **Soft Delete**: Not implemented (uses hard delete)
4. **Pagination**: Implemented for transactions and users list

## License

ISC
