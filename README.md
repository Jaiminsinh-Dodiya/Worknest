# WorkNest — Company Project & Workforce Management Platform

WorkNest is a modern desktop application prototype for company project and workforce management designed as a multi-tenant SaaS platform. Built with **Electron**, **React**, **Vite**, and **Tailwind CSS**, it features a sleek desktop interface with dark mode support, realistic mock data, an authentic macOS traffic light window system, and integrated AI assistant capabilities.

---

## 🚀 Key Features

- **macOS Window Controls & Frameless Shell**:
  - Custom macOS traffic light controls (🔴 Close, 🟡 Minimize, 🟢 Maximize / Fullscreen) with authentic hover icons (`✕`, `−`, `⤢`).
  - Draggable custom TitleBar (`-webkit-app-region: drag`) integrated seamlessly across the App Shell and Login screen.
  - Calibrated for high-DPI displays.
- **Dashboard**: High-level metrics, active project progress tracking, recent task activity, and quick workspace actions.
- **Project Management**: Multi-project tracking with progress meters, team member assignments, and manager details.
- **Interactive Kanban Board**: Project task management with real-time status transitions (Todo, In Progress, Completed) and task creation modal.
- **User & Employee Management**: Role-based employee directory (Company Owner, HR, Manager, Employee) with status toggles (Active / Inactive) and live search/filters.
- **AI Assistant**: Intelligent mock assistant powered by custom response flows for project summaries, task prioritization, and status updates.
- **User Profile & Settings**: Personal information management and theme preference settings (Light / Dark Mode).
- **Multi-Tenant SaaS Foundation**: Configured with company context (*WorkNest Technologies*) and mock data abstraction layer ready for backend integration.

---

## 🛠️ Tech Stack

- **Desktop Framework**: Electron 33 (Frameless Window + IPC Layer)
- **Frontend Core**: React 18 + React Router 6 (HashRouter)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v3 + Lucide Icons
- **State Management**: Centralized React Context API (`AppContext`, `ToastContext`)
- **Code Quality**: ESLint (0 errors, 0 warnings)

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation & Run

```bash
# Clone repository
git clone https://github.com/Jaiminsinh-Dodiya/Worknest.git
cd Worknest

# Install dependencies
npm install

# Run in development mode (Vite + Electron concurrently)
npm run dev

# Run code quality & lint checks
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

```
├── electron/
│   ├── main.js             # Electron main process (frameless window, IPC handlers)
│   └── preload.js          # contextBridge secure IPC exposure
├── src/
│   ├── components/
│   │   ├── layout/         # AppShell, Sidebar, Topbar, TitleBar, WindowControls
│   │   └── ui/             # Reusable UI components (Button, Modal, Card, Badge, etc.)
│   ├── contexts/           # AppContext (global state) & ToastContext
│   ├── data/               # Realistic mock datasets (users, projects, tasks, AI responses)
│   ├── pages/              # 7 Application screens (Login, Dashboard, Users, Projects, etc.)
│   ├── services/           # AI service abstraction layer (ready for NVIDIA API)
│   ├── App.jsx             # App routing & shell wrapper
│   ├── index.css           # Design system & Tailwind CSS configuration
│   └── main.jsx            # React DOM root entry
├── .eslintrc.cjs           # ESLint configuration
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🗺️ Roadmap & Backend Integration

WorkNest is structured so that the mock data layer and services can be seamlessly swapped with backend services in future phases:

```
[ Frontend: React + Electron ]
               ↓
    [ ASP.NET Core Web API ]
               ↓
     [ Entity Framework ]
               ↓
       [ SQL Server ]
```
