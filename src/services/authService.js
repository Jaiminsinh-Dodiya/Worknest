/**
 * WorkNest — Authentication Service
 *
 * Communicates with the Node.js REST API (/api/auth).
 */

import { api } from './api';

const SESSION_KEY = 'worknest_session';

export const authService = {
  /**
   * Authenticate a user with email and password against the live backend API.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
   */
  async login(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Live API login against PostgreSQL
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
      // Server returned a business error (401 invalid credentials or inactive account)
      if (err.status === 401 || err.status === 403 || err.status === 400) {
        return { success: false, error: err.message };
      }

      // Backend server is not running or unreachable
      return {
        success: false,
        error: 'Cannot connect to the backend server. Please make sure the backend server is running on http://localhost:3001.',
      };
    }

    return { success: false, error: 'Login failed. Please try again.' };
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

  /**
   * Fetch active demo accounts from the live backend API for development.
   * @returns {Promise<Array>}
   */
  async getDemoAccounts() {
    try {
      const response = await api.get('/auth/demo-accounts');
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  },
};
