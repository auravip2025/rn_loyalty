import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import CustomerHome from '../../screens/customer/CustomerHome';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export default function CustomerHomePage() {
    const { balance } = useWallet() as any;
    const [offers, setOffers] = useState<any[]>([]);
    const router = useRouter();

    useFocusEffect(useCallback(() => {
        let cancelled = false;
        const load = async () => {
            // Clear stale state immediately so Fast Refresh / re-mounts never
            // show data from a previous session.
            if (!cancelled) setOffers([]);
            try {
                const token = await AsyncStorage.getItem('@dandan_auth_token');
                const res = await fetch(`${API_URL}/catalog/rewards`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
                const items = await res.json();
                if (!cancelled && Array.isArray(items)) {
                    setOffers(items
                        .filter((r: any) => r.isEnabled)
                        .map((r: any) => ({
                            id: r.id,
                            title: r.name,
                            desc: r.description || r.name,
                            image: r.imageUrl || null,
                            price: parseFloat(r.price) || 0,
                            discount: r.pointsPrice ? `${r.pointsPrice} pts` : null,
                        }))
                    );
                }
            } catch (err) {
                console.warn('[Home] offers fetch failed:', err);
                if (!cancelled) setOffers([]);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []));

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
