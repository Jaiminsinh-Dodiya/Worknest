import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { currentUser as defaultCurrentUser, mockUsers as defaultMockUsers } from '../data/users';
import { mockProjects as defaultMockProjects } from '../data/projects';
import { mockTasks as defaultMockTasks } from '../data/tasks';
import { currentCompany } from '../data/companies';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(defaultCurrentUser);
  const [users, setUsers] = useState(defaultMockUsers);
  const [projects, setProjects] = useState(defaultMockProjects);
  const [tasks, setTasks] = useState(defaultMockTasks);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const company = currentCompany;

  // Get all users including current user
  const allUsers = useMemo(() => [currentUser, ...users], [currentUser, users]);

  // User actions
  const addUser = useCallback((user) => {
    const newUser = {
      ...user,
      id: `user-${Date.now()}`,
      status: 'Active',
      avatar: null,
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((id, updates) => {
    if (id === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
      );
    }
  }, [currentUser.id]);

  const deactivateUser = useCallback((id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
    );
  }, []);

  // Project actions
  const addProject = useCallback((project) => {
    const newProject = {
      ...project,
      id: `proj-${Date.now()}`,
      progress: 0,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback((id, updates) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  // Task actions
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

  // Auth actions
  const login = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  // Helper: get user by ID
  const getUserById = useCallback(
    (id) => allUsers.find((u) => u.id === id),
    [allUsers]
  );

  // Helper: get tasks for a project
  const getTasksByProject = useCallback(
    (projectId) => tasks.filter((t) => t.projectId === projectId),
    [tasks]
  );

  // Helper: get project by ID
  const getProjectById = useCallback(
    (id) => projects.find((p) => p.id === id),
    [projects]
  );

  const value = {
    // State
    currentUser,
    company,
    users,
    allUsers,
    projects,
    tasks,
    isAuthenticated,
    // User actions
    addUser,
    updateUser,
    deactivateUser,
    // Project actions
    addProject,
    updateProject,
    // Task actions
    addTask,
    updateTask,
    deleteTask,
    // Auth
    login,
    logout,
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
