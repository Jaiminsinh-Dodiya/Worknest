# WorkNest Architecture Documentation

This document provides a comprehensive technical overview of the **WorkNest** architecture, covering the Electron shell, React frontend, Role-Based Access Control (RBAC) engine, mock authentication layer, component hierarchy, multi-tenant data model, and future Node.js backend integration.

---

## 🏗️ System Overview

WorkNest is a desktop-first, multi-tenant workforce and project management platform. The current phase features a fully functional, decoupled frontend with an authentic macOS-style desktop shell, a centralized RBAC permissions engine, and a mock authentication layer designed for zero-refactor backend integration.

```text
WorkNest
│
├── Electron (Desktop Shell)
│   ├── Main Process (Frameless Window, IPC Handlers)
│   └── Preload Layer (Secure contextBridge API)
│
├── React (Frontend Application)
│   ├── App.jsx (HashRouter, Role-Based Route Definitions)
│   ├── AppShell (TitleBar, Role-Aware Sidebar, Topbar, Toast Container)
│   ├── Role Configuration
│   │   ├── roles.js (Canonical ROLES, Labels, Dashboard Paths)
│   │   ├── permissions.js (Role-to-Permission Map & Auth Guards)
│   │   └── navigation.js (Role-Based Sidebar Navigation Specs)
│   ├── Mock Authentication Layer
│   │   ├── authService.js (Credential Validation, Session Persistence)
│   │   └── RoleRoute.jsx (Route Protection & Unauthorized Redirects)
│   ├── Dashboards (Central Router + 5 Role Composers)
│   │   ├── Dashboard.jsx (Central Role Router)
│   │   ├── SuperAdminDashboard.jsx (Platform & Tenant Overview)
│   │   ├── CompanyOwnerDashboard.jsx (Executive Organization Overview)
│   │   ├── HRDashboard.jsx (Workforce & Department Management)
│   │   ├── ManagerDashboard.jsx (Project Pipeline & Team Tasks)
│   │   └── EmployeeDashboard.jsx (Personal Workspace & Deliverables)
│   ├── Shared Dashboard Widgets
│   │   ├── DashboardHeader.jsx
│   │   ├── StatsGrid.jsx
│   │   ├── ProjectOverview.jsx
│   │   ├── TaskList.jsx
│   │   ├── QuickActions.jsx
│   │   └── ActivityFeed.jsx
│   ├── Pages
│   │   ├── Login.jsx (1-Click 5-Role Demo Switcher)
│   │   ├── Users.jsx (Company Staff Directory with Role Guards)
│   │   ├── Projects.jsx (Company Projects Grid with Management Guards)
│   │   ├── ProjectDetails.jsx (Kanban Board with Assignee Status Guards)
│   │   ├── MyTasks.jsx (Personal Task Workspace)
│   │   ├── AdminCompanies.jsx (Super Admin Tenant Directory)
│   │   ├── AdminUsers.jsx (Super Admin Cross-Tenant User Directory)
│   │   ├── AIAssistant.jsx (Mock AI Chat Engine)
│   │   └── Profile.jsx (User Details & Theme Preferences)
│   ├── State & Contexts
│   │   ├── AppContext.jsx (Global Scoped Data, Current User, CRUD Helpers)
│   │   └── ToastContext.jsx (Notification Queue & Toasts)
│   └── Multi-Tenant Mock Data Layer
│       ├── users.js (5 Canonical Roles with Dev Credentials)
│       ├── companies.js (Tenant Organizations)
│       ├── projects.js (Tenant Scoped Projects)
│       ├── tasks.js (Tenant & Project Scoped Tasks)
│       └── aiResponses.js (Domain-Specific AI Flows)
│
└── Future Node.js REST API & Database Backend
    ├── Node.js + Express / Fastify / NestJS (TypeScript)
    ├── JWT Authentication & RBAC Middleware
    └── Prisma ORM + PostgreSQL / MongoDB
```

---

## 🔒 1. Electron IPC & Window Management

The desktop shell operates with a frameless BrowserWindow (`frame: false`, `titleBarStyle: 'hidden'`) using macOS-inspired traffic light window controls.

### Main Process (`electron/main.js`)
- **Window Lifecycle**: Creates an isolated `1280x800` (min `1024x600`) window with `contextIsolation: true` and `nodeIntegration: false`.
- **IPC Handlers**:
  - `window-minimize`: Triggers `win.minimize()`.
  - `window-maximize`: Toggles between `win.maximize()` and `win.unmaximize()`.
  - `window-close`: Executes `win.close()`.

### Preload Script (`electron/preload.js`)
Exposes safe IPC methods via `contextBridge`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
});
```

---

## 👑 2. Canonical Roles & Permissions System

WorkNest enforces **five canonical roles** throughout the entire application. All role references in configuration, state, UI, and data models use these exact uppercase strings.

```typescript
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',     // Platform Owner (Multi-Tenant Overseer)
  COMPANY_OWNER: 'COMPANY_OWNER', // Organization Executive (Tenant Admin)
  HR: 'HR',                       // People & Workforce Operations
  MANAGER: 'MANAGER',             // Project Delivery & Team Lead
  EMPLOYEE: 'EMPLOYEE',           // Individual Contributor
};
```

### Role Matrix & Landing Destinations

| Role | Label | Default Landing Path | Scope of Access |
|---|---|---|---|
| `SUPER_ADMIN` | Super Admin | `/admin` | Cross-tenant platform visibility, tenant company oversight, all platform users. |
| `COMPANY_OWNER` | Company Owner | `/dashboard` | Full organization-level management: projects, employees, tasks, company stats. |
| `HR` | HR | `/hr` | Workforce operations: employee directory, additions, status toggles, departments. |
| `MANAGER` | Manager | `/manager` | Managed projects, team task assignments, delivery pipeline, assigned team members. |
| `EMPLOYEE` | Employee | `/employee` | Personal tasks, assigned project participation, personal task status updates. |

### Centralized Permissions Map (`src/config/permissions.js`)

Permissions are centralized in a declarative mapping rather than scattered conditionals:

```javascript
export const PERMISSIONS = {
  SUPER_ADMIN: [
    'platform.view', 'companies.view', 'companies.manage',
    'users.viewAll', 'users.manage', 'projects.viewAll', 'tasks.viewAll', 'settings.manage'
  ],
  COMPANY_OWNER: [
    'company.view', 'users.view', 'users.manage',
    'projects.view', 'projects.manage', 'tasks.view', 'tasks.manage', 'ai.access'
  ],
  HR: [
    'users.view', 'users.manage', 'ai.access'
  ],
  MANAGER: [
    'projects.view', 'projects.manage', 'tasks.view', 'tasks.manage',
    'team.view', 'ai.access'
  ],
  EMPLOYEE: [
    'tasks.viewOwn', 'tasks.updateOwn', 'projects.viewOwn', 'ai.access'
  ],
};
```

Helper utilities provide clean access checks:
- `hasPermission(role, permission)`: Checks if a role contains a specific capability.
- `hasRole(userRole, allowedRoles)`: Verifies role membership against an allowed list.
- `getRedirectPath(role)`: Returns the safe landing path for unauthorized attempts.

---

## 🛡️ 3. Authentication & Route Protection

### Mock Authentication Service (`src/services/authService.js`)

Authentication is decoupled through an abstraction layer ready for Node.js REST API swap:

1. **`login(email, password)`**: Validates credentials against `mockUsers`, checks active status, strips the plaintext password, and stores the user session in `localStorage` under `worknest_session`.
2. **`logout()`**: Removes `worknest_session` from `localStorage`.
3. **`getCurrentUser()`**: Restores the active user session across page reloads.
4. **`isAuthenticated()`**: Verifies active session presence.

> **Future Backend Integration**: Transitioning to a live backend only requires updating the internal body of `authService.login(email, password)` to dispatch `fetch('/api/auth/login')` or `axios.post('/api/auth/login')`. The AppContext, dashboards, and route guards require zero architectural alterations.

### Route Guard (`src/components/auth/RoleRoute.jsx`)

Restricted routes are wrapped in `<RoleRoute allowedRoles={[...]}>`. If an unauthenticated user attempts access, they are redirected to `/login`. If an authenticated user attempts to access a path outside their authorized roles (e.g. an `EMPLOYEE` navigating to `/admin`), `RoleRoute` redirects them safely to their own role dashboard.

---

## 📊 4. Dashboard Architecture: Composers & Shared Widgets

Rather than duplicating dashboard code across five separate pages, WorkNest uses a **Composer Pattern**:

```text
                       Dashboard.jsx
                    (Role-Based Router)
                            │
      ┌───────────┬─────────┴─────────┬───────────┐
      ▼           ▼                   ▼           ▼
SuperAdmin   CompanyOwner            HR        Manager / Employee
Dashboard     Dashboard           Dashboard       Dashboards
      │           │                   │           │
      └───────────┴─────────┬─────────┴───────────┘
                            ▼
                Shared Dashboard Widgets
     (Header, StatsGrid, ProjectOverview, TaskList,
             QuickActions, ActivityFeed)
```

1. **`Dashboard.jsx`**: Central entry point that inspects `currentUser.role` and renders the matching composer component.
2. **Role Composers** (`src/pages/dashboards/`): Lightweight components (40–100 lines) configuring stats, actions, feeds, and layout.
3. **Shared Widgets** (`src/components/dashboard/`):
   - **`DashboardHeader.jsx`**: Title and personalized role-context subtitle.
   - **`StatsGrid.jsx`**: Responsive grid of `StatCard` elements based on an input metric array.
   - **`ProjectOverview.jsx`**: Project progress list with manager details, timeline dates, and progress bars.
   - **`TaskList.jsx`**: Task table with project tags, assignees, priorities, and deadlines.
   - **`QuickActions.jsx`**: Action buttons with customizable icons, labels, and handlers.
   - **`ActivityFeed.jsx`**: Chronological event logs with badges and timestamps.

---

## 🧭 5. Dynamic Sidebar Navigation

The sidebar navigation (`src/components/layout/Sidebar.jsx`) dynamically evaluates `navigationByRole[currentUser.role]` from `src/config/navigation.js`.

- **Super Admin**: Workspace section titled `WORKNEST` with links to Dashboard (`/admin`), Companies (`/admin/companies`), Platform Users (`/admin/users`).
- **Company Owner**: Workspace section titled `COMPANY` with Dashboard (`/dashboard`), Users (`/users`), Projects (`/projects`), Tasks (`/tasks`), AI (`/ai`).
- **HR**: Workspace section titled `HR` with Dashboard (`/hr`), Users (`/users`), AI (`/ai`).
- **Manager**: Workspace section titled `WORKSPACE` with Dashboard (`/manager`), Projects (`/projects`), My Tasks (`/my-tasks`), Team Tasks (`/tasks`), AI (`/ai`).
- **Employee**: Workspace section titled `MY WORKSPACE` with Dashboard (`/employee`), My Tasks (`/my-tasks`), My Projects (`/projects`), AI (`/ai`).
- **Account (All Roles)**: Profile & Settings (`/profile`), Logout.

---

## 💾 6. Multi-Tenant Data Scoping (`AppContext.jsx`)

Global application state is managed in `src/contexts/AppContext.jsx`. Data isolation is enforced at the context level:

```typescript
// Company-Scoped Accessors in AppContext:
getVisibleUsers(): User[]       // Scoped to currentUser.companyId (Super Admin sees all)
getVisibleProjects(): Project[] // Filtered by company, managerId, or team membership
getVisibleTasks(): Task[]       // Scoped to projects accessible by the current role
getMyTasks(): Task[]            // Tasks assigned strictly to currentUser.id
```

### Data Models

#### Tenant Company (`src/data/companies.js`)
```typescript
interface Company {
  id: string;              // e.g. 'company-1'
  name: string;            // e.g. 'WorkNest Technologies'
  industry: string;
  size: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  status: 'Active' | 'Inactive';
  createdAt: string;
}
```

#### User Entity (`src/data/users.js`)
```typescript
interface User {
  id: string;              // e.g. 'user-1'
  name: string;
  email: string;
  password?: string;       // Dev mock only, omitted in active session
  phone: string;
  role: 'SUPER_ADMIN' | 'COMPANY_OWNER' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  department: string;
  companyId: string | null;// null for SUPER_ADMIN, 'company-1' for tenant users
  status: 'Active' | 'Inactive';
  avatar: string | null;
  joinedAt: string;
}
```

#### Project Entity (`src/data/projects.js`)
```typescript
interface Project {
  id: string;              // e.g. 'proj-1'
  name: string;
  description: string;
  managerId: string;
  teamMemberIds: string[];
  progress: number;        // 0 - 100%
  status: 'Active' | 'Completed' | 'On Hold';
  companyId: string;       // Tenant partition
  startDate: string;
  dueDate: string;
  createdAt: string;
}
```

#### Task Entity (`src/data/tasks.js`)
```typescript
interface Task {
  id: string;              // e.g. 'task-1'
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Todo' | 'In Progress' | 'Completed';
  dueDate: string;
  createdAt: string;
}
```

---

## 🗺️ 7. Full Application Route Tree

```text
Routes (HashRouter)
├── /login                   -> Login (1-Click Demo Switcher, TitleBar)
│
└── AppShell (Authenticated Layout Shell)
    ├── /dashboard           -> Dashboard (Central Role Router)
    │
    ├── /admin               -> [RoleRoute: SUPER_ADMIN] -> SuperAdminDashboard
    ├── /admin/companies     -> [RoleRoute: SUPER_ADMIN] -> AdminCompanies
    ├── /admin/users         -> [RoleRoute: SUPER_ADMIN] -> AdminUsers
    │
    ├── /hr                  -> [RoleRoute: HR] -> HRDashboard
    ├── /manager             -> [RoleRoute: MANAGER] -> ManagerDashboard
    ├── /employee            -> [RoleRoute: EMPLOYEE] -> EmployeeDashboard
    │
    ├── /users               -> [RoleRoute: SUPER_ADMIN, COMPANY_OWNER, HR, MANAGER] -> Users
    ├── /projects            -> [RoleRoute: SUPER_ADMIN, COMPANY_OWNER, MANAGER, EMPLOYEE] -> Projects
    ├── /projects/:id        -> [RoleRoute: SUPER_ADMIN, COMPANY_OWNER, MANAGER, EMPLOYEE] -> ProjectDetails
    │
    ├── /my-tasks            -> [RoleRoute: MANAGER, EMPLOYEE] -> MyTasks
    ├── /tasks               -> [RoleRoute: SUPER_ADMIN, COMPANY_OWNER, MANAGER] -> MyTasks
    │
    ├── /ai                  -> AIAssistant (Universal Access)
    └── /profile             -> Profile (Universal Access)
```

---

## 🚀 8. Future Node.js Backend Migration Strategy

When transitioning from mock authentication and in-memory state to the live Node.js REST API backend:

```text
[ React Frontend ] 
       │
       │ HTTP / JSON (Axios or Fetch)
       ▼
[ Node.js REST API ] (Express / Fastify / NestJS with TypeScript)
       │
       ├── Middleware: authMiddleware (JWT Verification)
       ├── Middleware: rbacMiddleware (Role Verification matching ROLES enum)
       ├── Middleware: tenantMiddleware (companyId Isolation)
       │
       ▼
[ Prisma ORM ] ──> [ PostgreSQL Database ]
       │
       └── Multi-Tenant Schema with Foreign Keys:
           Companies 1:N Users
           Companies 1:N Projects
           Projects 1:N Tasks
```

1. **Authentication API**: Replace `authService.login()` with `POST /api/auth/login`. On success, store the returned JWT in secure storage.
2. **Role Mapping**: The backend database enum `UserRole` will match `ROLES` (`SUPER_ADMIN`, `COMPANY_OWNER`, `HR`, `MANAGER`, `EMPLOYEE`) 1-to-1.
3. **Tenant Query Filtering**: The backend will automatically inject `WHERE companyId = req.user.companyId` on all project and task queries for tenant roles, mirroring the behavior currently implemented in `AppContext.jsx`.
