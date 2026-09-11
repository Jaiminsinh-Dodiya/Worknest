/**
 * WorkNest — Authentication Service
 *
 * Communicates with the Node.js REST API (/api/auth).
 * Includes fallback to mock database if API server is not running.
 */

import { api } from './api';
import { mockUsers } from '../data/users';

const SESSION_KEY = 'worknest_session';

export const authService = {
  /**
   * Authenticate a user with email and password.
   * Calls the live backend API, with fallback to mock data if offline.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
   */
  async login(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // 1. Attempt live API login against PostgreSQL
      const response = await api.post('/auth/login', {
        email: normalizedEmail,
        password,
      });

      if (response && response.success) {
        api.setTokens(response.accessToken, response.refreshToken);
        localStorage.setItem(SESSION_KEY, JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
    } catch (err) {
      // If server returned a business error (401 invalid credentials or inactive account)
      if (err.status === 401 || err.status === 403 || err.status === 400) {
        return { success: false, error: err.message };
      }

      // If network connection failed (backend not running), use local fallback
      console.warn('Backend API unreachable. Falling back to local authentication.', err.message);
    }

    // 2. Offline Fallback (Mock Authentication)
    const mockUser = mockUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!mockUser) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (mockUser.status === 'Inactive') {
      return { success: false, error: 'Your account has been deactivated. Contact your administrator.' };
    }

    const sessionUser = { ...mockUser };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  /**
   * Clear the current session, tokens, and log out.
   */
  logout() {
    api.clearTokens();
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Retrieve the currently authenticated user from session storage.
   * @returns {object|null}
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  /**
   * Check if there is an active session.
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  /**
   * Update the stored session when user profile changes.
   * @param {object} updatedUser
   */
  updateSession(updatedUser) {
    const sessionUser = { ...updatedUser };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  },
};
