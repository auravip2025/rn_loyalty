import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, ArrowRight, LayoutGrid, Mail, Zap } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchApi } from '../../api/restClient';
import Button from '../../components/old_app/common/Button';
import Input from '../../components/old_app/common/Input';
import { useAuth } from '../../contexts/AuthContext';


const PLACEHOLDER_EMAILS = {
  customer: 'alex@dandan.io',
  merchant: 'merchant@coffeehouse.com',
};

const LoginScreen = () => {
  const { loginWithOtp } = useAuth();
  const [activeRole, setActiveRole] = useState('customer');
  const [isNewUser, setIsNewUser] = useState(false);
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [emailError, setEmailError] = useState('');
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const primaryColor = activeRole === 'customer' ? '#4f46e5' : '#10b981';

  // ── Step 1: Send OTP ─────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      return;
    }

    setEmailError('');
    setLoading(true);
    try {
      const endpoint = activeRole === 'customer' ? '/users/auth/otp' : '/merchants/auth/request-otp';
      const response = await fetchApi(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          mode: isNewUser ? 'register' : 'login',
        }),
      });
      const data = await response.json();

      if (response.ok && data?.success !== false) {
        setStep('otp');
        setOtpError('');
        console.log(`[REST OTP] Requested for ${email}. Message: ${data.message || 'ok'}`);
      } else {
        setEmailError(data?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setEmailError('Could not connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const entered = otp.join('');
    if (entered.length < 6) {
      setOtpError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = activeRole === 'customer' ? '/users/auth/verify' : '/merchants/auth/verify-otp';
      const response = await fetchApi(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          otp: entered,
          mode: isNewUser ? 'register' : 'login',
        }),
      });
      const res = await response.json();

      if (response.ok && res?.success !== false) {
        // Store auth tokens
        if (res.token) {
          await AsyncStorage.setItem('@dandan_auth_token', res.token);
        }
        if (res.refreshToken) {
          await AsyncStorage.setItem('@dandan_refresh_token', res.refreshToken);
        }

        // For merchants — store the merchant profile returned by verify so
        // MerchantPrograms can use merchantProfile.id immediately
        if (activeRole === 'merchant' && res.merchant) {
          const profile = {
            id: res.merchant.id,
            businessName: res.merchant.companyName || res.merchant.name,
            businessType: res.merchant.category,
            address: res.merchant.address,
            phone: res.merchant.phone,
            email: res.merchant.email,
            status: res.merchant.status,
          };
          await AsyncStorage.setItem('@dandan_merchant_profile', JSON.stringify(profile));
        }

        console.log(`[Verify] Success. merchant=${JSON.stringify(res.merchant)}, isNew=${res.isNewMerchant ?? res.isNewUser}`);

        // Use role from server response, fallback to selected role
        const userRole = res.user?.role || (activeRole === 'merchant' ? 'merchant' : activeRole);
        const newFlag = res.isNewMerchant ?? res.isNewUser ?? isNewUser;

        const loginResult = await loginWithOtp(
          (res.user?.email || res.merchant?.email || email).toLowerCase(),
          userRole,
          newFlag
        );

        if (!loginResult.success) {
          setOtpError('Successfully verified but could not create local session.');
        }
      } else {
        setOtpError(res?.error || res?.message || 'The code you entered is incorrect.');
      }
    } catch (err) {
      console.error('Verify Mutation Error:', err);
      setOtpError('An error occurred during verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP box handler ──────────────────────────────────────────────────────────
  const handleOtpChange = (text, index) => {
    if (otpError) setOtpError('');
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // ── Role toggle ──────────────────────────────────────────────────────────────
  const switchRole = (role) => {
    setActiveRole(role);
    setStep('email');
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setIsNewUser(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: primaryColor }]}>
            {activeRole === 'customer' ? (
              <Zap size={48} color="#ffffff" />
            ) : (
              <LayoutGrid size={48} color="#ffffff" />
            )}
          </View>
          <Text style={styles.brand}>
            dan<Text style={[styles.brandAccent, { color: primaryColor }]}>dan</Text>
          </Text>
          <Text style={styles.tagline}>
            {activeRole === 'customer' ? 'Earn. Redeem. Repeat.' : 'Scale your brand loyalty.'}
          </Text>
        </View>

        {/* Role Toggle */}
        <View style={styles.roleToggle}>
          {['customer', 'merchant'].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => switchRole(r)}
              style={[styles.roleButton, activeRole === r && styles.roleButtonActive]}
            >
              <Text style={[styles.roleText, activeRole === r && { color: primaryColor }]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Email Step ── */}
        {step === 'email' && (
          <View style={styles.form}>
            <Input
              label="Email Address"
              icon={Mail}
              placeholder={PLACEHOLDER_EMAILS[activeRole]}
              value={email}
              onChange={(val) => { setEmail(val); if (emailError) setEmailError(''); }}
              autoFocus
              testID="email-input"
            />
            <Button
              onPress={handleSendOtp}
              variant={activeRole === 'customer' ? 'primary' : 'merchant'}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
              testID="send-otp-btn"
            >
              {isNewUser ? 'Register with OTP' : 'Send OTP'}
              <ArrowRight size={20} color="#ffffff" />
            </Button>

            {emailError ? <Text style={styles.inlineError}>{emailError}</Text> : null}

            {/* New / Existing toggle */}
            <TouchableOpacity onPress={() => setIsNewUser(!isNewUser)} style={styles.toggleRow}>
              <Text style={styles.toggleText}>
                {isNewUser ? 'Already have an account? ' : "New to dandan? "}
                <Text style={[styles.toggleLink, { color: primaryColor }]}>
                  {isNewUser ? 'Log In' : 'Register'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── OTP Step ── */}
        {step === 'otp' && (
          <View style={styles.form}>

            {/* Back button */}
            <TouchableOpacity onPress={() => setStep('email')} style={styles.backRow}>
              <ArrowLeft size={16} color="#64748b" />
              <Text style={styles.backText}>Change email</Text>
            </TouchableOpacity>

            <Text style={styles.otpLabel}>
              Enter the 6-digit code sent to
            </Text>
            <Text style={[styles.otpEmail, { color: primaryColor }]}>{email}</Text>

            {/* OTP Boxes */}
            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={otpRefs[i]}
                  style={[
                    styles.otpBox,
                    digit ? { borderColor: primaryColor } : {},
                    otpError ? styles.otpBoxError : {},
                  ]}
                  value={digit}
                  onChangeText={(t) => handleOtpChange(t, i)}
                  onKeyPress={(e) => handleOtpKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={i === 0}
                  selectTextOnFocus
                  testID={`otp-input-${i}`}
                  accessibilityLabel={`OTP digit ${i + 1}`}
                />
              ))}
            </View>

            {otpError ? <Text style={styles.otpErrorText}>{otpError}</Text> : null}


            <Button
              onPress={handleVerifyOtp}
              variant={activeRole === 'customer' ? 'primary' : 'merchant'}
              style={styles.submitButton}
              disabled={loading}
              loading={loading}
              testID="verify-otp-btn"
            >
              Verify & Continue
              <ArrowRight size={20} color="#ffffff" />
            </Button>

            <TouchableOpacity onPress={() => setStep('email')} style={styles.resendRow}>
              <Text style={styles.resendText}>
                Didn't receive it?{' '}
                <Text style={[styles.resendLink, { color: primaryColor }]}>Resend</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    padding: 24,
    borderRadius: 40,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },
  brand: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -2,
    lineHeight: 48,
  },
  brandAccent: {
    fontWeight: '900',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 8,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 24,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  roleButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#64748b',
  },
  form: {
    gap: 16,
  },
  submitButton: {
    width: '100%',
    marginTop: 8,
    paddingVertical: 18,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  backText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  otpLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
  },
  otpEmail: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 8,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  otpBoxError: {
    borderColor: '#ef4444',
  },
  otpErrorText: {
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: -4,
  },

  resendRow: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  resendLink: {
    fontWeight: '900',
  },
  toggleRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  toggleText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  toggleLink: {
    fontWeight: '900',
  },
  inlineError: {
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default LoginScreen;
