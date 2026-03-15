import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { useWallet } from '../../contexts/WalletContext';
import CustomerCheckout from '../../screens/customer/CustomerCheckout';

export default function CheckoutPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { balance, deductPoints } = useWallet() as any;

    const cartStr = Array.isArray(params.cartStr) ? params.cartStr[0] : params.cartStr;
    const totalAmount = Array.isArray(params.totalAmount) ? params.totalAmount[0] : params.totalAmount;
    const merchantName = Array.isArray(params.merchantName) ? params.merchantName[0] : params.merchantName;

    console.log('🛒 Checkout params:', { cartStr, totalAmount, merchantName });

    if (!cartStr || !merchantName) {
        console.warn('🛒 Checkout: missing params', { cartStr, merchantName });
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <Text style={{ fontSize: 16, color: '#64748b' }}>No items to checkout</Text>
            </View>
        );
    }

    let cartItems: any[] = [];
    try {
        cartItems = JSON.parse(cartStr as string);
    } catch (e) {
        console.warn('🛒 Checkout: failed to parse cartStr', cartStr, e);
    }
    const total = parseFloat(totalAmount as string) || 0;

    return (
        <CustomerCheckout
            merchantName={merchantName as string}
            cartItems={cartItems}
            totalAmount={total}
            balance={balance ?? 0}
            onConfirm={async (pointsUsed: number, merchant: string) => {
                await deductPoints(pointsUsed, merchant);
            }}
            onDone={() => router.back()}
            onCancel={() => router.back()}
        />
    );
}
