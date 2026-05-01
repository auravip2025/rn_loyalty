import { useRouter } from 'expo-router';
import {
    Bell,
    ChevronRight,
    Mail,
    Moon,
    Phone,
    Settings2,
    Sun,
    User,
} from 'lucide-react-native';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

// Derive initials from a name string or email fallback
function getInitials(user: any): string {
    if (user?.firstName && user?.lastName) {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
        const parts = user.name.trim().split(/\s+/);
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return parts[0][0].toUpperCase();
    }
    if (user?.email) return user.email[0].toUpperCase();
    return '?';
}

function getDisplayName(user: any): string {
    if (user?.name) return user.name;
    if (user?.firstName || user?.lastName) {
        return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    return 'Customer';
}

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    const initials = getInitials(user);
    const displayName = getDisplayName(user);

    return (
        <ScrollView
            style={[styles.container, isDark && styles.containerDark]}
            contentContainerStyle={[
                styles.content,
                { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
        >
            {/* Page title */}
            <Text style={[styles.pageTitle, isDark && styles.textDark]}>Profile</Text>

            {/* ── User identity card ── */}
            <View style={[styles.identityCard, isDark && styles.identityCardDark]}>
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                </View>

                {/* Name */}
                <Text style={[styles.displayName, isDark && styles.textDark]}>{displayName}</Text>

                {/* Detail rows */}
                <View style={styles.detailRows}>
                    {/* Email */}
                    <View style={styles.detailRow}>
                        <View style={[styles.detailIconWrap, { backgroundColor: '#eef2ff' }]}>
                            <Mail size={14} color="#4f46e5" />
                        </View>
                        <Text style={[styles.detailText, isDark && styles.detailTextDark]} numberOfLines={1}>
                            {user?.email || '—'}
                        </Text>
                    </View>

                    {/* Phone */}
                    {!!user?.phone && (
                        <View style={styles.detailRow}>
                            <View style={[styles.detailIconWrap, { backgroundColor: '#f0fdf4' }]}>
                                <Phone size={14} color="#059669" />
                            </View>
                            <Text style={[styles.detailText, isDark && styles.detailTextDark]}>
                                {user.phone}
                            </Text>
                        </View>
                    )}

                    {/* Member status */}
                    <View style={styles.detailRow}>
                        <View style={[styles.detailIconWrap, { backgroundColor: '#fef3c7' }]}>
                            <User size={14} color="#d97706" />
                        </View>
                        <Text style={[styles.detailText, isDark && styles.detailTextDark]}>
                            dandan Member
                        </Text>
                    </View>
                </View>
            </View>

            {/* ── Account section ── */}
            <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>Account</Text>
            <View style={[styles.menuGroup, isDark && styles.menuGroupDark]}>
                {/* Notification Center */}
                <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => router.push('/(customer)/notifications' as any)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.menuIcon, { backgroundColor: '#eef2ff' }]}>
                        <Bell size={16} color="#4f46e5" />
                    </View>
                    <Text style={[styles.menuLabel, isDark && styles.textDark]}>Notification Centre</Text>
                    <ChevronRight size={16} color="#94a3b8" style={styles.menuChevron} />
                </TouchableOpacity>

                <View style={[styles.menuDivider, isDark && styles.menuDividerDark]} />

                {/* Reward Preferences */}
                <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => router.push({ pathname: '/(customer)/preferences', params: { mode: 'settings' } } as any)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.menuIcon, { backgroundColor: '#f5f3ff' }]}>
                        <Settings2 size={16} color="#7c3aed" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.menuLabel, isDark && styles.textDark]}>Reward Preferences</Text>
                        <Text style={styles.menuSub}>Food · Travel · Cosmetics and more</Text>
                    </View>
                    <ChevronRight size={16} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            {/* ── App section ── */}
            <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>App</Text>
            <View style={[styles.menuGroup, isDark && styles.menuGroupDark]}>
                <TouchableOpacity
                    style={styles.menuRow}
                    onPress={toggleTheme}
                    activeOpacity={0.7}
                >
                    <View style={[styles.menuIcon, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                        {isDark
                            ? <Sun size={16} color="#f59e0b" />
                            : <Moon size={16} color="#475569" />
                        }
                    </View>
                    <Text style={[styles.menuLabel, isDark && styles.textDark]}>
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </Text>
                    <View style={[styles.themeToggle, isDark && styles.themeToggleOn]}>
                        <View style={[styles.themeToggleThumb, isDark && styles.themeToggleThumbOn]} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* ── Sign out ── */}
            <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.85}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    containerDark: {
        backgroundColor: '#0f172a',
    },
    content: {
        paddingHorizontal: 20,
    },
    pageTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 24,
    },
    textDark: {
        color: '#f1f5f9',
    },

    // ── Identity card ────────────────────────────────────────────────────────────
    identityCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    identityCardDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    avatarWrap: {
        marginBottom: 16,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 32,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    displayName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    detailRows: {
        width: '100%',
        gap: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    detailIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    detailTextDark: {
        color: '#cbd5e1',
    },

    // ── Section label ────────────────────────────────────────────────────────────
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 10,
        marginLeft: 4,
    },
    sectionLabelDark: {
        color: '#64748b',
    },

    // ── Menu group ───────────────────────────────────────────────────────────────
    menuGroup: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    menuGroupDark: {
        backgroundColor: '#1e293b',
        borderColor: '#334155',
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 14,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
    },
    menuSub: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '500',
        marginTop: 2,
    },
    menuChevron: {
        marginLeft: 'auto',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginLeft: 66,
    },
    menuDividerDark: {
        backgroundColor: '#334155',
    },

    // ── Theme toggle ─────────────────────────────────────────────────────────────
    themeToggle: {
        width: 44,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    themeToggleOn: {
        backgroundColor: '#4f46e5',
    },
    themeToggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    themeToggleThumbOn: {
        alignSelf: 'flex-end',
    },

    // ── Sign out ─────────────────────────────────────────────────────────────────
    signOutBtn: {
        backgroundColor: '#fef2f2',
        borderRadius: 18,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    signOutText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ef4444',
    },
});
