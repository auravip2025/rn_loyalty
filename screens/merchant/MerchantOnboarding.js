import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    ChevronDown,
    CreditCard,
    FileText,
    MapPin,
    Upload,
} from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';

const BUSINESS_TYPES = ['Restaurant', 'Cafe', 'Retail', 'Salon & Beauty', 'Gym & Fitness', 'Entertainment', 'Other'];

const STEPS = [
    { id: 1, label: 'Business Details' },
    { id: 2, label: 'Verification Docs' },
    { id: 3, label: 'Review & Submit' },
];

// ── Reusable field row ─────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, value, onChangeText, placeholder, keyboardType = 'default', multiline }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={[styles.fieldRow, multiline && { alignItems: 'flex-start', minHeight: 80 }]}>
            <View style={[styles.fieldIcon, multiline && { marginTop: 4 }]}>
                <Icon size={16} color="#94a3b8" />
            </View>
            <TextInput
                style={[styles.fieldInput, multiline && { textAlignVertical: 'top', minHeight: 72 }]}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                multiline={multiline}
                autoCorrect={false}
            />
        </View>
    </View>
);

// ── Document upload mock card ─────────────────────────────────────────────────
const UploadCard = ({ label, subtitle, uploaded, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.uploadCard, uploaded && styles.uploadCardDone]}>
        <View style={[styles.uploadIconBox, uploaded && styles.uploadIconBoxDone]}>
            {uploaded ? <CheckCircle2 size={24} color="#10b981" /> : <Upload size={24} color="#94a3b8" />}
        </View>
        <View style={styles.uploadInfo}>
            <Text style={[styles.uploadLabel, uploaded && { color: '#10b981' }]}>{label}</Text>
            <Text style={styles.uploadSub}>{uploaded ? 'Uploaded ✓' : subtitle}</Text>
        </View>
        {!uploaded && (
            <View style={styles.uploadBtn}>
                <Text style={styles.uploadBtnText}>Upload</Text>
            </View>
        )}
    </TouchableOpacity>
);

// ── Summary row ───────────────────────────────────────────────────────────────
const SummaryRow = ({ label, value }) => (
    <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value || '—'}</Text>
    </View>
);

// ─────────────────────────────────────────────────────────────────────────────

const MerchantOnboarding = ({ onComplete }) => {
    const { saveMerchantProfile, onboardingStatus } = useAuth();
    const insets = useSafeAreaInsets();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showTypePicker, setShowTypePicker] = useState(false);
    const [submitted, setSubmitted] = useState(onboardingStatus === 'under_review');

    // Step 1 data
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [taxId, setTaxId] = useState('');

    // Step 2 data
    const [licenseUploaded, setLicenseUploaded] = useState(false);
    const [additionalUploaded, setAdditionalUploaded] = useState(false);

    const mockUpload = (setter) => {
        setTimeout(() => setter(true), 800);
    };

    const validateStep1 = () => {
        if (!businessName.trim()) { Alert.alert('Required', 'Please enter your business name.'); return false; }
        if (!businessType) { Alert.alert('Required', 'Please select a business type.'); return false; }
        if (!address.trim()) { Alert.alert('Required', 'Please enter your business address.'); return false; }
        if (!phone.trim()) { Alert.alert('Required', 'Please enter your phone number.'); return false; }
        if (!taxId.trim()) { Alert.alert('Required', 'Please enter your Tax ID.'); return false; }
        return true;
    };

    const validateStep2 = () => {
        if (!licenseUploaded) { Alert.alert('Required', 'Please upload your business license.'); return false; }
        return true;
    };

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep(s => s + 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await saveMerchantProfile({
                businessName,
                businessType,
                address,
                phone,
                taxId,
                licenseUploaded,
                additionalUploaded,
            });
            setSubmitted(true);
        } catch {
            Alert.alert('Error', 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Success / Under Review State ───────────────────────────────────────────
    if (submitted) {
        return (
            <View style={[styles.pendingContainer, { paddingTop: insets.top }]}>
                <View style={styles.pendingIconRing}>
                    <AlertCircle size={56} color="#f59e0b" />
                </View>
                <Text style={styles.pendingTitle}>Under Review</Text>
                <Text style={styles.pendingDesc}>
                    Your application has been submitted. Our team will verify your documents within 1–2 business days.
                </Text>
                <View style={styles.pendingSteps}>
                    {['Submitted', 'Under Review', 'Approved'].map((s, i) => (
                        <View key={s} style={styles.pendingStep}>
                            <View style={[styles.pendingDot, i <= 1 && styles.pendingDotActive]} />
                            <Text style={[styles.pendingStepText, i === 1 && styles.pendingStepTextActive]}>{s}</Text>
                        </View>
                    ))}
                </View>
                <TouchableOpacity onPress={onComplete} style={styles.goToBtn}>
                    <Text style={styles.goToBtnText}>Go to Dashboard</Text>
                    <ArrowRight size={18} color="#10b981" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScreenWrapper backgroundColor="#ffffff" paddingHorizontal={0} >
            <View style={[styles.header]}>
                {step > 1 ? (
                    <TouchableOpacity onPress={() => setStep(s => s - 1)} style={styles.backBtn}>
                        <ArrowLeft size={20} color="#0f172a" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backBtn} />
                )}
                <Text style={styles.headerTitle}>Merchant Registration</Text>
                <View style={styles.backBtn} />
            </View>

            {/* Progress bar */}
            <View style={styles.progressContainer}>
                {STEPS.map((s, i) => (
                    <View key={s.id} style={styles.progressItem}>
                        <View style={[
                            styles.progressDot,
                            step > s.id && styles.progressDotDone,
                            step === s.id && styles.progressDotActive,
                        ]}>
                            {step > s.id
                                ? <CheckCircle2 size={14} color="#fff" />
                                : <Text style={[styles.progressNum, step === s.id && styles.progressNumActive]}>{s.id}</Text>
                            }
                        </View>
                        <Text style={[styles.progressLabel, step === s.id && styles.progressLabelActive]}>
                            {s.label}
                        </Text>
                        {i < STEPS.length - 1 && (
                            <View style={[styles.progressLine, step > s.id && styles.progressLineDone]} />
                        )}
                    </View>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── Step 1: Business Details ── */}
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Business Details</Text>
                        <Text style={styles.stepSubtitle}>Tell us about your business so we can set up your account.</Text>

                        <Field label="Business Name" icon={Building2} value={businessName} onChangeText={setBusinessName} placeholder="The Coffee House" />

                        {/* Business Type picker */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Business Type</Text>
                            <TouchableOpacity
                                style={styles.fieldRow}
                                onPress={() => setShowTypePicker(true)}
                            >
                                <View style={styles.fieldIcon}><CreditCard size={16} color="#94a3b8" /></View>
                                <Text style={[styles.fieldInput, !businessType && { color: '#94a3b8' }]}>
                                    {businessType || 'Select business type'}
                                </Text>
                                <ChevronDown size={16} color="#94a3b8" style={{ marginRight: 12 }} />
                            </TouchableOpacity>
                        </View>

                        <Field label="Business Address" icon={MapPin} value={address} onChangeText={setAddress} placeholder="123 Main St, City, Country" multiline />
                        <Field label="Contact Phone Number" icon={Building2} value={phone} onChangeText={setPhone} placeholder="+65 1234 5678" keyboardType="phone-pad" />
                        <Field label="Tax ID / UEN No." icon={FileText} value={taxId} onChangeText={setTaxId} placeholder="XX-XXXXXXX" keyboardType="default" />
                    </View>
                )}

                {/* ── Step 2: Verification Documents ── */}
                {step === 2 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Verification Documents</Text>
                        <Text style={styles.stepSubtitle}>Upload your business documents for identity verification.</Text>

                        <UploadCard
                            label="Business License"
                            subtitle="PDF, JPG or PNG · Max 10MB"
                            uploaded={licenseUploaded}
                            onPress={() => mockUpload(setLicenseUploaded)}
                        />
                        <UploadCard
                            label="Additional Documents"
                            subtitle="e.g. ID, utility bill (optional)"
                            uploaded={additionalUploaded}
                            onPress={() => mockUpload(setAdditionalUploaded)}
                        />

                        <View style={styles.infoBox}>
                            <AlertCircle size={14} color="#f59e0b" />
                            <Text style={styles.infoText}>
                                Documents are encrypted and stored securely. Only used for verification purposes.
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── Step 3: Review & Submit ── */}
                {step === 3 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.stepTitle}>Review & Submit</Text>
                        <Text style={styles.stepSubtitle}>Please confirm your details before submitting for approval.</Text>

                        <View style={styles.summaryCard}>
                            <Text style={styles.summarySection}>Business Information</Text>
                            <SummaryRow label="Business Name" value={businessName} />
                            <SummaryRow label="Business Type" value={businessType} />
                            <SummaryRow label="Address" value={address} />
                            <SummaryRow label="Phone" value={phone} />
                            <SummaryRow label="Tax ID" value={taxId} />
                        </View>

                        <View style={styles.summaryCard}>
                            <Text style={styles.summarySection}>Documents</Text>
                            <SummaryRow label="Business License" value={licenseUploaded ? '✓ Uploaded' : '✗ Missing'} />
                            <SummaryRow label="Additional Docs" value={additionalUploaded ? '✓ Uploaded' : 'Not provided'} />
                        </View>

                        <View style={styles.infoBox}>
                            <AlertCircle size={14} color="#6366f1" />
                            <Text style={styles.infoText}>
                                By submitting, you agree to our Merchant Terms of Service and Privacy Policy.
                            </Text>
                        </View>
                    </View>
                )}

            </ScrollView>

            {/* Footer CTA */}
            <View style={styles.footer}>
                {step < 3 ? (
                    <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
                        <Text style={styles.nextBtnText}>Continue</Text>
                        <ArrowRight size={20} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[styles.nextBtn, { backgroundColor: '#10b981' }, loading && { opacity: 0.7 }]}
                        disabled={loading}
                    >
                        <Text style={styles.nextBtnText}>{loading ? 'Submitting…' : 'Submit for Approval'}</Text>
                        {!loading && <CheckCircle2 size={20} color="#fff" />}
                    </TouchableOpacity>
                )}
            </View>

            {/* Business Type Modal Picker */}
            <Modal transparent visible={showTypePicker} animationType="slide" onRequestClose={() => setShowTypePicker(false)}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowTypePicker(false)} activeOpacity={1}>
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHandle} />
                        <Text style={styles.pickerTitle}>Select Business Type</Text>
                        {BUSINESS_TYPES.map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.pickerRow, businessType === type && styles.pickerRowActive]}
                                onPress={() => { setBusinessType(type); setShowTypePicker(false); }}
                            >
                                <Text style={[styles.pickerRowText, businessType === type && styles.pickerRowTextActive]}>
                                    {type}
                                </Text>
                                {businessType === type && <CheckCircle2 size={18} color="#10b981" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
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
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#f8fafc' },

    // Progress
    progressContainer: {
        flexDirection: 'row', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingVertical: 20,
    },
    progressItem: { flex: 1, alignItems: 'center', position: 'relative' },
    progressDot: {
        width: 28, height: 28, borderRadius: 14, borderWidth: 2,
        borderColor: '#e2e8f0', backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center', marginBottom: 6,
    },
    progressDotActive: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
    progressDotDone: { borderColor: '#10b981', backgroundColor: '#10b981' },
    progressNum: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
    progressNumActive: { color: '#10b981' },
    progressLabel: { fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
    progressLabelActive: { color: '#10b981' },
    progressLine: {
        position: 'absolute', top: 13, left: '75%', right: '-25%',
        height: 2, backgroundColor: '#e2e8f0',
    },
    progressLineDone: { backgroundColor: '#10b981' },

    // Scroll
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },

    // Step
    stepContent: { paddingTop: 8 },
    stepTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 6 },
    stepSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 20 },

    // Field
    fieldContainer: { marginBottom: 16 },
    fieldLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginLeft: 4 },
    fieldRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14,
    },
    fieldIcon: { paddingHorizontal: 14, paddingVertical: 16 },
    fieldInput: { flex: 1, fontSize: 14, color: '#0f172a', paddingVertical: 14, paddingRight: 14 },

    // Upload
    uploadCard: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0',
        borderRadius: 16, padding: 16, marginBottom: 12,
    },
    uploadCardDone: { borderColor: '#a7f3d0', backgroundColor: '#f0fdf4' },
    uploadIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    uploadIconBoxDone: { backgroundColor: '#d1fae5' },
    uploadInfo: { flex: 1 },
    uploadLabel: { fontSize: 13, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
    uploadSub: { fontSize: 11, color: '#94a3b8' },
    uploadBtn: { backgroundColor: '#0f172a', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
    uploadBtnText: { fontSize: 11, fontWeight: '800', color: '#fff' },

    // Info box
    infoBox: {
        flexDirection: 'row', gap: 10, alignItems: 'flex-start',
        backgroundColor: '#fffbeb', borderRadius: 12, padding: 14, marginTop: 8,
    },
    infoText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },

    // Summary
    summaryCard: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 },
    summarySection: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    summaryLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', flex: 1 },
    summaryValue: { fontSize: 12, color: '#0f172a', fontWeight: '800', flex: 1, textAlign: 'right' },

    // Footer
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9',
        paddingHorizontal: 20, paddingVertical: 16,
    },
    nextBtn: {
        backgroundColor: '#10b981', borderRadius: 16, paddingVertical: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    nextBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },

    // Type picker modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
    pickerHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    pickerTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
    pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    pickerRowActive: { backgroundColor: '#f0fdf4', marginHorizontal: -20, paddingHorizontal: 20, borderRadius: 0 },
    pickerRowText: { fontSize: 14, fontWeight: '600', color: '#475569' },
    pickerRowTextActive: { color: '#10b981', fontWeight: '900' },

    // Pending / Under Review
    pendingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#fff' },
    pendingIconRing: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#fffbeb', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    pendingTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
    pendingDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    pendingSteps: { flexDirection: 'row', gap: 24, marginBottom: 40 },
    pendingStep: { alignItems: 'center', gap: 8 },
    pendingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#e2e8f0' },
    pendingDotActive: { backgroundColor: '#f59e0b' },
    pendingStepText: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
    pendingStepTextActive: { color: '#f59e0b' },
    goToBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#10b981', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
    goToBtnText: { fontSize: 14, fontWeight: '900', color: '#10b981' },
});

export default MerchantOnboarding;
