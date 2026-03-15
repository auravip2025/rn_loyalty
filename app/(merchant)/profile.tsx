import { useRouter } from 'expo-router';
import React from 'react';
import MerchantProfile from '../../screens/merchant/MerchantProfile';

export default function MerchantProfilePage() {
    const router = useRouter();
    return (
        <MerchantProfile />
    );
}
