import {
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  Settings,
  Wallet,
  Zap,
} from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../components/old_app/common/Button';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

// ── Skeleton shimmer for loading state ────────────────────────────────────────
const SkeletonRow = ({ index }) => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 700, delay: index * 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [index]);

  return (
    <Animated.View style={[styles.skeletonRow, { opacity }]}>
      <View style={styles.skeletonIcon} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={[styles.skeletonLine, { width: '55%' }]} />
        <View style={[styles.skeletonLine, { width: '30%', opacity: 0.6 }]} />
      </View>
      <View style={[styles.skeletonLine, { width: 60 }]} />
    </Animated.View>
  );
};

// ── Single transaction row ─────────────────────────────────────────────────────
const TransactionRow = ({ tx }) => {
  const isEarn = tx.type === 'earn';
  return (
    <View style={styles.txRow}>
      <View style={[styles.txIconWrap, isEarn ? styles.txIconEarn : styles.txIconSpend]}>
        {isEarn
          ? <ArrowDownLeft size={18} color="#059669" />
          : <ArrowUpRight  size={18} color="#e11d48" />
        }
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txMerchant} numberOfLines={1}>{tx.merchant}</Text>
        <Text style={styles.txDate}>{tx.date}</Text>
      </View>
      <View style={styles.txAmountCol}>
        <Text style={[styles.txAmount, isEarn ? styles.amountEarn : styles.amountSpend]}>
          {isEarn ? '+' : '−'}{Number(tx.amount).toLocaleString()}
        </Text>
        <Text style={styles.txUnit}>pts</Text>
      </View>
    </View>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const CustomerWallet = ({ balance, transactions = [], loading = false, onOpenPayment }) => {
  const latest = transactions.slice(0, 10);

  return (
    <ScreenWrapper
      scroll
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* ── Balance card ── */}
      <View style={styles.balanceCard}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />

        <View style={styles.balanceHeader}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
              <Text style={styles.balanceAmount}>{(balance || 0).toLocaleString()}</Text>
              <Text style={styles.balanceUnit}>dandan</Text>
            </View>
          </View>
          <View style={styles.walletIconWrap}>
            <Wallet size={22} color="#ffffff" />
          </View>
        </View>

        <Button
          onPress={onOpenPayment}
          variant="merchant"
          style={styles.payButton}>
          <QrCode size={18} color="#ffffff" />
          <Text style={styles.payButtonText}>Pay</Text>
        </Button>
      </View>

      {/* ── Transaction section header ── */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {!loading && latest.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{latest.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Loading skeleton ── */}
      {loading && (
        <View style={styles.listWrap}>
          {[0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} index={i} />)}
        </View>
      )}

      {/* ── Empty state ── */}
      {!loading && latest.length === 0 && (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Zap size={28} color="#c7d2fe" />
          </View>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtitle}>
            Earn or spend dandan tokens and your activity will appear here.
          </Text>
        </View>
      )}

      {/* ── Transaction list ── */}
      {!loading && latest.length > 0 && (
        <View style={styles.listWrap}>
          {latest.map((tx, i) => (
            <React.Fragment key={tx.id ?? i}>
              <TransactionRow tx={tx} />
              {i < latest.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      )}

    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  contentContainer: {},

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  settingsButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },

  // Balance card
  balanceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  bgCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.25,
  },
  bgCircle1: { top: -70, right: -70, backgroundColor: '#4f46e5' },
  bgCircle2: { bottom: -70, left: -70, backgroundColor: '#059669' },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
  },
  balanceUnit: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 6,
  },
  walletIconWrap: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#059669',
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  countBadge: {
    backgroundColor: '#e0e7ff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4f46e5',
  },

  // Transaction list card
  listWrap: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
  },

  // Transaction row
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  txIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txIconEarn:  { backgroundColor: '#ecfdf5' },
  txIconSpend: { backgroundColor: '#fff1f2' },
  txInfo: {
    flex: 1,
    gap: 3,
  },
  txMerchant: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  txDate: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  txAmountCol: {
    alignItems: 'flex-end',
    gap: 1,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  txUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountEarn:  { color: '#059669' },
  amountSpend: { color: '#e11d48' },

  // Empty state
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: '#fafafa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Skeleton
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  skeletonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
});

export default CustomerWallet;
