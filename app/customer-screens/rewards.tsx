import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import Rewards from '../../screens/customer/Rewards';

export default function RewardsScreen() {
    const router = useRouter();
    const { balance } = useWallet() as any;

    const handleRedeem = (reward: any) => {
        router.push({
            pathname: '/customer-screens/offer-details',
            params: { offer: JSON.stringify(reward) }
        });
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <Rewards
                balance={balance}
                onBack={() => router.back()}
                onRedeem={handleRedeem}
            />
        </>
    );
}
