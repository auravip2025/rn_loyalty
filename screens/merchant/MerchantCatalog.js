import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Check,
    ChevronDown,
    Gift,
    ImageIcon,
    Leaf,
    Minus,
    Package,
    Plus,
    Search,
    Settings,
    Trash2,
    X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// expo-image-picker requires a native build — safe-require so Expo Go doesn't crash
let ImagePicker = null;
try { ImagePicker = require('expo-image-picker'); } catch (_) {}
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Badge from '../../components/old_app/common/Badge';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { getRewardDetails } from '../../utils/rewardDetails';

const SCREEN_H = Dimensions.get('window').height;

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// ─── Reward type → display icon ───────────────────────────────────────────────
const typeIcon = (type) => {
    if (type === 'BUNDLE') return Package;
    return Gift;
};

// ─── Product details helpers ──────────────────────────────────────────────────
const emptyProductDetails = () => ({
    category: '',
    highlights: ['', '', ''],
    specs: [],
    includes: [],
    allergens: '',
    terms: '',
});

const initProductDetails = (reward) => {
    if (reward?.productDetails) {
        const pd = reward.productDetails;
        return {
            category:   pd.category   || '',
            highlights: [...(pd.highlights || []), '', '', ''].slice(0, 3),
            specs:      pd.specs      || [],
            includes:   pd.includes   || [],
            allergens:  pd.allergens  || '',
            terms:      pd.terms      || '',
        };
    }
    if (reward?.name) {
        const mock = getRewardDetails(reward.name);
        return {
            category:   mock.category || '',
            highlights: [...mock.highlights, '', ''].slice(0, 3),
            specs:      mock.specs    || [],
            includes:   mock.includes || [],
            allergens:  mock.allergens || '',
            terms:      mock.terms    || '',
        };
    }
    return emptyProductDetails();
};



// ─── Main Screen ──────────────────────────────────────────────────────────────
const MerchantCatalog = () => {
    const { merchantProfile } = useAuth();
    const merchantId = merchantProfile?.id;


    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingReward, setEditingReward] = useState(null);
    // All stores for this merchant — used for the store picker in the reward form
    const [stores, setStores] = useState([]);

    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('@dandan_auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const loadRewards = useCallback(async () => {
        if (!merchantId) { setLoading(false); return; }
        setLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/catalog/rewards/merchant/${merchantId}`, { headers });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to load rewards');
            setRewards(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [merchantId]);

    // Fetch all stores for this merchant — used in the reward form's store picker
    const loadStores = useCallback(async () => {
        if (!merchantId) return;
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/stores/merchant/${merchantId}`, { headers });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                console.error('[MerchantCatalog] loadStores failed:', res.status, d.error);
                return;
            }
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            console.log('[MerchantCatalog] loadStores:', list.length, 'store(s)', list.map(s => ({ id: s.id, name: s.name })));
            setStores(list.map(s => ({
                id:       s.id,
                name:     s.name || `Store ${s.id?.slice(0, 6)}`,
                settings: s.settings || {},
            })));
        } catch (err) {
            console.error('[MerchantCatalog] loadStores exception:', err.message);
        }
    }, [merchantId]);

    useFocusEffect(
        useCallback(() => {
            loadRewards();
            loadStores();
        }, [loadRewards, loadStores])
    );

    const handleOpenCreate = () => {
        router.push('/(merchant)/reward-form');
    };

    const handleOpenEdit = (r) => {
        router.push({
            pathname: '/(merchant)/reward-form',
            params: { id: r.id }
        });
    };

    const handleSave = (saved, isEdit) => {
        setRewards(prev =>
            isEdit ? prev.map(r => r.id === saved.id ? saved : r)
                : [...prev, saved]
        );
    };

    const handleToggleEnabled = async (reward) => {
        try {
            const headers = await getAuthHeaders();
            const updated = { ...reward, isEnabled: !reward.isEnabled };
            const res = await fetch(`${API_URL}/catalog/rewards/${reward.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ isEnabled: updated.isEnabled }),
            });
            if (!res.ok) throw new Error('Failed to update');
            setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, isEnabled: updated.isEnabled } : r));
        } catch {
            Alert.alert('Error', 'Could not update reward status.');
        }
    };

    const handleDelete = (reward) => {
        Alert.alert(
            'Delete Reward',
            `Are you sure you want to delete "${reward.name}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: async () => {
                        try {
                            const headers = await getAuthHeaders();
                            const res = await fetch(`${API_URL}/catalog/rewards/${reward.id}`, {
                                method: 'DELETE',
                                headers,
                            });
                            if (!res.ok) {
                                const d = await res.json();
                                throw new Error(d.error || 'Delete failed');
                            }
                            setRewards(prev => prev.filter(r => r.id !== reward.id));
                        } catch (err) {
                            Alert.alert('Error', err.message);
                        }
                    }
                }
            ]
        );
    };

    // ── Loading ──
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Loading catalog…</Text>
            </View>
        );
    }

    return (
        <ScreenWrapper backgroundColor="#f8fafc" paddingHorizontal={0}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Reward Catalog</Text>
                    <Text style={styles.subtitle}>{rewards.length} item{rewards.length !== 1 ? 's' : ''}</Text>
                </View>
                <TouchableOpacity onPress={handleOpenCreate} style={styles.addIconBtn}>
                    <Plus size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>


                {/* Error */}
                {error ? (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={loadRewards}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Empty state */}
                {!error && rewards.length === 0 && (
                    <View style={styles.empty}>
                        <Gift size={48} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No reward items yet</Text>
                        <Text style={styles.emptyDesc}>
                            Create reward items here — these are the prizes customers earn through your loyalty programs (e.g. Free Coffee, 10% Voucher, Eco Tote Bag).
                        </Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={handleOpenCreate}>
                            <Plus size={16} color="#fff" />
                            <Text style={styles.emptyBtnText}>Create First Reward</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Rewards list */}
                {rewards.map((reward) => {
                    const Icon = typeIcon(reward.type);
                    const storeName = reward.storeId
                        ? (stores.find(s => s.id === reward.storeId)?.name || reward.storeId.slice(0, 8))
                        : null;
                    return (
                        <Card key={reward.id} style={styles.rewardCard}>

                            {/* ── Top: icon + name + eco badge + action buttons ── */}
                            <View style={styles.rewardTop}>
                                <View style={[styles.iconBox, !reward.isEnabled && styles.iconBoxDisabled]}>
                                    {reward.imageUrl ? (
                                        <Image source={{ uri: reward.imageUrl }} style={styles.rewardThumb} />
                                    ) : reward.isGreenReward ? (
                                        <Leaf size={22} color="#10b981" />
                                    ) : (
                                        <Icon size={22} color={reward.isEnabled ? '#6366f1' : '#94a3b8'} />
                                    )}
                                </View>
                                <View style={styles.rewardTitleGroup}>
                                    <Text style={[styles.rewardName, !reward.isEnabled && styles.rewardNameDisabled]} numberOfLines={2}>
                                        {reward.name}
                                    </Text>
                                    {reward.isGreenReward && (
                                        <View style={styles.greenBadge}>
                                            <Text style={styles.greenBadgeText}>🌿 Eco</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={() => handleOpenEdit(reward)}
                                    >
                                        <Settings size={15} color="#64748b" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, reward.isEnabled ? styles.actionBtnGreen : styles.actionBtnGray]}
                                        onPress={() => handleToggleEnabled(reward)}
                                    >
                                        <Text style={[styles.actionBtnText, reward.isEnabled ? styles.actionBtnTextGreen : styles.actionBtnTextGray]}>
                                            {reward.isEnabled ? 'On' : 'Off'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.actionBtnRed]}
                                        onPress={() => handleDelete(reward)}
                                    >
                                        <Trash2 size={14} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* ── Middle: points / stock / status ── */}
                            <View style={styles.rewardMeta}>
                                {reward.pointsPrice != null && (
                                    <Badge color="indigo">{reward.pointsPrice} pts</Badge>
                                )}
                                <Text style={styles.stockText}>
                                    Stock: {reward.stock >= 9999999 ? '∞' : reward.stock}
                                </Text>
                                {!reward.isEnabled && (
                                    <View style={styles.disabledBadge}>
                                        <Text style={styles.disabledBadgeText}>Disabled</Text>
                                    </View>
                                )}
                            </View>

                            {/* ── Bottom: store name ── */}
                            {storeName && (
                                <>
                                    <View style={styles.storeDivider} />
                                    <Text style={styles.storeLabel}>🏪 {storeName}</Text>
                                </>
                            )}

                        </Card>
                    );
                })}

                {/* Add more button (when list has items) */}
                {rewards.length > 0 && (
                    <TouchableOpacity style={styles.addMoreBtn} onPress={handleOpenCreate}>
                        <Plus size={16} color="#10b981" />
                        <Text style={styles.addMoreBtnText}>Add Reward Item</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>

        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    contentContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 13, color: '#64748b', fontWeight: '600' },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 14,
        backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
        zIndex: 10,
    },
    title: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
    addIconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },

    rewardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    rewardTitleGroup: { flex: 1, gap: 4 },
    rewardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    storeDivider: { height: 1, backgroundColor: '#f1f5f9', marginTop: 10, marginBottom: 6 },
    storeLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', marginTop: 2 },

    errorBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fef2f2', borderRadius: 12, padding: 12, marginBottom: 16,
        borderWidth: 1, borderColor: '#fecaca',
    },
    errorText: { flex: 1, fontSize: 12, color: '#dc2626', fontWeight: '600' },
    retryText: { fontSize: 12, color: '#4f46e5', fontWeight: '700', marginLeft: 8 },

    empty: {
        alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24,
        backgroundColor: '#fff', borderRadius: 20,
        borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed',
    },
    emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 16, marginBottom: 8 },
    emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
    emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    emptyBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },

    rewardCard: { marginBottom: 12, padding: 14 },
    rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    iconBoxDisabled: { backgroundColor: '#f1f5f9' },
    rewardThumb: { width: '100%', height: '100%' },
    rewardInfo: { flex: 1 },
    rewardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    rewardName: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
    rewardNameDisabled: { color: '#94a3b8' },
    greenBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
    greenBadgeText: { fontSize: 9, fontWeight: '800', color: '#16a34a' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    stockText: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
    disabledBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    disabledBadgeText: { fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },

    actions: { flexDirection: 'row', gap: 6 },
    actionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    actionBtnGreen: { backgroundColor: '#ecfdf5' },
    actionBtnGray: { backgroundColor: '#f1f5f9' },
    actionBtnRed: { backgroundColor: '#fef2f2' },
    actionBtnText: { fontSize: 10, fontWeight: '900' },
    actionBtnTextGreen: { color: '#10b981' },
    actionBtnTextGray: { color: '#94a3b8' },

    addMoreBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 14, marginTop: 4,
        backgroundColor: '#f0fdf4', borderRadius: 14,
        borderWidth: 1, borderColor: '#bbf7d0',
    },
    addMoreBtnText: { fontSize: 13, fontWeight: '800', color: '#10b981' },
});

export default MerchantCatalog;
