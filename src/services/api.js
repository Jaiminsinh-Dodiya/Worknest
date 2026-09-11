/**
 * WorkNest — Centralized API HTTP Client
 *
 * Provides typed REST communication with the Node.js backend.
 * Automatically manages JWT access tokens and headers.
 */

const API_BASE = 'http://localhost:3001/api';

export const TOKEN_KEY = 'worknest_access_token';
export const REFRESH_TOKEN_KEY = 'worknest_refresh_token';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || response.statusText;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  get(endpoint, options) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, body, options) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  patch(endpoint, body, options) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...options,
    });
  }

  delete(endpoint, options) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  /** Check if the backend API server is reachable */
  async isOnline() {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const api = new ApiClient(API_BASE);
