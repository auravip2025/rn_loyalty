import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { X, Store, Tag, Zap, CheckCircle2, RefreshCw } from 'lucide-react-native';
import Button from '../common/Button';
import Card from '../common/Card';

const PaymentModal = ({
  balance,
  onClose,
  onConfirmPayment,
  onDone,
  activeCoupon,
  initialAmount
}) => {
  const [billAmount, setBillAmount] = useState(initialAmount || '');
  const [usePoints, setUsePoints] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [deducted, setDeducted] = useState({ points: 0, cash: 0, saved: 0 });

  const conversionRate = 0.01;
  const numericBill = parseFloat(billAmount) || 0;

  let couponDiscount = 0;
  if (activeCoupon && activeCoupon.type === 'discount') {
    couponDiscount = numericBill * (activeCoupon.value / 100);
  }

  const billAfterCoupon = numericBill - couponDiscount;
  const maxPointDiscount = balance * conversionRate;
  const pointDiscount = usePoints ? Math.min(billAfterCoupon, maxPointDiscount) : 0;
  const payAmount = Math.max(0, billAfterCoupon - pointDiscount);
  const pointsUsed = usePoints ? Math.ceil(pointDiscount / conversionRate) : 0;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      onConfirmPayment(pointsUsed);
      setDeducted({
        points: pointsUsed,
        cash: payAmount,
        saved: couponDiscount
      });
      setProcessing(false);
      setCompleted(true);
    }, 2000);
  };

  if (completed) {
    return (
      <View style={styles.completedOverlay}>
        <View style={styles.completedContainer}>
          <View style={styles.successIcon}>
            <CheckCircle2 size={40} color="#059669" />
          </View>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <Text style={styles.successId}>Transaction #8839201</Text>

          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Bill</Text>
              <Text style={styles.summaryValue}>${numericBill.toFixed(2)}</Text>
            </View>

            {deducted.saved > 0 && (
              <View style={[styles.summaryRow, styles.borderBottom]}>
                <Text style={[styles.summaryLabel, styles.couponLabel]}>
                  <Tag size={12} color="#10b981" /> Coupon Applied
                </Text>
                <Text style={styles.couponValue}>-${deducted.saved.toFixed(2)}</Text>
              </View>
            )}

            {deducted.points > 0 && (
              <View style={[styles.summaryRow, styles.borderBottom]}>
                <Text style={styles.summaryLabel}>Points Redeemed</Text>
                <Text style={styles.pointsValue}>-{deducted.points} dandan</Text>
              </View>
            )}

            <View style={[styles.summaryRow, styles.borderBottom]}>
              <Text style={styles.amountLabel}>Amount Paid</Text>
              <Text style={styles.amountValue}>${deducted.cash.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.remainingLabel}>Remaining Balance</Text>
              <Text style={styles.remainingValue}>
                {(balance - deducted.points).toLocaleString()} dandan
              </Text>
            </View>
          </Card>

          <Button onPress={onDone || onClose} variant="secondary" style={styles.doneButton}>
            Done
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Make Payment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <X size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.merchantInfo}>
            <Text style={styles.merchantLabel}>Merchant</Text>
            <View style={styles.merchantName}>
              <Store size={24} color="#4f46e5" />
              <Text style={styles.merchantText}>The Coffee House</Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#cbd5e1"
              value={billAmount}
              onChangeText={setBillAmount}
              keyboardType="numeric"
              autoFocus
            />
          </View>

          {activeCoupon && (
            <View style={styles.couponCard}>
              <View style={styles.couponLeft}>
                <View style={styles.couponIcon}>
                  <Tag size={20} color="#059669" />
                </View>
                <View>
                  <Text style={styles.couponType}>Active Coupon</Text>
                  <Text style={styles.couponName}>{activeCoupon.label}</Text>
                </View>
              </View>
              <Text style={styles.couponDiscount}>
                -${(numericBill * (activeCoupon.value / 100)).toFixed(2)}
              </Text>
            </View>
          )}

          <Card style={[styles.pointsCard, usePoints && styles.pointsCardActive]}>
            <View style={styles.pointsRow}>
              <View style={styles.pointsLeft}>
                <View style={styles.pointsIcon}>
                  <Zap size={20} color="#d97706" fill="#f59e0b" />
                </View>
                <View>
                  <Text style={styles.balanceText}>
                    Balance: {balance.toLocaleString()}
                  </Text>
                  <Text style={styles.pointsText}>Use Points</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setUsePoints(!usePoints)}
                style={[styles.toggle, usePoints && styles.toggleActive]}
              >
                <View style={[styles.toggleKnob, usePoints && styles.toggleKnobActive]} />
              </TouchableOpacity>
            </View>

            {usePoints && (
              <View style={styles.pointsDetails}>
                <Text style={styles.pointsCoverage}>
                  Covering ${Math.min(
                    billAfterCoupon,
                    balance * conversionRate
                  ).toFixed(2)}
                </Text>
                <Text style={styles.pointsDeduction}>
                  -{Math.ceil(Math.min(
                    billAfterCoupon,
                    balance * conversionRate
                  ) / conversionRate)} pts
                </Text>
              </View>
            )}
          </Card>
        </View>

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total to Pay</Text>
            <Text style={styles.totalAmount}>
              ${Math.max(0, payAmount).toFixed(2)}
            </Text>
          </View>
          <Button
            onPress={handlePay}
            disabled={!billAmount || processing}
            variant="merchant"
            style={styles.payButton}
          >
            {processing ? (
              <RefreshCw size={20} color="#ffffff" style={styles.spinner} />
            ) : (
              'Confirm Payment'
            )}
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 60,
  },
  container: {
    flex: 1,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  closeIcon: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
  },
  content: {
    flex: 1,
  },
  merchantInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  merchantLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  merchantName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  merchantText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  amountContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  currencySymbol: {
    position: 'absolute',
    left: 24,
    top: 18,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#94a3b8',
    zIndex: 1,
  },
  amountInput: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderRadius: 24,
    paddingVertical: 20,
    paddingLeft: 48,
    paddingRight: 24,
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    color: '#0f172a',
  },
  couponCard: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#d1fae5',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  couponIcon: {
    padding: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
  },
  couponType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
    textTransform: 'uppercase',
  },
  couponName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  couponDiscount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },
  pointsCard: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pointsCardActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsIcon: {
    padding: 8,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#cbd5e1',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#4f46e5',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  pointsDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e7ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsCoverage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4f46e5',
  },
  pointsDeduction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e11d48',
  },
  footer: {
    marginTop: 'auto',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  totalAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0f172a',
  },
  payButton: {
    width: '100%',
    paddingVertical: 20,
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 60,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#ecfdf5',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  successId: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 32,
  },
  summaryCard: {
    width: '100%',
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  borderBottom: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  couponLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  couponValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e11d48',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4f46e5',
  },
  remainingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  remainingValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#f59e0b',
  },
  doneButton: {
    width: '100%',
  },
});

export default PaymentModal;