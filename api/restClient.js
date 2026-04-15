/**
 * restClient.js
 *
 * Thin wrapper around fetch() for REST API calls.
 * Always connects to the real backend defined in EXPO_PUBLIC_API_URL.
 *
 * Usage:
 *   import { fetchApi } from '../../api/restClient';
 *   const response = await fetchApi('/users/auth/otp', { method: 'POST', body: ... });
 */

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

/**
 * Fetches a REST endpoint on the real backend.
 *
 * @param {string} path     - e.g. '/users/auth/otp'
 * @param {object} options  - Standard fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>}
 */
export const fetchApi = (path, options = {}) => {
    const url = `${BASE_URL}${path}`;
    return fetch(url, options);
};
