import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { GET_OFFERS, useQuery } from '../../api/client';
import { useWallet } from '../../contexts/WalletContext';
import OfferDetails from '../../screens/customer/OfferDetails';

export default function OfferDetailsPage() {
    const router = useRouter();
    const { offer: offerStr } = useLocalSearchParams();
    const { deductPoints } = useWallet() as any;

    if (!offerStr) return null;

    const offer = JSON.parse(offerStr as string);

    const { data: offersData } = useQuery(GET_OFFERS);
    const storeMenus = (offersData as any)?.storeMenus || {};

    return (
        <OfferDetails
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
