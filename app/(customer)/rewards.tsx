import { useRouter } from 'expo-router';
import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import Rewards from '../../screens/customer/Rewards';

export default function RewardsPage() {
    const router = useRouter();
    const { balance } = useWallet() as any;

    return (
        <Rewards
            balance={balance}
            onBack={() => router.back()}
            onRedeem={(reward: any) => {
                // Always pass the real dollar price so the order summary shows it.
                // Pass pointsCost separately so checkout can use it directly instead
                // of deriving it from dollars (rewards have an explicit points price).
                const dollarPrice = Number(reward.price) || 0;
                const pointsCost  = Number(reward.cost ?? reward.pointsPrice) || 0;
                router.push({
                    pathname: '/(customer)/checkout',
                    params: {
                        cartStr:      JSON.stringify([{ title: reward.title, quantity: reward.bundleCount || 1, price: dollarPrice }]),
                        totalAmount:  String(dollarPrice),
                        pointsCost:   String(pointsCost),
                        rewardId:     String(reward.id),
                        rewardName:   reward.title || reward.name || '',
                        merchantName: reward.storeName || 'DanDan Rewards',
                    },
                });
            }}
        />
    );
}
