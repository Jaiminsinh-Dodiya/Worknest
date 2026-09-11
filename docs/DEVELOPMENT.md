# WorkNest Developer & Contribution Guide

This guide covers local environment setup, npm scripts, role configuration, permissions architecture, state management conventions, and quality standards for developers working on **WorkNest**.

---

## 🛠️ Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Git**: Installed and configured
- **Operating System**: Windows, macOS, or Linux

---

## 🚀 Quick Setup

```bash
# 1. Clone repository and checkout feature or development branch
git clone https://github.com/Jaiminsinh-Dodiya/Worknest.git
cd Worknest
git checkout feat/role-based-architecture

# 2. Install all dependencies
npm install

# 3. Start development server with hot-reload and Electron shell
npm run dev
```

---

## 📜 NPM Scripts Reference

| Command | Purpose |
|---|---|
| `npm run dev` | Runs Vite dev server and launches Electron concurrently with hot reload. |
| `npm run dev:vite` | Starts only the Vite development server (`http://localhost:5173`). |
| `npm run dev:electron` | Launches only the Electron client window. |
| `npm run lint` | Runs ESLint across all `.js` and `.jsx` files with zero-warning threshold (`--max-warnings 0`). |
| `npm run build` | Compiles the production frontend bundle into `dist/`. |
| `npm run dist` | Builds production frontend and packages Windows installer and portable `.exe`. |
| `npm run dist:portable` | Packages strictly a standalone single portable `.exe` into `release/`. |
| `npm run dist:dir` | Fast unpacked build for quick testing at `release/win-unpacked/`. |

---

## 👑 Role Configuration & Permissions Guide

WorkNest implements a centralized Role-Based Access Control (RBAC) engine. When extending roles, permissions, or navigation:

### 1. Canonical Roles (`src/config/roles.js`)
All role references use the exact uppercase strings defined in `ROLES`:
```javascript
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_OWNER: 'COMPANY_OWNER',
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};
```
- `ROLE_LABELS`: Map of human-readable display names for badges and UI.
- `ROLE_DASHBOARD_PATHS`: Defines each role's primary landing destination after login.
- `getDashboardPath(role)`: Helper returning the landing destination.

### 2. Permissions Map (`src/config/permissions.js`)
Map capabilities to roles in `PERMISSIONS`:
```javascript
export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['platform.view', 'companies.view', 'companies.manage', ...],
  [ROLES.COMPANY_OWNER]: ['company.view', 'users.view', 'projects.manage', ...],
  [ROLES.HR]: ['users.view', 'users.manage', ...],
  [ROLES.MANAGER]: ['projects.view', 'projects.manage', 'tasks.manage', ...],
  [ROLES.EMPLOYEE]: ['tasks.viewOwn', 'tasks.updateOwn', ...],
};
```
- `hasPermission(role, permission)`: Check role capability inside components.
- `hasRole(userRole, allowedRoles)`: Verify role membership.

### 3. Sidebar Navigation (`src/config/navigation.js`)
Define menu items per role:
```javascript
export const navigationByRole = {
  [ROLES.SUPER_ADMIN]: {
    sectionLabel: 'WORKNEST',
    items: [ { to: '/admin', label: 'Dashboard', icon: LayoutDashboard }, ... ],
  },
  // ... other roles
};
```

### 4. Protecting Routes with `RoleRoute`
Wrap routes in `src/App.jsx` using `RoleRoute`:
```jsx
<Route
  path="/admin/companies"
  element={
    <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
      <AdminCompanies />
    </RoleRoute>
  }
/>
```
If an unauthenticated user attempts access, they are redirected to `/login`. If an authenticated user lacks the required role, they are redirected to their own dashboard.

---

## 🧪 Mock Authentication & Testing Accounts

Authentication is managed through `src/services/authService.js` and stored in `localStorage` under `worknest_session`.

The login screen (`/login`) includes a **1-click Role Selector** for quick testing:

| Role | Email | Password | Landing Page |
|---|---|---|---|
| **Super Admin** | `admin@worknest.local` | `admin123` | `/admin` |
| **Company Owner** | `owner@worknest.local` | `owner123` | `/dashboard` |
| **HR** | `hr@worknest.local` | `hr123` | `/hr` |
| **Manager** | `manager@worknest.local` | `manager123` | `/manager` |
| **Employee** | `employee@worknest.local` | `employee123` | `/employee` |

To test session persistence:
1. Log in with any account.
2. Refresh the browser window or restart Electron (`npm run dev`).
3. Verify that your session and active role remain active.
4. Click **Logout** to clear the session and return to `/login`.

---

## 🎨 Design System & Styling Conventions

- **Color Palette (Indigo Primary)**:
  - Primary Base: `#4F46E5` (`bg-primary-600`)
  - Primary Hover: `#4338CA` (`bg-primary-700`)
  - Primary Light: `#EEF2FF` (`bg-primary-50`)
- **Dark Mode**:
  - Controlled by the `.dark` class on the root `<html>` element.
  - Dark Surface: `#1E293B` (`bg-slate-800`)
  - Dark Background: `#0F172A` (`bg-slate-900`)
  - Dark Border: `#334155` (`border-slate-700`)
- **Icons**:
  - Always import icons from `lucide-react`.
  - Icon standard sizes: `14px` (small buttons/badges), `16px` (regular UI), `20px` (stat cards/headers).
- **Interactive Windows**:
  - macOS traffic light controls in `src/components/layout/WindowControls.jsx`.
  - Draggable regions require `-webkit-app-region: drag`. Buttons/inputs inside title bars must have `-webkit-app-region: no-drag`.

---

## 🏗️ State Management Conventions (`AppContext.jsx`)

Global workspace data is managed through `src/contexts/AppContext.jsx`. When working with context:

1. **Use Scoped Data Accessors**:
   - `getVisibleUsers()`: Scoped to company (or all for Super Admin).
   - `getVisibleProjects()`: Scoped by role, managerId, or team assignments.
   - `getVisibleTasks()`: Scoped by visible projects.
   - `getMyTasks()`: Tasks assigned directly to `currentUser.id`.
2. **Pure Immutability**:
   - Always treat state as immutable (`setTasks(prev => [...prev, newTask])`).
3. **Session Sync**:
   - Profile updates automatically call `authService.updateSession(updatedUser)`.
4. **Toast Feedback**:
   - Pair mutating actions with feedback: `useToast().addToast(message, 'success')`.

---

## 🧪 Quality Verification

Always verify before committing:

```bash
# 1. Verify zero lint errors (mandatory zero warnings)
npm run lint

# 2. Verify clean production bundle
npm run build

# 3. Quick unpacked packaging test
npm run dist:dir
```
