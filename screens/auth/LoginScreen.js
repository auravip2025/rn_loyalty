import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Zap, LayoutGrid, User, Mail, Lock, ArrowRight } from 'lucide-react-native';
import Input from '../../components/old_app/common/Input';
import Button from '../../components/old_app/common/Button';
import { useAuth } from '../../contexts/AuthContext';

// Mock credentials for demo
const mockCredentials = {
  customer: {
    email: 'alex@dandan.io',
    password: 'password123',
  },
  merchant: {
    email: 'merchant@coffeehouse.com',
    password: 'merchant123',
  },
};

const LoginScreen = () => {
  const { login } = useAuth();
  const [activeRole, setActiveRole] = useState('customer');
  const [isNewUser, setIsNewUser] = useState(false);
  const [email, setEmail] = useState(mockCredentials.customer.email);
  const [password, setPassword] = useState(mockCredentials.customer.password);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const primaryColor = activeRole === 'customer' ? '#4f46e5' : '#10b981';

  const handleSubmit = async () => {
    performLogin(email, password);
  };

  const performLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    try {
      // Mock validation - in real app, this would be an API call
      const isValid =
        (loginEmail === mockCredentials.customer.email &&
          loginPassword === mockCredentials.customer.password &&
          activeRole === 'customer') ||
        (loginEmail === mockCredentials.merchant.email &&
          loginPassword === mockCredentials.merchant.password &&
          activeRole === 'merchant');

      if (!isValid) {
        Alert.alert(
          'Invalid Credentials',
          `For demo, use:\nCustomer: alex@dandan.io / password123\nMerchant: merchant@coffeehouse.com / merchant123`
        );
        setLoading(false);
        return;
      }

      const result = await login(loginEmail, loginPassword, activeRole);
      if (!result.success) {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
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
            {activeRole === 'customer'
              ? "Earn. Redeem. Repeat."
              : "Scale your brand loyalty."}
          </Text>
        </View>

        <View style={styles.roleToggle}>
          <TouchableOpacity
            onPress={() => {
              setActiveRole('customer');
              setIsNewUser(false);
              // Auto-fill customer credentials
              setEmail(mockCredentials.customer.email);
              setPassword(mockCredentials.customer.password);
            }}
            style={[
              styles.roleButton,
              activeRole === 'customer' && styles.roleButtonActive
            ]}>
            <Text style={[
              styles.roleText,
              activeRole === 'customer' && styles.roleTextActive
            ]}>
              Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setActiveRole('merchant');
              setIsNewUser(false);
              // Auto-fill merchant credentials
              setEmail(mockCredentials.merchant.email);
              setPassword(mockCredentials.merchant.password);
            }}
            style={[
              styles.roleButton,
              activeRole === 'merchant' && styles.roleButtonActive
            ]}>
            <Text style={[
              styles.roleText,
              activeRole === 'merchant' && styles.roleTextActive
            ]}>
              Merchant
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {isNewUser && (
            <Input
              label="Full Name"
              icon={User}
              placeholder="Alex Dandan"
              value={name}
              onChange={setName}
            />
          )}
          <Input
            label="Email ID"
            icon={Mail}
            placeholder="name@dandan.io"
            value={email}
            onChange={setEmail}
          />
          <Input
            label="Secure Password"
            icon={Lock}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
          />

          <Button
            onPress={handleSubmit}
            variant={activeRole === 'customer' ? 'primary' : 'merchant'}
            style={styles.submitButton}
            disabled={loading}
            loading={loading}
          >
            {isNewUser ? 'Create Profile' : 'Authenticate'}
            <ArrowRight size={20} color="#ffffff" />
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isNewUser ? "Already a member?" : "New to dandan?"}{" "}
            <Text
              onPress={() => setIsNewUser(!isNewUser)}
              style={[styles.footerLink, { color: primaryColor }]}>
              {isNewUser ? "Log In" : "Register"}
            </Text>
          </Text>
        </View>
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
    marginBottom: 16,
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
  roleTextActive: {
    color: '#4f46e5',
  },
  form: {
    gap: 16,
  },
  submitButton: {
    width: '100%',
    marginTop: 8,
    paddingVertical: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  footerLink: {
    fontWeight: '900',
  },
});

export default LoginScreen;
