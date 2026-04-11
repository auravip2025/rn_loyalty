import {
    ArrowLeft,
    Building2,
    Camera,
    CheckCircle2,
    Clock,
    Facebook,
    Globe,
    Instagram,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultHours = DAYS.reduce((acc, day) => {
    acc[day] = { open: true, from: '09:00', to: '18:00' };
    return acc;
}, {});

// ── Section header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ title }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
);

// ── Editable text field ────────────────────────────────────────────────────────
const EditField = ({ label, icon: Icon, value, onChangeText, placeholder, keyboardType = 'default', multiline }) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={[styles.fieldRow, multiline && { alignItems: 'flex-start', minHeight: 80 }]}>
            {Icon && (
                <View style={[styles.fieldIcon, multiline && { marginTop: 4 }]}>
                    <Icon size={15} color="#94a3b8" />
                </View>
            )}
            <TextInput
                style={[styles.fieldInput, !Icon && { paddingLeft: 14 }, multiline && { textAlignVertical: 'top', minHeight: 72 }]}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                autoCorrect={false}
                multiline={multiline}
            />
        </View>
    </View>
);

// ── Photo placeholder ──────────────────────────────────────────────────────────
const PhotoPlaceholder = ({ size = 80, style, label }) => (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: size * 0.3 }}>{label}</Text>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────

const MerchantProfile = () => {
    const { merchantProfile, updateMerchantProfile, onboardingStatus } = useAuth();

    // Business Info
    const [businessName, setBusinessName] = useState(merchantProfile?.businessName || 'The Coffee House');
    const [description, setDescription] = useState(merchantProfile?.description || '');
    const [businessType, setBusinessType] = useState(merchantProfile?.businessType || 'Cafe');
    const [address, setAddress] = useState(merchantProfile?.address || '');
    const [taxId] = useState(merchantProfile?.taxId || '');

    // Contact & Social
    const [phone, setPhone] = useState(merchantProfile?.phone || '');
    const [website, setWebsite] = useState(merchantProfile?.website || '');
    const [instagram, setInstagram] = useState(merchantProfile?.instagram || '');
    const [facebook, setFacebook] = useState(merchantProfile?.facebook || '');
    const [email, setEmail] = useState(merchantProfile?.email || '');

    // Operating Hours
    const [hours, setHours] = useState(merchantProfile?.hours || defaultHours);

    const [saving, setSaving] = useState(false);

    const toggleDay = (day) => {
        setHours(prev => ({
            ...prev,
            [day]: { ...prev[day], open: !prev[day].open },
        }));
    };

    const statusColor = onboardingStatus === 'approved' ? '#10b981' : onboardingStatus === 'under_review' ? '#f59e0b' : '#94a3b8';
    const statusLabel = onboardingStatus === 'approved' ? 'Verified' : onboardingStatus === 'under_review' ? 'Under Review' : 'Pending';

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateMerchantProfile({
                businessName, description, businessType, address,
                phone, website, instagram, facebook, email, hours,
            });
            Alert.alert('Saved', 'Your profile has been updated.');
        } catch {
            Alert.alert('Error', 'Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScreenWrapper backgroundColor="#ffffff" paddingHorizontal={0}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Business Profile</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                    disabled={saving}
                >
                    <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* ── Cover Photo + Avatar ── */}
                <View style={styles.coverContainer}>
                    <View style={styles.coverPhoto}>
                        <TouchableOpacity style={styles.coverCameraBtn}>
                            <Camera size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.avatarWrapper}>
                        <PhotoPlaceholder size={80} label={businessName.charAt(0)} />
                        <TouchableOpacity style={styles.avatarCameraBtn}>
                            <Camera size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status badge */}
                <View style={styles.statusRow}>
                    <Text style={styles.displayName}>{businessName || 'Your Business'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        {onboardingStatus === 'approved' && <CheckCircle2 size={12} color={statusColor} />}
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                </View>

                {/* ── Business Information ── */}
                <View style={styles.section}>
                    <SectionHeader title="Business Information" />
                    <EditField label="Business Name" icon={Building2} value={businessName} onChangeText={setBusinessName} placeholder="The Coffee House" />
                    <EditField label="Description" icon={null} value={description} onChangeText={setDescription} placeholder="Tell customers about your business…" multiline />
                    <EditField label="Category" icon={Building2} value={businessType} onChangeText={setBusinessType} placeholder="e.g. Cafe, Restaurant, Retail" />
                    <EditField label="Address" icon={MapPin} value={address} onChangeText={setAddress} placeholder="123 Main St, City" multiline />
                    {/* Tax ID is read-only after verification */}
                    <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>Tax ID (read-only)</Text>
                        <View style={[styles.fieldRow, { backgroundColor: '#f1f5f9' }]}>
                            <View style={styles.fieldIcon}><Building2 size={15} color="#cbd5e1" /></View>
                            <Text style={[styles.fieldInput, { color: '#94a3b8' }]}>{taxId || '—'}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Operating Hours ── */}
                <View style={styles.section}>
                    <SectionHeader title="Operating Hours" />
                    {DAYS.map(day => (
                        <View key={day} style={styles.hoursRow}>
                            <Switch
                                value={hours[day]?.open ?? true}
                                onValueChange={() => toggleDay(day)}
                                trackColor={{ false: '#e2e8f0', true: '#a7f3d0' }}
                                thumbColor={hours[day]?.open ? '#10b981' : '#94a3b8'}
                            />
                            <Text style={[styles.dayLabel, !hours[day]?.open && styles.dayLabelOff]}>
                                {day.slice(0, 3)}
                            </Text>
                            {hours[day]?.open ? (
                                <View style={styles.hoursTimeRow}>
                                    <View style={styles.timeChip}>
                                        <Clock size={11} color="#64748b" />
                                        <TextInput
                                            style={styles.timeInput}
                                            value={hours[day].from}
                                            onChangeText={(v) => setHours(prev => ({ ...prev, [day]: { ...prev[day], from: v } }))}
                                            keyboardType="numbers-and-punctuation"
                                            maxLength={5}
                                        />
                                    </View>
                                    <Text style={styles.timeSep}>→</Text>
                                    <View style={styles.timeChip}>
                                        <Clock size={11} color="#64748b" />
                                        <TextInput
                                            style={styles.timeInput}
                                            value={hours[day].to}
                                            onChangeText={(v) => setHours(prev => ({ ...prev, [day]: { ...prev[day], to: v } }))}
                                            keyboardType="numbers-and-punctuation"
                                            maxLength={5}
                                        />
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.closedText}>Closed</Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* ── Contact & Social ── */}
                <View style={styles.section}>
                    <SectionHeader title="Contact & Social" />
                    <EditField label="Phone" icon={Phone} value={phone} onChangeText={setPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
                    <EditField label="Email" icon={Mail} value={email} onChangeText={setEmail} placeholder="hello@yourbusiness.com" keyboardType="email-address" />
                    <EditField label="Website" icon={Globe} value={website} onChangeText={setWebsite} placeholder="https://yourbusiness.com" keyboardType="url" />
                    <EditField label="Instagram" icon={Instagram} value={instagram} onChangeText={setInstagram} placeholder="@yourbusiness" />
                    <EditField label="Facebook" icon={Facebook} value={facebook} onChangeText={setFacebook} placeholder="facebook.com/yourbusiness" />
                </View>

                {/* Save button at bottom */}
                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.bottomSaveBtn, saving && { opacity: 0.6 }]}
                    disabled={saving}
                >
                    <Text style={styles.bottomSaveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
                </TouchableOpacity>

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    headerTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
    saveBtn: { backgroundColor: '#10b981', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 12 },
    saveBtnText: { fontSize: 13, fontWeight: '900', color: '#fff' },

    scrollContent: { paddingBottom: 48 },

    // Cover
    coverContainer: { marginBottom: 56 },
    coverPhoto: {
        height: 160, backgroundColor: '#134e4a',
        justifyContent: 'flex-end', alignItems: 'flex-end', padding: 12,
    },
    coverCameraBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarWrapper: {
        position: 'absolute', bottom: -44, left: 20,
        width: 88, height: 88, borderRadius: 44,
        borderWidth: 4, borderColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
    },
    avatarCameraBtn: {
        position: 'absolute', bottom: 0, right: 0,
        width: 26, height: 26, borderRadius: 13, backgroundColor: '#0f172a',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#fff',
    },

    // Status
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, marginBottom: 20 },
    displayName: { fontSize: 20, fontWeight: '900', color: '#0f172a', flex: 1 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Section
    section: { paddingHorizontal: 20, marginBottom: 28 },
    sectionTitle: {
        fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase',
        letterSpacing: 1.5, marginBottom: 14,
    },

    // Field
    fieldWrap: { marginBottom: 14 },
    fieldLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginLeft: 4 },
    fieldRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    },
    fieldIcon: { paddingHorizontal: 12, paddingVertical: 14 },
    fieldInput: { flex: 1, fontSize: 14, color: '#0f172a', paddingVertical: 14, paddingRight: 14, paddingLeft: 2 },

    // Hours
    hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    dayLabel: { fontSize: 13, fontWeight: '700', color: '#0f172a', width: 32 },
    dayLabelOff: { color: '#94a3b8' },
    hoursTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    timeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    timeInput: { fontSize: 13, fontWeight: '700', color: '#0f172a', minWidth: 36 },
    timeSep: { fontSize: 12, color: '#94a3b8', fontWeight: '700' },
    closedText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic', flex: 1 },

    // Bottom save
    bottomSaveBtn: {
        marginHorizontal: 20, backgroundColor: '#10b981', borderRadius: 16,
        paddingVertical: 16, alignItems: 'center',
    },
    bottomSaveBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },
});

export default MerchantProfile;
