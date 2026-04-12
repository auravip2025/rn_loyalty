import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import ScanView from '../../components/old_app/payment/ScanView';

export default function ScanPage() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const parseEMVCo = (data: string) => {
        let merchantName = "Merchant";
        let amount = "0.00";
        
        let i = 0;
        while (i < data.length) {
            const tag = data.substring(i, i + 2);
            const length = parseInt(data.substring(i + 2, i + 4));
            const value = data.substring(i + 4, i + 4 + length);
            
            if (tag === '54') { // Amount
                amount = value;
            } else if (tag === '59') { // Merchant Name
                merchantName = value;
            }
            
            i += 4 + length;
        }
        return { merchantName, amount };
    };

    const handleScanComplete = (data: string) => {
        let merchant = "Generic Merchant";
        let amount = "10.00";

        // Check if it's an EMVCo / PayNow QR (starts with 000201)
        if (data.startsWith('000201')) {
            const parsed = parseEMVCo(data);
            merchant = parsed.merchantName;
            amount = parsed.amount;
        } else if (data.includes('|')) {
            const parts = data.split('|');
            merchant = parts[0];
            amount = parts[1];
        } else if (!isNaN(parseFloat(data))) {
            merchant = "Direct Payment";
            amount = data;
        }

        router.push({
            pathname: '/(customer)/checkout',
            params: {
                merchantName: merchant,
                totalAmount: amount,
                cartStr: JSON.stringify([{ id: 'scan-1', title: 'Payment via QR', price: parseFloat(amount), quantity: 1 }])
            }
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <ScanView onScanComplete={handleScanComplete} />
        </View>
    );
}
