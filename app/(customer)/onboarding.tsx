import { useRouter } from 'expo-router';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CustomerOnboarding from '../../screens/customer/CustomerOnboarding';

export default function OnboardingPage() {
    const router = useRouter();
    const { completeCustomerOnboarding } = useAuth() as any;

    const handleComplete = async (fullName: string, phone: string) => {
        await completeCustomerOnboarding(fullName, phone);
        // Replace so the user can't back-navigate to onboarding
        router.replace('/(customer)/home');
    };

    return <CustomerOnboarding onComplete={handleComplete} />;
}
