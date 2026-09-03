# Contributing to WorkNest

Thank you for your interest in contributing to **WorkNest**! Please review the guidelines below to help keep our development workflow smooth and consistent.

---

## 🌿 Branching Strategy

We follow a two-branch workflow:

- **`main`**: Production-ready, stable releases (tagged with semver e.g., `v1.0.0`).
- **`dev`**: Active development branch. All feature work and bug fixes should be branched off or merged into `dev`.

```
[ dev ] ───(feature commits)───> [ Pull Request ] ───> [ main ] (v1.0.0 Release)
```

---

## 📝 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

- `feat(...)`: A new user-facing or architectural feature.
- `fix(...)`: A bug fix or visual adjustment.
- `docs(...)`: Documentation changes or additions.
- `style(...)`: Formatting, CSS, or visual styling without logic change.
- `build(...)`: Build system, packaging, or dependency changes.
- `refactor(...)`: Code refactoring without behavioral change.

---

## 🧪 Quality Verification

Before committing and pushing your code:

```bash
# 1. Verify zero lint errors
npm run lint

# 2. Verify clean production build
npm run build

# 3. Test standalone packaging
npm run dist:dir
```
