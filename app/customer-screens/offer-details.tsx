import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import OfferDetails from '../../screens/customer/OfferDetails';

export default function OfferDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const offer = useMemo(() => {
        if (params.offer) {
            try {
                return JSON.parse(params.offer as string);
            } catch (e) {
                console.error('Failed to parse offer params:', e);
                return null;
            }
        }
        return null;
    }, [params.offer]);

    const handleCheckout = (amount: any) => {
        router.push({
            pathname: '/(customer)/scan',
            params: { amount },
        });
    };

    if (!offer) {
        return null;
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <OfferDetails
                offer={offer}
                onBack={() => router.back()}
                onCheckout={handleCheckout}
            />
        </>
    );
}
