import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  Clock,
  RefreshCw,
  TrendingUp,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

interface SettlementBalance {
  merchantId: string;
  pendingTokens: number;
  pendingSGD: number;
  settledTokens: number;
  settledSGD: number;
  conversionRate: number; // tokensPerSGD
}

interface LedgerEntry {
  id: string;
  userId: string;
  tokensRedeemed: number;
  sgdEquivalent: number;
  status: 'PENDING' | 'SETTLED';
  createdAt: string;
}

interface MerchantSettlementProps {
  merchantId: string;
  onBack: () => void;
}

const MerchantSettlement: React.FC<MerchantSettlementProps> = ({ merchantId, onBack }) => {
  const insets = useSafeAreaInsets();
  const [balance, setBalance]     = useState<SettlementBalance | null>(null);
  const [history, setHistory]     = useState<LedgerEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!merchantId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('@dandan_auth_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const [balRes, histRes] = await Promise.all([
        fetch(`${API_URL}/settlements/merchant/${merchantId}/balance`, { headers }),
        fetch(`${API_URL}/settlements/merchant/${merchantId}/history?limit=20`, { headers }),
      ]);

      if (!balRes.ok)  throw new Error(`Balance fetch failed: ${balRes.status}`);
      if (!histRes.ok) throw new Error(`History fetch failed: ${histRes.status}`);

      const balData  = await balRes.json();
      const histData = await histRes.json();

      setBalance(balData);
      setHistory(histData.entries || histData.ledger || []);
    } catch (err: any) {
      console.warn('[Settlement] load error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return iso; }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settlement</Text>
        <TouchableOpacity onPress={load} style={styles.refreshBtn}>
          <RefreshCw size={18} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Balance Cards */}
          <View style={styles.cardsRow}>
            {/* Pending (owed by dandan to merchant) */}
            <View style={[styles.card, styles.cardPending]}>
              <View style={styles.cardIcon}>
                <Clock size={20} color="#d97706" />
              </View>
              <Text style={styles.cardLabel}>Pending</Text>
              <Text style={styles.cardAmount}>
                SGD {balance?.pendingSGD?.toFixed(2) ?? '0.00'}
              </Text>
              <Text style={styles.cardSub}>
                {(balance?.pendingTokens ?? 0).toLocaleString()} dandan
              </Text>
            </View>

            {/* Settled (already paid out) */}
            <View style={[styles.card, styles.cardSettled]}>
              <View style={[styles.cardIcon, { backgroundColor: '#dcfce7' }]}>
                <CheckCircle2 size={20} color="#16a34a" />
              </View>
              <Text style={styles.cardLabel}>Settled</Text>
              <Text style={[styles.cardAmount, { color: '#16a34a' }]}>
                SGD {balance?.settledSGD?.toFixed(2) ?? '0.00'}
              </Text>
              <Text style={styles.cardSub}>
                {(balance?.settledTokens ?? 0).toLocaleString()} dandan
              </Text>
            </View>
          </View>

          {/* Conversion rate info */}
          <View style={styles.rateRow}>
            <TrendingUp size={14} color="#64748b" />
            <Text style={styles.rateText}>
              Conversion rate: {balance?.conversionRate ?? 500} dandan = SGD 1.00
            </Text>
          </View>

          {/* How settlement works */}
          <View style={styles.infoBox}>
            <BadgeDollarSign size={16} color="#4f46e5" />
            <Text style={styles.infoText}>
              Pending balance is invoiced monthly. Payment is transferred to your registered bank account by the 5th of the following month.
            </Text>
          </View>

          {/* Ledger history */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Redemption History</Text>

            {history.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No redemptions yet</Text>
                <Text style={styles.emptySubtext}>
                  When customers redeem rewards at your store, they'll appear here.
                </Text>
              </View>
            )}

            {history.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <View style={styles.entryLeft}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: entry.status === 'SETTLED' ? '#16a34a' : '#d97706' }
                  ]} />
                  <View>
                    <Text style={styles.entryDate}>{formatDate(entry.createdAt)}</Text>
                    <Text style={styles.entryCustomer}>
                      {entry.tokensRedeemed.toLocaleString()} dandan redeemed
                    </Text>
                  </View>
                </View>
                <View style={styles.entryRight}>
                  <Text style={styles.entrySgd}>SGD {entry.sgdEquivalent?.toFixed(2)}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: entry.status === 'SETTLED' ? '#dcfce7' : '#fef3c7' }
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      { color: entry.status === 'SETTLED' ? '#16a34a' : '#d97706' }
                    ]}>
                      {entry.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '900', color: '#0f172a',
  },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#eef2ff',
    justifyContent: 'center', alignItems: 'center',
  },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  errorText: { fontSize: 14, color: '#ef4444', textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    backgroundColor: '#4f46e5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12,
  },
  retryText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  cardsRow: {
    flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 0,
  },
  card: {
    flex: 1, borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardPending: { backgroundColor: '#fffbeb' },
  cardSettled: { backgroundColor: '#f0fdf4' },
  cardIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fef3c7',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 11, fontWeight: '900', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
  },
  cardAmount: {
    fontSize: 20, fontWeight: '900', color: '#d97706', marginBottom: 2,
  },
  cardSub: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  rateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingTop: 16,
  },
  rateText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  infoBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    margin: 20, padding: 14,
    backgroundColor: '#eef2ff', borderRadius: 14,
  },
  infoText: { flex: 1, fontSize: 12, color: '#4f46e5', lineHeight: 18, fontWeight: '500' },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#64748b' },
  emptySubtext: {
    fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 18,
  },
  entryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  entryLeft: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  entryDate: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  entryCustomer: { fontSize: 12, color: '#64748b', marginTop: 1 },
  entryRight: { alignItems: 'flex-end', gap: 4 },
  entrySgd: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '900' },
});

export default MerchantSettlement;
