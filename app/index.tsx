import { useRouter } from 'expo-router';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, role, login } = useAuth();

    const handleLogin = async (selectedRole: string) => {
        try {
            // Mock login with default credentials
            const response = await login('user@example.com', 'password', selectedRole);
            if (response.success) {
                // Navigate based on role
                if (selectedRole === 'customer') {
                    router.replace('/(customer)');
                } else {
                    router.replace('/(merchant)');
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
                router.replace('/(customer)');
            } else {
                router.replace('/(merchant)');
            }
        }
    }, [isAuthenticated, role]);

    return <LoginScreen onLogin={handleLogin} />;
}
