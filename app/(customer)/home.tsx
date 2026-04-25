import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import CustomerHome from '../../screens/customer/CustomerHome';
import { GET_FOR_YOU_OFFERS, useQuery } from '../../api/client';

export default function CustomerHomePage() {
    const { balance } = useWallet() as any;
    const { isAuthenticated, user } = useAuth() as any;
    const router = useRouter();

    const { data: offersData, refetch: refetchOffers } = useQuery(GET_FOR_YOU_OFFERS, {
        variables: { userId: user?.id },
        skip: !isAuthenticated || !user?.id,
        fetchPolicy: 'network-only',
    });

    const offers: any[] = offersData?.forYouOffers ?? [];

    // Refetch on tab focus so navigating back always shows fresh results.
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated && user?.id) {
                refetchOffers();
            }
        }, [isAuthenticated, user?.id])
    );

    return (
        <CustomerHome
            offers={offers}
            recentStores={[]}
            balance={balance}
            onOpenWallet={() => router.push('/(customer)/wallet')}
            onScan={() => router.push('/(customer)/scan')}
        />
    );
}
