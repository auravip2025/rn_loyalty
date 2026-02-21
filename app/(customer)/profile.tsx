import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfilePage() {
    const { logout } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.dismissAll();
        router.replace('/');
    };

    return (
        <ScreenWrapper style={[
            styles.profileContainer,
            isDark && styles.profileContainerDark
        ]}>
            <View style={styles.content}>
                <Text style={[styles.profileTitle, isDark && styles.textDark]}>Profile</Text>
                <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>AJ</Text>
                    </View>
                    <View>
                        <Text style={[styles.userName, isDark && styles.textDark]}>Alex Johnson</Text>
                        <Text style={styles.userBadge}>Prime Member • Level 42</Text>
                    </View>
                </View>
                <View style={styles.profileActions}>
                    <TouchableOpacity style={[styles.outlineButton, isDark && styles.outlineButtonDark]}>
                        <Text style={[styles.outlineButtonText, isDark && styles.textDark]}>Linked Accounts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.outlineButton, isDark && styles.outlineButtonDark]}>
                        <Text style={[styles.outlineButtonText, isDark && styles.textDark]}>Notification Center</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.themeButton, isDark && styles.themeButtonDark]}
                        onPress={toggleTheme}
                    >
                        <Text style={[styles.themeButtonText, isDark && styles.textDark]}>
                            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    profileContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        paddingVertical: 24,
    },
    profileContainerDark: {
        backgroundColor: '#0f172a',
    },
    profileTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 32,
    },
    textDark: {
        color: '#ffffff',
    },
    profileCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    profileCardDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 32,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#ffffff',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    userBadge: {
        fontSize: 14,
        fontWeight: '500',
        color: '#94a3b8',
        marginTop: 4,
    },
    profileActions: {
        gap: 12,
    },
    outlineButton: {
        padding: 16,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
    },
    outlineButtonDark: {
        borderColor: '#475569',
    },
    outlineButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
        textAlign: 'left',
    },
    themeButton: {
        padding: 16,
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        alignItems: 'center',
    },
    themeButtonDark: {
        backgroundColor: '#334155',
    },
    themeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    logoutButton: {
        padding: 16,
        backgroundColor: '#f43f5e',
        borderRadius: 16,
        marginTop: 24,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});
