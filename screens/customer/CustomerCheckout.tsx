import {
  ArrowLeft,
  CheckCircle,
  Coins,
  Minus,
  Plus,
  Wallet,
} from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const { width } = Dimensions.get('window');
const POINTS_PER_DOLLAR = 100; // 100 dandan = $1

interface CartItem {
  title: string;
  quantity: number;
  price: number;
}

interface ConfirmSuccessDetails {
  amount: number;
  pointsUsed: number;
  merchantName: string;
  transactionRef: string;
}

interface CustomerCheckoutProps {
  merchantName: string;
  cartItems?: CartItem[];
  totalAmount?: number;
  balance?: number;
  onConfirm?: (pointsUsed: number, merchantName: string) => Promise<void> | void;
  onConfirmSuccess?: (details: ConfirmSuccessDetails) => void;
  onDone?: () => void;
  onCancel?: () => void;
}

const CustomerCheckout: React.FC<CustomerCheckoutProps> = ({
  merchantName,
  cartItems = [],
  totalAmount = 0,
  balance = 0,
  onConfirm,
  onConfirmSuccess,
  onDone,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();
  const [showQr, setShowQr] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [transactionRef, setTransactionRef] = useState('');
  const pulseOpacity = useSharedValue(1);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setShowQr(false);
      setTransactionRef('');
    }
  }, [isFocused]);

  const pointsCost = Math.ceil(totalAmount * POINTS_PER_DOLLAR);
  const maxPoints = Math.min(balance, pointsCost);
  const isFreeRedemption = totalAmount === 0;
  const canPay = isFreeRedemption || (pointsToUse > 0 && pointsToUse <= balance);

  useEffect(() => {
    // Default to full points payment if affordable
    setPointsToUse(maxPoints);
  }, [maxPoints]);

  useEffect(() => {
    if (showQr) {
      pulseOpacity.value = withRepeat(
        withTiming(0.3, { duration: 1200 }),
        -1,
        true
      );
    }
  }, [showQr]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const adjustPoints = (delta: number) => {
    setPointsToUse((prev) => {
      const step = 100; // adjust by 100 dandan at a time
      const next = prev + delta * step;
      return Math.max(0, Math.min(maxPoints, next));
    });
  };

  const handleConfirm = async () => {
    const ref = `TXN-${Date.now()}`;
    setTransactionRef(ref);
    if (onConfirm) {
      await onConfirm(pointsToUse, merchantName);
    }
    
    if (onConfirmSuccess) {
      onConfirmSuccess({
        amount: totalAmount,
        pointsUsed: pointsToUse,
        merchantName: merchantName,
        transactionRef: ref
      });
    } else {
      setShowQr(true);
    }
  };

  const qrPayload = JSON.stringify({
    type: 'dandan_payment',
    version: 1,
    ref: transactionRef,
    customerId: 1,
    merchant: merchantName,
    items: cartItems.map((i) => ({
      title: i.title,
      qty: i.quantity,
      price: i.price,
    })),
    total: totalAmount,
    pointsUsed: pointsToUse,
    timestamp: new Date().toISOString(),
  });

  const remainingBalance = balance - pointsToUse;
  const dollarValue = (pointsToUse / POINTS_PER_DOLLAR).toFixed(2);

  // ─── QR CODE VIEW ───
  if (showQr) {
    return (
      <ScreenWrapper
        useSafeAreaTop
        useSafeAreaBottom
        backgroundColor="#f8fafc"
        paddingHorizontal={0}
        style={styles.qrScreen}
      >
        <TouchableOpacity
          onPress={onDone}
          style={[styles.backBtn, { top: insets.top + 8 }]}
        >
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>

        <Animated.View entering={FadeIn.duration(600)} style={styles.qrCard}>
          <View style={styles.successBadge}>
            <CheckCircle size={44} color="#10b981" />
          </View>
          <Text style={styles.qrTitle}>Payment Confirmed!</Text>
          <Text style={styles.qrSubtitle}>
            Show this QR code to the merchant to complete your order.
          </Text>

          <View style={styles.qrCodeBox}>
            <QRCode value={qrPayload} size={200} backgroundColor="#ffffff" />
          </View>

          <Text style={styles.orderRef}>
            {transactionRef}
          </Text>

          <View style={styles.qrSummary}>
            {cartItems.map((item, i) => (
              <Text key={i} style={styles.qrItemText}>
                {item.quantity}x {item.title}
              </Text>
            ))}
            <View style={styles.qrDivider} />
            <Text style={styles.qrPointsText}>
              {pointsToUse.toLocaleString()} dandan used
            </Text>
          </View>

          <Animated.View style={[styles.waitingRow, pulseStyle]}>
            <View style={styles.waitingDot} />
            <Text style={styles.waitingText}>Waiting for merchant to scan...</Text>
          </Animated.View>
        </Animated.View>

        <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </ScreenWrapper>
    );
  }

  // ─── CHECKOUT SUMMARY VIEW ───
  return (
    <View style={styles.fullScreen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onCancel} style={styles.headerBack}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        style={{ flex: 1 }}
      >
        {/* Merchant + Order Summary combined */}
        <View style={styles.section}>
          <Text style={styles.merchantName}>{merchantName}</Text>
          <View style={styles.cardCompact}>
            {cartItems.map((item, i) => (
              <View key={i} style={styles.orderRow}>
                <View style={styles.orderQty}>
                  <Text style={styles.orderQtyText}>{item.quantity}x</Text>
                </View>
                <Text style={styles.orderItemName}>{item.title}</Text>
                <Text style={styles.orderItemPrice}>
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <View style={styles.totalRight}>
                <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
                <Text style={styles.totalPoints}>≈ {pointsCost.toLocaleString()} dandan</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Wallet Balance — compact inline */}
        <View style={styles.section}>
          <View style={styles.walletRow}>
            <View style={styles.walletLeft}>
              <Wallet size={18} color="#94a3b8" />
              <Text style={styles.walletBalance}>
                {balance.toLocaleString()} dandan
              </Text>
            </View>
            {balance < pointsCost ? (
              <View style={styles.insufficientBadge}>
                <Text style={styles.insufficientText}>Insufficient</Text>
              </View>
            ) : (
              <Text style={styles.walletSubtext}>Available</Text>
            )}
          </View>
        </View>

        {/* Points Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PAY WITH POINTS</Text>
          <View style={styles.cardCompact}>
            <View style={styles.pointsSelector}>
              <TouchableOpacity
                onPress={() => adjustPoints(-1)}
                style={styles.pointsBtn}
              >
                <Minus size={18} color="#0f172a" />
              </TouchableOpacity>
              <View style={styles.pointsDisplay}>
                <Text style={styles.pointsValue}>
                  {pointsToUse.toLocaleString()}
                </Text>
                <Text style={styles.pointsUnit}>dandan</Text>
              </View>
              <TouchableOpacity
                onPress={() => adjustPoints(1)}
                style={styles.pointsBtn}
              >
                <Plus size={18} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {/* Quick select buttons */}
            <View style={styles.quickSelect}>
              {[25, 50, 75, 100].map((pct) => {
                const val = Math.round((maxPoints * pct) / 100 / 100) * 100;
                const isActive = pointsToUse === val;
                return (
                  <TouchableOpacity
                    key={pct}
                    onPress={() => setPointsToUse(val)}
                    style={[
                      styles.quickBtn,
                      isActive && styles.quickBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickBtnText,
                        isActive && styles.quickBtnTextActive,
                      ]}
                    >
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Dollar value</Text>
              <Text style={styles.breakdownValue}>${dollarValue}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Remaining balance</Text>
              <Text
                style={[
                  styles.breakdownValue,
                  remainingBalance < 1000 ? { color: '#ef4444' } : undefined,
                ]}
              >
                {remainingBalance.toLocaleString()} dandan
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer with Submit Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.payBtn, !canPay ? { opacity: 0.5 } : undefined]}
          onPress={handleConfirm}
          disabled={!canPay}
        >
          <Coins size={18} color="#ffffff" />
          <Text style={styles.payBtnText}>
            {isFreeRedemption ? 'Redeem Prize' : `Pay ${pointsToUse.toLocaleString()} dandan`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: '#f8fafc' },
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
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 10,
  },
  cardCompact: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  orderQty: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderQtyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
  },
  totalRight: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  totalPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginTop: 2,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  walletSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  insufficientBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  insufficientText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  pointsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  pointsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsDisplay: {
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#4f46e5',
  },
  pointsUnit: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: -2,
  },
  quickSelect: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  quickBtnActive: {
    backgroundColor: '#4f46e5',
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
  },
  quickBtnTextActive: {
    color: '#ffffff',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4f46e5',
    height: 56,
    borderRadius: 28,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  // ─── QR Screen ───
  qrScreen: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  qrCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 12,
  },
  successBadge: {
    marginBottom: 12,
  },
  qrTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 6,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  qrCodeBox: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  orderRef: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  qrSummary: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  qrItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  qrDivider: {
    height: 1,
    width: '60%',
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  qrPointsText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#4f46e5',
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waitingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  waitingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  doneBtn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
});

export default CustomerCheckout;
