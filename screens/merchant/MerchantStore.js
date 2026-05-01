import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  Building2,
  ChevronRight,
  MapPin,
  Plus,
  Store,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import LocationPicker from '../../components/merchant/LocationPicker';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

// ── Store card ────────────────────────────────────────────────────────────────
const StoreCard = ({ store }) => (
  <Card style={styles.storeCard}>
    <View style={styles.storeRow}>
      <View style={styles.storeIconWrap}>
        <Store size={20} color="#4f46e5" />
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        {store.address ? (
          <View style={styles.storeAddressRow}>
            <MapPin size={11} color="#94a3b8" />
            <Text style={styles.storeAddress} numberOfLines={1}>{store.address}</Text>
          </View>
        ) : (
          <Text style={styles.storeNoAddress}>No location set</Text>
        )}
      </View>
      <ChevronRight size={16} color="#cbd5e1" />
    </View>
  </Card>
);

// ── Create Store Modal ────────────────────────────────────────────────────────
const CreateStoreModal = ({ visible, merchantId, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const reset = () => {
    setName('');
    setLocation(null);
    setNameError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Store name is required');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('@dandan_auth_token');
      const res = await fetch(`${API_URL}/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          merchantId,
          name: name.trim(),
          address:   location?.address   ?? null,
          latitude:  location?.latitude  ?? null,
          longitude: location?.longitude ?? null,
          placeId:   location?.placeId   ?? null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const created = await res.json();
      onCreated(created);
      reset();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create store');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Store</Text>
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Store name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Store Name *</Text>
              <View style={[styles.inputWrap, !!nameError && styles.inputError]}>
                <Building2 size={16} color={nameError ? '#dc2626' : '#94a3b8'} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Main Branch"
                  placeholderTextColor="#cbd5e1"
                  value={name}
                  onChangeText={v => { setName(v); setNameError(''); }}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
              </View>
              {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
            </View>

            {/* Location */}
            <View style={[styles.fieldGroup, { zIndex: 10 }]}>
              <Text style={styles.fieldLabel}>Location</Text>
              <LocationPicker value={location} onChange={setLocation} />
              {!location && (
                <Text style={styles.fieldHint}>
                  Search for your store's address or use your current location.
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Save button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#ffffff" />
                : <Text style={styles.saveBtnText}>Create Store</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
const MerchantStore = ({ merchantId }) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!merchantId) return;
      let cancelled = false;
      const load = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('@dandan_auth_token');
          const res = await fetch(`${API_URL}/stores/merchant/${merchantId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) throw new Error(`${res.status}`);
          const data = await res.json();
          if (!cancelled) setStores(Array.isArray(data) ? data : []);
        } catch (err) {
          console.warn('[MerchantStore] load failed:', err.message);
          if (!cancelled) setStores([]);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      load();
      return () => { cancelled = true; };
    }, [merchantId])
  );

  const handleCreated = (newStore) => {
    setStores(prev => [...prev, newStore]);
    setShowCreate(false);
  };

  return (
    <ScreenWrapper scroll contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Stores</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Plus size={16} color="#ffffff" />
          <Text style={styles.addBtnText}>Add Store</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : stores.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Store size={36} color="#c7d2fe" />
          </View>
          <Text style={styles.emptyTitle}>No stores yet</Text>
          <Text style={styles.emptySub}>
            Add your first store to start accepting payments and managing rewards.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
            <Plus size={15} color="#4f46e5" />
            <Text style={styles.emptyBtnText}>Add Your First Store</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.storeList}>
          {stores.map(s => <StoreCard key={s.id} store={s} />)}
        </View>
      )}

      {/* Create modal */}
      <CreateStoreModal
        visible={showCreate}
        merchantId={merchantId}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  center: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 19,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#c7d2fe',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4f46e5',
  },
  storeList: {
    gap: 12,
  },
  storeCard: {
    padding: 0,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  storeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  storeAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeAddress: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  storeNoAddress: {
    fontSize: 12,
    color: '#cbd5e1',
    fontStyle: 'italic',
  },
  // ── Modal ──────────────────────────────────────────────────────────────────
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  modalCloseBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  modalCloseText: {
    fontSize: 15,
    color: '#4f46e5',
    fontWeight: '600',
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#f8fafc',
  },
  inputError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff5f5',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    marginLeft: 2,
  },
  fieldHint: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  saveBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: '#a5b4fc',
    shadowOpacity: 0,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});

export default MerchantStore;
