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
                router.push({
                    pathname: '/(customer)/checkout',
                    params: {
                        cartStr: JSON.stringify([{ title: reward.title, quantity: reward.bundleCount || 1, price: reward.isCash ? reward.price : 0 }]),
                        totalAmount: reward.isCash ? String(reward.price) : '0',
                        merchantName: 'DanDan Rewards',
                    },
                });
            }}
        />
    );
}
