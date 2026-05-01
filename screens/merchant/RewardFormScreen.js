import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import {
    Check,
    ChevronDown,
    ImageIcon,
    Leaf,
    Minus,
    Plus,
    Search,
    X,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import ScreenWrapper from '@/components/old_app/common/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { getRewardDetails } from '../../utils/rewardDetails';

const SCREEN_H = Dimensions.get('window').height;
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

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
            category: pd.category || '',
            highlights: [...(pd.highlights || []), '', '', ''].slice(0, 3),
            specs: pd.specs || [],
            includes: pd.includes || [],
            allergens: pd.allergens || '',
            terms: pd.terms || '',
        };
    }
    if (reward?.name) {
        const mock = getRewardDetails(reward.name);
        return {
            category: mock.category || '',
            highlights: [...mock.highlights, '', ''].slice(0, 3),
            specs: mock.specs || [],
            includes: mock.includes || [],
            allergens: mock.allergens || '',
            terms: mock.terms || '',
        };
    }
    return emptyProductDetails();
};

const RewardFormScreen = () => {
    const { merchantProfile } = useAuth();
    const merchantId = merchantProfile?.id;

    const params = useLocalSearchParams();


    const isEdit = !!params.id;
    const [reward, setReward] = useState(null);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(isEdit);

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

    const getAuthHeaders = async () => {
        const token = await AsyncStorage.getItem('@dandan_auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    // Load stores and existing reward if editing
    useEffect(() => {
        const init = async () => {
            if (!merchantId) return;
            try {
                const headers = await getAuthHeaders();

                // Fetch stores
                const storeRes = await fetch(`${API_URL}/stores/merchant/${merchantId}`, { headers });
                const storeData = await storeRes.json();
                const storeList = Array.isArray(storeData) ? storeData : [];
                setStores(storeList);

                if (isEdit) {
                    const res = await fetch(`${API_URL}/catalog/rewards/${params.id}`, { headers });
                    const data = await res.json();
                    if (res.ok) {
                        setReward(data);
                        setForm({
                            name: data.name || '',
                            description: data.description || '',
                            type: data.type || 'SINGLE',
                            price: String(data.price ?? '0'),
                            pointsPrice: data.pointsPrice != null ? String(data.pointsPrice) : '',
                            stock: String(data.stock ?? '100'),
                            isEnabled: data.isEnabled !== false,
                            isGreenReward: data.isGreenReward || false,
                            carbonOffsetKg: data.carbonOffsetKg ? String(data.carbonOffsetKg) : '',
                            ecoDescription: data.ecoDescription || '',
                            storeId: data.storeId || (storeList.length === 1 ? storeList[0].id : ''),
                            imageUri: data.imageUrl || null,
                            imageChanged: false,
                            productDetails: initProductDetails(data),
                        });
                    }
                } else {
                    setForm(f => ({
                        ...f,
                        storeId: storeList.length === 1 ? storeList[0].id : '',
                    }));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [merchantId, isEdit, params.id]);

    const handleSave = async () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Reward name is required';
        if (!form.storeId) errs.storeId = 'Select the store that offers this reward';
        if (!form.pointsPrice || isNaN(parseInt(form.pointsPrice)) || parseInt(form.pointsPrice) <= 0)
            errs.pointsPrice = 'Points cost is required (must be > 0)';
        if (!form.stock || isNaN(parseInt(form.stock)) || parseInt(form.stock) < 0)
            errs.stock = 'Stock quantity is required';

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }
        setFieldErrors({});
        setSaving(true);
        setError(null);

        try {
            const token = await AsyncStorage.getItem('@dandan_auth_token');
            const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
            const pd = form.productDetails;
            const cleanDetails = {
                category: pd.category.trim(),
                highlights: pd.highlights.filter(h => h.trim()),
                specs: pd.specs.filter(s => s.label.trim() && s.value.trim()),
                includes: (pd.includes || []).filter(i => i.trim()),
                allergens: pd.allergens.trim(),
                terms: pd.terms.trim(),
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
                const url = isEdit ? `${API_URL}/catalog/rewards/${params.id}` : `${API_URL}/catalog/rewards`;
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
                const url = isEdit ? `${API_URL}/catalog/rewards/${params.id}` : `${API_URL}/catalog/rewards`;
                res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers, body: JSON.stringify(payload) });
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save reward');
            }
            router.back();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const pickImage = async () => {
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

    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [kbVersion, setKbVersion] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);
    const lastScrollY = useRef(0);

    const handleFocus = () => {
        setIsKeyboardVisible(true);
    }
    const handleBlur = () => {
        setIsKeyboardVisible(false);
        setScrollOffset(lastScrollY.current);
        setKbVersion(v => v + 1);
    }

    useEffect(() => {
        const hideSubscription = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setIsKeyboardVisible(false);
                setScrollOffset(lastScrollY.current);
                setKbVersion(v => v + 1);
            }
        );
        return () => hideSubscription.remove();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    const filteredStores = stores.filter(s => (s.name || '').toLowerCase().includes(storeSearch.toLowerCase()));

    const selectedStoreName = stores.find(s => s.id === form.storeId)?.name || null;

    const field = (label, key, opts = {}) => {
        const err = fieldErrors[key];
        return (
            <View style={styles.field}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                    style={[styles.input, err && styles.inputError]}
                    value={String(form[key] ?? '')}
                    placeholder={opts.placeholder || ''}
                    keyboardType={opts.numeric ? 'numeric' : 'default'}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChangeText={(v) => {
                        setForm({ ...form, [key]: v });
                        if (err) setFieldErrors(prev => ({ ...prev, [key]: undefined }));
                    }}
                    multiline={opts.multiline}
                    numberOfLines={opts.multiline ? 3 : 1}
                />
                {err ? <Text style={styles.fieldError}>{err}</Text> : null}
            </View>
        );
    };

    return (
        <>
            <ScreenWrapper backgroundColor="#fff" paddingHorizontal={0} bottomPadding={0} scroll={false}>
                <KeyboardAvoidingView
                    key={`kb-${kbVersion}`}
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : (isKeyboardVisible ? 50 : 0)}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <X size={20} color="#0f172a" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{isEdit ? 'Edit Reward' : 'New Reward Item'}</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView
                        ref={scrollRef}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        contentOffset={{ x: 0, y: scrollOffset }}
                        onScroll={(e) => { lastScrollY.current = e.nativeEvent.contentOffset.y; }}
                        scrollEventThrottle={16}
                    >
                        {/* Image Section */}
                        <View style={styles.imageSection}>
                            <Text style={styles.label}>Reward Photo</Text>
                            <View style={styles.imagePreviewCard}>
                                <TouchableOpacity style={styles.imagePickerBox} activeOpacity={0.75} onPress={pickImage}>
                                    {form.imageUri ? (
                                        <Image source={{ uri: form.imageUri }} style={styles.imagePreview} />
                                    ) : (
                                        <View style={styles.imagePlaceholder}>
                                            <ImageIcon size={22} color="#94a3b8" />
                                            <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <View style={styles.imageCardContent}>
                                    <Text style={styles.imageCardTitle} numberOfLines={1}>
                                        {form.name.trim() || 'Reward Name'}
                                    </Text>
                                    <Text style={styles.imageCardCost}>
                                        {form.pointsPrice ? `${form.pointsPrice} pts` : '— pts'}
                                    </Text>
                                    <Text style={styles.imageCardHint}>Customer card preview</Text>
                                </View>
                                {form.imageUri && (
                                    <TouchableOpacity
                                        style={styles.imageClearBtn}
                                        onPress={() => setForm(f => ({ ...f, imageUri: null, imageChanged: true }))}
                                    >
                                        <X size={12} color="#fff" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Store Picker */}
                        <View style={styles.field}>
                            <Text style={[styles.label, fieldErrors.storeId && styles.labelError]}>Offered at Store *</Text>
                            <TouchableOpacity
                                activeOpacity={0.75}
                                style={[styles.ddTrigger, fieldErrors.storeId && styles.ddTriggerError, storeDropdownOpen && styles.ddTriggerOpen]}
                                onPress={() => setStoreDropdownOpen(!storeDropdownOpen)}
                            >
                                <Text style={selectedStoreName ? styles.ddValue : styles.ddPlaceholder} numberOfLines={1}>
                                    {selectedStoreName || 'Select a store…'}
                                </Text>
                                <ChevronDown size={16} color="#64748b" style={storeDropdownOpen && { transform: [{ rotate: '180deg' }] }} />
                            </TouchableOpacity>

                            {storeDropdownOpen && (
                                <View style={styles.ddPanel}>
                                    <View style={styles.ddSearchRow}>
                                        <Search size={14} color="#94a3b8" />
                                        <TextInput
                                            style={styles.ddSearchInput}
                                            placeholder="Search stores…"
                                            value={storeSearch}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                            onChangeText={setStoreSearch}
                                        />
                                    </View>
                                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                                        {filteredStores.map(s => (
                                            <TouchableOpacity
                                                key={s.id}
                                                style={[styles.ddItem, form.storeId === s.id && styles.ddItemSelected]}
                                                onPress={() => {
                                                    setForm({ ...form, storeId: s.id });
                                                    setStoreDropdownOpen(false);
                                                }}
                                            >
                                                <Text style={styles.ddItemText}>{s.name}</Text>
                                                {form.storeId === s.id && <Check size={14} color="#4f46e5" />}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                            {fieldErrors.storeId && <Text style={styles.fieldError}>{fieldErrors.storeId}</Text>}
                        </View>

                        {/* Type toggle */}
                        <View style={styles.typeRow}>
                            {['SINGLE', 'BUNDLE'].map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
                                    onPress={() => setForm({ ...form, type: t })}
                                >
                                    <Text style={[styles.typeBtnText, form.type === t && styles.typeBtnTextActive]}>
                                        {t === 'SINGLE' ? 'Single Reward' : 'Bundle'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Form Fields */}
                        {field('Reward Name *', 'name', { placeholder: 'e.g. Free Flat White' })}
                        {field('Description', 'description', { placeholder: 'Optional', multiline: true })}
                        {field('Points Cost *', 'pointsPrice', { placeholder: 'e.g. 200', numeric: true })}
                        {field('Fiat Price ($)', 'price', { placeholder: '0.00', numeric: true })}
                        {field('Stock *', 'stock', { placeholder: 'e.g. 100', numeric: true })}

                        {/* Enabled toggle */}
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Enabled</Text>
                            <TouchableOpacity
                                style={[styles.toggleBtn, form.isEnabled && styles.toggleBtnOn]}
                                onPress={() => setForm({ ...form, isEnabled: !form.isEnabled })}
                            >
                                <Text style={styles.toggleBtnText}>{form.isEnabled ? 'Yes' : 'No'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Green reward toggle */}
                        <View style={styles.toggleRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Leaf size={14} color="#10b981" />
                                <Text style={styles.toggleLabel}>Green Reward</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.toggleBtn, form.isGreenReward && styles.toggleBtnOn]}
                                onPress={() => setForm({ ...form, isGreenReward: !form.isGreenReward })}
                            >
                                <Text style={styles.toggleBtnText}>{form.isGreenReward ? 'Yes' : 'No'}</Text>
                            </TouchableOpacity>
                        </View>

                        {form.isGreenReward && (
                            <>
                                {field('CO₂ Offset (kg)', 'carbonOffsetKg', { placeholder: 'e.g. 2.5', numeric: true })}
                                {field('Eco Description', 'ecoDescription', { placeholder: 'e.g. Made from recycled materials', multiline: true })}
                            </>
                        )}

                        {/* Product Details (collapsible) */}
                        <View style={styles.detailsSection}>
                            <TouchableOpacity
                                style={styles.detailsHeader}
                                onPress={() => setDetailsExpanded(!detailsExpanded)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.detailsHeaderLeft}>
                                    <Text style={styles.detailsHeaderTitle}>Product Details</Text>
                                    <Text style={styles.detailsHeaderSub}>Shown on customer reward screen</Text>
                                </View>
                                <ChevronDown
                                    size={16}
                                    color="#64748b"
                                    style={detailsExpanded ? { transform: [{ rotate: '180deg' }] } : {}}
                                />
                            </TouchableOpacity>

                            {detailsExpanded && form.name.trim() && (
                                <TouchableOpacity
                                    style={styles.autoSuggestBtn}
                                    onPress={() => setForm(f => ({
                                        ...f,
                                        productDetails: initProductDetails({ name: f.name }),
                                    }))}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.autoSuggestText}>
                                        ✨ Auto-fill from "{form.name.trim()}"
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {detailsExpanded && (
                                <View style={styles.detailsBody}>
                                    {/* Category */}
                                    <View style={styles.field}>
                                        <Text style={styles.label}>Category</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g. Hot Coffee"
                                            placeholderTextColor="#cbd5e1"
                                            value={form.productDetails.category}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                            onChangeText={v => setForm(f => ({
                                                ...f,
                                                productDetails: { ...f.productDetails, category: v },
                                            }))}
                                        />
                                    </View>

                                    {/* Highlights */}
                                    <View style={styles.field}>
                                        <Text style={styles.label}>Highlights (up to 3)</Text>
                                        <Text style={styles.fieldHint}>Short emoji phrases shown as chips</Text>
                                        {[0, 1, 2].map(i => (
                                            <TextInput
                                                key={i}
                                                style={[styles.input, i < 2 && { marginBottom: 6 }]}
                                                placeholder={`Highlight ${i + 1}`}
                                                placeholderTextColor="#cbd5e1"
                                                value={form.productDetails.highlights[i] || ''}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
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
                                    <View style={styles.field}>
                                        <View style={styles.fieldRowHeader}>
                                            <Text style={styles.label}>Product Specs</Text>
                                            <TouchableOpacity
                                                style={styles.addRowBtn}
                                                onPress={() => setForm(f => ({
                                                    ...f,
                                                    productDetails: {
                                                        ...f.productDetails,
                                                        specs: [...f.productDetails.specs, { label: '', value: '' }],
                                                    },
                                                }))}
                                            >
                                                <Plus size={11} color="#4f46e5" />
                                                <Text style={styles.addRowBtnText}>Add Row</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {form.productDetails.specs.map((spec, i) => (
                                            <View key={i} style={styles.dynRow}>
                                                <TextInput
                                                    style={[styles.input, { flex: 2 }]}
                                                    placeholder="Label"
                                                    value={spec.label}
                                                    onFocus={handleFocus}
                                                    onBlur={handleBlur}
                                                    onChangeText={v => {
                                                        const s = [...form.productDetails.specs];
                                                        s[i] = { ...s[i], label: v };
                                                        setForm(f => ({ ...f, productDetails: { ...f.productDetails, specs: s } }));
                                                    }}
                                                />
                                                <TextInput
                                                    style={[styles.input, { flex: 3 }]}
                                                    placeholder="Value"
                                                    value={spec.value}
                                                    onFocus={handleFocus}
                                                    onBlur={handleBlur}
                                                    onChangeText={v => {
                                                        const s = [...form.productDetails.specs];
                                                        s[i] = { ...s[i], value: v };
                                                        setForm(f => ({ ...f, productDetails: { ...f.productDetails, specs: s } }));
                                                    }}
                                                />
                                                <TouchableOpacity
                                                    style={styles.removeRowBtn}
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
                                    <View style={styles.field}>
                                        <View style={styles.fieldRowHeader}>
                                            <Text style={styles.label}>What's Included</Text>
                                            <TouchableOpacity
                                                style={styles.addRowBtn}
                                                onPress={() => setForm(f => ({
                                                    ...f,
                                                    productDetails: {
                                                        ...f.productDetails,
                                                        includes: [...(f.productDetails.includes || []), ''],
                                                    },
                                                }))}
                                            >
                                                <Plus size={11} color="#4f46e5" />
                                                <Text style={styles.addRowBtnText}>Add</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {(form.productDetails.includes || []).map((item, i) => (
                                            <View key={i} style={styles.dynRow}>
                                                <TextInput
                                                    style={[styles.input, { flex: 1 }]}
                                                    placeholder={`Included item ${i + 1}`}
                                                    value={item}
                                                    onFocus={handleFocus}
                                                    onBlur={handleBlur}
                                                    onChangeText={v => {
                                                        const inc = [...(form.productDetails.includes || [])];
                                                        inc[i] = v;
                                                        setForm(f => ({ ...f, productDetails: { ...f.productDetails, includes: inc } }));
                                                    }}
                                                />
                                                <TouchableOpacity
                                                    style={styles.removeRowBtn}
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
                                    <View style={styles.field}>
                                        <Text style={styles.label}>Allergen / Dietary Notice</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g. Contains dairy"
                                            value={form.productDetails.allergens}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                            onChangeText={v => setForm(f => ({
                                                ...f,
                                                productDetails: { ...f.productDetails, allergens: v },
                                            }))}
                                            multiline
                                        />
                                    </View>

                                    {/* Terms */}
                                    <View style={styles.field}>
                                        <Text style={styles.label}>Terms & Conditions</Text>
                                        <TextInput
                                            style={[styles.input, { minHeight: 60 }]}
                                            placeholder="e.g. One per customer"
                                            value={form.productDetails.terms}
                                            onFocus={handleFocus}
                                            onBlur={handleBlur}
                                            onChangeText={v => setForm(f => ({
                                                ...f,
                                                productDetails: { ...f.productDetails, terms: v },
                                            }))}
                                            multiline
                                        />
                                    </View>
                                </View>
                            )}
                        </View>


                        {error && <Text style={styles.error}>{error}</Text>}

                        {/* Inline Actions */}
                        <View style={styles.inlineActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Create Reward'}</Text>}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </ScreenWrapper >
        </>
    );
};

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    imageSection: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    labelError: { color: '#dc2626' },
    imagePreviewCard: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', backgroundColor: '#f8fafc', height: 90 },
    imagePickerBox: { width: 100, height: '100%', backgroundColor: '#f1f5f9' },
    imagePreview: { width: '100%', height: '100%' },
    imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
    imagePlaceholderText: { fontSize: 9, fontWeight: '700', color: '#94a3b8', textAlign: 'center' },
    imageCardContent: { flex: 1, padding: 10, justifyContent: 'center', gap: 3 },
    imageCardTitle: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
    imageCardCost: { fontSize: 11, fontWeight: '700', color: '#4f46e5' },
    imageCardHint: { fontSize: 9, fontWeight: '600', color: '#cbd5e1', marginTop: 4, textTransform: 'uppercase' },
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
    field: { marginBottom: 16 },
    input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a', backgroundColor: '#f8fafc' },
    inputError: { borderColor: '#dc2626', backgroundColor: '#fff5f5' },
    fieldError: { fontSize: 11, color: '#dc2626', fontWeight: '600', marginTop: 4 },
    ddTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#f8fafc' },
    ddTriggerError: { borderColor: '#dc2626' },
    ddTriggerOpen: { borderColor: '#4f46e5', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
    ddValue: { fontSize: 14, color: '#0f172a' },
    ddPlaceholder: { fontSize: 14, color: '#94a3b8' },
    ddPanel: { borderWidth: 1, borderTopWidth: 0, borderColor: '#4f46e5', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: '#fff', overflow: 'hidden' },
    ddSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#f8fafc' },
    ddSearchInput: { flex: 1, fontSize: 13, color: '#0f172a' },
    ddItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    ddItemSelected: { backgroundColor: '#eef2ff' },
    ddItemText: { fontSize: 14, color: '#374151' },
    inlineActions: { flexDirection: 'row', gap: 12, marginTop: 24, paddingBottom: 20 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', backgroundColor: '#fff' },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
    saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 14, backgroundColor: '#10b981', alignItems: 'center' },
    saveBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },
    error: { fontSize: 12, color: '#dc2626', fontWeight: '600', marginTop: 12 },
    typeRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 },
    typeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
    typeBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    typeBtnText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
    typeBtnTextActive: { color: '#0f172a' },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    toggleLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    toggleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    toggleBtnOn: { backgroundColor: '#ecfdf5', borderColor: '#10b981' },
    toggleBtnText: { fontSize: 12, fontWeight: '700', color: '#374151' },
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
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    fieldHint: {
        fontSize: 11,
        color: '#94a3b8',
        marginBottom: 8,
    },
    fieldRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    addRowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#eef2ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    addRowBtnText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#4f46e5',
        textTransform: 'uppercase',
    },
    dynRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    removeRowBtn: {
        width: 38,
        height: 38,
        borderRadius: 8,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
});

export default RewardFormScreen;
