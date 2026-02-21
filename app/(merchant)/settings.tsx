import { useRouter } from 'expo-router';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import MerchantSettings from '../../screens/merchant/MerchantSettings';

export default function SettingsPage() {
    const { logout } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.dismissAll();
        router.replace('/');
    };

    return <MerchantSettings onLogout={handleLogout} onToggleTheme={toggleTheme} isDark={isDark} />;
}
