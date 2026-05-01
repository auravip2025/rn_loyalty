import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import Rewards from '../../screens/customer/Rewards';

export default function RewardsPage() {
    const router = useRouter();
    const { balance } = useWallet() as any;
    // Optional: campaign notifications deep-link here with ?merchantId=xxx
    const {
        merchantId,
        title: campaignTitle,
        message: campaignMessage,
    } = useLocalSearchParams<{ merchantId?: string; title?: string; message?: string }>();

    // If a merchantId is present this is a campaign deep-link.
    // Redirect to the dedicated campaign-offer screen so the customer sees
    // only that merchant's rewards with the campaign promo banner.
    // This catches cases where Expo Router's tab navigator delivers the link
    // to this screen instead of campaign-offer directly.
    useEffect(() => {
        if (merchantId) {
            router.replace({
                pathname: '/(customer)/campaign-offer' as any,
                params: {
                    merchantId,
                    title:   campaignTitle   || 'Campaign Offer',
                    message: campaignMessage || '',
                },
            });
        }
    }, [merchantId]);

    // While redirecting, render nothing
    if (merchantId) return null;

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
