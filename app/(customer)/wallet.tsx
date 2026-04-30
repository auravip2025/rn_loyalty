import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import CustomerWallet from '../../screens/customer/CustomerWallet';

export default function WalletPage() {
    const { balance, transactions, loading, refetch } = useWallet() as any;
    const router = useRouter();

    // Refresh every time the tab gains focus so balances and transactions stay fresh
    useFocusEffect(
        useCallback(() => {
            refetch?.();
        }, [])
    );

    return (
        <CustomerWallet
            balance={balance}
            transactions={transactions}
            loading={loading}
            onOpenPayment={() => router.push('/(customer)/scan')}
        />
    );
}
