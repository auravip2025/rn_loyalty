import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import PaymentSuccess from '../../screens/customer/PaymentSuccess';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const amount = parseFloat(params.amount as string) || 0;
    const pointsUsed = parseInt(params.pointsUsed as string) || 0;
    const merchantName = (params.merchantName as string) || 'Merchant';
    const transactionRef = (params.transactionRef as string) || 'N/A';

    const handleDone = () => {
        router.replace('/(customer)/home');
    };

    return (
        <PaymentSuccess
            amount={amount}
            pointsUsed={pointsUsed}
            merchantName={merchantName}
            transactionRef={transactionRef}
            onDone={handleDone}
        />
    );
}
