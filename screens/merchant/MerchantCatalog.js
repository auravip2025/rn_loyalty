import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Award,
    Gift,
    Package,
    Plus,
    Settings,
    Leaf,
    Trash2,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Badge from '../../components/old_app/common/Badge';
import Card from '../../components/old_app/common/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// ─── Reward type → display icon ───────────────────────────────────────────────
const typeIcon = (type) => {
    if (type === 'BUNDLE') return Package;
    return Gift;
};

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
const RewardFormModal = ({ visible, reward, merchantId, onSave, onClose }) => {
    const isEdit = !!reward?.id;
    const insets = useSafeAreaInsets();

    const [form, setForm] = useState({
        name: '',
        description: '',
        type: 'SINGLE',
        price: '0',
        pointsPrice: '',
        stock: '100',
        isEnabled: true,
        isGreenReward: false,
        carbonOffsetKg: '',
        ecoDescription: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (visible) {
            setError(null);
            setForm(reward ? {
                name: reward.name || '',
                description: reward.description || '',
                type: reward.type || 'SINGLE',
                price: String(reward.price ?? '0'),
                pointsPrice: reward.pointsPrice != null ? String(reward.pointsPrice) : '',
                stock: String(reward.stock ?? '100'),
                isEnabled: reward.isEnabled !== false,
                isGreenReward: reward.isGreenReward || false,
                carbonOffsetKg: reward.carbonOffsetKg ? String(reward.carbonOffsetKg) : '',
                ecoDescription: reward.ecoDescription || '',
            } : {
                name: '',
                description: '',
                type: 'SINGLE',
                price: '0',
                pointsPrice: '',
                stock: '100',
                isEnabled: true,
                isGreenReward: false,
                carbonOffsetKg: '',
                ecoDescription: '',
            });
        }
    }, [visible, reward]);

    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('@dandan_auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const handleSave = async () => {
        if (!form.name.trim()) { setError('Reward name is required'); return; }
        setSaving(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const payload = {
                merchantId,
                name: form.name.trim(),
                description: form.description.trim() || null,
                type: form.type,
                price: parseFloat(form.price) || 0,
                pointsPrice: form.pointsPrice ? parseInt(form.pointsPrice) : null,
                stock: form.stock === '∞' ? 9999999 : parseInt(form.stock) || 0,
                isEnabled: form.isEnabled,
                isGreenReward: form.isGreenReward,
                carbonOffsetKg: form.carbonOffsetKg ? parseFloat(form.carbonOffsetKg) : 0,
                ecoDescription: form.ecoDescription.trim() || null,
            };

            let res;
            if (isEdit) {
                res = await fetch(`${API_URL}/catalog/rewards/${reward.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch(`${API_URL}/catalog/rewards`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload),
                });
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save reward');
            onSave(data, isEdit);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const field = (label, key, opts = {}) => (
        <View style={modalStyles.field}>
            <Text style={modalStyles.label}>{label}</Text>
            <TextInput
                style={modalStyles.input}
                value={String(form[key] ?? '')}
                placeholder={opts.placeholder || ''}
                keyboardType={opts.numeric ? 'numeric' : 'default'}
                onChangeText={(v) => setForm({ ...form, [key]: v })}
                multiline={opts.multiline}
                numberOfLines={opts.multiline ? 3 : 1}
            />
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={modalStyles.overlay}>
                <View style={[modalStyles.sheet, { paddingBottom: insets.bottom + 24 }]}>
                    <View style={modalStyles.sheetHandle} />
                    <Text style={modalStyles.sheetTitle}>{isEdit ? 'Edit Reward' : 'New Reward Item'}</Text>

                    <ScrollView showsVerticalScrollIndicator={false} style={modalStyles.scroll}>

                        {/* Type toggle */}
                        <View style={modalStyles.typeRow}>
                            {['SINGLE', 'BUNDLE'].map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[modalStyles.typeBtn, form.type === t && modalStyles.typeBtnActive]}
                                    onPress={() => setForm({ ...form, type: t })}
                                >
                                    <Text style={[modalStyles.typeBtnText, form.type === t && modalStyles.typeBtnTextActive]}>
                                        {t === 'SINGLE' ? 'Single Reward' : 'Bundle'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {field('Reward Name *', 'name', { placeholder: 'e.g. Free Flat White' })}
                        {field('Description', 'description', { placeholder: 'Optional', multiline: true })}
                        {field('Points Cost', 'pointsPrice', { placeholder: 'e.g. 200', numeric: true })}
                        {field('Fiat Price ($)', 'price', { placeholder: '0.00', numeric: true })}
                        {field('Stock', 'stock', { placeholder: 'e.g. 100', numeric: true })}

                        {/* Enabled toggle */}
                        <View style={modalStyles.toggleRow}>
                            <Text style={modalStyles.toggleLabel}>Enabled</Text>
                            <TouchableOpacity
                                style={[modalStyles.toggleBtn, form.isEnabled && modalStyles.toggleBtnOn]}
                                onPress={() => setForm({ ...form, isEnabled: !form.isEnabled })}
                            >
                                <Text style={modalStyles.toggleBtnText}>{form.isEnabled ? 'Yes' : 'No'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Green reward toggle */}
                        <View style={modalStyles.toggleRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Leaf size={14} color="#10b981" />
                                <Text style={modalStyles.toggleLabel}>Green Reward</Text>
                            </View>
                            <TouchableOpacity
                                style={[modalStyles.toggleBtn, form.isGreenReward && modalStyles.toggleBtnOn]}
                                onPress={() => setForm({ ...form, isGreenReward: !form.isGreenReward })}
                            >
                                <Text style={modalStyles.toggleBtnText}>{form.isGreenReward ? 'Yes' : 'No'}</Text>
                            </TouchableOpacity>
                        </View>

                        {form.isGreenReward && (
                            <>
                                {field('CO₂ Offset (kg)', 'carbonOffsetKg', { placeholder: 'e.g. 2.5', numeric: true })}
                                {field('Eco Description', 'ecoDescription', { placeholder: 'e.g. Made from recycled materials', multiline: true })}
                            </>
                        )}

                        {error ? <Text style={modalStyles.error}>{error}</Text> : null}
                    </ScrollView>

                    <View style={modalStyles.actions}>
                        <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose} disabled={saving}>
                            <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSave} disabled={saving}>
                            {saving
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={modalStyles.saveBtnText}>{isEdit ? 'Save Changes' : 'Create Reward'}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingTop: 12, paddingHorizontal: 20, maxHeight: '92%',
        // paddingBottom set dynamically via insets
    },
    sheetHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
    scroll: { maxHeight: 480 },
    typeRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 },
    typeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    typeBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    typeBtnText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    typeBtnTextActive: { color: '#0f172a' },
    field: { marginBottom: 12 },
    label: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
        borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a',
        backgroundColor: '#f8fafc', textAlignVertical: 'top',
    },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    toggleLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    toggleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    toggleBtnOn: { backgroundColor: '#ecfdf5', borderColor: '#10b981' },
    toggleBtnText: { fontSize: 12, fontWeight: '700', color: '#374151' },
    error: { fontSize: 12, color: '#dc2626', fontWeight: '600', marginTop: 8 },
    actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: '#10b981', alignItems: 'center' },
    saveBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MerchantCatalog = () => {
    const { merchantProfile } = useAuth();
    const merchantId = merchantProfile?.id;
    const insets = useSafeAreaInsets();

    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingReward, setEditingReward] = useState(null);

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

    useEffect(() => { loadRewards(); }, [loadRewards]);

    const handleOpenCreate = () => { setEditingReward(null); setModalVisible(true); };
    const handleOpenEdit = (reward) => { setEditingReward(reward); setModalVisible(true); };

    const handleSave = (saved, isEdit) => {
        setRewards(prev =>
            isEdit ? prev.map(r => r.id === saved.id ? saved : r)
                   : [...prev, saved]
        );
        setModalVisible(false);
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
        <View style={styles.container}>
            {/* Fixed header — sits above the scroll, respects status bar */}
            <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
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
                    return (
                        <Card key={reward.id} style={styles.rewardCard}>
                            <View style={styles.rewardRow}>
                                <View style={[styles.iconBox, !reward.isEnabled && styles.iconBoxDisabled]}>
                                    {reward.isGreenReward
                                        ? <Leaf size={22} color="#10b981" />
                                        : <Icon size={22} color={reward.isEnabled ? '#6366f1' : '#94a3b8'} />
                                    }
                                </View>

                                <View style={styles.rewardInfo}>
                                    <View style={styles.rewardNameRow}>
                                        <Text style={[styles.rewardName, !reward.isEnabled && styles.rewardNameDisabled]}>
                                            {reward.name}
                                        </Text>
                                        {reward.isGreenReward && (
                                            <View style={styles.greenBadge}>
                                                <Text style={styles.greenBadgeText}>🌿 Eco</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.metaRow}>
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

            <RewardFormModal
                visible={modalVisible}
                reward={editingReward}
                merchantId={merchantId}
                onSave={handleSave}
                onClose={() => setModalVisible(false)}
            />
        </View>
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
    iconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
    iconBoxDisabled: { backgroundColor: '#f1f5f9' },
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
