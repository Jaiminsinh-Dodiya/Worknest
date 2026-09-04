# WorkNest Architecture Documentation

This document describes the high-level architecture, design decisions, component hierarchy, and communication layers of the **WorkNest** desktop application.

---

## 🏗️ System Overview

WorkNest is architected as a modern, decoupled desktop client designed for eventual integration with a Node.js REST API (Express / Fastify / NestJS) and database backend (PostgreSQL / SQL Server / MongoDB via Prisma).

```
+-----------------------------------------------------------------------+
|                           WorkNest Client                             |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |                       Electron Main Process                     |  |
|  |   - Frameless BrowserWindow Management (1280x800, min 1024x600) |  |
|  |   - IPC Main Handlers (minimize, maximize/unmaximize, close)    |  |
|  +---------------------------------+-------------------------------+  |
|                                    | (IPC / contextBridge)            |
|  +---------------------------------v-------------------------------+  |
|  |                      Electron Preload Layer                     |  |
|  |   - Secure window.electronAPI exposure (Context Isolation)      |  |
|  +---------------------------------+-------------------------------+  |
|                                    |                                  |
|  +---------------------------------v-------------------------------+  |
|  |                   React 18 Renderer (Vite 6)                    |  |
|  |                                                                 |  |
|  |  +-----------------------------------------------------------+  |  |
|  |  |                     Global State Layer                    |  |  |
|  |  |   - AppContext (Users, Projects, Tasks, Company, Auth)    |  |  |
|  |  |   - ToastContext (Notification Queue & Auto-dismiss)      |  |  |
|  |  +-----------------------------+-----------------------------+  |  |
|  |                                |                                |  |
|  |  +-----------------------------v-----------------------------+  |  |
|  |  |                      Layout & Navigation                  |  |  |
|  |  |   - TitleBar (macOS Traffic Light WindowControls, Drag)   |  |  |
|  |  |   - Sidebar (Collapsible Nav, Multi-tenant Workspace)     |  |  |
|  |  |   - Topbar (Live Search, Notification Flyout, Theme Mode) |  |  |
|  |  +-----------------------------+-----------------------------+  |  |
|  |                                |                                |  |
|  |  +-----------------------------v-----------------------------+  |  |
|  |  |                     7 Application Screens                 |  |  |
|  |  |   - Login | Dashboard | Users | Projects                  |  |  |
|  |  |   - Project Details (Kanban) | AI Assistant | Profile     |  |  |
|  |  +-----------------------------------------------------------+  |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

---

## 🔒 Electron IPC & Window Management

The application uses a customized frameless window (`frame: false`, `titleBarStyle: 'hidden'`) with native-feeling macOS traffic lights:

### Main Process (`electron/main.js`)
- **`window-minimize`**: Invokes `win.minimize()` on the target window.
- **`window-maximize`**: Toggles between `win.maximize()` and `win.unmaximize()`.
- **`window-close`**: Invokes `win.close()` cleanly.

### Preload Script (`electron/preload.js`)
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

## 🧩 Component Hierarchy

```
App
├── HashRouter
│   ├── ToastProvider (ToastContainer)
│   └── AppProvider (AppContext)
│       └── Routes
│           ├── Route /login -> Login (TitleBar + Auth Card)
│           └── Route / -> AppShell
│               ├── TitleBar (WindowControls + Window Title + Drag Region)
│               ├── Sidebar (Workspace Nav + Account Nav + Profile Snippet)
│               ├── Topbar (Search + Theme Switcher + Notifications)
│               └── <Outlet />
│                   ├── /dashboard       -> Dashboard
│                   ├── /users           -> Users (Data Table + Add Modal)
│                   ├── /projects        -> Projects (Grid + Progress)
│                   ├── /projects/:id    -> ProjectDetails (Kanban + Task Modal)
│                   ├── /ai              -> AIAssistant (Chat + Suggestions)
│                   └── /profile         -> Profile (Info + Preferences)
```

---

## 💾 Multi-Tenant Data Schema (Mock Layer)

### Company Entity
```typescript
interface Company {
  id: string;
  name: string;        // e.g. "WorkNest Technologies"
  industry: string;
  size: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  createdAt: string;
}
```

### User Entity & RBAC Roles
```typescript
type Role = 'CompanyOwner' | 'HR' | 'Manager' | 'Employee';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  department: string;
  status: 'Active' | 'Inactive';
  avatar: string | null;
  joinedAt: string;
}
```

### Project Entity
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  managerId: string;
  teamMemberIds: string[];
  progress: number;       // 0 - 100%
  status: 'Active' | 'Completed' | 'On Hold';
  startDate: string;
  dueDate: string;
  createdAt: string;
}
```

### Task Entity
```typescript
interface Task {
  id: string;
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

## 🤖 AI Service Architecture

The AI module is decoupled via `src/services/aiService.js`:

```
[ AIAssistant.jsx ] ──> [ aiService.generateResponse(prompt) ]
                                    │
               +--------------------+--------------------+
               │ (Current)                               │ (Future Phase)
               ▼                                         ▼
   [ Mock Response Engine ]                     [ Node.js API ]
   - Latency simulation                                  │
   - Keyword prompt routing                              ▼
                                                 [ NVIDIA AI API ]
```
