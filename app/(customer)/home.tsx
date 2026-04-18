import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import CustomerHome from '../../screens/customer/CustomerHome';
import { GET_FOR_YOU_OFFERS, useLazyQuery } from '../../api/client';

export default function CustomerHomePage() {
    const { balance } = useWallet() as any;
    const { isAuthenticated, user } = useAuth() as any;
    const router = useRouter();

    const [fetchOffers, { data: offersData }] = useLazyQuery(GET_FOR_YOU_OFFERS, {
        fetchPolicy: 'network-only',
    });

    // Fires on mount + whenever auth state changes.
    // Catches the initial-login case: the (customer) stack mounts fresh after
    // login, so isAuthenticated is already true on first render and this runs
    // immediately — no focus-change event is needed.
    useEffect(() => {
        if (isAuthenticated) {
            fetchOffers();
        }
    }, [isAuthenticated, user?.id]);

    // Fires every time this screen gains focus (tab switches, back navigation).
    // This is the reliable path for all subsequent visits.
    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) {
                fetchOffers();
            }
        }, [isAuthenticated])
    );

    const offers = offersData?.forYouOffers ?? [];

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
