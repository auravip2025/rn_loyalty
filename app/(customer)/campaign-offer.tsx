import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import CampaignOffer from '../../screens/customer/CampaignOffer';

/**
 * Deep-link target for campaign push notifications.
 *
 * Expected URL params:
 *   merchantId  (required) — merchant whose catalog rewards to show
 *   title       (optional) — campaign title from the notification
 *   message     (optional) — campaign body text from the notification
 *
 * Example link stored in notifications table:
 *   /(customer)/campaign-offer?merchantId=abc&title=Summer%20Sale&message=Get%2020%25%20off%20everything
 */
export default function CampaignOfferPage() {
    const router = useRouter();
    const { balance } = useWallet() as any;
    const {
        merchantId,
        title: campaignTitle,
        message: campaignMessage,
    } = useLocalSearchParams<{
        merchantId?: string;
        title?: string;
        message?: string;
    }>();

    if (!merchantId) {
        // Shouldn't happen — fall back to the general rewards screen
        router.replace('/(customer)/rewards');
        return null;
    }

    return (
        <CampaignOffer
            balance={balance}
            merchantId={merchantId}
            campaignTitle={campaignTitle ? decodeURIComponent(campaignTitle) : undefined}
            campaignMessage={campaignMessage ? decodeURIComponent(campaignMessage) : undefined}
            onBack={() => router.back()}
            onRedeemReward={(offer: any) => {
                // Navigate to offer-details hero view → then checkout from there
                router.push({
                    pathname: '/(customer)/offer-details' as any,
                    params: {
                        offer: JSON.stringify(offer),
                    },
                });
            }}
        />
    );
}
