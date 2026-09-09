import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { mockUsers } from '../data/users';
import { mockProjects as defaultMockProjects } from '../data/projects';
import { mockTasks as defaultMockTasks } from '../data/tasks';
import { mockCompanies, getCompanyById } from '../data/companies';
import { authService } from '../services/authService';
import { ROLES } from '../config/roles';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Authentication State ──
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  // ── Data State ──
  const [users, setUsers] = useState(mockUsers);
  const [projects, setProjects] = useState(defaultMockProjects);
  const [tasks, setTasks] = useState(defaultMockTasks);

  // ── Derived State ──
  const userRole = currentUser?.role || null;
  const companyId = currentUser?.companyId || null;

  const company = useMemo(() => {
    if (!companyId) return { id: null, name: 'WorkNest Platform' };
    return getCompanyById(companyId) || { id: companyId, name: 'Unknown Company' };
  }, [companyId]);

  // ── Auth Actions ──
  const login = useCallback((email, password) => {
    const result = authService.login(email, password);
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  // ── Company-Scoped Data Helpers ──

  /** Get users visible to the current user based on role/company */
  const getVisibleUsers = useCallback(() => {
    if (!currentUser) return [];
    if (currentUser.role === ROLES.SUPER_ADMIN) {
      return users.filter((u) => u.id !== currentUser.id);
    }
    return users.filter((u) => u.companyId === currentUser.companyId && u.id !== currentUser.id);
  }, [currentUser, users]);

  /** All users including current user, scoped by role */
  const allUsers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === ROLES.SUPER_ADMIN) return users;
    return users.filter((u) => u.companyId === currentUser.companyId);
  }, [currentUser, users]);

  /** Get projects visible to the current user based on role/company */
  const getVisibleProjects = useCallback(() => {
    if (!currentUser) return [];
    if (currentUser.role === ROLES.SUPER_ADMIN) return projects;
    const companyProjects = projects.filter((p) => p.companyId === currentUser.companyId);

    if (currentUser.role === ROLES.EMPLOYEE) {
      return companyProjects.filter((p) => p.teamMemberIds.includes(currentUser.id));
    }
    if (currentUser.role === ROLES.MANAGER) {
      return companyProjects.filter(
        (p) => p.managerId === currentUser.id || p.teamMemberIds.includes(currentUser.id)
      );
    }
    return companyProjects;
  }, [currentUser, projects]);

  /** Get tasks visible to the current user based on role/company */
  const getVisibleTasks = useCallback(() => {
    if (!currentUser) return [];
    const visibleProjectIds = getVisibleProjects().map((p) => p.id);

    if (currentUser.role === ROLES.SUPER_ADMIN) return tasks;

    const companyTasks = tasks.filter((t) => visibleProjectIds.includes(t.projectId));

    if (currentUser.role === ROLES.EMPLOYEE) {
      return companyTasks.filter((t) => t.assigneeId === currentUser.id);
    }
    return companyTasks;
  }, [currentUser, tasks, getVisibleProjects]);

  /** Get tasks assigned to current user (My Tasks) */
  const getMyTasks = useCallback(() => {
    if (!currentUser) return [];
    return tasks.filter((t) => t.assigneeId === currentUser.id);
  }, [currentUser, tasks]);

  // ── User CRUD ──
  const addUser = useCallback((user) => {
    const newUser = {
      ...user,
      id: `user-${Date.now()}`,
      companyId: companyId || user.companyId,
      status: 'Active',
      avatar: null,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  }, [companyId]);

  const updateUser = useCallback((id, updates) => {
    if (currentUser && id === currentUser.id) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      authService.updateSession(updatedUser);
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  }, [currentUser]);

  const deactivateUser = useCallback((id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
    );
  }, []);

  // ── Project CRUD ──
  const addProject = useCallback((project) => {
    const newProject = {
      ...project,
      id: `proj-${Date.now()}`,
      companyId: companyId || project.companyId,
      progress: 0,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, [companyId]);

  const updateProject = useCallback((id, updates) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  // ── Task CRUD ──
  const addTask = useCallback((task) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Lookup Helpers ──
  const getUserById = useCallback(
    (id) => users.find((u) => u.id === id),
    [users]
  );

  const getTasksByProject = useCallback(
    (projectId) => tasks.filter((t) => t.projectId === projectId),
    [tasks]
  );

  const getProjectById = useCallback(
    (id) => projects.find((p) => p.id === id),
    [projects]
  );

  const value = {
    // Auth
    currentUser,
    isAuthenticated,
    userRole,
    companyId,
    login,
    logout,
    // Company
    company,
    companies: mockCompanies,
    // Data (scoped)
    users,
    allUsers,
    projects,
    tasks,
    // Scoped accessors
    getVisibleUsers,
    getVisibleProjects,
    getVisibleTasks,
    getMyTasks,
    // User CRUD
    addUser,
    updateUser,
    deactivateUser,
    // Project CRUD
    addProject,
    updateProject,
    // Task CRUD
    addTask,
    updateTask,
    deleteTask,
    // Helpers
    getUserById,
    getTasksByProject,
    getProjectById,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
