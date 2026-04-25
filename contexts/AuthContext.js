import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [merchantProfile, setMerchantProfile] = useState(null);
  // 'none' | 'pending' | 'under_review' | 'approved'
  const [onboardingStatus, setOnboardingStatus] = useState('none');

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@dandan_user');
      const storedRole = await AsyncStorage.getItem('@dandan_role');
      const storedProfile = await AsyncStorage.getItem('@dandan_merchant_profile');
      const storedStatus = await AsyncStorage.getItem('@dandan_onboarding_status');

      if (storedUser && storedRole) {
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
        setIsAuthenticated(true);
      }
      if (storedProfile) setMerchantProfile(JSON.parse(storedProfile));
      if (storedStatus) setOnboardingStatus(storedStatus);
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, selectedRole) => {
    try {
      setLoading(true);
      const mockUser = {
        id: 1,
        name: selectedRole === 'customer' ? 'Alex Johnson' : 'The Coffee House',
        email,
      };
      await AsyncStorage.setItem('@dandan_user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('@dandan_role', selectedRole);
      setUser(mockUser);
      setRole(selectedRole);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // OTP-based login (no password required)
  const loginWithOtp = async (email, selectedRole, isNewUser = false, userId = Date.now()) => {
    try {
      setLoading(true);
      const sessionUser = { id: userId, email, isNew: isNewUser };

      // Write ALL storage keys before updating React state.
      // Apollo's authLink reads the token from AsyncStorage on every request —
      // if state updates trigger a re-render (and a fetch) before the writes
      // finish, the first request goes out without an Authorization header.
      const storageWrites = [
        AsyncStorage.setItem('@dandan_user', JSON.stringify(sessionUser)),
        AsyncStorage.setItem('@dandan_role', selectedRole),
      ];
      if (selectedRole === 'merchant' && isNewUser) {
        storageWrites.push(AsyncStorage.setItem('@dandan_onboarding_status', 'pending'));
      }
      await Promise.all(storageWrites);

      // Now it's safe to flip React state — any fetch triggered by these
      // updates will find the token already in AsyncStorage.
      if (selectedRole === 'merchant' && isNewUser) {
        setOnboardingStatus('pending');
      }

      setUser(sessionUser);
      setRole(selectedRole);
      setIsAuthenticated(true);

      // Load merchant profile from AsyncStorage — LoginScreen may have just
      // written it from the verify-otp response before calling this function
      if (selectedRole === 'merchant') {
        const stored = await AsyncStorage.getItem('@dandan_merchant_profile');
        if (stored) {
          const profile = JSON.parse(stored);
          setMerchantProfile(profile);
          // Existing merchants are active — mark onboarding complete
          if (!isNewUser) {
            setOnboardingStatus('approved');
            await AsyncStorage.setItem('@dandan_onboarding_status', 'approved');
          }
        }
      }

      return { success: true, isNew: isNewUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Save merchant profile (onboarding submission)
  const saveMerchantProfile = async (profileData) => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
      const token = await AsyncStorage.getItem('@dandan_auth_token');
      
      const payload = {
        companyName: profileData.businessName,
        registrationNumber: profileData.taxId,
        adminName: user?.name || profileData.businessName,
        email: (user?.email || '').toLowerCase(),
        category: profileData.businessType,
        address: profileData.address,
        phone: profileData.phone,
      };

      const response = await fetch(`${API_URL}/merchants/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to register merchant');

      const profile = { ...profileData, id: data.merchant?.id || data.merchantId || data.id, createdAt: new Date().toISOString() };
      await AsyncStorage.setItem('@dandan_merchant_profile', JSON.stringify(profile));
      await AsyncStorage.setItem('@dandan_onboarding_status', 'under_review');
      if (data.token) await AsyncStorage.setItem('@dandan_auth_token', data.token);
      if (data.refreshToken) await AsyncStorage.setItem('@dandan_refresh_token', data.refreshToken);
      setMerchantProfile(profile);
      setOnboardingStatus('under_review');
      return { success: true };
    } catch (error) {
      console.error('Merchant registration failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Update existing merchant profile
  const updateMerchantProfile = async (updates) => {
    try {
      const updated = { ...merchantProfile, ...updates, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem('@dandan_merchant_profile', JSON.stringify(updated));
      setMerchantProfile(updated);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        '@dandan_user',
        '@dandan_role',
        '@dandan_merchant_profile',
        '@dandan_onboarding_status',
        '@dandan_auth_token',
        '@dandan_refresh_token',
      ]);
      setUser(null);
      setRole(null);
      setMerchantProfile(null);
      setOnboardingStatus('none');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    role,
    loading,
    merchantProfile,
    onboardingStatus,
    login,
    loginWithOtp,
    saveMerchantProfile,
    updateMerchantProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};