import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, role, login, loading, onboardingStatus, user } = useAuth() as any;

    if (loading) return null;

    // Already authenticated — use <Redirect> (declarative, safe in Strict Mode)
    // router.replace inside useEffect fires twice in dev due to Strict Mode, causing
    // a REPLACE action into the Tab navigator which doesn't support it.
    if (isAuthenticated && role === 'customer') {
        const isNew = typeof user === 'object' && user?.isNew;
        // New user who hasn't filled in their name yet → onboarding screen
        if (isNew && !user?.name) return <Redirect href="/(customer)/onboarding" />;
        return <Redirect href="/(customer)/home" />;
    }

    if (isAuthenticated && role === 'merchant') {
        if (onboardingStatus === 'pending') return <Redirect href="/(merchant)/onboarding" />;
        return <Redirect href="/(merchant)/dashboard" />;
    }

    const handleLogin = async (selectedRole: string) => {
        try {
            const response = await login('user@example.com', 'password', selectedRole);
            if (!response.success) {
                console.error('Login failed:', response.error);
            }
            // Navigation is handled above declaratively on the next render
            // after isAuthenticated / role update in AuthContext
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const LoginScreenAny = LoginScreen as any;
    return <LoginScreenAny onLogin={handleLogin} />;
}
