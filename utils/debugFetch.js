/**
 * Global fetch interceptor for debugging network requests in development.
 * Logs all outgoing fetch requests, their bodies, and responses.
 */

if (__DEV__) {
    const originalFetch = global.fetch;

    global.fetch = async (...args) => {
        const [resource, config] = args;
        const method = config?.method || 'GET';
        const startTime = Date.now();
        
        console.log('🚀 [FETCH REQUEST]', {
            method,
            url: resource,
            headers: config?.headers,
        });

        if (config?.body) {
            try {
                // Try parsing JSON for prettier logging
                if (typeof config.body === 'string') {
                    console.log('📦 [FETCH BODY]', JSON.parse(config.body));
                } else {
                    console.log('📦 [FETCH BODY]', config.body);
                }
            } catch (e) {
                console.log('📦 [FETCH BODY]', config.body);
            }
        }

        try {
            const response = await originalFetch(...args);
            const duration = Date.now() - startTime;
            
            console.log(`✅ [FETCH RESPONSE] ${response.status} | ${duration}ms | ${resource}`);

            // Clone the response so we don't consume the stream
            const responseClone = response.clone();
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const json = await responseClone.json();
                    console.log('📄 [FETCH DATA]', json);
                }
            } catch (err) {
                // Not a JSON response or failed to parse
            }

            return response;
        } catch (error) {
            console.log(`❌ [FETCH ERROR] ${resource}`, error);
            throw error;
        }
    };
}
