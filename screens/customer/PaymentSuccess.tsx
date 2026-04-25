import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { CheckCircle, Share2, Download, Home } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const { width } = Dimensions.get('window');

interface PaymentSuccessProps {
  amount: number;
  pointsUsed: number;
  merchantName: string;
  transactionRef: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  amount,
  pointsUsed,
  merchantName,
  transactionRef,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 800 });
  }, []);

  const checkCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <ScreenWrapper
      backgroundColor="#ffffff"
      paddingHorizontal={24}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.successIcon, checkCircleStyle]}>
          <View style={styles.iconBackground}>
            <CheckCircle size={80} color="#10b981" strokeWidth={2.5} />
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(300).duration(600)} style={styles.successTitle}>
          Payment Successful!
        </Animated.Text>
        
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.amountContainer}>
          <Text style={styles.amountLabel}>You paid</Text>
          <Text style={styles.amountValue}>${(amount || 0).toFixed(2)}</Text>
          {pointsUsed > 0 && (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{pointsUsed.toLocaleString()} dandan used</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Merchant</Text>
            <Text style={styles.detailValue}>{merchantName}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{transactionRef}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{new Date().toLocaleDateString('en-SG', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</Text>
          </View>
        </Animated.View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.outlineButton}>
            <Download size={20} color="#64748b" />
            <Text style={styles.outlineButtonText}>Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton}>
            <Share2 size={20} color="#64748b" />
            <Text style={styles.outlineButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Done — go back to home */}
      <TouchableOpacity
        style={[styles.doneButton, { marginBottom: insets.bottom + 16 }]}
        onPress={() => router.navigate('/(customer)/home' as any)}
      >
        <Home size={20} color="#ffffff" />
        <Text style={styles.doneButtonText}>Back to Home</Text>
      </TouchableOpacity>

    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  successIcon: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 40,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -2,
  },
  pointsBadge: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b45309',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
    opacity: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: '#0f172a',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
});

export default PaymentSuccess;
