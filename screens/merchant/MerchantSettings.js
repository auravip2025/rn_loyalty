import {
  Bell,
  ChevronRight,
  Cpu,
  LogOut,
  Megaphone,
  Moon,
  ShieldCheck,
  Store,
  Sun,
  UserCog,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../components/old_app/common/Button';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import MerchantCampaigns from './MerchantCampaigns';

const NotificationsModal = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [rewardAlerts, setRewardAlerts] = useState(true);
  const [scanAlerts, setScanAlerts] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  const rows = [
    { label: 'Push Notifications', sub: 'Real-time alerts on your device', value: pushEnabled, set: setPushEnabled },
    { label: 'Email Notifications', sub: 'Summaries sent to your inbox', value: emailEnabled, set: setEmailEnabled },
    { label: 'Reward Redemptions', sub: 'Alert when a customer redeems', value: rewardAlerts, set: setRewardAlerts },
    { label: 'QR Scan Activity', sub: 'Alert on each scan event', value: scanAlerts, set: setScanAlerts },
    { label: 'Weekly Report', sub: 'Performance digest every Monday', value: weeklyReport, set: setWeeklyReport },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={notifStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[notifStyles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={notifStyles.handle} />
          <Text style={notifStyles.title}>Notifications</Text>
          {rows.map((row, i) => (
            <View key={i} style={notifStyles.row}>
              <View style={notifStyles.rowInfo}>
                <Text style={notifStyles.rowLabel}>{row.label}</Text>
                <Text style={notifStyles.rowSub}>{row.sub}</Text>
              </View>
              <Switch
                value={row.value}
                onValueChange={row.set}
                trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                thumbColor="#fff"
              />
            </View>
          ))}
          <TouchableOpacity style={notifStyles.doneBtn} onPress={onClose}>
            <Text style={notifStyles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const notifStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingHorizontal: 20,
  },
  handle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 17, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  rowInfo: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  rowSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  doneBtn: {
    marginTop: 20, backgroundColor: '#10b981', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  doneBtnText: { fontSize: 14, fontWeight: '900', color: '#fff' },
});

const MerchantSettings = ({ onLogout, onToggleTheme, isDark, onEditProfile }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const { onboardingStatus } = useAuth();

  const statusLabel = onboardingStatus === 'approved' ? 'Verified ✓'
    : onboardingStatus === 'under_review' ? 'Under Review'
      : 'Setup Pending';
  const statusColor = onboardingStatus === 'approved' ? '#10b981'
    : onboardingStatus === 'under_review' ? '#f59e0b'
      : '#94a3b8';

  const settings = [
    {
      id: 0,
      title: 'Edit Profile',
      subtitle: 'Business info, hours, social',
      icon: UserCog,
      right: <ChevronRight size={16} color="#94a3b8" />,
      onPress: onEditProfile,
    },
    {
      id: 1,
      title: 'Notifications',
      subtitle: 'Push & Email',
      icon: Bell,
      right: <ChevronRight size={16} color="#94a3b8" />,
      onPress: () => setShowNotifications(true),
    },
    {
      id: 4,
      title: 'Campaigns',
      subtitle: 'Event-based rewards',
      icon: Megaphone,
      right: <ChevronRight size={16} color="#94a3b8" />,
      onPress: () => setShowCampaigns(true),
    },
    {
      id: 2,
      title: 'Security',
      subtitle: '2FA Enabled',
      icon: ShieldCheck,
      right: <ChevronRight size={16} color="#94a3b8" />,
    },
    {
      id: 3,
      title: 'Rule Engine',
      subtitle: 'Adv. Triggers',
      icon: Cpu,
      right: <ChevronRight size={16} color="#94a3b8" />,
    },
  ];

  return (
    <>
    <ScreenWrapper
      scroll
      contentContainerStyle={styles.contentContainer}
      style={isDark && styles.containerDark}
    >

      <View style={styles.profileSection}>
        <View style={styles.logoContainer}>
          <Store size={32} color="#ffffff" />
        </View>
        <Text style={[styles.merchantName, isDark && styles.textDark]}>The Coffee House</Text>
        <Text style={styles.merchantId}>Merchant ID: #88392</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.settingsList}>
        {settings.map((item) => (
          <Card key={item.id} style={styles.settingCard} onPress={item.onPress}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <item.icon size={20} color="#475569" />
              </View>
              <View>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            {item.right}
          </Card>
        ))}
      </View>

      <TouchableOpacity
        onPress={onToggleTheme}
        style={[styles.themeButton, isDark && styles.themeButtonDark]}>
        {isDark ? <Sun size={18} color="#ffffff" /> : <Moon size={18} color="#0f172a" />}
        <Text style={[styles.themeButtonText, isDark && styles.textDark]}>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </Text>
      </TouchableOpacity>

      <Button
        onPress={onLogout}
        variant="primary"
        style={styles.logoutButton}>
        <LogOut size={18} color="#ffffff" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Button>
    </ScreenWrapper>
      <NotificationsModal visible={showNotifications} onClose={() => setShowNotifications(false)} />
      <MerchantCampaigns visible={showCampaigns} onClose={() => setShowCampaigns(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    paddingBottom: 80,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#059669',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  merchantName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  textDark: {
    color: '#ffffff',
  },
  merchantId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsList: {
    gap: 12,
    marginBottom: 32,
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIcon: {
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 20,
  },
  settingSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toggle: {
    width: 40,
    height: 24,
    backgroundColor: '#10b981',
    borderRadius: 12,
    position: 'relative',
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  themeButtonDark: {
    backgroundColor: '#334155',
  },
  themeButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f43f5e',
    paddingVertical: 16,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MerchantSettings;
