import { useRouter } from 'expo-router';
import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import CustomerWallet from '../../screens/customer/CustomerWallet';

export default function WalletPage() {
    const { balance, transactions } = useWallet();
    const router = useRouter();

    const handleOpenPayment = () => {
        router.push('/(customer)/scan');
    };

    return (
        <CustomerWallet
            balance={balance}
            transactions={transactions}
            onOpenPayment={handleOpenPayment}
        />
    );
}
