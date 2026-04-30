import {
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  Gift,
  Mail,
  Megaphone,
  MessageSquare,
  Music,
  Plus,
  Send,
  Star,
  Tag,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Trophy,
} from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// ─── Event type config ────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { key: 'sports',    label: 'Sports',    icon: Trophy,     color: '#f59e0b', bg: '#fffbeb' },
  { key: 'birthday',  label: 'Birthday',  icon: Gift,       color: '#ec4899', bg: '#fdf2f8' },
  { key: 'music',     label: 'Music',     icon: Music,      color: '#6366f1', bg: '#eef2ff' },
  { key: 'festival',  label: 'Festival',  icon: Star,       color: '#10b981', bg: '#ecfdf5' },
  { key: 'promo',     label: 'Promo',     icon: Megaphone,  color: '#3b82f6', bg: '#eff6ff' },
  { key: 'custom',    label: 'Custom',    icon: Tag,        color: '#94a3b8', bg: '#f8fafc' },
];

// Example seed campaigns
const EXAMPLE_EVENTS = [
  'Premier League Final', 'World Cup 2026', 'F1 Monaco GP', 'Champions League',
  'Coachella', 'Taylor Swift Tour', 'New Year Eve', 'Valentine\'s Day',
];

const eventTypeFor = (key) => EVENT_TYPES.find(e => e.key === key) || EVENT_TYPES[5];

// ─── Broadcast channel config ──────────────────────────────────────────────────
const CHANNELS = [
  { key: 'push',  label: 'Push',  icon: Bell,          color: '#6366f1', bg: '#eef2ff' },
  { key: 'sms',   label: 'SMS',   icon: MessageSquare, color: '#10b981', bg: '#ecfdf5' },
  { key: 'email', label: 'Email', icon: Mail,          color: '#f59e0b', bg: '#fffbeb' },
];

// ─── Campaign Card ─────────────────────────────────────────────────────────────
const CampaignCard = ({ campaign, onEdit, onDelete, onToggle }) => {
  // Backend campaigns have `status` (DRAFT/ACTIVE/ENDED); local mock had `isActive`
  const isActive = campaign.isActive !== undefined
    ? campaign.isActive
    : campaign.status === 'ACTIVE';
  const et = eventTypeFor(campaign.eventType || 'custom');
  const Icon = et.icon;
  const now = new Date();
  const start = campaign.startDate ? new Date(campaign.startDate) : null;
  const end   = campaign.endDate   ? new Date(campaign.endDate)   : null;
  const isLive = isActive && start && end && now >= start && now <= end;
  const isScheduled = isActive && start && now < start;
  const statusLabel = campaign.status === 'ACTIVE'
    ? (isLive ? 'Live' : 'Active')
    : campaign.status === 'ENDED' ? 'Ended'
    : campaign.status === 'DRAFT' ? 'Draft'
    : isLive ? 'Live' : isScheduled ? 'Scheduled' : isActive ? 'Active' : 'Paused';
  const statusColor = (statusLabel === 'Live' || statusLabel === 'Active') ? '#10b981'
    : statusLabel === 'Scheduled' || statusLabel === 'Draft' ? '#6366f1'
    : '#94a3b8';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onEdit(campaign)} activeOpacity={0.8}>
      <View style={[styles.cardIcon, { backgroundColor: et.bg }]}>
        <Icon size={20} color={et.color} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName} numberOfLines={1}>{campaign.name}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.cardMeta}>
          {et.label}  ·  {campaign.startDate ? campaign.startDate.toString().slice(0,10) : '—'} → {campaign.endDate ? campaign.endDate.toString().slice(0,10) : '—'}
        </Text>
        {(campaign.reward || campaign.description) ? (
          <View style={styles.rewardChip}>
            <Gift size={10} color="#6366f1" />
            <Text style={styles.rewardChipText} numberOfLines={1}>
              {campaign.reward || campaign.description}
            </Text>
          </View>
        ) : null}
        {(campaign.channels || []).length > 0 && (
          <View style={styles.channelRow}>
            {(campaign.channels || []).map(ch => {
              const c = CHANNELS.find(x => x.key === ch);
              if (!c) return null;
              const CIcon = c.icon;
              return (
                <View key={ch} style={[styles.channelChip, { backgroundColor: c.bg }]}>
                  <CIcon size={9} color={c.color} />
                  <Text style={[styles.channelChipText, { color: c.color }]}>{c.label}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => onToggle(campaign.id)} style={styles.iconBtn}>
          {campaign.isActive
            ? <ToggleRight size={26} color="#10b981" />
            : <ToggleLeft size={26} color="#cbd5e1" />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(campaign.id)} style={styles.iconBtn}>
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ─── Create / Edit form ────────────────────────────────────────────────────────
const CampaignForm = ({ campaign, onSave, onBack }) => {
  const insets = useSafeAreaInsets();
  const isEdit = !!campaign?.id;
  const [form, setForm] = useState({
    name: campaign?.name || '',
    eventType: campaign?.eventType || 'sports',
    reward: campaign?.reward || '',
    description: campaign?.description || '',
    startDate: campaign?.startDate || '',
    endDate: campaign?.endDate || '',
    isActive: campaign?.isActive !== false,
    channels: campaign?.channels || ['push'],
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleChannel = (key) => {
    const existing = form.channels || [];
    set('channels', existing.includes(key) ? existing.filter(k => k !== key) : [...existing, key]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Campaign name is required.'); return; }
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...campaign, ...form }, false /* draft */);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBroadcast = async () => {
    if (!form.name.trim()) { setError('Campaign name is required.'); return; }
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...campaign, ...form }, true /* launch now */);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedType = eventTypeFor(form.eventType);

  return (
    <View style={[styles.formContainer, { paddingBottom: insets.bottom + 16 }]}>
      {/* Header */}
      <View style={[styles.formHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.formTitle}>{isEdit ? 'Edit Campaign' : 'New Campaign'}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Campaign name */}
        <Text style={styles.fieldLabel}>Campaign Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. World Cup 2026 Special"
          placeholderTextColor="#94a3b8"
          value={form.name}
          onChangeText={v => set('name', v)}
        />

        {/* Quick fill suggestions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={styles.suggestions}>
            {EXAMPLE_EVENTS.map(e => (
              <TouchableOpacity key={e} style={styles.suggestionChip} onPress={() => set('name', e)}>
                <Text style={styles.suggestionText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Event type */}
        <Text style={styles.fieldLabel}>Event Type</Text>
        <View style={styles.typeGrid}>
          {EVENT_TYPES.map(et => {
            const Icon = et.icon;
            const active = form.eventType === et.key;
            return (
              <TouchableOpacity
                key={et.key}
                style={[styles.typeBtn, active && { borderColor: et.color, backgroundColor: et.bg }]}
                onPress={() => set('eventType', et.key)}
              >
                <Icon size={18} color={active ? et.color : '#94a3b8'} />
                <Text style={[styles.typeBtnText, active && { color: et.color }]}>{et.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reward */}
        <Text style={styles.fieldLabel}>Reward Offered</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Free Coffee, 20% Off, Double Points"
          placeholderTextColor="#94a3b8"
          value={form.reward}
          onChangeText={v => set('reward', v)}
        />

        {/* Description */}
        <Text style={styles.fieldLabel}>Campaign Message</Text>
        <TextInput
          style={[styles.input, { minHeight: 72, textAlignVertical: 'top' }]}
          placeholder="What will customers see in their notification? e.g. Join us for the Premier League Final — enjoy 2x points on all orders!"
          placeholderTextColor="#94a3b8"
          multiline
          value={form.description}
          onChangeText={v => set('description', v)}
        />

        {/* Date range */}
        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Start Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={form.startDate}
              onChangeText={v => set('startDate', v)}
            />
          </View>
          <View style={styles.dateSep} />
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>End Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={form.endDate}
              onChangeText={v => set('endDate', v)}
            />
          </View>
        </View>

        {/* Active toggle */}
        <TouchableOpacity style={styles.activeRow} onPress={() => set('isActive', !form.isActive)}>
          <View>
            <Text style={styles.activeLabel}>Active</Text>
            <Text style={styles.activeSub}>Campaign will run during the set period</Text>
          </View>
          {form.isActive
            ? <ToggleRight size={36} color="#10b981" />
            : <ToggleLeft size={36} color="#cbd5e1" />}
        </TouchableOpacity>

        {/* Broadcast channels */}
        <Text style={styles.fieldLabel}>Broadcast Via</Text>
        <View style={styles.channelGrid}>
          {CHANNELS.map(ch => {
            const Icon = ch.icon;
            const active = (form.channels || []).includes(ch.key);
            return (
              <TouchableOpacity
                key={ch.key}
                style={[styles.channelBtn, active && { borderColor: ch.color, backgroundColor: ch.bg }]}
                onPress={() => toggleChannel(ch.key)}
              >
                <View style={[styles.channelBtnIcon, active && { backgroundColor: ch.color }]}>
                  <Icon size={16} color={active ? '#fff' : '#94a3b8'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.channelBtnLabel, active && { color: ch.color }]}>{ch.label}</Text>
                  <Text style={styles.channelBtnSub}>
                    {ch.key === 'push' ? 'Mobile push notification' : ch.key === 'sms' ? 'Text message to customers' : 'Email to opted-in users'}
                  </Text>
                </View>
                {active && <Check size={16} color={ch.color} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Broadcast now button — creates campaign AND sends notifications immediately */}
        {!isEdit && (
          <TouchableOpacity
            style={[styles.broadcastBtn, saving && { opacity: 0.6 }]}
            onPress={handleBroadcast}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Send size={16} color="#fff" />}
            <Text style={styles.broadcastBtnText}>{saving ? 'Sending…' : 'Broadcast Now'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Save as Draft'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
const MerchantCampaigns = ({ visible, onClose }) => {
  const { merchantProfile } = useAuth();
  const merchantId = merchantProfile?.id;

  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Fetch campaigns from campaign-service whenever the modal opens or after save
  const fetchCampaigns = useCallback(async () => {
    if (!merchantId) return;
    setLoadingList(true);
    try {
      const token = await AsyncStorage.getItem('@dandan_auth_token');
      const res = await fetch(`${API_BASE}/campaigns/merchant/${merchantId}/campaigns`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('[MerchantCampaigns] fetch error:', err.message);
    } finally {
      setLoadingList(false);
    }
  }, [merchantId]);

  useEffect(() => {
    if (visible) fetchCampaigns();
  }, [visible, fetchCampaigns]);

  // handleSave: create campaign + immediately launch it (= broadcast)
  const handleSave = async (formData, shouldLaunch = false) => {
    if (!merchantId) {
      Alert.alert('Error', 'Merchant profile not loaded.');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('@dandan_auth_token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      // Determine campaign type from eventType
      const typeMap = {
        sports:   'SPORTS_EVENT',
        birthday: 'BIRTHDAY_SPECIAL',
        music:    'SPECIAL_EVENT',
        festival: 'FESTIVAL',
        promo:    'SPECIAL_EVENT',
        custom:   'SPECIAL_EVENT',
      };

      const body = {
        name:            formData.name,
        type:            typeMap[formData.eventType] || 'SPECIAL_EVENT',
        description:     formData.reward
          ? `${formData.reward}${formData.description ? ' — ' + formData.description : ''}`
          : formData.description || formData.name,
        startDate:       formData.startDate || new Date().toISOString(),
        endDate:         formData.endDate   || new Date(Date.now() + 86400000 * 7).toISOString(),
        audienceCriteria: {},
      };

      // 1. Create the campaign
      const createRes = await fetch(
        `${API_BASE}/campaigns/merchant/${merchantId}/campaigns`,
        { method: 'POST', headers, body: JSON.stringify(body) }
      );

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.error || `Create failed (${createRes.status})`);
      }

      const created = await createRes.json();

      // 2. Launch it immediately (fans out in-app notifications to all audience members)
      if (shouldLaunch) {
        const launchRes = await fetch(
          `${API_BASE}/campaigns/merchant/${merchantId}/campaigns/${created.id}/launch`,
          { method: 'POST', headers }
        );
        if (!launchRes.ok) {
          const err = await launchRes.json().catch(() => ({}));
          console.warn('[MerchantCampaigns] launch error:', err.error);
          // Non-fatal — campaign was created, just not launched
        }
      }

      await fetchCampaigns();
      setView('list');
      setEditingCampaign(null);

      Alert.alert(
        shouldLaunch ? 'Campaign Launched! 🎉' : 'Campaign Saved',
        shouldLaunch
          ? `"${formData.name}" is live. Notifications are being sent to your customers.`
          : `"${formData.name}" has been saved as a draft.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Campaign', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () =>
          setCampaigns(prev => prev.filter(c => c.id !== id))
      },
    ]);
  };

  const handleToggle = (id) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setView('form');
  };

  const handleNew = () => {
    setEditingCampaign(null);
    setView('form');
  };

  const handleBack = () => {
    if (view === 'form') { setView('list'); setEditingCampaign(null); }
    else onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleBack}>
      {view === 'form' ? (
        <CampaignForm campaign={editingCampaign} onSave={handleSave} onBack={() => { setView('list'); setEditingCampaign(null); }} />
      ) : (
        <ScreenWrapper backgroundColor="#f8fafc" paddingHorizontal={0}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <ArrowLeft size={20} color="#0f172a" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Campaigns</Text>
              <Text style={styles.headerSub}>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleNew}>
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>

            {/* Info banner */}
            <View style={styles.infoBanner}>
              <Calendar size={16} color="#6366f1" />
              <Text style={styles.infoText}>
                Campaigns let you trigger special rewards during events — sports finals, birthdays, festivals and more.
              </Text>
            </View>

            {loadingList ? (
              <View style={styles.empty}>
                <ActivityIndicator size="large" color="#6366f1" />
              </View>
            ) : campaigns.length === 0 ? (
              <View style={styles.empty}>
                <Megaphone size={40} color="#cbd5e1" />
                <Text style={styles.emptyTitle}>No campaigns yet</Text>
                <Text style={styles.emptyDesc}>Create your first campaign to reward customers during special events.</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={handleNew}>
                  <Plus size={16} color="#fff" />
                  <Text style={styles.emptyBtnText}>New Campaign</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.list}>
                <Text style={styles.sectionLabel}>Your Campaigns</Text>
                {campaigns.map(c => (
                  <CampaignCard
                    key={c.id}
                    campaign={c}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </View>
            )}

            {/* Event type reference */}
            <Text style={styles.sectionLabel}>Event Categories</Text>
            <View style={styles.categoryGrid}>
              {EVENT_TYPES.map(et => {
                const Icon = et.icon;
                return (
                  <View key={et.key} style={[styles.catCard, { backgroundColor: et.bg }]}>
                    <Icon size={20} color={et.color} />
                    <Text style={[styles.catLabel, { color: et.color }]}>{et.label}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </ScreenWrapper>
      )}
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  headerSub: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },

  listContent: { padding: 20, paddingBottom: 48 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#eef2ff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#c7d2fe', marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 12, color: '#4338ca', lineHeight: 18, fontWeight: '500' },

  list: { marginBottom: 24 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  cardName: { flex: 1, fontSize: 14, fontWeight: '800', color: '#0f172a' },
  statusPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  statusText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardMeta: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginBottom: 5 },
  rewardChip: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  rewardChipText: { fontSize: 10, fontWeight: '700', color: '#4f46e5' },
  cardActions: { gap: 8 },
  iconBtn: { padding: 4 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: {
    width: '30%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 10, borderRadius: 12,
  },
  catLabel: { fontSize: 11, fontWeight: '800' },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a', marginTop: 12, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20, paddingHorizontal: 24, marginBottom: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10b981', paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // Form styles
  formContainer: { flex: 1, backgroundColor: '#f8fafc' },
  formHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingBottom: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  formTitle: { flex: 1, fontSize: 17, fontWeight: '900', color: '#0f172a' },

  fieldLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#0f172a', marginBottom: 16,
  },

  suggestions: { flexDirection: 'row', gap: 8 },
  suggestionChip: {
    backgroundColor: '#f1f5f9', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  suggestionText: { fontSize: 12, fontWeight: '600', color: '#475569' },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#f8fafc', borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  typeBtnText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },

  dateRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 0 },
  dateSep: { width: 12 },

  activeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20,
  },
  activeLabel: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  activeSub: { fontSize: 11, color: '#94a3b8' },

  error: { fontSize: 12, color: '#dc2626', fontWeight: '600', marginBottom: 12 },

  channelRow: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  channelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20,
  },
  channelChipText: { fontSize: 9, fontWeight: '800' },

  channelGrid: { gap: 8, marginBottom: 20 },
  channelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  channelBtnIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center',
  },
  channelBtnLabel: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  channelBtnSub: { fontSize: 11, color: '#94a3b8' },

  broadcastBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#6366f1', borderRadius: 14, paddingVertical: 14, marginBottom: 12,
  },
  broadcastBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },

  saveBtn: { backgroundColor: '#10b981', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },
});

export default MerchantCampaigns;
