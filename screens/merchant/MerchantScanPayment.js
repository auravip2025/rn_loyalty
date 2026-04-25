import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckCircle, Gift, Receipt, User, XCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

/**
 * MerchantScanPayment — shown after the merchant scans a customer's QR code.
 *
 * Two modes based on QR payload:
 *   dandan_payment (type)   — reward redemption QR (ref = redemptionId from rewards-service)
 *   dandan_earn   (type)    — earn points QR (future)
 *
 * For reward redemptions this screen calls POST /api/rewards/redemptions/:id/fulfill
 * which marks the UserReward as FULFILLED and records the settlement ledger entry.
 */
const MerchantScanPayment = ({ transactionData, storeId, onDone }) => {
  const insets = useSafeAreaInsets();
  const [fulfilling, setFulfilling]   = useState(false);
  const [fulfilled,  setFulfilled]    = useState(false);
  const [error,      setError]        = useState(null);
  const [redemptionDetail, setRedemptionDetail] = useState(null);

  if (!transactionData) return null;

  const {
    ref,           // redemptionId (UUID) for rewards, or TXN-xxx for legacy
    customerId,
    merchant,
    items = [],
    total,
    pointsUsed,
    timestamp,
    type,
  } = transactionData;

  const isRewardRedemption = type === 'dandan_payment' && ref && !ref.startsWith('TXN-');

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // On mount, fetch the server-side redemption details + call fulfill
  useEffect(() => {
    if (!isRewardRedemption) return;

    const fulfill = async () => {
      setFulfilling(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('@dandan_auth_token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // 1. Fetch redemption details to verify before fulfilling
        const detailRes = await fetch(`${API_URL}/rewards/redemptions/${ref}`, { headers });
        const detail = await detailRes.json();
        if (!detailRes.ok) throw new Error(detail.error || 'Redemption not found');
        setRedemptionDetail(detail);

        // 2. Mark as fulfilled — creates settlement record
        const fulfillRes = await fetch(`${API_URL}/rewards/redemptions/${ref}/fulfill`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ storeId }),
        });
        const fulfillData = await fulfillRes.json();
        if (!fulfillRes.ok) throw new Error(fulfillData.error || 'Fulfillment failed');

        setFulfilled(true);
        console.log(`[MerchantScan] Fulfilled redemption ${ref}`);
      } catch (err) {
        console.error('[MerchantScan] Fulfill error:', err.message);
        setError(err.message);
      } finally {
        setFulfilling(false);
      }
    };

    fulfill();
  }, [ref]);

  // ── Loading state ──
  if (fulfilling) {
    return (
      <View style={[styles.container, { backgroundColor: '#f8fafc' }]}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Confirming redemption...</Text>
      </View>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <ScreenWrapper useSafeAreaTop useSafeAreaBottom backgroundColor="#fff5f5" paddingHorizontal={0} style={styles.container}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.successHeader}>
          <View style={[styles.checkCircle, { backgroundColor: '#fee2e2' }]}>
            <XCircle size={56} color="#ef4444" />
          </View>
          <Text style={[styles.successTitle, { color: '#ef4444' }]}>Redemption Failed</Text>
          <Text style={styles.successSubtitle}>{error}</Text>
        </Animated.View>
        <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: '#ef4444' }]} onPress={onDone}>
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const rewardName = redemptionDetail?.rewardName || items[0]?.title || 'Reward';
  const isReward   = isRewardRedemption && fulfilled;

  return (
    <ScreenWrapper
      useSafeAreaTop
      useSafeAreaBottom
      backgroundColor="#f0fdf4"
      paddingHorizontal={0}
      style={styles.container}
    >
      {/* Success Header */}
      <Animated.View entering={FadeIn.duration(600)} style={styles.successHeader}>
        <View style={styles.checkCircle}>
          {isReward
            ? <Gift size={56} color="#10b981" />
            : <CheckCircle size={56} color="#10b981" />
          }
        </View>
        <Text style={styles.successTitle}>
          {isReward ? 'Reward Fulfilled!' : 'Payment Received!'}
        </Text>
        <Text style={styles.successSubtitle}>
          {isReward
            ? `Hand over "${rewardName}" to the customer`
            : 'Points have been deducted from customer\'s wallet'
          }
        </Text>
      </Animated.View>

      {/* Transaction Card */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.txCard}>

        {/* Customer row */}
        <View style={styles.txRow}>
          <View style={styles.txIcon}>
            <User size={16} color="#10b981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.txLabel}>Customer</Text>
            <Text style={styles.txValue}>Customer #{customerId}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Reward / items */}
        <View style={styles.txRow}>
          <View style={styles.txIcon}>
            {isReward
              ? <Gift size={16} color="#10b981" />
              : <Receipt size={16} color="#10b981" />
            }
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.txLabel}>{isReward ? 'Reward' : 'Order Items'}</Text>
            {isReward
              ? <Text style={styles.txValue}>{rewardName}</Text>
              : items.map((item, i) => (
                  <Text key={i} style={styles.txItemText}>
                    {item.qty}x {item.title}{item.price ? ` — $${(item.price * item.qty).toFixed(2)}` : ''}
                  </Text>
                ))
            }
          </View>
        </View>

        <View style={styles.divider} />

        {/* Points used */}
        <View style={styles.amountSection}>
          {total > 0 && (
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Total Value</Text>
              <Text style={styles.amountValue}>${Number(total).toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Points Redeemed</Text>
            <Text style={styles.pointsValue}>
              {Number(pointsUsed).toLocaleString()} dandan
            </Text>
          </View>
          {isReward && (
            <View style={[styles.settlementNote]}>
              <Text style={styles.settlementNoteText}>
                This redemption will appear in your monthly settlement invoice.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Reference */}
        <View style={styles.refRow}>
          <Text style={styles.refLabel}>Reference</Text>
          <Text style={styles.refValue} numberOfLines={1}>{ref}</Text>
        </View>
        {formattedTime ? (
          <View style={styles.refRow}>
            <Text style={styles.refLabel}>Time</Text>
            <Text style={styles.refValue}>{formattedTime}</Text>
          </View>
        ) : null}
      </Animated.View>

      {/* Done Button */}
      <Animated.View
        entering={FadeInDown.delay(500)}
        style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}
      >
        <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  txCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  txRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  txLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  txValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  txItemText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  amountSection: {
    gap: 10,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10b981',
  },
  settlementNote: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  settlementNoteText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
    lineHeight: 16,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 12,
  },
  refLabel: {
    fontSize: 12,
    color: '#94a3b8',
    flexShrink: 0,
  },
  refValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    flex: 1,
    textAlign: 'right',
  },
  bottomArea: {
    width: '100%',
    marginTop: 32,
  },
  doneBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
});

export default MerchantScanPayment;
