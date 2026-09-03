# WorkNest Project Roadmap & Backend Integration Plan

This roadmap outlines the development phases for turning the **WorkNest** frontend prototype into a full-stack, enterprise-ready SaaS desktop platform.

---

## 🗺️ Phases Overview

```
Phase 1: Frontend Desktop Prototype  [ ✅ COMPLETED ]
   ├── Electron + Vite + React 18
   ├── macOS-style Frameless TitleBar & Window Controls
   ├── 7 Core Application Screens
   ├── Centralized Global State & Mock Data Layer
   └── Standalone Windows .exe Packaging (NSIS & Portable)

Phase 2: ASP.NET Core Backend API     [ 🔄 UPCOMING ]
   ├── C# ASP.NET Core 8 Web API
   ├── JWT Authentication & Refresh Token Flow
   ├── Entity Framework Core ORM
   └── SQL Server Database Schema & Migrations

Phase 3: Multi-Tenancy & RBAC Engine  [ ⏳ PLANNED ]
   ├── Tenant Isolation (Company Schema Partitioning)
   ├── Role-Based Access Control Middleware (Owner, HR, Manager, Employee)
   └── Permission Guards on Project and Task Management

Phase 4: NVIDIA AI API Integration   [ ⏳ PLANNED ]
   ├── Real AI integration via NVIDIA API / NIM
   ├── Natural language project querying & automated status report generation
   └── Smart task prioritization & workload balancing algorithms
```

---

## 📋 Phase 2 Milestone Checklist (Backend Architecture)

- [ ] **Database Design**:
  - `Companies` Table (Tenant ID, Name, Plan, Tier)
  - `Users` Table (Id, CompanyId, Email, PasswordHash, Role, Department, Status)
  - `Projects` Table (Id, CompanyId, Name, ManagerId, Progress, Status, DueDate)
  - `Tasks` Table (Id, ProjectId, AssigneeId, Title, Priority, Status, DueDate)
- [ ] **API Endpoints**:
  - `POST /api/auth/login` & `POST /api/auth/refresh`
  - `GET/POST/PUT /api/users`
  - `GET/POST/PUT /api/projects`
  - `GET/POST/PUT/DELETE /api/tasks`
  - `POST /api/ai/chat` (proxying to NVIDIA API)
- [ ] **Frontend API Integration**:
  - Replace mock services with Axios/Fetch HTTP client.
  - Implement token storage and auto-refresh interceptors.
