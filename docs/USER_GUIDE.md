# WorkNest User Guide & Feature Manual

Welcome to the **WorkNest** User Guide! This guide walks you through every screen and feature in the desktop application.

---

## 🪟 1. Window Controls & TitleBar

WorkNest features an authentic macOS-style frameless titlebar:

- **Window Dragging**: Click and drag anywhere across the top title bar header to reposition the window on your screen.
- **Traffic Light Controls (Top-Left)**:
  - 🔴 **Red Dot (Close)**: Hovering displays `✕`. Closes the desktop window.
  - 🟡 **Yellow Dot (Minimize)**: Hovering displays `−`. Minimizes the application to your taskbar.
  - 🟢 **Green Dot (Maximize / Fullscreen)**: Hovering displays `⤢`. Expands or restores the window size.

---

## 🔑 2. Login & Authentication

- **Location**: `/login`
- **Default Account**: `demo@worknest.local` (Company Owner: Jaimin Dodiya).
- **Password Visibility**: Click the eye icon (`Eye` / `EyeOff`) to toggle password visibility.
- **Login Action**: Submitting logs you in and redirects directly to the `/dashboard`.

---

## 📊 3. Workspace Dashboard

- **Location**: `/dashboard`
- **KPI Summary Cards**:
  - **Total Employees**: Count of active team members.
  - **Active Projects**: Current projects in progress.
  - **Pending Tasks**: High & medium priority work items.
  - **Completed Tasks**: Delivered deliverables.
- **Project Overview**: Live progress indicators and manager badges. Clicking any project navigates straight to its details.
- **Quick Action Buttons**: Fast shortcuts to create new projects, add employees, create tasks, or launch the AI assistant.
- **Recent Task Feed**: Real-time table of recent task assignments with due dates and priority tags.

---

## 👥 4. User Management

- **Location**: `/users`
- **Live Search**: Instant filter by employee name or email address.
- **Role Filters**: Filter users by *All Roles*, *Company Owner*, *HR*, *Manager*, or *Employee*.
- **Status Toggles**: Easily deactivate or reactivate team members with instantaneous toast feedback.
- **Add User Modal**: Simple form to onboard new teammates with department and role assignment.

---

## 📁 5. Project Directory

- **Location**: `/projects`
- **Grid Card View**: Card-based visualization with progress percentage bars, manager assignments, team member clusters, and timeline dates.
- **Status Filter**: Switch between *All*, *Active*, *Completed*, and *On Hold*.
- **Add Project Modal**: Create a new project with assigned manager and due date.

---

## 📋 6. Project Details & Interactive Kanban Board

- **Location**: `/projects/:id`
- **Interactive Kanban Columns**:
  1. **Todo**: Tasks waiting to be picked up.
  2. **In Progress**: Tasks actively being worked on.
  3. **Completed**: Finished tasks.
- **Status Dropdown**: Change task status directly on the card to smoothly move it between Kanban columns.
- **Task Creator Modal**: Add tasks with title, description, assignee, priority (High, Medium, Low), and deadline.

---

## 🤖 7. AI Assistant

- **Location**: `/ai`
- **Natural Chat Flow**: Conversational chat interface simulating intelligent productivity assistance.
- **Suggested Prompts**:
  - *"Summarize my projects"*
  - *"Show my pending tasks"*
  - *"Generate a project description"*
  - *"Suggest task priorities"*
  - *"Write a status update"*
- **Live Typing Indicator**: Visual feedback during AI response generation.

---

## 👤 8. Profile & Preferences

- **Location**: `/profile`
- **Personal Information**: View full name, email, phone, role, and department.
- **Edit Profile & Password Modals**: Interactive forms with validation and toast alerts.
- **Theme Switcher**: Instant one-click toggle between **Light Mode** and **Dark Mode** (persisted in `localStorage`).
