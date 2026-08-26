import { mockResponses } from '../data/aiResponses';

/**
 * AI Service abstraction layer.
 * Currently returns mock responses.
 * Replace this implementation with NVIDIA API calls later.
 *
 * Future architecture:
 *   React -> aiService.generateResponse() -> ASP.NET Core API -> NVIDIA API
 */
export async function generateResponse(prompt) {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

  const normalizedPrompt = prompt.toLowerCase().trim();

  // Check for keyword matches in mock responses
  for (const [key, response] of Object.entries(mockResponses)) {
    if (key === 'default') continue;
    if (normalizedPrompt.includes(key)) {
      return response;
    }
  }

  return mockResponses.default;
}
