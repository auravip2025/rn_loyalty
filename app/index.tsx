import { useRouter } from 'expo-router';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, role, login, onboardingStatus } = useAuth() as any;

    const handleLogin = async (selectedRole: string) => {
        try {
            const response = await login('user@example.com', 'password', selectedRole);
            if (response.success) {
                if (selectedRole === 'customer') {
                    router.replace('/(customer)/home');
                } else {
                    router.replace('/(merchant)/dashboard');
                }
            } else {
                console.error('Login failed:', response.error);
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    // If already authenticated, redirect to appropriate screen
    React.useEffect(() => {
        if (isAuthenticated && role) {
            if (role === 'customer') {
                router.replace('/(customer)/home');
            } else if (role === 'merchant') {
                // New merchants with pending onboarding go to onboarding wizard
                if (onboardingStatus === 'pending') {
                    router.replace('/(merchant)/onboarding');
                } else {
                    router.replace('/(merchant)/dashboard');
                }
            }
        }
    }, [isAuthenticated, role, onboardingStatus]);

    const LoginScreenAny = LoginScreen as any;
    return <LoginScreenAny onLogin={handleLogin} />;
}
