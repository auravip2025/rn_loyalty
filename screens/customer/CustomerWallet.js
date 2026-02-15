import {
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  Settings,
  Wallet,
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/old_app/common/Button';
import Card from '../../components/old_app/common/Card';

const CustomerWallet = ({ balance, transactions, onOpenPayment }) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        {/* Background Effects */}
        <View style={[styles.bgEffect, styles.bgEffect1]} />
        <View style={[styles.bgEffect, styles.bgEffect2]} />

        <View style={styles.balanceHeader}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {balance.toLocaleString()}{' '}
              <Text style={styles.balanceUnit}>dandan</Text>
            </Text>
          </View>
          <View style={styles.walletIcon}>
            <Wallet size={24} color="#ffffff" />
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

      {/* Recent Transactions */}
      <View style={styles.transactionsHeader}>
        <Text style={styles.transactionsTitle}>Activity</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllButton}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsList}>
        {transactions.map((tx) => (
          <Card key={tx.id} style={styles.transactionCard}>
            <View
              style={[
                styles.transactionIcon,
                tx.type === 'earn'
                  ? styles.transactionIconEarn
                  : styles.transactionIconSpend,
              ]}>
              {tx.type === 'earn' ? (
                <ArrowDownLeft size={20} color="#059669" />
              ) : (
                <ArrowUpRight size={20} color="#e11d48" />
              )}
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionMerchant}>{tx.merchant}</Text>
              <Text style={styles.transactionDate}>{tx.date}</Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                tx.type === 'earn'
                  ? styles.transactionAmountEarn
                  : styles.transactionAmountSpend,
              ]}>
              {tx.type === 'earn' ? '+' : '-'}{tx.amount}
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
    paddingHorizontal: 24,
  },
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
  balanceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
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
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
  },
  balanceUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
  },
  walletIcon: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
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
    fontWeight: 'bold',
  },
  bgEffect: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    opacity: 0.3,
  },
  bgEffect1: {
    top: -64,
    right: -64,
    backgroundColor: '#4f46e5',
  },
  bgEffect2: {
    bottom: -64,
    left: -64,
    backgroundColor: '#059669',
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  viewAllButton: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconEarn: {
    backgroundColor: '#ecfdf5',
  },
  transactionIconSpend: {
    backgroundColor: '#fff1f2',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '900',
  },
  transactionAmountEarn: {
    color: '#059669',
  },
  transactionAmountSpend: {
    color: '#0f172a',
  },
});

export default CustomerWallet;
