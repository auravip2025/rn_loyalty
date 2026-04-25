import { useRouter } from 'expo-router';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MerchantSettlement from '../../screens/merchant/MerchantSettlement';

export default function SettlementPage() {
    const router = useRouter();
    const { merchantProfile } = useAuth() as any;

    return (
        <MerchantSettlement
            merchantId={merchantProfile?.id}
            onBack={() => router.back()}
        />
    );
}
