import { api } from './api';

/**
 * WorkNest — AI Assistant Service
 *
 * Communicates with the WorkNest Node.js REST API gateway (/api/ai/chat).
 * All NVIDIA API credentials, endpoints, models, and company contexts are
 * strictly managed server-side. The frontend only sends the validated user message.
 */
export const aiService = {
  /**
   * Send a user prompt to the backend AI gateway.
   *
   * @param {string} prompt - User message (1 - 4000 characters)
   * @returns {Promise<string>} The assistant's reply text
   */
  async sendMessage(prompt) {
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new Error('Please enter a message.');
    }

    const trimmed = prompt.trim();
    if (trimmed.length > 4000) {
      throw new Error('Message is too long. Please keep it under 4,000 characters.');
    }

    // Verify authentication before attempting network call
    const token = api.getToken();
    if (!token) {
      throw new Error('You must be signed in to use the AI assistant.');
    }

    try {
      const response = await api.post('/ai/chat', { message: trimmed });

      if (response && response.success && response.data?.reply) {
        return response.data.reply;
      }

      throw new Error('Received an empty response from WorkNest AI.');
    } catch (err) {
      // Map HTTP error codes to safe, user-friendly messages
      if (err.status === 401) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      if (err.status === 403) {
        throw new Error('You do not have permission to access the AI assistant.');
      }
      if (err.status === 400) {
        throw new Error(err.message || 'Invalid message format.');
      }
      if (err.status === 429) {
        throw new Error('AI request limit reached. Please wait a moment before trying again.');
      }
      if (err.status === 502 || err.status === 503 || err.status === 504) {
        throw new Error('WorkNest AI is temporarily unavailable. Please try again shortly.');
      }

      // Network / connection error
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error('Unable to connect to WorkNest backend server. Please verify your connection.');
      }

      throw new Error(err.message || 'WorkNest AI encountered an unexpected issue. Please try again.');
    }
  },
};

/**
 * Backwards-compatible export for existing components.
 */
export async function generateResponse(prompt) {
  return aiService.sendMessage(prompt);
}
