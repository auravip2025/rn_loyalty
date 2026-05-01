import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// expo-location requires a native build — safe-require so Expo Go doesn't crash
let Location: any = null;
try { Location = require('expo-location'); } catch (_) {}
import { useWallet } from '../../contexts/WalletContext';
import CustomerHome from '../../screens/customer/CustomerHome';
import { GET_FOR_YOU_OFFERS, GET_NEARBY_MERCHANTS, useQuery } from '../../api/client';

export default function CustomerHomePage() {
    const { balance } = useWallet() as any;
    const { isAuthenticated, user } = useAuth() as any;
    const router = useRouter();

    // ── User location (best-effort; carousel renders regardless of permission) ──
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const locationFetched = useRef(false);

    useEffect(() => {
        if (locationFetched.current) return;
        locationFetched.current = true;

        (async () => {
            try {
                if (!Location) return; // native module not available (Expo Go / web)
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy?.Balanced,
                });
                setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            } catch {
                // Location unavailable — carousel still shows all merchants
            }
        })();
    }, []);

    // ── For You offers ──────────────────────────────────────────────────────────
    const { data: offersData, refetch: refetchOffers } = useQuery(GET_FOR_YOU_OFFERS, {
        variables: { userId: user?.id },
        skip: !isAuthenticated || !user?.id,
        fetchPolicy: 'network-only',
    });

    // ── Nearby merchants ────────────────────────────────────────────────────────
    const { data: merchantsData, refetch: refetchMerchants } = useQuery(GET_NEARBY_MERCHANTS, {
        variables: { lat: coords?.lat ?? null, lng: coords?.lng ?? null },
        skip: !isAuthenticated,
        fetchPolicy: 'network-only',
    });

    const offers: any[]    = offersData?.forYouOffers    ?? [];
    const merchants: any[] = merchantsData?.nearbyMerchants ?? [];

    // Re-fetch on tab focus so navigating back always shows fresh results
    useFocusEffect(
        useCallback(() => {
            if (!isAuthenticated || !user?.id) return;
            refetchOffers();
            refetchMerchants();
        }, [isAuthenticated, user?.id])
    );

    // Derive display name: prefer full name stored after onboarding,
    // fall back to firstName+lastName or email prefix
    const displayName: string = (() => {
        if (user?.name) return user.name;
        if (user?.firstName) return [user.firstName, user.lastName].filter(Boolean).join(' ');
        return '';
    })();

    return (
        <CustomerHome
            offers={offers}
            merchants={merchants}
            recentStores={[]}
            balance={balance}
            userName={displayName}
            onOpenWallet={() => router.push('/(customer)/wallet')}
            onScan={() => router.push('/(customer)/scan')}
        />
    );
}
