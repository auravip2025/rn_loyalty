import { ArrowRight, Phone, User } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomerOnboardingProps {
  onComplete: (fullName: string, phone: string) => Promise<void>;
}

const CustomerOnboarding: React.FC<CustomerOnboardingProps> = ({ onComplete }) => {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});
  const phoneRef = useRef<TextInput>(null);

  const validate = () => {
    const e: { fullName?: string; phone?: string } = {};
    if (!fullName.trim() || fullName.trim().split(/\s+/).length < 2) {
      e.fullName = 'Please enter your first and last name';
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      e.phone = 'Please enter a valid phone number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onComplete(fullName.trim(), phone.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#ffffff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding */}
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandName}>dandan</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Welcome aboard! 👋</Text>
        <Text style={styles.subheading}>
          Tell us a little about yourself so we can personalise your experience.
        </Text>

        {/* Full Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputWrap, !!errors.fullName && styles.inputWrapError]}>
            <User size={18} color={errors.fullName ? '#dc2626' : '#94a3b8'} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Jane Smith"
              placeholderTextColor="#cbd5e1"
              value={fullName}
              onChangeText={v => { setFullName(v); setErrors(e => ({ ...e, fullName: undefined })); }}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
          </View>
          {!!errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        {/* Phone */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={[styles.inputWrap, !!errors.phone && styles.inputWrapError]}>
            <Phone size={18} color={errors.phone ? '#dc2626' : '#94a3b8'} />
            <TextInput
              ref={phoneRef}
              style={styles.input}
              placeholder="e.g. +65 9123 4567"
              placeholderTextColor="#cbd5e1"
              value={phone}
              onChangeText={v => { setPhone(v); setErrors(e => ({ ...e, phone: undefined })); }}
              keyboardType="phone-pad"
              autoComplete="tel"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>
          {!!errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btn, (loading || !fullName || !phone) && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={loading || !fullName.trim() || !phone.trim()}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.btnText}>Get Started</Text>
              <ArrowRight size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your details are only used to personalise your rewards experience.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4f46e5',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4f46e5',
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 10,
    lineHeight: 34,
  },
  subheading: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 40,
    fontWeight: '500',
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
  },
  inputWrapError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 5,
    marginLeft: 4,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 20,
    height: 56,
    marginTop: 12,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: '#c7d2fe',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  disclaimer: {
    marginTop: 20,
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default CustomerOnboarding;
