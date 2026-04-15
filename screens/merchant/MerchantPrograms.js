import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ArrowLeft,
    Building2,
    ChevronRight,
    Coffee,
    Crown,
    Eraser,
    Plus,
    RefreshCw,
    Sparkles,
    Star,
    Tag,
    ToggleLeft,
    ToggleRight,
    Zap,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProgramConfigEditor from '../../components/old_app/merchant/ProgramConfigEditor';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// ─── Program type mappings ────────────────────────────────────────────────────
const PROGRAM_TYPE_MAP = {
    points:   'LOYALTY_POINTS',
    stamps:   'DIGITAL_STAMPS',
    wheel:    'WHEEL_OF_FORTUNE',
    scratch:  'SCRATCH_WIN',
    tiered:   'TIERED_DISCOUNTS',
    cashback: 'CASHBACK',
};

const BACKEND_TO_KEY = Object.fromEntries(
    Object.entries(PROGRAM_TYPE_MAP).map(([k, v]) => [v, k])
);

const PROGRAM_TEMPLATES = [
    {
        key: 'points',
        name: 'Points Rewards',
        desc: 'Earn points on every purchase and redeem for rewards.',
        icon: Star,
        accent: '#6366f1',
        bg: '#eef2ff',
        badge: 'Popular',
        badgeColor: '#6366f1',
        defaults: { earnRate: '10', desc: 'Earn 10 points per $1 spent. Redeem for exclusive rewards.', active: true },
    },
    {
        key: 'stamps',
        name: 'Digital Stamps',
        desc: 'Fill a stamp card with each visit to earn a free reward.',
        icon: Coffee,
        accent: '#10b981',
        bg: '#ecfdf5',
        badge: 'Classic',
        badgeColor: '#10b981',
        defaults: { targetStamps: '10', desc: 'Collect 10 stamps and earn a free item.', active: true },
    },
    {
        key: 'wheel',
        name: 'Wheel of Fortune',
        desc: 'Give customers a daily spin to win prizes and discounts.',
        icon: RefreshCw,
        accent: '#f59e0b',
        bg: '#fffbeb',
        badge: 'Gamified',
        badgeColor: '#f59e0b',
        defaults: {
            probability: '25', dailyLimit: '1',
            desc: 'Spin the wheel once a day for a chance to win amazing prizes.',
            active: true,
            segments: [
                { label: '50 Pts', color: '#6366f1', type: 'points', value: 50 },
                { label: 'No Luck', color: '#94a3b8', type: 'none', value: 0 },
                { label: '10% Off', color: '#10b981', type: 'discount', value: 10 },
                { label: 'Free Item', color: '#f59e0b', type: 'item', value: 'Coffee' },
                { label: '2x Pts', color: '#ec4899', type: 'multiplier', value: 2 },
                { label: 'Try Again', color: '#94a3b8', type: 'none', value: 0 },
            ],
        },
    },
    {
        key: 'scratch',
        name: 'Scratch & Win',
        desc: 'Let customers reveal hidden prizes by scratching a card.',
        icon: Eraser,
        accent: '#f43f5e',
        bg: '#fff1f2',
        badge: 'Engagement',
        badgeColor: '#f43f5e',
        defaults: {
            probability: '30', dailyLimit: '1',
            desc: 'Scratch your card and reveal an instant prize.',
            active: true,
            segments: [
                { label: '100 Pts', color: '#6366f1', type: 'points', value: 100 },
                { label: 'No Prize', color: '#94a3b8', type: 'none', value: 0 },
                { label: '15% Off', color: '#10b981', type: 'discount', value: 15 },
                { label: 'Free Drink', color: '#f59e0b', type: 'item', value: 'Drink' },
            ],
        },
    },
    {
        key: 'tiered',
        name: 'Tiered Membership',
        desc: 'Reward loyalty with Bronze → Silver → Gold → Platinum tiers.',
        icon: Crown,
        accent: '#a855f7',
        bg: '#faf5ff',
        badge: 'Premium',
        badgeColor: '#a855f7',
        defaults: {
            desc: 'Unlock exclusive perks as you climb through membership tiers.',
            active: true,
            tierDiscounts: { Bronze: '5%', Silver: '10%', Gold: '15%', Platinum: '20%' },
        },
    },
    {
        key: 'cashback',
        name: 'Cashback',
        desc: 'Customers earn a percentage of every purchase back as credit.',
        icon: Tag,
        accent: '#3b82f6',
        bg: '#eff6ff',
        badge: 'Simple',
        badgeColor: '#3b82f6',
        defaults: { discountVal: '5%', desc: 'Earn 5% cashback on every purchase, redeemable in-store.', active: true },
    },
];

const TEMPLATE_BY_KEY = Object.fromEntries(PROGRAM_TEMPLATES.map(t => [t.key, t]));

const toApiConfiguration = (formData) => {
    // eslint-disable-next-line no-unused-vars
    const { icon, accent, bg, color, badge, badgeColor, id, key, programType, active, name, ...rest } = formData;
    return rest;
};

// Map a raw programConfig from the backend to a UI program object
const cfgToUiProgram = (cfg) => {
    const key = BACKEND_TO_KEY[cfg.programType];
    if (!key) return null;
    const t = TEMPLATE_BY_KEY[key];
    if (!t) return null;
    return {
        id: cfg.id,
        key,
        programType: cfg.programType,
        name: t.name,
        icon: t.icon,
        accent: t.accent,
        bg: t.bg,
        badge: t.badge,
        badgeColor: t.badgeColor,
        active: cfg.isEnabled,
        ...(cfg.configuration || {}),
    };
};

// ─── Store card ───────────────────────────────────────────────────────────────
const StoreCard = ({ store, onPress }) => {
    const configs = store.programConfigs || [];
    const activeCount = configs.filter(c => c.isEnabled).length;
    const totalCount = configs.length;

    return (
        <TouchableOpacity style={styles.storeCard} onPress={() => onPress(store)} activeOpacity={0.75}>
            <View style={styles.storeIconBox}>
                <Building2 size={22} color="#10b981" />
            </View>
            <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeMeta}>
                    {totalCount === 0
                        ? 'No programs yet'
                        : `${activeCount} active · ${totalCount} total`}
                </Text>
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
        </TouchableOpacity>
    );
};

// ─── Program row (in store programs view) ─────────────────────────────────────
const ProgramRow = ({ cfg, onEdit, onToggle }) => {
    const program = cfgToUiProgram(cfg);
    if (!program) return null;
    const Icon = program.icon;

    return (
        <TouchableOpacity style={styles.programRow} onPress={() => onEdit(cfg)} activeOpacity={0.75}>
            <View style={[styles.programIcon, { backgroundColor: program.bg }]}>
                <Icon size={20} color={program.accent} />
            </View>
            <View style={styles.programInfo}>
                <Text style={styles.programName}>{program.name}</Text>
                <View style={[styles.programBadge, { backgroundColor: program.badgeColor + '20' }]}>
                    <Text style={[styles.programBadgeText, { color: program.badgeColor }]}>{program.badge}</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={(e) => { e.stopPropagation?.(); onToggle(cfg.programType); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                {cfg.isEnabled
                    ? <ToggleRight size={30} color="#10b981" />
                    : <ToggleLeft size={30} color="#cbd5e1" />}
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
const MerchantPrograms = () => {
    const { merchantProfile } = useAuth();
    const merchantId = merchantProfile?.id;
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // ── View state machine: 'stores' | 'programs' | 'editor' ────────────────
    const [view, setView] = useState('stores');
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [editingProgram, setEditingProgram] = useState(null);
    const [catalogItems, setCatalogItems] = useState([]);

    // ── Modal state ──────────────────────────────────────────────────────────
    const [showCreateStore, setShowCreateStore] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');
    const [showProgramPicker, setShowProgramPicker] = useState(false);

    // ── Async state ──────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [creatingStore, setCreatingStore] = useState(false);
    const [createStoreError, setCreateStoreError] = useState(null);

    useEffect(() => {
        if (!merchantId) {
            setLoading(false);
            setError('Merchant profile not found. Please complete registration or log in again.');
            return;
        }
        loadStores();
        loadCatalogItems();
    }, [merchantId]);

    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('@dandan_auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    // ── Load all stores for merchant ─────────────────────────────────────────
    const loadStores = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/stores/merchant/${merchantId}`, { headers });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error || `Failed to load stores (${res.status})`);
            }
            const data = await res.json();
            const storeList = Array.isArray(data) ? data : [];
            setStores(storeList);
            return storeList;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const loadCatalogItems = async () => {
        if (!merchantId) return;
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/catalog/rewards/merchant/${merchantId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setCatalogItems(Array.isArray(data) ? data : (data.rewards || []));
            }
        } catch {
            // Non-fatal
        }
    };

    // ── Create a new store ───────────────────────────────────────────────────
    const handleCreateStore = async () => {
        const name = newStoreName.trim();
        if (!name) {
            setCreateStoreError('Please enter a store name.');
            return;
        }
        setCreatingStore(true);
        setCreateStoreError(null);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/stores/`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ merchantId, name, settings: {} }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create store');
            setShowCreateStore(false);
            setNewStoreName('');
            await loadStores();
        } catch (err) {
            setCreateStoreError(err.message);
        } finally {
            setCreatingStore(false);
        }
    };

    // ── Navigate: store list → programs ──────────────────────────────────────
    const handleSelectStore = (store) => {
        setSelectedStore(store);
        setSaveError(null);
        setView('programs');
    };

    // ── Navigate: pick a program type → editor ────────────────────────────────
    const handleSelectTemplate = (template) => {
        setShowProgramPicker(false);
        const configs = selectedStore?.programConfigs || [];
        const existingCfg = configs.find(c => c.programType === PROGRAM_TYPE_MAP[template.key]);

        if (existingCfg) {
            // Edit existing
            setEditingProgram(cfgToUiProgram(existingCfg) || {
                id: existingCfg.id,
                key: template.key,
                programType: existingCfg.programType,
                name: template.name,
                icon: template.icon,
                accent: template.accent,
                bg: template.bg,
                badge: template.badge,
                badgeColor: template.badgeColor,
                active: existingCfg.isEnabled,
                ...(existingCfg.configuration || {}),
            });
        } else {
            // New program
            setEditingProgram({
                id: null,
                key: template.key,
                programType: PROGRAM_TYPE_MAP[template.key],
                name: template.name,
                icon: template.icon,
                accent: template.accent,
                bg: template.bg,
                badge: template.badge,
                badgeColor: template.badgeColor,
                active: true,
                ...template.defaults,
            });
        }
        setView('editor');
    };

    // ── Edit an existing program (tap on row) ─────────────────────────────────
    const handleEditProgram = (cfg) => {
        const program = cfgToUiProgram(cfg);
        if (!program) return;
        setEditingProgram(program);
        setSaveError(null);
        setView('editor');
    };

    // ── Save a program ────────────────────────────────────────────────────────
    const handleSaveProgram = async (savedProgram) => {
        if (!selectedStore?.id) {
            setSaveError('No store selected.');
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const headers = await getAuthHeaders();
            const programType = PROGRAM_TYPE_MAP[savedProgram.key];
            if (!programType) throw new Error('Unknown program type: ' + savedProgram.key);

            const res = await fetch(`${API_URL}/stores/${selectedStore.id}/programs/${programType}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    isEnabled: savedProgram.active !== false,
                    configuration: toApiConfiguration(savedProgram),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save program');

            // Refresh store list and update selectedStore with latest data
            const storeList = await loadStores(true);
            const refreshed = storeList.find(s => s.id === selectedStore.id);
            if (refreshed) setSelectedStore(refreshed);

            setEditingProgram(null);
            setView('programs');
        } catch (err) {
            setSaveError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Toggle a program on/off ────────────────────────────────────────────────
    const handleToggleActive = async (programType) => {
        if (!selectedStore?.id) return;

        // Optimistic update
        const toggle = (configs) =>
            configs.map(p => p.programType === programType ? { ...p, isEnabled: !p.isEnabled } : p);

        setSelectedStore(prev => ({ ...prev, programConfigs: toggle(prev.programConfigs || []) }));
        setStores(prev => prev.map(s => s.id === selectedStore.id
            ? { ...s, programConfigs: toggle(s.programConfigs || []) }
            : s
        ));

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/stores/${selectedStore.id}/programs/${programType}/toggle`, {
                method: 'PATCH',
                headers,
            });
            if (!res.ok) {
                // Revert
                setSelectedStore(prev => ({ ...prev, programConfigs: toggle(prev.programConfigs || []) }));
                setStores(prev => prev.map(s => s.id === selectedStore.id
                    ? { ...s, programConfigs: toggle(s.programConfigs || []) }
                    : s
                ));
            }
        } catch {
            // Revert
            setSelectedStore(prev => ({ ...prev, programConfigs: toggle(prev.programConfigs || []) }));
            setStores(prev => prev.map(s => s.id === selectedStore.id
                ? { ...s, programConfigs: toggle(s.programConfigs || []) }
                : s
            ));
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // ── VIEW: Editor ──────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    if (view === 'editor' && editingProgram) {
        return (
            <ProgramConfigEditor
                program={editingProgram}
                onSave={handleSaveProgram}
                onBack={() => { setEditingProgram(null); setSaveError(null); setView('programs'); }}
                saving={saving}
                saveError={saveError}
                catalogItems={catalogItems}
                merchantId={merchantId}
                onGoToCatalog={() => {
                    setEditingProgram(null);
                    setSaveError(null);
                    setView('stores');
                    router.push('/(merchant)/catalog');
                }}
            />
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── VIEW: Programs (for selected store) ────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    if (view === 'programs' && selectedStore) {
        const configs = selectedStore.programConfigs || [];
        const activeCount = configs.filter(c => c.isEnabled).length;

        return (
            <ScreenWrapper backgroundColor="#f8fafc" paddingHorizontal={0}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setView('stores')} style={styles.backBtn}>
                        <ArrowLeft size={20} color="#0f172a" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle} numberOfLines={1}>{selectedStore.name}</Text>
                        <Text style={styles.headerSub}>
                            {configs.length === 0 ? 'No programs' : `${activeCount} active · ${configs.length} total`}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowProgramPicker(true)} style={styles.addBtn}>
                        <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Empty state */}
                    {configs.length === 0 && (
                        <View style={styles.emptyHero}>
                            <View style={styles.emptyIconRing}>
                                <Sparkles size={32} color="#10b981" />
                            </View>
                            <Text style={styles.emptyTitle}>No programs yet</Text>
                            <Text style={styles.emptyDesc}>
                                Add your first loyalty program to start rewarding customers at this store.
                            </Text>
                            <TouchableOpacity onPress={() => setShowProgramPicker(true)} style={styles.emptyBtn}>
                                <Plus size={16} color="#fff" />
                                <Text style={styles.emptyBtnText}>Add Program</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Program list */}
                    {configs.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Programs</Text>
                            <View style={styles.programList}>
                                {configs.map(cfg => (
                                    <ProgramRow
                                        key={cfg.id || cfg.programType}
                                        cfg={cfg}
                                        onEdit={handleEditProgram}
                                        onToggle={handleToggleActive}
                                    />
                                ))}
                            </View>
                            <TouchableOpacity onPress={() => setShowProgramPicker(true)} style={styles.addMoreBtn}>
                                <Plus size={16} color="#10b981" />
                                <Text style={styles.addMoreBtnText}>Add another program</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Tips */}
                    <View style={styles.tipsCard}>
                        <View style={styles.tipsHeader}>
                            <Zap size={14} color="#f59e0b" />
                            <Text style={styles.tipsTitle}>Pro Tips</Text>
                        </View>
                        {[
                            'Combine Points + Stamps for 30% more repeat visits.',
                            'Wheel of Fortune drives 2x daily app opens on average.',
                            'Tiered programs increase avg. lifetime value by 40%.',
                        ].map((tip, i) => (
                            <View key={i} style={styles.tipRow}>
                                <View style={styles.tipDot} />
                                <Text style={styles.tipText}>{tip}</Text>
                            </View>
                        ))}
                    </View>

                </ScrollView>

                {/* Program type picker */}
                <Modal
                    visible={showProgramPicker}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowProgramPicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowProgramPicker(false)}
                    >
                        <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 24 }]}>
                            <View style={styles.pickerHandle} />
                            <View style={styles.pickerHeader}>
                                <View>
                                    <Text style={styles.pickerTitle}>Add Program</Text>
                                    <Text style={styles.pickerSub}>Choose a program type for this store</Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowProgramPicker(false)} style={styles.pickerClose}>
                                    <Text style={styles.pickerCloseText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {PROGRAM_TEMPLATES.map(t => {
                                    const Icon = t.icon;
                                    const alreadyAdded = configs.some(c => c.programType === PROGRAM_TYPE_MAP[t.key]);
                                    return (
                                        <TouchableOpacity
                                            key={t.key}
                                            style={styles.pickerRow}
                                            onPress={() => handleSelectTemplate(t)}
                                        >
                                            <View style={[styles.pickerIconBox, { backgroundColor: t.bg }]}>
                                                <Icon size={22} color={t.accent} />
                                            </View>
                                            <View style={styles.pickerInfo}>
                                                <Text style={styles.pickerName}>{t.name}</Text>
                                                <Text style={styles.pickerDesc} numberOfLines={1}>{t.desc}</Text>
                                            </View>
                                            <View style={[
                                                styles.pickerBadge,
                                                alreadyAdded
                                                    ? { backgroundColor: '#ecfdf5' }
                                                    : { backgroundColor: t.badgeColor + '20' }
                                            ]}>
                                                <Text style={[
                                                    styles.pickerBadgeText,
                                                    { color: alreadyAdded ? '#10b981' : t.badgeColor }
                                                ]}>
                                                    {alreadyAdded ? 'Edit' : t.badge}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── VIEW: Store list (default) ────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Loading stores…</Text>
            </View>
        );
    }

    return (
        <ScreenWrapper backgroundColor="#f8fafc" paddingHorizontal={0}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Stores</Text>
                    <Text style={styles.headerSub}>{stores.length} store{stores.length !== 1 ? 's' : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => { setCreateStoreError(null); setNewStoreName(''); setShowCreateStore(true); }} style={styles.addBtn}>
                    <Plus size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Error banner */}
                {error ? (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorBannerText}>{error}</Text>
                        <TouchableOpacity onPress={() => loadStores()}>
                            <Text style={styles.errorRetry}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* Empty state */}
                {stores.length === 0 && !error && (
                    <View style={styles.emptyHero}>
                        <View style={styles.emptyIconRing}>
                            <Building2 size={32} color="#10b981" />
                        </View>
                        <Text style={styles.emptyTitle}>No stores yet</Text>
                        <Text style={styles.emptyDesc}>
                            Create your first store and set up loyalty programs to start rewarding customers.
                        </Text>
                        <TouchableOpacity
                            onPress={() => { setCreateStoreError(null); setNewStoreName(''); setShowCreateStore(true); }}
                            style={styles.emptyBtn}
                        >
                            <Plus size={16} color="#fff" />
                            <Text style={styles.emptyBtnText}>Create Store</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Store list */}
                {stores.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Your Stores</Text>
                        <View style={styles.storeList}>
                            {stores.map(store => (
                                <StoreCard key={store.id} store={store} onPress={handleSelectStore} />
                            ))}
                        </View>
                    </View>
                )}

                {/* Tips */}
                <View style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <Zap size={14} color="#f59e0b" />
                        <Text style={styles.tipsTitle}>Pro Tips</Text>
                    </View>
                    {[
                        'Each store can have its own set of loyalty programs.',
                        'Mix gamification (Wheel, Scratch) with classic rewards (Points, Stamps).',
                        'Merchants with 3+ programs see 2x customer retention.',
                    ].map((tip, i) => (
                        <View key={i} style={styles.tipRow}>
                            <View style={styles.tipDot} />
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* Create Store Modal */}
            <Modal
                visible={showCreateStore}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCreateStore(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCreateStore(false)}
                >
                    <View style={[styles.createSheet, { paddingBottom: 40 }]}>
                        <View style={styles.pickerHandle} />
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>New Store</Text>
                            <TouchableOpacity onPress={() => setShowCreateStore(false)} style={styles.pickerClose}>
                                <Text style={styles.pickerCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Store Name</Text>
                        <TextInput
                            style={styles.storeNameInput}
                            placeholder="e.g. Main Branch, Orchard Outlet…"
                            placeholderTextColor="#94a3b8"
                            value={newStoreName}
                            onChangeText={(t) => { setNewStoreName(t); if (createStoreError) setCreateStoreError(null); }}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleCreateStore}
                        />

                        {createStoreError ? (
                            <Text style={styles.createError}>{createStoreError}</Text>
                        ) : null}

                        <TouchableOpacity
                            onPress={handleCreateStore}
                            style={[styles.createBtn, (!newStoreName.trim() || creatingStore) && styles.createBtnDisabled]}
                            disabled={!newStoreName.trim() || creatingStore}
                        >
                            {creatingStore
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={styles.createBtnText}>Create Store</Text>}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc' },
    loadingText: { fontSize: 13, color: '#64748b', fontWeight: '600' },

    // Header — paddingTop is set dynamically via insets; base value here is just the bottom/sides
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
        zIndex: 10,
    },
    headerCenter: { flex: 1, paddingHorizontal: 12 },
    backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
    headerSub: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
    addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },

    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },

    // Error banner
    errorBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fef2f2', borderRadius: 12, padding: 12,
        marginBottom: 16, borderWidth: 1, borderColor: '#fecaca',
    },
    errorBannerText: { flex: 1, fontSize: 12, color: '#dc2626', fontWeight: '600' },
    errorRetry: { fontSize: 12, color: '#4f46e5', fontWeight: '700', marginLeft: 8 },

    // Section
    section: { marginBottom: 24 },
    sectionLabel: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

    // Empty hero
    emptyHero: {
        alignItems: 'center', paddingVertical: 36,
        backgroundColor: '#fff', borderRadius: 20,
        borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed',
        marginBottom: 24,
    },
    emptyIconRing: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    emptyTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a', marginBottom: 6 },
    emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, paddingHorizontal: 28, marginBottom: 20 },
    emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10b981', paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
    emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

    // Store list
    storeList: { gap: 10 },
    storeCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    storeIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center' },
    storeInfo: { flex: 1 },
    storeName: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 3 },
    storeMeta: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

    // Program list
    programList: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', marginBottom: 12 },
    programRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    programIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    programInfo: { flex: 1 },
    programName: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
    programBadge: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
    programBadgeText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
    addMoreBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
        paddingVertical: 12, backgroundColor: '#f0fdf4', borderRadius: 12,
        borderWidth: 1, borderColor: '#bbf7d0',
    },
    addMoreBtnText: { fontSize: 13, fontWeight: '800', color: '#10b981' },

    // Tips
    tipsCard: { backgroundColor: '#fffbeb', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#fef3c7' },
    tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    tipsTitle: { fontSize: 12, fontWeight: '900', color: '#92400e' },
    tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
    tipDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#f59e0b', marginTop: 6 },
    tipText: { flex: 1, fontSize: 12, color: '#78350f', lineHeight: 18 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    pickerSheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 12, paddingHorizontal: 20, maxHeight: '85%',
        // paddingBottom set dynamically via insets
    },
    createSheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 12, paddingHorizontal: 20,
        // paddingBottom set dynamically via insets
    },
    pickerHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    pickerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
    pickerSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    pickerClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    pickerCloseText: { fontSize: 13, color: '#64748b', fontWeight: '700' },
    pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    pickerIconBox: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
    pickerInfo: { flex: 1 },
    pickerName: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
    pickerDesc: { fontSize: 11, color: '#64748b' },
    pickerBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    pickerBadgeText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Create store modal
    inputLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    storeNameInput: {
        backgroundColor: '#f8fafc', borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0',
        paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0f172a', marginBottom: 8,
    },
    createError: { fontSize: 12, color: '#ef4444', fontWeight: '600', marginBottom: 12 },
    createBtn: {
        backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 16,
        alignItems: 'center', marginTop: 8,
    },
    createBtnDisabled: { opacity: 0.5 },
    createBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },
});

export default MerchantPrograms;
