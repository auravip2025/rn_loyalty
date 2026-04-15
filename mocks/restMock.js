/**
 * restMock.js
 *
 * Simulates the backend REST API for local development / demo mode.
 * Mirrors the same endpoints hit by LoginScreen.js and restClient.js.
 *
 * Endpoint map:
 *   POST /users/auth/otp               → sendCustomerOtp
 *   POST /merchants/auth/request-otp   → sendMerchantOtp
 *   POST /users/auth/verify            → verifyCustomerOtp
 *   POST /merchants/auth/verify-otp    → verifyMerchantOtp
 *   POST /users/auth/refresh           → refreshToken
 *   POST /merchants/auth/refresh       → refreshToken
 */

// ── Shared mock data ──────────────────────────────────────────────────────────

export const MOCK_OTP = '123456';

const MOCK_DELAY_MS = 600;

const MOCK_USERS = {
    'alex@dandan.io': {
        id: 'mock_user_1',
        email: 'alex@dandan.io',
        role: 'customer',
        isEmailVerified: true,
        createdAt: '2024-01-01T00:00:00.000Z',
    },
    'newuser@dandan.io': {
        id: 'mock_user_2',
        email: 'newuser@dandan.io',
        role: 'customer',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
    },
};

const MOCK_MERCHANTS = {
    'merchant@coffeehouse.com': {
        id: 'mock_merchant_1',
        email: 'merchant@coffeehouse.com',
        companyName: 'The Coffee House',
        category: 'Café',
        address: '123 Orchard Road, #01-12',
        phone: '+65 6234 5678',
        status: 'active',
    },
};

const MOCK_TOKENS = {
    token: 'mock_access_token_abc123',
    refreshToken: 'mock_refresh_token_xyz789',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockResponse = (body, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => body,
});

// ── Route handlers ────────────────────────────────────────────────────────────

const handlers = {
    // POST /users/auth/otp
    '/users/auth/otp': async ({ email }) => {
        await delay(MOCK_DELAY_MS);
        console.log(`🛠️  [REST Mock] POST /users/auth/otp → email=${email}`);
        if (!email) {
            return mockResponse({ success: false, message: 'Email is required.' }, false, 400);
        }
        return mockResponse({
            success: true,
            message: 'OTP sent successfully',
            expiresIn: 300,
            cooldown: 60,
        });
    },

    // POST /merchants/auth/request-otp
    '/merchants/auth/request-otp': async ({ email }) => {
        await delay(MOCK_DELAY_MS);
        console.log(`🛠️  [REST Mock] POST /merchants/auth/request-otp → email=${email}`);
        if (!email) {
            return mockResponse({ success: false, message: 'Email is required.' }, false, 400);
        }
        return mockResponse({
            success: true,
            message: 'OTP sent to merchant email',
            expiresIn: 300,
            cooldown: 60,
        });
    },

    // POST /users/auth/verify
    '/users/auth/verify': async ({ email, otp, mode }) => {
        await delay(MOCK_DELAY_MS);
        console.log(`🛠️  [REST Mock] POST /users/auth/verify → email=${email}, otp=${otp}`);

        if (otp !== MOCK_OTP) {
            return mockResponse({ success: false, message: 'Invalid OTP. Please try again.' }, false, 401);
        }

        const existingUser = MOCK_USERS[email];
        const isNewUser = !existingUser || mode === 'register';
        const user = existingUser || {
            id: `mock_user_${Date.now()}`,
            email,
            role: 'customer',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
        };

        return mockResponse({
            success: true,
            message: 'OTP verified successfully',
            ...MOCK_TOKENS,
            tokenType: 'Bearer',
            expiresIn: 86400,
            isNewUser,
            user,
        });
    },

    // POST /merchants/auth/verify-otp
    '/merchants/auth/verify-otp': async ({ email, otp, mode }) => {
        await delay(MOCK_DELAY_MS);
        console.log(`🛠️  [REST Mock] POST /merchants/auth/verify-otp → email=${email}, otp=${otp}`);

        if (otp !== MOCK_OTP) {
            return mockResponse({ success: false, message: 'Invalid OTP. Please try again.' }, false, 401);
        }

        const existingMerchant = MOCK_MERCHANTS[email];
        const isNewMerchant = !existingMerchant || mode === 'register';
        const merchant = existingMerchant || {
            id: `mock_merchant_${Date.now()}`,
            email,
            companyName: 'New Merchant',
            category: 'Other',
            address: '',
            phone: '',
            status: 'pending',
        };

        return mockResponse({
            success: true,
            message: 'OTP verified successfully',
            ...MOCK_TOKENS,
            tokenType: 'Bearer',
            expiresIn: 86400,
            isNewMerchant,
            merchant,
        });
    },

    // POST /users/wallet/credit  (welcome bonus + any server-side credits)
    '/users/wallet/credit': async ({ amount, type, description }) => {
        await delay(MOCK_DELAY_MS);
        console.log(`🛠️  [REST Mock] POST /users/wallet/credit → amount=${amount}, type=${type}`);
        if (!amount || amount <= 0) {
            return mockResponse({ success: false, message: 'Invalid amount.' }, false, 400);
        }
        return mockResponse({
            success: true,
            message: `${amount} tokens credited to wallet`,
            balance: amount,
            transaction: {
                id: `mock_tx_${Date.now()}`,
                amount,
                type: type || 'WELCOME_BONUS',
                description: description || 'Token credit',
                createdAt: new Date().toISOString(),
            },
        });
    },

    // POST /users/auth/refresh
    '/users/auth/refresh': async ({ refreshToken }) => {
        await delay(MOCK_DELAY_MS);
        console.log(`🛠️  [REST Mock] POST /users/auth/refresh`);
        if (!refreshToken) {
            return mockResponse({ success: false, message: 'No refresh token.' }, false, 401);
        }
        return mockResponse({ ...MOCK_TOKENS });
    },

    // POST /merchants/auth/refresh
    '/merchants/auth/refresh': async ({ refreshToken }) => {
        await delay(MOCK_DELAY_MS);
        console.log(`🛠️  [REST Mock] POST /merchants/auth/refresh`);
        if (!refreshToken) {
            return mockResponse({ success: false, message: 'No refresh token.' }, false, 401);
        }
        return mockResponse({ ...MOCK_TOKENS });
    },
};

// ── Main mock fetch entry point ───────────────────────────────────────────────

/**
 * Drop-in replacement for `fetch()` in mock mode.
 * Strips the base URL and routes by pathname.
 *
 * @param {string} url      - Full URL, e.g. http://localhost:3000/api/users/auth/otp
 * @param {object} options  - Fetch options (method, body, headers…)
 */
export const mockFetch = async (url, options = {}) => {
    // Extract just the path after /api
    const pathname = url.replace(/^https?:\/\/[^/]+(\/api)?/, '') || '/';
    const body = options.body ? JSON.parse(options.body) : {};

    const handler = handlers[pathname];
    if (handler) {
        return handler(body);
    }

    // Unhandled route fallback
    console.warn(`🛠️  [REST Mock] No handler for: ${options.method || 'GET'} ${pathname}`);
    return mockResponse({ success: false, message: `Mock: no handler for ${pathname}` }, false, 404);
};
