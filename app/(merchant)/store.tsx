import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MerchantStore from '../../screens/merchant/MerchantStore';

export default function StorePage() {
    const { merchantProfile } = useAuth();
    const merchantId = merchantProfile?.id ?? null;

    return (
        <MerchantStore merchantId={merchantId} />
    );
}
