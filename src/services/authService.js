/**
 * WorkNest — Mock Authentication Service
 *
 * Abstraction layer for authentication.
 * Currently uses mock users + localStorage.
 *
 * Future architecture:
 *   authService.login(email, password)
 *       ↓
 *   POST /api/auth/login
 *       ↓
 *   Node.js REST API → Database
 *
 * To migrate: replace the login() implementation body only.
 */

import { mockUsers } from '../data/users';

const SESSION_KEY = 'worknest_session';

export const authService = {
  /**
   * Authenticate a user with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {{ success: boolean, user?: object, error?: string }}
   */
  login(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (user.status === 'Inactive') {
      return { success: false, error: 'Your account has been deactivated. Contact your administrator.' };
    }

    // Store session (exclude password from stored session)
    const sessionUser = { ...user };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { success: true, user: sessionUser };
  },

  /**
   * Clear the current session and log out.
   */
  logout() {
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
