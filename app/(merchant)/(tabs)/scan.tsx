import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import ScanView from '../../../components/old_app/payment/ScanView';
import MerchantScanPayment from '../../../screens/merchant/MerchantScanPayment';
import { useAuth } from '../../../contexts/AuthContext';

export default function MerchantScanPage() {
    const router = useRouter();
    const { merchantProfile } = useAuth() as any;
    const [paymentData, setPaymentData] = useState<any>(null);

    const handleScanComplete = (data: string) => {
        try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.type === 'dandan_payment') {
                setPaymentData(parsed);
                return;
            }
        } catch {
            // Not JSON — fall through to default behavior
        }
        // Non-payment QR: just go back
        router.back();
    };

    if (paymentData) {
        return (
            <MerchantScanPayment
                transactionData={paymentData}
                storeId={merchantProfile?.storeId || merchantProfile?.id}
                onDone={() => {
                    setPaymentData(null);
                    router.back();
                }}
            />
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScanView onScanComplete={handleScanComplete} />
        </View>
    );
}
