import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ScanView from '../../components/old_app/payment/ScanView';

export default function MerchantScanPage() {
    const router = useRouter();

    const handleScanComplete = () => {
        // Handle redemption logic
        router.back();
    };

    return (
        <View style={{ flex: 1 }}>
            <ScanView onScanComplete={handleScanComplete} />
        </View>
    );
}
