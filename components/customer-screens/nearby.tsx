import { Stack, useRouter } from 'expo-router';
import React from 'react';
import NearbyStores from '../../screens/customer/NearbyStores';

export default function NearbyScreen() {
    const router = useRouter();

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <NearbyStores
                onBack={() => router.back()}
            />
        </>
    );
}
