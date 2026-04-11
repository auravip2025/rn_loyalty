/**
 * restClient.js
 *
 * Thin wrapper around fetch() that transparently delegates to the REST mock
 * when EXPO_PUBLIC_ENV=mock, or calls the real API otherwise.
 *
 * Usage (replaces raw fetch calls everywhere):
 *   import { fetchApi } from '../../api/restClient';
 *   const response = await fetchApi('/users/auth/otp', { method: 'POST', body: ... });
 */

import { mockFetch, MOCK_OTP } from '../mocks/restMock';

const IS_MOCK = process.env.EXPO_PUBLIC_ENV === 'mock';
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

/**
 * Fetches a REST endpoint, routing to the mock in mock mode.
 *
 * @param {string} path     - e.g. '/users/auth/otp'
 * @param {object} options  - Standard fetch options (method, headers, body, etc.)
 * @returns {Promise<Response-like>}
 */
export const fetchApi = (path, options = {}) => {
    const url = `${BASE_URL}${path}`;
    if (IS_MOCK) {
        console.log(`🛠️  [restClient] Mock mode → ${options.method || 'GET'} ${path}`);
        return mockFetch(url, options);
    }
    return fetch(url, options);
};

// Re-export for screens that show the demo hint
export { IS_MOCK, MOCK_OTP };
