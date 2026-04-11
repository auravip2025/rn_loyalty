import { CheckCircle, Receipt, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const MerchantScanPayment = ({ transactionData, onDone }) => {


  if (!transactionData) return null;

  const {
    ref,
    customerId,
    merchant,
    items = [],
    total,
    pointsUsed,
    timestamp,
  } = transactionData;

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

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
          <CheckCircle size={56} color="#10b981" />
        </View>
        <Text style={styles.successTitle}>Payment Received!</Text>
        <Text style={styles.successSubtitle}>
          Points have been deducted from customer's wallet
        </Text>
      </Animated.View>

      {/* Transaction Card */}
      <Animated.View entering={FadeInDown.delay(300)} style={styles.txCard}>
        {/* Customer Info */}
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

        {/* Order Details */}
        <View style={styles.txRow}>
          <View style={styles.txIcon}>
            <Receipt size={16} color="#10b981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.txLabel}>Order Items</Text>
            {items.map((item, i) => (
              <Text key={i} style={styles.txItemText}>
                {item.qty}x {item.title} — ${(item.price * item.qty).toFixed(2)}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Amount */}
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>${total?.toFixed(2)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Points Collected</Text>
            <Text style={styles.pointsValue}>
              {pointsUsed?.toLocaleString()} dandan
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Reference */}
        <View style={styles.refRow}>
          <Text style={styles.refLabel}>Reference</Text>
          <Text style={styles.refValue}>{ref}</Text>
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
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  refLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  refValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
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
