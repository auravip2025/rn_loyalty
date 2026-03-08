import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function MerchantLayout() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    return (
        <Stack>
            <Stack.Screen
                name="dashboard"
                options={{
                    title: 'Merchant Dashboard',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="settings"
                options={{
                    title: 'Settings',
                }}
            />
        </Stack>
    );
}

const styles = StyleSheet.create({
    logoutButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f43f5e',
        borderRadius: 8,
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
