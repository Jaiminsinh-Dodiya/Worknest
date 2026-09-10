# WorkNest — Multi-Tenant Workforce & Project Management Platform

WorkNest is a modern desktop application for company project and workforce management designed as a multi-tenant SaaS platform. Built with **Electron**, **React**, **Vite**, and **Tailwind CSS**, it features a desktop interface with dark mode support, an authentic macOS traffic light window system, an intelligent AI assistant, and a **Role-Based Access Control (RBAC)** frontend architecture powered by a zero-refactor mock authentication engine.

---

## 🚀 Key Features

### 👑 Role-Based Frontend Architecture & Mock Authentication
- **5 Canonical Roles**: Strict, system-wide role separation:
  - `SUPER_ADMIN`: Multi-tenant platform management, company registry, cross-tenant user oversight.
  - `COMPANY_OWNER`: Organization-level executive overview, project portfolios, and team management.
  - `HR`: Workforce operations, employee directory, staff onboarding, and active/inactive status toggles.
  - `MANAGER`: Project delivery pipelines, team workload distribution, and assigned team members.
  - `EMPLOYEE`: Individual contributor workspace, assigned deliverables, and personal task status updates.
- **1-Click Demo Account Switcher**: The login screen features interactive role cards to instantly populate credentials and test all 5 role experiences with a single click.
- **Session Persistence**: Sessions persist in `localStorage` under `worknest_session` across page reloads and desktop restarts.
- **Route Protection (`RoleRoute`)**: Automatic route guarding with intelligent redirects if an unauthorized URL is entered manually.
- **Centralized Permission Engine**: Declarative capability mapping (`hasPermission`, `hasRole`, `getRedirectPath`).
- **Multi-Tenant Data Scoping**: Context-level isolation ensuring company users only see their organization's data, while Super Admin retains platform-wide visibility.

### 📊 Role-Specific Dashboards (Shared Component Architecture)
- Five distinct dashboard views built with high-reusability shared widgets (`DashboardHeader`, `StatsGrid`, `ProjectOverview`, `TaskList`, `QuickActions`, `ActivityFeed`).
- **Central Dashboard Router**: The `/dashboard` route automatically adapts its layout and metrics to match the authenticated user's role.

### 🧭 Dynamic Sidebar Navigation
- Menu items and section headers dynamically adapt according to `navigationByRole[currentUser.role]`.
- Smooth collapsible sidebar (`72px` collapsed / `240px` expanded) with state persisted across sessions.

### 🪟 macOS Window Controls & Frameless Shell
- Custom macOS traffic lights (🔴 Close, 🟡 Minimize, 🟢 Maximize / Fullscreen) with authentic hover icons (`✕`, `−`, `⤢`).
- Draggable custom TitleBar (`-webkit-app-region: drag`) integrated seamlessly across the App Shell and Login screen.
- Calibrated for high-DPI desktop displays.

### 📁 Projects & Interactive Kanban Board
- Multi-project tracking with progress meters, timeline dates, and manager assignments.
- Real-time status transitions (Todo, In Progress, Completed) with **role-based status edit protection** (employees can only update tasks assigned to them).

### 🤖 AI Assistant
- Intelligent mock assistant with natural conversational flows for project summaries, task prioritization, and status updates.

### 👤 Profile & Dark Mode
- Full name, email, phone, canonical role (`ROLE_LABELS`), department, and organization display.
- One-click instant theme toggle between **Light Mode** and **Dark Mode** (persisted in `localStorage`).

---

## 🔑 Demonstration Accounts

| Role | Email | Password | Landing Path | Description |
|---|---|---|---|---|
| **Super Admin** | `admin@worknest.local` | `admin123` | `/admin` | Platform oversight & tenant management |
| **Company Owner** | `owner@worknest.local` | `owner123` | `/dashboard` | Organization executive dashboard |
| **HR** | `hr@worknest.local` | `hr123` | `/hr` | Workforce operations & staff directory |
| **Manager** | `manager@worknest.local` | `manager123` | `/manager` | Project delivery & team tasks |
| **Employee** | `employee@worknest.local` | `employee123` | `/employee` | Personal deliverables & task tracking |

---

## 🛠️ Tech Stack

- **Desktop Framework**: Electron 33 (Frameless Window + Context-Isolated IPC Layer)
- **Frontend Core**: React 18 + React Router 6 (HashRouter)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v3 + Lucide Icons
- **State Management**: Centralized React Context API (`AppContext`, `ToastContext`)
- **Code Quality**: ESLint (0 errors, 0 warnings threshold)

---

## 📦 Getting Started

### Prerequisites

- Node.js (`v18+` recommended)
- npm (`v9+` recommended)

### Installation & Run

```bash
# Clone repository
git clone https://github.com/Jaiminsinh-Dodiya/Worknest.git
cd Worknest
git checkout feat/role-based-architecture

# Install dependencies
npm install

# Run in development mode (Vite + Electron concurrently)
npm run dev

# Run code quality & lint verification
npm run lint

# Build production frontend bundle
npm run build

# Package desktop application into standalone Windows .exe (Installer & Portable)
npm run dist

# Or package strictly as a single standalone portable .exe
npm run dist:portable
```

---

## 📂 Project Structure

```text
WorkNest
├── electron/
│   ├── main.js             # Electron main process (frameless window, IPC handlers)
│   └── preload.js          # contextBridge secure IPC exposure
├── src/
│   ├── components/
│   │   ├── auth/           # RoleRoute.jsx (Route-level access guard)
│   │   ├── dashboard/      # Shared dashboard widgets (Header, Stats, Projects, Tasks, etc.)
│   │   ├── layout/         # AppShell, Sidebar, Topbar, TitleBar, WindowControls
│   │   └── ui/             # 16+ Reusable UI components (Button, Modal, Card, Badge, etc.)
│   ├── config/
│   │   ├── roles.js        # Canonical ROLES constants, labels, and dashboard paths
│   │   ├── permissions.js  # Centralized role-to-permission mapping and helper guards
│   │   └── navigation.js   # Role-based sidebar navigation configuration
│   ├── contexts/           # AppContext (scoped state & auth) & ToastContext
│   ├── data/               # Realistic mock datasets (users, companies, projects, tasks)
│   ├── pages/              # Application views:
│   │   ├── admin/          # AdminCompanies.jsx, AdminUsers.jsx (Super Admin)
│   │   ├── dashboards/     # 5 Role dashboard composers (SuperAdmin, Owner, HR, Manager, Employee)
│   │   ├── Dashboard.jsx   # Central role router for /dashboard
│   │   ├── Login.jsx       # Login screen with 1-click 5-role demo switcher
│   │   ├── MyTasks.jsx     # Personal task workspace for Employee & Manager
│   │   ├── Projects.jsx    # Projects directory with role-based scoping
│   │   ├── ProjectDetails.jsx # Kanban board with assignee edit guards
│   │   ├── Users.jsx       # Employee directory with role-based action guards
│   │   ├── AIAssistant.jsx # AI chat interface
│   │   └── Profile.jsx     # User profile and theme settings
│   ├── services/
│   │   ├── authService.js  # Mock authentication & session persistence abstraction
│   │   └── aiService.js    # AI service abstraction layer
│   ├── App.jsx             # React Router definitions & RoleRoute bindings
│   ├── index.css           # Design system tokens & Tailwind styling
│   └── main.jsx            # React DOM root entry
├── docs/                   # Complete technical documentation suite
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🗺️ Roadmap & Backend Migration

WorkNest's frontend architecture is fully decoupled, enabling direct API integration with a future Node.js backend without UI refactoring:

```text
[ React Frontend ]
       ↓
[ Node.js REST API ] (Express / Fastify / NestJS with TypeScript)
       ↓
[ Database Layer ] (Prisma ORM + PostgreSQL / MongoDB)
       ↓
[ Production AI API ] (NVIDIA AI API / NIM)
```

---

## 📚 Documentation Index

Explore the `docs/` directory for detailed architecture and developer manuals:

- 🏛️ **[System Architecture](docs/ARCHITECTURE.md)**: Component hierarchy, RBAC engine, IPC flow, and data schema.
- 📖 **[User Guide](docs/USER_GUIDE.md)**: Walkthrough for all 5 role dashboards, Kanban board, test credentials, and window controls.
- 🛠️ **[Developer Guide](docs/DEVELOPMENT.md)**: Environment setup, npm scripts, role configuration, permissions guide, and quality checks.
- 🗺️ **[Project Roadmap](docs/ROADMAP.md)**: Multi-phase backend integration and database schema plans.
- 🤝 **[Contributing Guidelines](docs/CONTRIBUTING.md)**: Git branching strategy and commit conventions.
