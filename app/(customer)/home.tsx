import { useRouter } from 'expo-router';
import React from 'react';
import { GET_OFFERS, GET_RECENT_STORES, useQuery } from '../../api/client';
import { useWallet } from '../../contexts/WalletContext';
import CustomerHome from '../../screens/customer/CustomerHome';

export default function CustomerHomePage() {
    const { balance } = useWallet() as any;
    const { data: offersData } = useQuery(GET_OFFERS);
    const { data: recentStoresData } = useQuery(GET_RECENT_STORES);
    const router = useRouter();

    const handleOpenWallet = () => {
        router.push('/(customer)/wallet');
    };

    const handleScan = () => {
        router.push('/(customer)/scan');
    };

    return (
        <CustomerHome
            offers={(offersData as any)?.offers || []}
            recentStores={(recentStoresData as any)?.recentStores || []}
            balance={balance}
            onOpenWallet={handleOpenWallet}
            onScan={handleScan}
        />
    );
}
