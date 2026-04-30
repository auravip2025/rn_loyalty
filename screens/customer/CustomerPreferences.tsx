'use client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { fetchApi } from '../../api/restClient';

const CATEGORIES = [
    'Food',
    'Travel',
    'Cosmetics',
    'Retail',
    'Fitness',
    'Entertainment',
    'Tech',
    'Health',
    'Other',
];

const DEFAULT_SELECTIONS = ['Food', 'Travel', 'Cosmetics'];

export default function CustomerPreferences() {
    const { user, loginWithOtp } = useAuth() as any;
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // mode=settings → came from profile page (load + save, then go back)
    // mode=onboarding (default) → first-time setup
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const isSettingsMode = mode === 'settings';

    const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTIONS);
    const [loadingPrefs, setLoadingPrefs] = useState(isSettingsMode);
    const [saving, setSaving] = useState(false);

    // In settings mode, load existing preferences from the backend
    useEffect(() => {
        if (!isSettingsMode || !user?.id) {
            setLoadingPrefs(false);
            return;
        }
        (async () => {
            try {
                const token = await AsyncStorage.getItem('@dandan_auth_token');
                const res = await fetchApi(`/users/${user.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await res.json();
                if (res.ok && Array.isArray(data.preferences) && data.preferences.length > 0) {
                    setSelected(data.preferences);
                }
            } catch {
                // Non-fatal — keep defaults
            } finally {
                setLoadingPrefs(false);
            }
        })();
    }, [isSettingsMode, user?.id]);

    const toggleCategory = (category: string) => {
        setSelected(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const handleSave = async () => {
        if (selected.length === 0) {
            Alert.alert('Select at least one', 'Please pick at least one category.');
            return;
        }
        setSaving(true);
        try {
            if (!user?.id) {
                console.warn('[Preferences] user.id missing, skipping backend save.');
            } else {
                const token = await AsyncStorage.getItem('@dandan_auth_token');
                const res = await fetchApi(`/users/${user.id}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ preferences: selected }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to save preferences');
            }

            if (isSettingsMode) {
                // Settings: just go back — no need to touch auth state
                router.back();
            } else {
                // Onboarding: clear the isNew flag so this screen is never shown again
                if (user?.email) {
                    await loginWithOtp(user.email, 'customer', false, user.id);
                }
                router.navigate('/(customer)/home' as any);
            }
        } catch (error: any) {
            console.error('Preference Save Error:', error);
            Alert.alert(
                'Error',
                error.message || 'Could not save your preferences. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        if (user?.email) {
            await loginWithOtp(user.email, 'customer', false, user.id);
        }
        router.navigate('/(customer)/home' as any);
    };

    if (loadingPrefs) {
        return (
            <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Loading your preferences…</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Back button in settings mode */}
                {isSettingsMode && (
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                        disabled={saving}
                    >
                        <ArrowLeft size={20} color="#0f172a" />
                    </TouchableOpacity>
                )}

                <View style={styles.headerBox}>
                    <View style={styles.iconRing}>
                        <Sparkles size={28} color="#4f46e5" />
                    </View>
                    <Text style={styles.title}>
                        {isSettingsMode ? 'Your Preferences' : 'Personalize Your Feed'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isSettingsMode
                            ? 'Update the categories you love — your "For You" rewards refresh instantly.'
                            : 'Select the categories you love most, and we\'ll instantly tailor your "For You" rewards.'}
                    </Text>
                </View>

                <View style={styles.grid}>
                    {CATEGORIES.map(category => {
                        const isSelected = selected.includes(category);
                        return (
                            <TouchableOpacity
                                key={category}
                                activeOpacity={0.7}
                                onPress={() => toggleCategory(category)}
                                style={[styles.pill, isSelected && styles.pillSelected]}
                            >
                                {isSelected && (
                                    <View style={styles.checkRing}>
                                        <Check size={12} color="#ffffff" />
                                    </View>
                                )}
                                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                {isSettingsMode ? (
                    // Settings footer: Cancel + Save
                    <>
                        <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={() => router.back()}
                            disabled={saving}
                        >
                            <Text style={styles.skipBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveBtn, (saving || selected.length === 0) && styles.saveBtnDisabled]}
                            onPress={handleSave}
                            disabled={saving || selected.length === 0}
                        >
                            {saving ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <Text style={styles.saveBtnText}>Save Preferences</Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    // Onboarding footer: Skip + Continue
                    <>
                        <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={handleSkip}
                            disabled={saving}
                        >
                            <Text style={styles.skipBtnText}>Skip for now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.saveBtnText}>Continue</Text>
                                    <ArrowRight size={20} color="#ffffff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 100,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerBox: {
        alignItems: 'center',
        marginBottom: 36,
        marginTop: 12,
    },
    iconRing: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eef2ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    pillSelected: {
        backgroundColor: '#eef2ff',
        borderColor: '#4f46e5',
    },
    checkRing: {
        backgroundColor: '#4f46e5',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    pillText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b',
    },
    pillTextSelected: {
        color: '#4f46e5',
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    skipBtn: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginRight: 12,
    },
    skipBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#94a3b8',
    },
    saveBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#4f46e5',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
    },
});
