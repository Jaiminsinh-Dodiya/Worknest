import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { mockUsers } from '../data/users';
import { mockProjects as defaultMockProjects } from '../data/projects';
import { mockTasks as defaultMockTasks } from '../data/tasks';
import { mockCompanies as defaultMockCompanies, getCompanyById } from '../data/companies';
import { authService } from '../services/authService';
import { api } from '../services/api';
import { ROLES } from '../config/roles';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Authentication State ──
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());

  // ── Data State (Loaded from API with fallback to mock data) ──
  const [users, setUsers] = useState(mockUsers);
  const [projects, setProjects] = useState(defaultMockProjects);
  const [tasks, setTasks] = useState(defaultMockTasks);
  const [companies, setCompanies] = useState(defaultMockCompanies);

  // ── Derived State ──
  const userRole = currentUser?.role || null;
  const companyId = currentUser?.companyId || null;

  const company = useMemo(() => {
    if (!companyId) return { id: null, name: 'WorkNest Platform' };
    const found = companies.find((c) => c.id === companyId);
    if (found) return found;
    return getCompanyById(companyId) || { id: companyId, name: 'Unknown Company' };
  }, [companyId, companies]);

  // ── Sync with Live PostgreSQL Backend on Authentication ──
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    async function fetchLiveBackendData() {
      try {
        const isOnline = await api.isOnline();
        if (!isOnline) return;

        // Parallel queries to live REST API
        const promises = [
          api.get('/users').catch(() => null),
          api.get('/projects').catch(() => null),
          api.get('/tasks').catch(() => null),
        ];

        if (currentUser?.role === ROLES.SUPER_ADMIN) {
          promises.push(api.get('/admin/companies').catch(() => null));
        }

        const [usersRes, projectsRes, tasksRes, companiesRes] = await Promise.all(promises);

        if (!isMounted) return;

        if (usersRes?.data && Array.isArray(usersRes.data)) {
          // Include current user in allUsers list
          const fetchedUsers = currentUser
            ? [currentUser, ...usersRes.data.filter((u) => u.id !== currentUser.id)]
            : usersRes.data;
          setUsers(fetchedUsers);
        }

        if (projectsRes?.data && Array.isArray(projectsRes.data)) {
          setProjects(projectsRes.data);
        }

        if (tasksRes?.data && Array.isArray(tasksRes.data)) {
          setTasks(tasksRes.data);
        }

        if (companiesRes?.data && Array.isArray(companiesRes.data)) {
          setCompanies(companiesRes.data);
        }
      } catch (err) {
        console.warn('Could not sync with live backend API:', err);
      }
    }

    fetchLiveBackendData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, currentUser]);

  // ── Auth Actions ──
  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
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
      return companyProjects.filter((p) => {
        const members = p.teamMemberIds || (p.teamMembers ? p.teamMembers.map((m) => m.id) : []);
        return members.includes(currentUser.id);
      });
    }
    if (currentUser.role === ROLES.MANAGER) {
      return companyProjects.filter((p) => {
        const members = p.teamMemberIds || (p.teamMembers ? p.teamMembers.map((m) => m.id) : []);
        return p.managerId === currentUser.id || members.includes(currentUser.id);
      });
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

  // ── User CRUD (Saves directly to PostgreSQL) ──
  const addUser = useCallback(async (user) => {
    try {
      const res = await api.post('/users', {
        ...user,
        companyId: companyId || user.companyId,
      });

      if (res?.data) {
        setUsers((prev) => [res.data, ...prev]);
        return res.data;
      }
    } catch (err) {
      console.warn('API addUser failed, using local state:', err);
    }

    // Local fallback
    const newUser = {
      ...user,
      id: `user-${Date.now()}`,
      companyId: companyId || user.companyId,
      status: 'Active',
      avatar: null,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  }, [companyId]);

  const updateUser = useCallback(async (id, updates) => {
    try {
      await api.patch(`/users/${id}`, updates);
    } catch (err) {
      console.warn('API updateUser failed, using local state:', err);
    }

    if (currentUser && id === currentUser.id) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      authService.updateSession(updatedUser);
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  }, [currentUser]);

  const deactivateUser = useCallback(async (id) => {
    try {
      const res = await api.patch(`/users/${id}/status`);
      if (res?.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: res.data.status } : u))
        );
        return;
      }
    } catch (err) {
      console.warn('API deactivateUser failed, using local state:', err);
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
    );
  }, []);

  const deleteUser = useCallback(async (id) => {
    try {
      await api.delete(`/users/${id}`);
    } catch (err) {
      console.warn('API deleteUser failed, using local state:', err);
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  // ── Project CRUD (Saves directly to PostgreSQL) ──
  const addProject = useCallback(async (project) => {
    try {
      const res = await api.post('/projects', {
        ...project,
        companyId: companyId || project.companyId,
      });

      if (res?.data) {
        setProjects((prev) => [res.data, ...prev]);
        return res.data;
      }
    } catch (err) {
      console.warn('API addProject failed, using local state:', err);
    }

    const newProject = {
      ...project,
      id: `proj-${Date.now()}`,
      companyId: companyId || project.companyId,
      progress: 0,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, [companyId]);

  const updateProject = useCallback(async (id, updates) => {
    try {
      await api.patch(`/projects/${id}`, updates);
    } catch (err) {
      console.warn('API updateProject failed, using local state:', err);
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  // ── Task CRUD (Saves directly to PostgreSQL) ──
  const addTask = useCallback(async (task) => {
    try {
      const res = await api.post('/tasks', task);
      if (res?.data) {
        setTasks((prev) => [res.data, ...prev]);
        return res.data;
      }
    } catch (err) {
      console.warn('API addTask failed, using local state:', err);
    }

    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    try {
      await api.patch(`/tasks/${id}`, updates);
    } catch (err) {
      console.warn('API updateTask failed, using local state:', err);
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (err) {
      console.warn('API deleteTask failed, using local state:', err);
    }

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
    companies,
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
    deleteUser,
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
