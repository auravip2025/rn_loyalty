import { useRouter } from 'expo-router';
import React from 'react';
import MerchantOnboarding from '../../screens/merchant/MerchantOnboarding';

export default function MerchantOnboardingPage() {
    const router = useRouter();
    return (
        <MerchantOnboarding
            onComplete={() => router.replace('/(merchant)/dashboard')}
        />
    );
}
