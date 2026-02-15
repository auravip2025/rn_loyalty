import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ScanView from '../../components/old_app/payment/ScanView';

export default function ScanPage() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const handleScanComplete = () => {
        // Navigate to payment or show modal
        router.back();
    };

    return (
        <View style={{ flex: 1 }}>
            <ScanView onScanComplete={handleScanComplete} />
        </View>
    );
}
