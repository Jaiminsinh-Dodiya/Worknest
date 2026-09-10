# WorkNest Project Roadmap & Backend Integration Plan

This roadmap outlines the development phases for turning the **WorkNest** frontend desktop application into a full-stack, enterprise-grade multi-tenant SaaS platform.

---

## 🗺️ Phases Overview

```text
Phase 1: Desktop Shell & Core UI Prototype     [ ✅ COMPLETED ]
   ├── Electron + Vite + React 18 Desktop Shell
   ├── macOS Frameless Window Controls & TitleBar
   ├── Core Application Screens & UI Component Library
   └── Standalone Windows .exe Packaging (NSIS & Portable)

Phase 2: Role-Based Frontend Architecture      [ ✅ COMPLETED ]
   ├── 5 Canonical Roles (SUPER_ADMIN, COMPANY_OWNER, HR, MANAGER, EMPLOYEE)
   ├── Mock Authentication & Session Persistence (localStorage)
   ├── Route-Level Access Control (RoleRoute Protection)
   ├── Centralized Permission Map & Capability Helpers
   ├── 5 Role-Specific Dashboards via Shared Component Architecture
   ├── Dynamic Role-Aware Sidebar Navigation
   ├── Company-Scoped Multi-Tenant Data Layer
   └── 1-Click Multi-Role Demo Switcher on Login

Phase 3: Node.js Backend & Real Authentication [ ✅ COMPLETED ]
   ├── Node.js + Express REST API (TypeScript) in backend/
   ├── Prisma ORM + PostgreSQL Database Schema & Enums
   ├── JWT Authentication (Access Token 15m + Refresh Token 7d)
   ├── Password Hashing with bcrypt (Salt Rounds = 10)
   ├── Backend RBAC Middleware mirroring ROLES & PERMISSIONS
   ├── Multi-tenant CRUD: Companies, Users, Projects, Tasks
   ├── Database Seeder matching all 12 users, 3 companies, 5 projects, 13 tasks
   └── Complete API Documentation & Seed Instructions

Phase 4: Frontend-Backend API Integration       [ 🔄 UPCOMING ]
   ├── Direct API swap of authService.login() -> POST /api/auth/login
   ├── Session token management with automatic token refresh
   ├── Replace AppContext mock state with REST API queries
   └── Offline/Fallback handling for desktop Electron environment

Phase 5: Production AI Integration             [ ⏳ PLANNED ]
   ├── Real AI integration via NVIDIA AI API / NIM
   ├── Natural language project querying & status generation
   └── Smart workload balancing & automated task prioritization
```

---

## 📋 Phase 3 Milestone Checklist (Node.js Backend & Database)

### 1. Database Schema Design (Prisma + PostgreSQL)
- **`Companies` Model**:
  - `id` (UUID), `name`, `industry`, `size`, `plan` (`Starter` | `Professional` | `Enterprise`), `status`, `createdAt`
- **`Users` Model**:
  - `id` (UUID), `companyId` (nullable for `SUPER_ADMIN`), `name`, `email`, `passwordHash`, `role` (`SUPER_ADMIN` | `COMPANY_OWNER` | `HR` | `MANAGER` | `EMPLOYEE`), `department`, `status`, `avatar`, `joinedAt`
- **`Projects` Model**:
  - `id` (UUID), `companyId`, `name`, `description`, `managerId`, `progress`, `status` (`Active` | `Completed` | `On Hold`), `startDate`, `dueDate`, `createdAt`
- **`Tasks` Model**:
  - `id` (UUID), `projectId`, `assigneeId`, `title`, `description`, `priority` (`High` | `Medium` | `Low`), `status` (`Todo` | `In Progress` | `Completed`), `dueDate`, `createdAt`

### 2. REST API Endpoints
- **Authentication**:
  - `POST /api/auth/login` (returns JWT + sanitized user object)
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- **Company & Tenant Management**:
  - `GET/POST /api/admin/companies` (restricted to `SUPER_ADMIN`)
  - `GET /api/companies/:id`
- **Users**:
  - `GET /api/users` (company-scoped or platform-wide for `SUPER_ADMIN`)
  - `POST /api/users` (restricted to `users.manage`)
  - `PATCH /api/users/:id`
  - `PATCH /api/users/:id/status`
- **Projects & Tasks**:
  - `GET/POST /api/projects`
  - `GET/PATCH /api/projects/:id`
  - `GET/POST /api/tasks`
  - `PATCH /api/tasks/:id` (assignee-only check for `EMPLOYEE`)
  - `DELETE /api/tasks/:id`
- **AI Service Proxy**:
  - `POST /api/ai/chat` (proxy to NVIDIA AI endpoint)

### 3. Frontend Zero-Refactor Transition Plan
Because the frontend architecture has been decoupled:
1. Replace `authService.login()` body with `POST /api/auth/login` call.
2. Replace `AppContext` in-memory state with API fetch calls (`react-query` or `axios`).
3. Retain all existing role configurations, route guards, dashboard widgets, and UI components untouched.
