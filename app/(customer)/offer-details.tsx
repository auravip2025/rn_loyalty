import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import OfferDetails from '../../screens/customer/OfferDetails';

export default function OfferDetailsPage() {
    const router = useRouter();
    const { offer: offerStr } = useLocalSearchParams();

    if (!offerStr) return null;

    let offer: any = null;
    try {
        offer = JSON.parse(offerStr as string);
    } catch {
        return null;
    }

    return (
        <OfferDetails
            offer={offer}
            onBack={() => router.back()}
            onCheckout={() => router.back()}
        />
    );
}
