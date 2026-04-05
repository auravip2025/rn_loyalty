import AsyncStorage from '@react-native-async-storage/async-storage';
import {
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
    Zap
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ProgramConfigEditor from '../../components/old_app/merchant/ProgramConfigEditor';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// ─── Program type key ↔ backend type mapping ─────────────────────────────────
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

// ─── Program type templates ────────────────────────────────────────────────────
const PROGRAM_TEMPLATES = [
    {
        key: 'points',
        name: 'Points Rewards',
        desc: 'Customers earn points on every purchase and redeem for rewards.',
        icon: Star,
        color: 'indigo',
        accent: '#6366f1',
        bg: '#eef2ff',
        badge: 'Popular',
        badgeColor: '#6366f1',
        defaults: {
            earnRate: '10',
            desc: 'Earn 10 points per $1 spent. Redeem for exclusive rewards.',
            active: true,
        },
    },
    {
        key: 'stamps',
        name: 'Digital Stamps',
        desc: 'Collect stamps with each visit. Fill the card to earn a free reward.',
        icon: Coffee,
        color: 'emerald',
        accent: '#10b981',
        bg: '#ecfdf5',
        badge: 'Classic',
        badgeColor: '#10b981',
        defaults: {
            targetStamps: '10',
            desc: 'Collect 10 stamps and earn a free item.',
            active: true,
        },
    },
    {
        key: 'wheel',
        name: 'Wheel of Fortune',
        desc: 'Give customers a daily spin to win prizes and discounts.',
        icon: RefreshCw,
        color: 'amber',
        accent: '#f59e0b',
        bg: '#fffbeb',
        badge: 'Gamified',
        badgeColor: '#f59e0b',
        defaults: {
            probability: '25',
            dailyLimit: '1',
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
        color: 'rose',
        accent: '#f43f5e',
        bg: '#fff1f2',
        badge: 'Engagement',
        badgeColor: '#f43f5e',
        defaults: {
            probability: '30',
            dailyLimit: '1',
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
        color: 'purple',
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
        color: 'blue',
        accent: '#3b82f6',
        bg: '#eff6ff',
        badge: 'Simple',
        badgeColor: '#3b82f6',
        defaults: {
            discountVal: '5%',
            desc: 'Earn 5% cashback on every purchase, redeemable in-store.',
            active: true,
        },
    },
];

const TEMPLATE_BY_KEY = Object.fromEntries(PROGRAM_TEMPLATES.map(t => [t.key, t]));

// Strip non-serializable / UI-only fields before sending to the backend
const toApiConfiguration = (formData) => {
    // eslint-disable-next-line no-unused-vars
    const { icon, accent, bg, color, badge, badgeColor, id, key, programType, active, name, ...rest } = formData;
    return rest;
};

// ─── Program type card ────────────────────────────────────────────────────────
const ProgramTypeCard = ({ template, onSelect }) => {
    const Icon = template.icon;
    return (
        <TouchableOpacity style={styles.typeCard} onPress={() => onSelect(template)} activeOpacity={0.75}>
            <View style={[styles.typeIconBox, { backgroundColor: template.bg }]}>
                <Icon size={28} color={template.accent} />
            </View>
            <View style={styles.typeInfo}>
                <View style={styles.typeNameRow}>
                    <Text style={styles.typeName}>{template.name}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: template.badgeColor + '20' }]}>
                        <Text style={[styles.typeBadgeText, { color: template.badgeColor }]}>{template.badge}</Text>
                    </View>
                </View>
                <Text style={styles.typeDesc}>{template.desc}</Text>
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
        </TouchableOpacity>
    );
};

// ─── Active program row ───────────────────────────────────────────────────────
const ActiveProgramRow = ({ program, onEdit, onToggle }) => {
    const Icon = program.icon;
    return (
        <TouchableOpacity style={styles.activeRow} onPress={() => onEdit(program)}>
            <View style={[styles.activeIcon, { backgroundColor: program.bg }]}>
                <Icon size={20} color={program.accent} />
            </View>
            <View style={styles.activeInfo}>
                <Text style={styles.activeName}>{program.name}</Text>
                <Text style={styles.activeDesc} numberOfLines={1}>{program.desc}</Text>
            </View>
            <TouchableOpacity
                onPress={(e) => { e.stopPropagation?.(); onToggle(program.key); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                {program.active
                    ? <ToggleRight size={32} color="#10b981" />
                    : <ToggleLeft size={32} color="#cbd5e1" />
                }
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

// ─── Main screen ─────────────────────────────────────────────────────────────
const MerchantPrograms = () => {
    const { merchantProfile } = useAuth();

    const [storeId, setStoreId] = useState(null);
    const [activePrograms, setActivePrograms] = useState([]);
    const [catalogItems, setCatalogItems] = useState([]);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    // ── Load store & programs on mount ──────────────────────────────────────────
    useEffect(() => {
        const merchantId = merchantProfile?.id;
        if (!merchantId) {
            setLoading(false);
            return;
        }
        loadPrograms(merchantId);
    }, [merchantProfile?.id]);

    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('@dandan_auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const loadCatalogItems = async (merchantId) => {
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`${API_URL}/catalog/rewards/merchant/${merchantId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                // API returns array directly
                setCatalogItems(Array.isArray(data) ? data : (data.rewards || []));
            }
        } catch {
            // Non-fatal — editor will just show no catalog items
        }
    };

    const loadPrograms = async (merchantId) => {
        setLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();

            // Fetch existing store for this merchant
            let storeRes = await fetch(`${API_URL}/stores/merchant/${merchantId}`, { headers });

            let store;
            if (storeRes.status === 404) {
                // Auto-create store on first visit
                const createRes = await fetch(`${API_URL}/stores`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        merchantId,
                        name: merchantProfile?.businessName || 'My Store',
                        settings: {},
                    }),
                });
                const createData = await createRes.json();
                if (!createRes.ok) throw new Error(createData.error || 'Failed to create store');
                store = createData;
            } else if (!storeRes.ok) {
                const d = await storeRes.json();
                throw new Error(d.error || 'Failed to load store');
            } else {
                store = await storeRes.json();
            }

            setStoreId(store.id);

            // Load catalog items in parallel (non-blocking)
            loadCatalogItems(merchantId);

            // Map backend programConfigs → local program objects
            if (Array.isArray(store.programConfigs) && store.programConfigs.length > 0) {
                const programs = store.programConfigs
                    .map(cfg => {
                        const key = BACKEND_TO_KEY[cfg.programType];
                        if (!key) return null;
                        const template = TEMPLATE_BY_KEY[key];
                        if (!template) return null;
                        return {
                            id: cfg.id,
                            key,
                            programType: cfg.programType,
                            name: template.name,
                            icon: template.icon,
                            color: template.color,
                            accent: template.accent,
                            bg: template.bg,
                            badge: template.badge,
                            badgeColor: template.badgeColor,
                            active: cfg.isEnabled,
                            ...(cfg.configuration || {}),
                        };
                    })
                    .filter(Boolean);
                setActivePrograms(programs);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Select a template to create/edit ───────────────────────────────────────
    const handleSelectTemplate = (template) => {
        setShowTypePicker(false);
        // If program type already configured, open editor for existing one
        const existing = activePrograms.find(p => p.key === template.key);
        if (existing) {
            setEditingProgram(existing);
            return;
        }
        setEditingProgram({
            id: null,
            key: template.key,
            programType: PROGRAM_TYPE_MAP[template.key],
            name: template.name,
            icon: template.icon,
            color: template.color,
            accent: template.accent,
            bg: template.bg,
            badge: template.badge,
            badgeColor: template.badgeColor,
            active: true,
            ...template.defaults,
        });
    };

    // ── Save program (create or update) ────────────────────────────────────────
    const handleSaveProgram = async (savedProgram) => {
        if (!storeId) {
            setSaveError('Store not initialised yet. Please wait.');
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const headers = await getAuthHeaders();
            const programType = PROGRAM_TYPE_MAP[savedProgram.key];
            if (!programType) throw new Error('Unknown program type: ' + savedProgram.key);

            const payload = {
                isEnabled: savedProgram.active !== false,
                configuration: toApiConfiguration(savedProgram),
            };

            const res = await fetch(`${API_URL}/stores/${storeId}/programs/${programType}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save program');

            // Merge saved data back into local state
            const persisted = {
                ...savedProgram,
                id: data.id || savedProgram.id,
                programType,
            };

            setActivePrograms(prev => {
                const exists = prev.find(p => p.key === savedProgram.key);
                if (exists) return prev.map(p => p.key === savedProgram.key ? persisted : p);
                return [...prev, persisted];
            });
            setEditingProgram(null);
        } catch (err) {
            setSaveError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Toggle program enabled/disabled ────────────────────────────────────────
    const handleToggleActive = async (key) => {
        if (!storeId) return;

        // Optimistic UI update
        setActivePrograms(prev =>
            prev.map(p => p.key === key ? { ...p, active: !p.active } : p)
        );

        try {
            const headers = await getAuthHeaders();
            const programType = PROGRAM_TYPE_MAP[key];
            const res = await fetch(`${API_URL}/stores/${storeId}/programs/${programType}/toggle`, {
                method: 'PATCH',
                headers,
            });
            if (!res.ok) {
                // Revert optimistic update on failure
                setActivePrograms(prev =>
                    prev.map(p => p.key === key ? { ...p, active: !p.active } : p)
                );
            }
        } catch {
            // Revert on network error
            setActivePrograms(prev =>
                prev.map(p => p.key === key ? { ...p, active: !p.active } : p)
            );
        }
    };

    // ── Editing view ────────────────────────────────────────────────────────────
    if (editingProgram) {
        return (
            <ProgramConfigEditor
                program={editingProgram}
                onSave={handleSaveProgram}
                onBack={() => { setEditingProgram(null); setSaveError(null); }}
                saving={saving}
                saveError={saveError}
                catalogItems={catalogItems}
                merchantId={merchantProfile?.id}
            />
        );
    }

    // ── Loading state ───────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Loading your programs…</Text>
            </View>
        );
    }

    // ── Main programs list ──────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Reward Programs</Text>
                    <Text style={styles.headerSub}>{activePrograms.length} program{activePrograms.length !== 1 ? 's' : ''} configured</Text>
                </View>
                <TouchableOpacity onPress={() => setShowTypePicker(true)} style={styles.addBtn}>
                    <Plus size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── Error banner ── */}
                {error ? (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorBannerText}>{error}</Text>
                        <TouchableOpacity onPress={() => merchantProfile?.id && loadPrograms(merchantProfile.id)}>
                            <Text style={styles.errorRetry}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}

                {/* ── Hero / Create CTA (shown when no programs) ── */}
                {activePrograms.length === 0 && !error && (
                    <View style={styles.emptyHero}>
                        <View style={styles.emptyIconRing}>
                            <Sparkles size={36} color="#10b981" />
                        </View>
                        <Text style={styles.emptyTitle}>Launch your first program</Text>
                        <Text style={styles.emptyDesc}>
                            Choose from 6 ready-made reward program types. Configure and activate in minutes.
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowTypePicker(true)}
                            style={styles.emptyCreateBtn}
                        >
                            <Plus size={18} color="#fff" />
                            <Text style={styles.emptyCreateBtnText}>Create Program</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Active Programs ── */}
                {activePrograms.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Your Programs</Text>
                        <View style={styles.activeList}>
                            {activePrograms.map(program => (
                                <ActiveProgramRow
                                    key={program.key}
                                    program={program}
                                    onEdit={setEditingProgram}
                                    onToggle={handleToggleActive}
                                />
                            ))}
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowTypePicker(true)}
                            style={styles.addMoreBtn}
                        >
                            <Plus size={16} color="#10b981" />
                            <Text style={styles.addMoreBtnText}>Add another program</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Program type gallery (always visible as inspiration) ── */}
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionLabel}>Program Types</Text>
                        <View style={styles.sectionTag}>
                            <Text style={styles.sectionTagText}>6 Available</Text>
                        </View>
                    </View>
                    <Text style={styles.sectionSub}>Tap any type to create a new program</Text>
                    <View style={styles.typeList}>
                        {PROGRAM_TEMPLATES.map(t => (
                            <ProgramTypeCard key={t.key} template={t} onSelect={handleSelectTemplate} />
                        ))}
                    </View>
                </View>

                {/* ── Tips ── */}
                <View style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <Zap size={16} color="#f59e0b" />
                        <Text style={styles.tipsTitle}>Pro Tips</Text>
                    </View>
                    {[
                        'Combine Points + Stamps for 30% more repeat visits.',
                        'Wheel of Fortune drives 2x daily app opens on average.',
                        'Tiered programs increase avg. customer lifetime value by 40%.',
                    ].map((tip, i) => (
                        <View key={i} style={styles.tipRow}>
                            <View style={styles.tipDot} />
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* ── Type Picker Modal ── */}
            <Modal
                visible={showTypePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTypePicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowTypePicker(false)}
                >
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHandle} />
                        <View style={styles.pickerHeader}>
                            <View>
                                <Text style={styles.pickerTitle}>Choose Program Type</Text>
                                <Text style={styles.pickerSub}>Select a template to get started</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowTypePicker(false)} style={styles.pickerClose}>
                                <Text style={styles.pickerCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {PROGRAM_TEMPLATES.map(t => {
                                const Icon = t.icon;
                                const alreadyAdded = activePrograms.some(p => p.key === t.key);
                                return (
                                    <TouchableOpacity
                                        key={t.key}
                                        style={styles.pickerRow}
                                        onPress={() => handleSelectTemplate(t)}
                                    >
                                        <View style={[styles.pickerIcon, { backgroundColor: t.bg }]}>
                                            <Icon size={22} color={t.accent} />
                                        </View>
                                        <View style={styles.pickerInfo}>
                                            <Text style={styles.pickerName}>{t.name}</Text>
                                            <Text style={styles.pickerDesc}>{t.desc}</Text>
                                        </View>
                                        {alreadyAdded ? (
                                            <View style={[styles.pickerBadge, { backgroundColor: '#ecfdf5' }]}>
                                                <Text style={[styles.pickerBadgeText, { color: '#10b981' }]}>Active</Text>
                                            </View>
                                        ) : (
                                            <View style={[styles.pickerBadge, { backgroundColor: t.badgeColor + '20' }]}>
                                                <Text style={[styles.pickerBadgeText, { color: t.badgeColor }]}>{t.badge}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },

    // Loading / centered
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc' },
    loadingText: { fontSize: 13, color: '#64748b', fontWeight: '600' },

    // Error banner
    errorBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fef2f2', borderRadius: 12, padding: 12,
        marginBottom: 16, borderWidth: 1, borderColor: '#fecaca',
    },
    errorBannerText: { flex: 1, fontSize: 12, color: '#dc2626', fontWeight: '600' },
    errorRetry: { fontSize: 12, color: '#4f46e5', fontWeight: '700', marginLeft: 8 },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    headerTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
    headerSub: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
    addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },

    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },

    // Section
    section: { marginBottom: 28 },
    sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    sectionLabel: { fontSize: 13, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
    sectionSub: { fontSize: 12, color: '#94a3b8', marginBottom: 14 },
    sectionTag: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    sectionTagText: { fontSize: 10, fontWeight: '800', color: '#10b981' },

    // Empty hero
    emptyHero: {
        alignItems: 'center', paddingVertical: 32,
        backgroundColor: '#fff', borderRadius: 20,
        borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed',
        marginBottom: 28,
    },
    emptyIconRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 8 },
    emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, paddingHorizontal: 24, marginBottom: 20 },
    emptyCreateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    emptyCreateBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },

    // Active programs
    activeList: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', marginBottom: 12 },
    activeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    activeIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    activeInfo: { flex: 1 },
    activeName: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
    activeDesc: { fontSize: 11, color: '#94a3b8' },
    addMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 12, backgroundColor: '#f0fdf4', borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' },
    addMoreBtnText: { fontSize: 13, fontWeight: '800', color: '#10b981' },

    // Type card
    typeList: { gap: 10 },
    typeCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#fff', borderRadius: 16,
        borderWidth: 1, borderColor: '#e2e8f0', padding: 14,
    },
    typeIconBox: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    typeInfo: { flex: 1 },
    typeNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    typeName: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
    typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
    typeBadgeText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
    typeDesc: { fontSize: 11, color: '#64748b', lineHeight: 16 },

    // Tips
    tipsCard: { backgroundColor: '#fffbeb', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#fef3c7' },
    tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    tipsTitle: { fontSize: 13, fontWeight: '900', color: '#92400e' },
    tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
    tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f59e0b', marginTop: 5 },
    tipText: { flex: 1, fontSize: 12, color: '#78350f', lineHeight: 18 },

    // Modal picker
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 40, maxHeight: '85%' },
    pickerHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    pickerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
    pickerSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    pickerClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    pickerCloseText: { fontSize: 13, color: '#64748b', fontWeight: '700' },
    pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    pickerIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    pickerInfo: { flex: 1 },
    pickerName: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
    pickerDesc: { fontSize: 11, color: '#64748b', lineHeight: 16 },
    pickerBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    pickerBadgeText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
});

export default MerchantPrograms;
