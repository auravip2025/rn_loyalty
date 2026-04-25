import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Coins, CreditCard } from 'lucide-react-native';

interface PaymentBreakdownProps {
  pointsReserved: number;
  cashRequired: number;
  type: 'pure_points' | 'hybrid' | 'cash_only';
}

const TOKENS_PER_SGD = 500;

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({
  pointsReserved,
  cashRequired,
  type,
}) => {
  const tokensValue = parseFloat((pointsReserved / TOKENS_PER_SGD).toFixed(2));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PAYMENT BREAKDOWN</Text>

      {pointsReserved > 0 && (
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={styles.iconBox}>
              <Coins size={14} color="#f59e0b" />
            </View>
            <Text style={styles.rowLabel}>
              {pointsReserved.toLocaleString()} dandan
            </Text>
          </View>
          <Text style={styles.rowValue}>SGD {tokensValue.toFixed(2)}</Text>
        </View>
      )}

      {cashRequired > 0 && (
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={[styles.iconBox, styles.iconBoxCash]}>
              <CreditCard size={14} color="#4f46e5" />
            </View>
            <Text style={styles.rowLabel}>Cash top-up</Text>
          </View>
          <Text style={[styles.rowValue, styles.cashValue]}>
            + SGD {cashRequired.toFixed(2)}
          </Text>
        </View>
      )}

      {type === 'cash_only' && (
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            Earn dandan tokens on this purchase!
          </Text>
        </View>
      )}

      {type === 'hybrid' && (
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            Your dandan tokens cover part of the cost. Pay the rest with HitPay.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxCash: {
    backgroundColor: '#eef2ff',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#f59e0b',
  },
  cashValue: {
    color: '#4f46e5',
  },
  infoRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    fontWeight: '500',
  },
});

export default PaymentBreakdown;
