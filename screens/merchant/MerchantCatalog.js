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
// expo-image-picker requires a native build — safe-require so Expo Go doesn't crash
let ImagePicker = null;
try { ImagePicker = require('expo-image-picker'); } catch (_) {}
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const SCREEN_H = Dimensions.get('window').height;
import Badge from '../../components/old_app/common/Badge';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { getRewardDetails } from '../../utils/rewardDetails';

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

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
const RewardFormModal = ({ visible, reward, merchantId, stores, onSave, onClose }) => {
    const isEdit = !!reward?.id;
    const translateY = useRef(new Animated.Value(0)).current;

    // Reset position every time modal opens
    useEffect(() => {
        if (visible) translateY.setValue(0);
    }, [visible]);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
            onPanResponderMove: (_, { dy }) => {
                if (dy > 0) translateY.setValue(dy);
            },
            onPanResponderRelease: (_, { dy, vy }) => {
                if (dy > 100 || vy > 0.5) {
                    Animated.timing(translateY, {
                        toValue: 700,
                        duration: 220,
                        useNativeDriver: true,
                    }).start(() => {
                        translateY.setValue(0);
                        onClose();
                    });
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

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
        storeId: '',
        imageUri: null,
        imageChanged: false,
        productDetails: emptyProductDetails(),
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
    const [storeSearch, setStoreSearch] = useState('');
    const [detailsExpanded, setDetailsExpanded] = useState(false);
    const scrollRef = useRef(null);

    // Auto-select the only store when there is exactly one; otherwise start blank
    const defaultStoreId = stores?.length === 1 ? stores[0].id : '';

    useEffect(() => {
        if (visible) {
            setError(null);
            setFieldErrors({});
            setStoreDropdownOpen(false);
            setStoreSearch('');
            setDetailsExpanded(false);
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
                storeId: reward.storeId || defaultStoreId,
                imageUri: reward.imageUrl || null,
                imageChanged: false,
                productDetails: initProductDetails(reward),
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
                storeId: defaultStoreId,
                imageUri: null,
                imageChanged: false,
                productDetails: emptyProductDetails(),
            });
        }
    }, [visible, reward, stores]);

    const pickImage = async () => {
        if (!ImagePicker) {
            setError('Image picker unavailable — run a development build (npx expo run:ios) to upload images.');
            return;
        }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setError('Photo library permission is required to upload images.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) {
            setForm(f => ({ ...f, imageUri: result.assets[0].uri, imageChanged: true }));
        }
    };

    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('@dandan_auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const handleSave = async () => {
        // Collect all field-level errors before touching the API
        const errs = {};
        if (!form.name.trim())
            errs.name = 'Reward name is required';
        if (!form.storeId)
            errs.storeId = 'Select the store that offers this reward';
        if (!form.pointsPrice || isNaN(parseInt(form.pointsPrice)) || parseInt(form.pointsPrice) <= 0)
            errs.pointsPrice = 'Points cost is required (must be > 0)';
        if (!form.stock || isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0)
            errs.stock = 'Stock quantity is required';

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            // Scroll to top so the user can see the first error
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }
        setFieldErrors({});
        setSaving(true);
        setError(null);
        try {
            const token = await AsyncStorage.getItem('@dandan_auth_token');
            const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

            // Clean productDetails — strip blank entries
            const pd = form.productDetails;
            const cleanDetails = {
                category:   pd.category.trim(),
                highlights: pd.highlights.filter(h => h.trim()),
                specs:      pd.specs.filter(s => s.label.trim() && s.value.trim()),
                includes:   (pd.includes || []).filter(i => i.trim()),
                allergens:  pd.allergens.trim(),
                terms:      pd.terms.trim(),
            };

            let res;
            if (form.imageChanged && form.imageUri) {
                const formData = new FormData();
                formData.append('merchantId', String(merchantId));
                formData.append('storeId', String(form.storeId));
                formData.append('name', form.name.trim());
                if (form.description.trim()) formData.append('description', form.description.trim());
                formData.append('type', form.type);
                formData.append('price', String(parseFloat(form.price) || 0));
                if (form.pointsPrice) formData.append('pointsPrice', String(parseInt(form.pointsPrice)));
                formData.append('stock', String(form.stock === '∞' ? 9999999 : parseInt(form.stock) || 0));
                formData.append('isEnabled', String(form.isEnabled));
                formData.append('isGreenReward', String(form.isGreenReward));
                if (form.carbonOffsetKg) formData.append('carbonOffsetKg', String(parseFloat(form.carbonOffsetKg)));
                if (form.ecoDescription.trim()) formData.append('ecoDescription', form.ecoDescription.trim());
                formData.append('productDetails', JSON.stringify(cleanDetails));
                const ext = form.imageUri.split('.').pop()?.toLowerCase() || 'jpg';
                formData.append('image', {
                    uri: form.imageUri,
                    name: `reward.${ext}`,
                    type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
                });
                const url = isEdit
                    ? `${API_URL}/catalog/rewards/${reward.id}`
                    : `${API_URL}/catalog/rewards`;
                res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: authHeader, body: formData });
            } else {
                const headers = { 'Content-Type': 'application/json', ...authHeader };
                const payload = {
                    merchantId,
                    storeId: form.storeId,
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
                    productDetails: cleanDetails,
                };
                const url = isEdit
                    ? `${API_URL}/catalog/rewards/${reward.id}`
                    : `${API_URL}/catalog/rewards`;
                res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers, body: JSON.stringify(payload) });
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

    const filteredStores = (stores || []).filter(s =>
        (s.name || '').toLowerCase().includes(storeSearch.toLowerCase())
    );
    const selectedStoreName = (stores || []).find(s => s.id === form.storeId)?.name || null;

    const field = (label, key, opts = {}) => {
        const err = fieldErrors[key];
        return (
            <View style={modalStyles.field}>
                <Text style={modalStyles.label}>{label}</Text>
                <TextInput
                    style={[modalStyles.input, err && modalStyles.inputError]}
                    value={String(form[key] ?? '')}
                    placeholder={opts.placeholder || ''}
                    keyboardType={opts.numeric ? 'numeric' : 'default'}
                    onChangeText={(v) => {
                        setForm({ ...form, [key]: v });
                        if (err) setFieldErrors(prev => ({ ...prev, [key]: undefined }));
                    }}
                    multiline={opts.multiline}
                    numberOfLines={opts.multiline ? 3 : 1}
                />
                {err ? <Text style={modalStyles.fieldError}>{err}</Text> : null}
            </View>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            {/* Tap dark backdrop to close */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={modalStyles.overlay}>
                    {/* Stop touch propagation so taps inside sheet don't close it */}
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[modalStyles.sheet, { transform: [{ translateY }] }]}
                        >
                            {/* Draggable handle — pan responder lives here */}
                            <View
                                style={modalStyles.sheetHandleHitArea}
                                {...panResponder.panHandlers}
                            >
                                <View style={modalStyles.sheetHandle} />
                            </View>
                            <Text style={modalStyles.sheetTitle}>{isEdit ? 'Edit Reward' : 'New Reward Item'}</Text>

                            <KeyboardAvoidingView
                                style={{ flex: 1 }}
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                keyboardVerticalOffset={8}
                            >
                            <ScrollView
                                ref={scrollRef}
                                showsVerticalScrollIndicator={false}
                                style={modalStyles.scroll}
                                contentContainerStyle={modalStyles.scrollContent}
                                keyboardShouldPersistTaps="handled"
                                nestedScrollEnabled
                            >

                        {/* Image picker — preview matches customer card dimensions (100px wide side image) */}
                        <View style={modalStyles.imageSection}>
                            <Text style={modalStyles.label}>Reward Photo</Text>
                            <View style={modalStyles.imagePreviewCard}>
                                <TouchableOpacity style={modalStyles.imagePickerBox} onPress={pickImage} activeOpacity={0.75}>
                                    {form.imageUri ? (
                                        <Image source={{ uri: form.imageUri }} style={modalStyles.imagePreview} />
                                    ) : (
                                        <View style={modalStyles.imagePlaceholder}>
                                            <ImageIcon size={22} color="#94a3b8" />
                                            <Text style={modalStyles.imagePlaceholderText}>Tap to add photo</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <View style={modalStyles.imageCardContent}>
                                    <Text style={modalStyles.imageCardTitle} numberOfLines={1}>
                                        {form.name.trim() || 'Reward Name'}
                                    </Text>
                                    <Text style={modalStyles.imageCardCost}>
                                        {form.pointsPrice ? `${form.pointsPrice} pts` : '— pts'}
                                    </Text>
                                    <Text style={modalStyles.imageCardHint}>Customer card preview</Text>
                                </View>
                                {form.imageUri ? (
                                    <TouchableOpacity
                                        style={modalStyles.imageClearBtn}
                                        onPress={() => setForm(f => ({ ...f, imageUri: null, imageChanged: true }))}
                                    >
                                        <X size={12} color="#fff" />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>

                        {/* Store picker — required: which store offers this reward */}
                        <View style={modalStyles.field}>
                            <Text style={[modalStyles.label, fieldErrors.storeId && modalStyles.labelError]}>
                                Offered at Store *
                            </Text>
                            {(stores || []).length === 0 ? (
                                <View style={{ backgroundColor: '#fef9c3', borderRadius: 10, padding: 12, marginTop: 4 }}>
                                    <Text style={{ fontSize: 12, color: '#854d0e', fontWeight: '700', marginBottom: 2 }}>
                                        No stores found
                                    </Text>
                                    <Text style={{ fontSize: 12, color: '#92400e' }}>
                                        Go to the Programs tab and create a store first. Rewards must be linked to the store where they are offered.
                                    </Text>
                                </View>
                            ) : (
                                <View>
                                    {/* Trigger */}
                                    <TouchableOpacity
                                        activeOpacity={0.75}
                                        style={[
                                            modalStyles.ddTrigger,
                                            fieldErrors.storeId && modalStyles.ddTriggerError,
                                            storeDropdownOpen && modalStyles.ddTriggerOpen,
                                        ]}
                                        onPress={() => {
                                            setStoreDropdownOpen(v => !v);
                                            setStoreSearch('');
                                        }}
                                    >
                                        <Text
                                            style={selectedStoreName ? modalStyles.ddValue : modalStyles.ddPlaceholder}
                                            numberOfLines={1}
                                        >
                                            {selectedStoreName || 'Select a store…'}
                                        </Text>
                                        <ChevronDown
                                            size={16}
                                            color="#64748b"
                                            style={storeDropdownOpen && { transform: [{ rotate: '180deg' }] }}
                                        />
                                    </TouchableOpacity>

                                    {/* Dropdown panel */}
                                    {storeDropdownOpen && (
                                        <View style={modalStyles.ddPanel}>
                                            {/* Search row */}
                                            <View style={modalStyles.ddSearchRow}>
                                                <Search size={14} color="#94a3b8" />
                                                <TextInput
                                                    style={modalStyles.ddSearchInput}
                                                    placeholder="Search stores…"
                                                    placeholderTextColor="#94a3b8"
                                                    value={storeSearch}
                                                    onChangeText={setStoreSearch}
                                                    autoFocus
                                                />
                                                {storeSearch.length > 0 && (
                                                    <TouchableOpacity onPress={() => setStoreSearch('')}>
                                                        <X size={14} color="#94a3b8" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            {/* Results */}
                                            <ScrollView
                                                style={modalStyles.ddList}
                                                keyboardShouldPersistTaps="handled"
                                                nestedScrollEnabled
                                            >
                                                {filteredStores.length === 0 ? (
                                                    <Text style={modalStyles.ddEmpty}>
                                                        No stores match "{storeSearch}"
                                                    </Text>
                                                ) : filteredStores.map(s => {
                                                    const selected = form.storeId === s.id;
                                                    return (
                                                        <TouchableOpacity
                                                            key={s.id}
                                                            activeOpacity={0.75}
                                                            style={[modalStyles.ddItem, selected && modalStyles.ddItemSelected]}
                                                            onPress={() => {
                                                                setForm(f => ({ ...f, storeId: s.id }));
                                                                setFieldErrors(e => ({ ...e, storeId: undefined }));
                                                                setStoreDropdownOpen(false);
                                                                setStoreSearch('');
                                                            }}
                                                        >
                                                            <Text
                                                                style={[modalStyles.ddItemText, selected && modalStyles.ddItemTextSelected]}
                                                                numberOfLines={1}
                                                            >
                                                                {s.name || s.id}
                                                            </Text>
                                                            {selected && <Check size={14} color="#4f46e5" />}
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                            )}
                            {fieldErrors.storeId ? (
                                <Text style={modalStyles.fieldError}>{fieldErrors.storeId}</Text>
                            ) : null}
                        </View>

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
                        {field('Points Cost *', 'pointsPrice', { placeholder: 'e.g. 200', numeric: true })}
                        {field('Fiat Price ($)', 'price', { placeholder: '0.00', numeric: true })}
                        {field('Stock *', 'stock', { placeholder: 'e.g. 100', numeric: true })}

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

                        {/* ── Product Details (collapsible) ────────────────────── */}
                        <View style={modalStyles.detailsSection}>
                            <TouchableOpacity
                                style={modalStyles.detailsHeader}
                                onPress={() => setDetailsExpanded(v => !v)}
                                activeOpacity={0.7}
                            >
                                <View style={modalStyles.detailsHeaderLeft}>
                                    <Text style={modalStyles.detailsHeaderTitle}>Product Details</Text>
                                    <Text style={modalStyles.detailsHeaderSub}>
                                        Shown on customer reward screen
                                    </Text>
                                </View>
                                <ChevronDown
                                    size={16}
                                    color="#64748b"
                                    style={detailsExpanded ? { transform: [{ rotate: '180deg' }] } : {}}
                                />
                            </TouchableOpacity>

                            {/* Auto-suggest strip (only when expanded & name exists) */}
                            {detailsExpanded && form.name.trim() && (
                                <TouchableOpacity
                                    style={modalStyles.autoSuggestBtn}
                                    onPress={() => setForm(f => ({
                                        ...f,
                                        productDetails: initProductDetails({ name: f.name }),
                                    }))}
                                    activeOpacity={0.75}
                                >
                                    <Text style={modalStyles.autoSuggestText}>
                                        ✨ Auto-fill from "{form.name.trim()}"
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {detailsExpanded && (
                                <View style={modalStyles.detailsBody}>

                                    {/* Category */}
                                    <View style={modalStyles.field}>
                                        <Text style={modalStyles.label}>Category</Text>
                                        <TextInput
                                            style={modalStyles.input}
                                            placeholder="e.g. Hot Coffee"
                                            placeholderTextColor="#cbd5e1"
                                            value={form.productDetails.category}
                                            onChangeText={v => setForm(f => ({
                                                ...f,
                                                productDetails: { ...f.productDetails, category: v },
                                            }))}
                                        />
                                    </View>

                                    {/* Highlights */}
                                    <View style={modalStyles.field}>
                                        <Text style={modalStyles.label}>Highlights (up to 3)</Text>
                                        <Text style={modalStyles.fieldHint}>
                                            Short emoji phrases shown as chips, e.g. "☕ Freshly Brewed"
                                        </Text>
                                        {[0, 1, 2].map(i => (
                                            <TextInput
                                                key={i}
                                                style={[modalStyles.input, i < 2 && { marginBottom: 6 }]}
                                                placeholder={`Highlight ${i + 1}`}
                                                placeholderTextColor="#cbd5e1"
                                                value={form.productDetails.highlights[i] || ''}
                                                onChangeText={v => {
                                                    const h = [...form.productDetails.highlights];
                                                    h[i] = v;
                                                    setForm(f => ({
                                                        ...f,
                                                        productDetails: { ...f.productDetails, highlights: h },
                                                    }));
                                                }}
                                            />
                                        ))}
                                    </View>

                                    {/* Product Specs */}
                                    <View style={modalStyles.field}>
                                        <View style={modalStyles.fieldRowHeader}>
                                            <Text style={modalStyles.label}>Product Specs</Text>
                                            <TouchableOpacity
                                                style={modalStyles.addRowBtn}
                                                onPress={() => setForm(f => ({
                                                    ...f,
                                                    productDetails: {
                                                        ...f.productDetails,
                                                        specs: [...f.productDetails.specs, { label: '', value: '' }],
                                                    },
                                                }))}
                                                disabled={form.productDetails.specs.length >= 8}
                                            >
                                                <Plus size={11} color="#4f46e5" />
                                                <Text style={modalStyles.addRowBtnText}>Add Row</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {form.productDetails.specs.length === 0 && (
                                            <Text style={modalStyles.emptyListHint}>No specs yet — tap Add Row.</Text>
                                        )}
                                        {form.productDetails.specs.map((spec, i) => (
                                            <View key={i} style={modalStyles.dynRow}>
                                                <TextInput
                                                    style={[modalStyles.input, modalStyles.dynLabel]}
                                                    placeholder="Label"
                                                    placeholderTextColor="#cbd5e1"
                                                    value={spec.label}
                                                    onChangeText={v => {
                                                        const s = [...form.productDetails.specs];
                                                        s[i] = { ...s[i], label: v };
                                                        setForm(f => ({ ...f, productDetails: { ...f.productDetails, specs: s } }));
                                                    }}
                                                />
                                                <TextInput
                                                    style={[modalStyles.input, modalStyles.dynValue]}
                                                    placeholder="Value"
                                                    placeholderTextColor="#cbd5e1"
                                                    value={spec.value}
                                                    onChangeText={v => {
                                                        const s = [...form.productDetails.specs];
                                                        s[i] = { ...s[i], value: v };
                                                        setForm(f => ({ ...f, productDetails: { ...f.productDetails, specs: s } }));
                                                    }}
                                                />
                                                <TouchableOpacity
                                                    style={modalStyles.removeRowBtn}
                                                    onPress={() => {
                                                        const s = form.productDetails.specs.filter((_, idx) => idx !== i);
                                                        setForm(f => ({ ...f, productDetails: { ...f.productDetails, specs: s } }));
                                                    }}
                                                >
                                                    <Minus size={13} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>

                                    {/* What's Included */}
                                    <View style={modalStyles.field}>
                                        <View style={modalStyles.fieldRowHeader}>
                                            <Text style={modalStyles.label}>What's Included</Text>
                                            <TouchableOpacity
                                                style={modalStyles.addRowBtn}
                                                onPress={() => setForm(f => ({
                                                    ...f,
                                                    productDetails: {
                                                        ...f.productDetails,
                                                        includes: [...(f.productDetails.includes || []), ''],
                                                    },
                                                }))}
                                                disabled={(form.productDetails.includes?.length || 0) >= 5}
                                            >
                                                <Plus size={11} color="#4f46e5" />
                                                <Text style={modalStyles.addRowBtnText}>Add</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {(form.productDetails.includes || []).map((item, i) => (
                                            <View key={i} style={modalStyles.dynRow}>
                                                <TextInput
                                                    style={[modalStyles.input, { flex: 1 }]}
                                                    placeholder={`Included item ${i + 1}`}
                                                    placeholderTextColor="#cbd5e1"
                                                    value={item}
                                                    onChangeText={v => {
                                                        const inc = [...(form.productDetails.includes || [])];
                                                        inc[i] = v;
                                                        setForm(f => ({ ...f, productDetails: { ...f.productDetails, includes: inc } }));
                                                    }}
                                                />
                                                <TouchableOpacity
                                                    style={modalStyles.removeRowBtn}
                                                    onPress={() => {
                                                        const inc = (form.productDetails.includes || []).filter((_, idx) => idx !== i);
                                                        setForm(f => ({ ...f, productDetails: { ...f.productDetails, includes: inc } }));
                                                    }}
                                                >
                                                    <Minus size={13} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Allergen notice */}
                                    <View style={modalStyles.field}>
                                        <Text style={modalStyles.label}>Allergen / Dietary Notice</Text>
                                        <TextInput
                                            style={modalStyles.input}
                                            placeholder="e.g. Contains dairy and gluten."
                                            placeholderTextColor="#cbd5e1"
                                            value={form.productDetails.allergens}
                                            onChangeText={v => setForm(f => ({
                                                ...f,
                                                productDetails: { ...f.productDetails, allergens: v },
                                            }))}
                                            multiline
                                            numberOfLines={2}
                                        />
                                    </View>

                                    {/* Terms */}
                                    <View style={modalStyles.field}>
                                        <Text style={modalStyles.label}>Terms & Conditions</Text>
                                        <TextInput
                                            style={[modalStyles.input, { minHeight: 72, textAlignVertical: 'top' }]}
                                            placeholder="e.g. Valid at participating outlets. One per customer."
                                            placeholderTextColor="#cbd5e1"
                                            value={form.productDetails.terms}
                                            onChangeText={v => setForm(f => ({
                                                ...f,
                                                productDetails: { ...f.productDetails, terms: v },
                                            }))}
                                            multiline
                                            numberOfLines={3}
                                        />
                                    </View>

                                </View>
                            )}
                        </View>

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
                            </KeyboardAvoidingView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: 20,
        maxHeight: SCREEN_H * 0.93,
        height: SCREEN_H * 0.93,
        flexDirection: 'column',
    },
    sheetHandleHitArea: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
    sheetHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 48 },
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
    fieldError: { fontSize: 11, color: '#dc2626', fontWeight: '600', marginTop: 4 },
    inputError: { borderColor: '#dc2626', backgroundColor: '#fff5f5' },
    labelError: { color: '#dc2626' },
    actions: {
        flexDirection: 'row', gap: 12,
        paddingTop: 12, paddingBottom: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#f1f5f9',
    },
    // Store searchable dropdown
    ddTrigger: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 11,
        backgroundColor: '#f8fafc', marginTop: 4,
    },
    ddTriggerOpen: { borderColor: '#4f46e5', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    ddTriggerError: { borderColor: '#dc2626', backgroundColor: '#fff5f5' },
    ddValue: { flex: 1, fontSize: 14, color: '#0f172a', marginRight: 8 },
    ddPlaceholder: { flex: 1, fontSize: 14, color: '#94a3b8', marginRight: 8 },
    ddPanel: {
        borderWidth: 1, borderTopWidth: 0, borderColor: '#4f46e5',
        borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
        backgroundColor: '#fff', overflow: 'hidden',
    },
    ddSearchRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 10, paddingVertical: 9,
        borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    ddSearchInput: { flex: 1, fontSize: 13, color: '#0f172a', paddingVertical: 0 },
    ddList: { maxHeight: 180 },
    ddItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, paddingVertical: 11,
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    ddItemSelected: { backgroundColor: '#eef2ff' },
    ddItemText: { flex: 1, fontSize: 14, color: '#374151', marginRight: 8 },
    ddItemTextSelected: { color: '#4f46e5', fontWeight: '700' },
    ddEmpty: { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 14 },
    // Image picker
    imageSection: { marginBottom: 16 },
    imagePreviewCard: {
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        height: 90,
    },
    imagePickerBox: {
        width: 100,
        height: '100%',
        backgroundColor: '#f1f5f9',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    imagePlaceholderText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#94a3b8',
        textAlign: 'center',
    },
    imageCardContent: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
        gap: 3,
    },
    imageCardTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#0f172a',
    },
    imageCardCost: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4f46e5',
    },
    imageCardHint: {
        fontSize: 9,
        fontWeight: '600',
        color: '#cbd5e1',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    imageClearBtn: {
        position: 'absolute',
        top: 6,
        left: 6,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: '#10b981', alignItems: 'center' },
    saveBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },

    // ── Product details section ───────────────────────────────────────────────
    detailsSection: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 14,
        marginBottom: 12,
    },
    detailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 13,
        backgroundColor: '#f8fafc',
    },
    detailsHeaderLeft: { flex: 1 },
    detailsHeaderTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#0f172a',
    },
    detailsHeaderSub: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 1,
    },
    autoSuggestBtn: {
        marginHorizontal: 14,
        marginTop: 10,
        backgroundColor: '#eef2ff',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
    },
    autoSuggestText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4f46e5',
    },
    detailsBody: {
        padding: 14,
        paddingTop: 8,
        gap: 0,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    fieldHint: {
        fontSize: 11,
        color: '#94a3b8',
        marginBottom: 6,
        lineHeight: 15,
    },
    fieldRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    addRowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#eef2ff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    addRowBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4f46e5',
    },
    dynRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    dynLabel: { flex: 2 },
    dynValue: { flex: 3 },
    removeRowBtn: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    emptyListHint: {
        fontSize: 11,
        color: '#cbd5e1',
        fontStyle: 'italic',
        marginBottom: 4,
    },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MerchantCatalog = () => {
    const { merchantProfile } = useAuth();
    const merchantId = merchantProfile?.id;

    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
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

    useEffect(() => {
        loadRewards();
        loadStores();
    }, [loadRewards, loadStores]);

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

            <RewardFormModal
                visible={modalVisible}
                reward={editingReward}
                merchantId={merchantId}
                stores={stores}
                onSave={handleSave}
                onClose={() => setModalVisible(false)}
            />
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
