import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, CreditCard, Smartphone, X } from 'lucide-react-native';

interface SimulatedPaymentModalProps {
  visible: boolean;
  cashRequired: number;
  redemptionId: string;
  onSuccess: () => void;
  onCancel: () => void;
  confirmUrl: string;  // POST URL to call on success
}

type Step = 'select' | 'processing' | 'success';

const METHODS = [
  { key: 'paynow',  label: 'PayNow',      sub: 'Scan QR with banking app',   icon: Smartphone, color: '#8b5cf6' },
  { key: 'paylah',  label: 'PayLah!',     sub: 'DBS PayLah wallet',          icon: Smartphone, color: '#ef4444' },
  { key: 'card',    label: 'Credit Card', sub: 'Visa / Mastercard',          icon: CreditCard, color: '#0ea5e9' },
];

const SimulatedPaymentModal: React.FC<SimulatedPaymentModalProps> = ({
  visible,
  cashRequired,
  redemptionId,
  onSuccess,
  onCancel,
  confirmUrl,
}) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('select');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (methodKey: string) => {
    setSelectedMethod(methodKey);
    setStep('processing');
    setError(null);

    // Simulate 2s payment processing
    await new Promise(r => setTimeout(r, 2000));

    try {
      const res = await fetch(confirmUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: `SIM_${methodKey.toUpperCase()}_${Date.now()}` }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Confirmation failed');
      }
      setStep('success');
      setTimeout(onSuccess, 1000);
    } catch (err: any) {
      setError(err.message);
      setStep('select');
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedMethod(null);
    setError(null);
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} disabled={step === 'processing'}>
            <X size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Payment</Text>
          <View style={{ width: 36 }} />
        </View>

        {step === 'select' && (
          <>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>AMOUNT DUE</Text>
              <Text style={styles.amountValue}>SGD {cashRequired.toFixed(2)}</Text>
              <Text style={styles.amountSub}>Select a payment method below</Text>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.methods}>
              {METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={styles.methodCard}
                    onPress={() => handlePay(m.key)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.methodIcon, { backgroundColor: m.color + '18' }]}>
                      <Icon size={22} color={m.color} />
                    </View>
                    <View style={styles.methodText}>
                      <Text style={styles.methodLabel}>{m.label}</Text>
                      <Text style={styles.methodSub}>{m.sub}</Text>
                    </View>
                    <View style={[styles.methodArrow, { backgroundColor: m.color }]}>
                      <Text style={styles.methodArrowText}>›</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.simNote}>
              ⚡ Simulated environment — no real payment is processed
            </Text>
          </>
        )}

        {step === 'processing' && (
          <View style={styles.statusScreen}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.statusTitle}>Processing payment…</Text>
            <Text style={styles.statusSub}>Please wait a moment</Text>
          </View>
        )}

        {step === 'success' && (
          <View style={styles.statusScreen}>
            <CheckCircle2 size={64} color="#10b981" />
            <Text style={[styles.statusTitle, { color: '#10b981' }]}>Payment successful!</Text>
            <Text style={styles.statusSub}>Preparing your QR code…</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  amountBox: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  amountSub: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 6,
  },
  errorBox: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  methods: {
    padding: 20,
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodText: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  methodSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
  },
  methodArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodArrowText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: -2,
  },
  simNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    paddingHorizontal: 24,
  },
  statusScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  statusSub: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SimulatedPaymentModal;
