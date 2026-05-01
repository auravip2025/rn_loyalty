import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

/**
 * Transparent loader for campaign push notifications.
 *
 * Fetches the merchant's first enabled reward, then immediately replaces
 * this screen with offer-details so the user lands directly on the reward
 * detail page — no intermediate list or banner step.
 *
 * Expected URL params:
 *   merchantId  (required) — merchant whose catalog to fetch
 *   title       (optional) — campaign title (unused after redesign)
 *   message     (optional) — campaign body  (unused after redesign)
 */
export default function CampaignOfferPage() {
    const router = useRouter();
    const { merchantId } = useLocalSearchParams<{ merchantId?: string }>();

    useEffect(() => {
        if (!merchantId) {
            router.replace('/(customer)/rewards' as any);
            return;
        }

        let cancelled = false;

        const load = async () => {
            try {
                const token = await AsyncStorage.getItem('@dandan_auth_token');
                const res = await fetch(
                    `${API_URL}/catalog/rewards/merchant/${merchantId}`,
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                if (!res.ok) throw new Error(`${res.status}`);
                const json = await res.json();
                const items: any[] = Array.isArray(json) ? json : (json.rewards || []);
                const first = items.find(r => r.isEnabled && r.stock !== 0);

                if (cancelled) return;

                if (first) {
                    const offer = {
                        id:             first.id,
                        title:          first.name,
                        desc:           first.description || '',
                        image:          first.imageUrl || null,
                        price:          Number(first.price) || 0,
                        discount:       first.pointsPrice != null
                                          ? `${first.pointsPrice} pts`
                                          : null,
                        expires:        null,
                        storeName:      'Campaign Reward',
                        productDetails: first.productDetails || null,
                    };
                    // Replace so "back" returns to notifications, not this loader
                    router.replace({
                        pathname: '/(customer)/offer-details' as any,
                        params: { offer: JSON.stringify(offer) },
                    });
                } else {
                    router.replace('/(customer)/rewards' as any);
                }
            } catch {
                if (!cancelled) router.replace('/(customer)/rewards' as any);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [merchantId]);

    // Brief loading state while the fetch completes
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4f46e5" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
});
