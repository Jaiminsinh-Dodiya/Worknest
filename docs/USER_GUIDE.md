# WorkNest User Guide & Feature Manual

Welcome to the **WorkNest** User Guide! This guide walks you through every screen, role experience, and feature in the desktop application.

---

## 🪟 1. Window Controls & TitleBar

WorkNest features an authentic macOS-style frameless titlebar with interactive traffic light buttons:

- **Window Dragging**: Click and drag anywhere across the top title bar header (`-webkit-app-region: drag`) to reposition the window on your screen.
- **Traffic Light Controls (Top-Left)**:
  - 🔴 **Red Dot (Close)**: Hovering displays `✕`. Gracefully terminates and closes the desktop application.
  - 🟡 **Yellow Dot (Minimize)**: Hovering displays `−`. Minimizes the application to your taskbar.
  - 🟢 **Green Dot (Maximize / Fullscreen)**: Hovering displays `⤢`. Toggles between maximized and restored window dimensions.

---

## 🔑 2. Login & Mock Authentication

- **Location**: `/login`
- **1-Click Role Switcher (Evaluation Demo)**: The login card features a quick-switcher grid containing all 5 roles. Clicking any card instantly populates the email and password fields for testing.
- **Password Visibility**: Click the eye toggle icon (`Eye` / `EyeOff`) to view or hide the password string.
- **Session Persistence**: Logging in persists your session in `localStorage` under `worknest_session`. Reloading the page or restarting the app keeps you logged in until you choose to log out.
- **Role-Based Redirects**: Upon successful authentication, users are automatically routed to their designated role dashboard.

### Demonstration Accounts

| Role | Email | Password | Landing Page | Primary Responsibilities |
|---|---|---|---|---|
| **Super Admin** | `admin@worknest.local` | `admin123` | `/admin` | Platform oversight, multi-tenant company management, cross-tenant user access. |
| **Company Owner** | `owner@worknest.local` | `owner123` | `/dashboard` | Executive leadership, organization metrics, project portfolios, company tasks. |
| **HR** | `hr@worknest.local` | `hr123` | `/hr` | Workforce operations, employee records, onboarding, active/inactive staff toggles. |
| **Manager** | `manager@worknest.local` | `manager123` | `/manager` | Project management, task assignments, delivery timelines, team coordination. |
| **Employee** | `employee@worknest.local` | `employee123` | `/employee` | Personal task tracking, milestone updates, individual deliverables. |

---

## 📊 3. Role-Specific Dashboards

WorkNest tailors the central dashboard view specifically to the currently authenticated user's role:

### A. Super Admin Dashboard (`/admin`)
- **Platform Metrics**: Total registered companies, active tenant organizations, platform-wide user count, and total projects.
- **Registered Companies Overview**: Live directory card of tenant companies with user count, active projects, industry, and subscription plan tier (`Starter`, `Professional`, `Enterprise`).
- **Platform Actions**: Quick links to manage companies, review platform users, or query the AI assistant.
- **System Activity Feed**: Event log of new tenant registrations, project creations, and security audits.

### B. Company Owner Dashboard (`/dashboard`)
- **Executive KPI Cards**: Total employees in organization, active projects, pending tasks, and completed tasks.
- **Project Progress Overview**: Visual progress percentage meters, assigned project managers, and upcoming milestone dates.
- **Executive Shortcuts**: Create project, add employee, create task, or launch AI assistant.
- **Recent Organization Tasks**: Chronological feed of tasks across all company projects.

### C. HR Dashboard (`/hr`)
- **Workforce Metrics**: Total company headcount, active staff, inactive staff, and total operating departments.
- **Team Directory**: Live list of employees showing name, department, role, join date, and active/inactive status badges.
- **HR Actions**: Add new employee modal, employee directory navigation, and HR policy queries with AI.
- **Workforce Activity Feed**: Audit log of onboarding milestones, staff transitions, and departmental reviews.

### D. Manager Dashboard (`/manager`)
- **Pipeline Metrics**: Count of managed projects, tasks currently in progress, tasks pending to-do, and successfully delivered tasks.
- **Managed Projects View**: Progress bars and due dates for projects directly managed by the manager.
- **Manager Shortcuts**: Create new project, assign team tasks, view team roster, and request automated AI project summaries.
- **Team Task Feed**: Table of team tasks with assignees, priorities, and deadlines.

### E. Employee Dashboard (`/employee`)
- **Personal Metrics**: Total tasks assigned to the employee, in-progress tasks, pending to-dos, and completed deliverables.
- **My Assigned Projects**: Overview of projects where the employee is an assigned team collaborator.
- **Personal Shortcuts**: Quick links to My Tasks, My Projects, and AI Assistant.
- **My Active Tasks Feed**: Focused list of upcoming tasks assigned specifically to the logged-in employee with direct status controls.

---

## 🧭 4. Dynamic Role-Aware Sidebar Navigation

The navigation sidebar automatically reconfigures its menu items and section headers according to the user's role:

- **Super Admin (`WORKNEST`)**:
  - Dashboard (`/admin`)
  - Companies (`/admin/companies`)
  - Platform Users (`/admin/users`)
- **Company Owner (`COMPANY`)**:
  - Dashboard (`/dashboard`)
  - Users (`/users`)
  - Projects (`/projects`)
  - Tasks (`/tasks`)
  - AI Assistant (`/ai`)
- **HR (`HR`)**:
  - Dashboard (`/hr`)
  - Users (`/users`)
  - AI Assistant (`/ai`)
- **Manager (`WORKSPACE`)**:
  - Dashboard (`/manager`)
  - Projects (`/projects`)
  - My Tasks (`/my-tasks`)
  - Team Tasks (`/tasks`)
  - AI Assistant (`/ai`)
- **Employee (`MY WORKSPACE`)**:
  - Dashboard (`/employee`)
  - My Tasks (`/my-tasks`)
  - My Projects (`/projects`)
  - AI Assistant (`/ai`)
- **Shared Account Controls**: Profile & Settings (`/profile`), Logout button, Sidebar Collapse toggle (`< 72px / 240px >`).

---

## 👥 5. User Management (`/users`)

- **Role Visibility**: Accessible by `SUPER_ADMIN`, `COMPANY_OWNER`, `HR`, and `MANAGER`.
- **Tenant Scoping**: Non-admin roles see only employees belonging to their organization.
- **Search & Filter**: Real-time filtering by employee name, email, or role (`COMPANY_OWNER`, `HR`, `MANAGER`, `EMPLOYEE`).
- **Permission Guards**:
  - **Add User**: Restricted to roles with `users.manage` (`COMPANY_OWNER`, `HR`, `SUPER_ADMIN`).
  - **Status Toggle**: Deactivate or reactivate employees with instantaneous confirmation toasts.
- **Add User Modal**: Onboard new employees with Full Name, Email, Phone, Department, and Role.

---

## 📁 6. Projects Directory (`/projects`)

- **Role Visibility**: Accessible by `SUPER_ADMIN`, `COMPANY_OWNER`, `MANAGER`, and `EMPLOYEE`.
- **Scoping**:
  - Company Owners see all company projects.
  - Managers see projects they manage or collaborate in.
  - Employees see projects they are assigned to.
- **Status Filtering**: Filter by *All Status*, *Active*, *Completed*, or *On Hold*.
- **Permission Guards**:
  - **New Project Button**: Restricted to roles with `projects.manage` (`COMPANY_OWNER`, `MANAGER`, `SUPER_ADMIN`).
- **Add Project Modal**: Assign project name, description, manager, and target due date.

---

## 📋 7. Project Details & Kanban Board (`/projects/:id`)

- **Interactive Kanban Columns**:
  - **Todo**: Work backlog.
  - **In Progress**: Active execution.
  - **Completed**: Done deliverables.
- **Role-Based Task Status Editing**:
  - **Managers & Company Owners**: Can update the status of any task on the board.
  - **Employees**: Can **only change the status of tasks assigned to themselves**. For other team members' tasks, a read-only status badge is displayed.
- **New Task Modal**: Restricted to users with `tasks.manage`. Add task with title, description, assignee, priority (High, Medium, Low), and due date.

---

## ✅ 8. My Tasks Workspace (`/my-tasks`)

- **Location**: `/my-tasks`
- **Purpose**: Dedicated workspace for `EMPLOYEE` and `MANAGER` roles to view tasks assigned strictly to them.
- **Search & Multi-Filters**: Instant search by task title or description, filtered by status and priority.
- **Direct Status Transition**: Interactive dropdown on each task card allowing immediate updates between *Todo*, *In Progress*, and *Completed*.

---

## 🏢 9. Super Admin Tenant Oversight (`/admin/companies` & `/admin/users`)

- **Location**: `/admin/companies` and `/admin/users`
- **Role Restriction**: Strictly protected by `RoleRoute` for `SUPER_ADMIN`.
- **Tenant Management**: Inspect all registered organization accounts, industry categories, employee headcount, and subscription tiers.
- **Platform User Management**: Cross-tenant directory displaying all accounts with tenant badges, contact info, and status toggles.

---

## 🤖 10. AI Assistant (`/ai`)

- **Location**: `/ai`
- **Access**: Universal access for all authenticated roles.
- **Suggested Prompts**:
  - *"Summarize my projects"*
  - *"Show my pending tasks"*
  - *"Generate a project description"*
  - *"Suggest task priorities"*
  - *"Write a status update"*
- **Typing Indicator**: Real-time simulation of asynchronous response generation.

---

## 👤 11. Profile & Theme Preferences (`/profile`)

- **Location**: `/profile`
- **Access**: Universal access for all authenticated roles.
- **User Information**: View full name, email, phone, canonical role (`ROLE_LABELS`), department, and organization.
- **Edit Profile & Password Modals**: Interactive modal forms with validation.
- **Theme Switcher**: Instant one-click toggle between **Light Mode** and **Dark Mode** (saved in `localStorage`).
