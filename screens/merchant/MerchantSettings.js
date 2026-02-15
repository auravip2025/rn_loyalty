import {
  Bell,
  ChevronRight,
  Cpu,
  LogOut,
  Moon,
  ShieldCheck,
  Store,
  Sun,
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../components/old_app/common/Button';
import Card from '../../components/old_app/common/Card';

const MerchantSettings = ({ onLogout, onToggleTheme, isDark }) => {
  const settings = [
    {
      id: 1,
      title: 'Notifications',
      subtitle: 'Push & Email',
      icon: Bell,
      right: <View style={styles.toggle} />,
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
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>

      <View style={styles.profileSection}>
        <View style={styles.logoContainer}>
          <Store size={32} color="#ffffff" />
        </View>
        <Text style={[styles.merchantName, isDark && styles.textDark]}>The Coffee House</Text>
        <Text style={styles.merchantId}>Merchant ID: #88392</Text>
      </View>

      <View style={styles.settingsList}>
        {settings.map((item) => (
          <Card key={item.id} style={styles.settingCard}>
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
    </ScrollView>
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
