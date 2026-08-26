# WorkNest — Company Project & Workforce Management Platform

WorkNest is a modern desktop application prototype for company project and workforce management designed as a multi-tenant SaaS platform. Built with **Electron**, **React**, **Vite**, and **Tailwind CSS**, it features a sleek desktop interface with dark mode support, realistic mock data, and integrated AI assistant capabilities.

## 🚀 Key Features

- **Dashboard**: High-level metrics, active project progress tracking, recent task activity, and quick workspace actions.
- **Project Management**: Multi-project tracking with progress meters, team member assignments, and manager details.
- **Interactive Kanban Board**: Project task management with real-time status transitions (Todo, In Progress, Completed).
- **User & Employee Management**: Role-based employee directory (Company Owner, HR, Manager, Employee) with status toggles and search/filter.
- **AI Assistant**: Intelligent mock assistant powered by custom response flows for project summaries, task prioritization, and status updates.
- **User Profile**: Personal information management and theme preference settings (Light/Dark Mode).

## 🛠️ Tech Stack

- **Desktop Framework**: Electron 33
- **Frontend Core**: React 18 + React Router 6 (HashRouter)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v3 + Lucide Icons
- **State Management**: React Context API (`AppContext`, `ToastContext`)

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
```

## 📂 Project Structure

```
├── electron/          # Main & preload scripts for Electron desktop shell
├── src/
│   ├── components/
│   │   ├── layout/    # AppShell, Sidebar, Topbar
│   │   └── ui/        # Reusable UI components (Button, Modal, Card, Badge, etc.)
│   ├── contexts/      # AppContext (global state) & ToastContext
│   ├── data/          # Realistic mock datasets (users, projects, tasks, AI responses)
│   ├── pages/         # 7 Application screens
│   ├── services/      # AI service abstraction layer
│   ├── App.jsx        # App routing
│   ├── index.css      # Design system & Tailwind CSS configuration
│   └── main.jsx       # React DOM root entry
├── package.json
└── vite.config.js
```
