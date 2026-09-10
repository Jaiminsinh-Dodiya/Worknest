# WorkNest Backend REST API

High-performance, secure backend REST API for **WorkNest** (Company Project & Workforce Management).

Built with **Node.js**, **TypeScript**, **Express**, **Prisma ORM**, and **PostgreSQL**.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES2022 / NodeNext modules)
- **Language**: TypeScript 5.7+
- **Web Framework**: Express 4.21+
- **ORM**: Prisma ORM 6+
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) with Access Token (15m) & Refresh Token (7d)
- **Security**: bcrypt (password hashing), Helmet (HTTP headers), CORS
- **Validation**: Zod (type-safe request schema validation)
- **Execution & Dev**: `tsx` (fast zero-config TypeScript runner)

---

## 📁 Architecture Overview

```
backend/
├── prisma/
│   ├── schema.prisma          # Prisma schema (models: Company, User, Project, Task)
│   └── seed.ts                # Database seeder matching frontend mock data
├── src/
│   ├── index.ts               # Express bootstrap, security middleware, route mounts
│   ├── config/
│   │   └── env.ts             # Typed environment configuration
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   ├── rbac.ts            # Role and permission enforcement
│   │   ├── validate.ts        # Zod request validator
│   │   └── errorHandler.ts    # Centralized HTTP & Prisma error handler
│   ├── routes/
│   │   ├── auth.routes.ts     # /api/auth (login, refresh, logout, me)
│   │   ├── company.routes.ts  # /api/admin/companies, /api/companies/:id
│   │   ├── user.routes.ts     # /api/users
│   │   ├── project.routes.ts  # /api/projects
│   │   └── task.routes.ts     # /api/tasks, /api/tasks/my
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── company.controller.ts
│   │   ├── user.controller.ts
│   │   ├── project.controller.ts
│   │   └── task.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── company.service.ts
│   │   ├── user.service.ts
│   │   ├── project.service.ts
│   │   └── task.service.ts
│   ├── types/
│   │   └── index.ts           # TokenPayload, Request extension
│   └── utils/
│       ├── errors.ts          # AppError hierarchy (400, 401, 403, 404, 500)
│       └── prisma.ts          # PrismaClient singleton
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🔐 Canonical Roles & RBAC

The backend strictly implements the 5 canonical WorkNest roles:

1. **`SUPER_ADMIN`**: Platform-wide super administrator (`companyId: null`). Can manage all companies, users, projects, and tasks across all tenants.
2. **`COMPANY_OWNER`**: Tenant root administrator. Full access to company-scoped users, projects, and tasks.
3. **`HR`**: Human resources. Can view and manage employees within their company.
4. **`MANAGER`**: Team manager. Can manage company projects and tasks.
5. **`EMPLOYEE`**: Individual contributor. Scoped to assigned projects and tasks; can update status of assigned tasks.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database instance running locally or in Docker

### 2. Configure Environment
Copy `.env.example` to `.env` and set your PostgreSQL connection string:

```bash
cp .env.example .env
```

Example `.env`:
```ini
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/worknest?schema=public"
JWT_SECRET="your_secret_key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your_refresh_secret_key"
JWT_REFRESH_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

### 3. Generate Prisma Client & Migrate Database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Seed Database

Populate database with all 3 companies, 12 demo users, 5 projects, and 13 tasks:

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`.
Health check: `http://localhost:3001/api/health`

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login`: Login with email & password. Returns access token, refresh token, and sanitized user.
- `POST /api/auth/refresh`: Exchange refresh token for a new access token.
- `POST /api/auth/logout`: Invalidate session.
- `GET /api/auth/me`: Get current authenticated user profile.

### Companies (Super Admin & Tenant)
- `GET /api/admin/companies`: List all companies (Super Admin only).
- `POST /api/admin/companies`: Register new company (Super Admin only).
- `GET /api/companies/:id`: View company details (Tenant-scoped).

### Users
- `GET /api/users`: List users (Company-scoped or all for Super Admin).
- `GET /api/users/:id`: View user profile.
- `POST /api/users`: Create user with bcrypt password (`users.manage`).
- `PATCH /api/users/:id`: Update user profile.
- `PATCH /api/users/:id/status`: Toggle user Active/Inactive.

### Projects
- `GET /api/projects`: List projects (Scoped: Super Admin -> all, Owner -> company, Manager -> managed/assigned, Employee -> assigned).
- `GET /api/projects/:id`: Project details with team members and tasks.
- `POST /api/projects`: Create project (`projects.manage`).
- `PATCH /api/projects/:id`: Update project details or progress.

### Tasks
- `GET /api/tasks`: List tasks (Role-scoped, optional `?projectId=` filter).
- `GET /api/tasks/my`: Get current user's assigned tasks.
- `GET /api/tasks/:id`: Get task details.
- `POST /api/tasks`: Create task (`tasks.manage`).
- `PATCH /api/tasks/:id`: Update task (Managers/Owners update full task; Employees update assigned task status).
- `DELETE /api/tasks/:id`: Delete task (`tasks.manage`).
