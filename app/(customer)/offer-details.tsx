import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { GET_OFFERS, useQuery } from '../../api/client';
import { useWallet } from '../../contexts/WalletContext';
import OfferDetails from '../../screens/customer/OfferDetails';

export default function OfferDetailsPage() {
    const router = useRouter();
    const { offer: offerStr } = useLocalSearchParams();
    const { deductPoints } = useWallet() as any;
    const [mountKey, setMountKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setMountKey(prev => prev + 1);
        }, [])
    );

    if (!offerStr) return null;

    const offer = JSON.parse(offerStr as string);

    const { data: offersData } = useQuery(GET_OFFERS);
    const storeMenus = (offersData as any)?.storeMenus || {};

    return (
        <OfferDetails
            key={`offer-${mountKey}`}
            offer={offer}
            storeMenus={storeMenus}
            onBack={() => router.back()}
            onCheckout={(total: any) => {
                console.log("Mock Checkout", total);
                router.back();
            }}
        />
    );
}
