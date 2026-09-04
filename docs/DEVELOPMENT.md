# WorkNest Developer & Contribution Guide

This guide covers local environment setup, npm scripts, coding conventions, styling rules, and architectural guidelines for developers working on **WorkNest**.

---

## 🛠️ Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Git**: Installed and configured
- **Operating System**: Windows, macOS, or Linux

---

## 🚀 Quick Setup

```bash
# 1. Clone repository and checkout development branch
git clone https://github.com/Jaiminsinh-Dodiya/Worknest.git
cd Worknest
git checkout dev

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
| `npm run lint` | Runs ESLint across all `.js` and `.jsx` files with zero-warning threshold. |
| `npm run build` | Compiles the production frontend bundle into `dist/`. |
| `npm run dist` | Builds production frontend and packages Windows installer and portable `.exe`. |
| `npm run dist:portable` | Packages strictly a standalone single portable `.exe` into `release/`. |
| `npm run dist:dir` | Fast unpacked build for quick testing at `release/win-unpacked/`. |

---

## 🎨 Design System & Styling Conventions

- **Color Palette (Indigo Primary)**:
  - Primary Base: `#4F46E5` (`bg-primary-600`)
  - Primary Hover: `#4338CA` (`bg-primary-700`)
  - Primary Light: `#EEF2FF` (`bg-primary-50`)
- **Dark Mode**:
  - Controlled by the `.dark` CSS class on the root `<html>` element.
  - Dark Surface: `#1E293B` (`bg-slate-800`)
  - Dark Background: `#0F172A` (`bg-slate-900`)
  - Dark Border: `#334155` (`border-slate-700`)
- **Icons**:
  - Always import icons from `lucide-react`.
  - Icon standard sizes: `14px` (small buttons/badges), `16px` (regular UI), `20px` (stat cards/headers).

---

## 🏗️ State Management Conventions

All global workspace data is managed through `src/contexts/AppContext.jsx`. When adding or mutating data:

1. Use pure immutability (`setProjects(prev => [...prev, newProject])`).
2. Expose typed helper functions rather than naked setters (e.g. `getUserById`, `getTasksByProject`).
3. Pair mutations with notifications using `useToast().addToast(message, 'success')`.
