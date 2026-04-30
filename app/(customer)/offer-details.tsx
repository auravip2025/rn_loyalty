import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import OfferDetails from '../../screens/customer/OfferDetails';

export default function OfferDetailsPage() {
    const router = useRouter();
    const { offer: offerStr } = useLocalSearchParams();
    const [redeemed, setRedeemed] = useState(false);

    // offer-details is a Tab screen (href: null) — Tab screens are singletons,
    // so router.push with new params reuses this component instance rather than
    // mounting a fresh one. Reset the redeemed flag whenever a different offer
    // navigates here so Offer A's redemption state doesn't bleed into Offer B.
    useEffect(() => {
        setRedeemed(false);
    }, [offerStr]);

    if (!offerStr) return null;

    let offer: any = null;
    try {
        offer = JSON.parse(offerStr as string);
    } catch {
        return null;
    }

    // ── Redeem → forward to the unified checkout flow ──────────────────────────
    // The "For You" offer object has these fields (see graphql-gateway rewardToOffer):
    //   id        → rewardId (catalog reward id)
    //   title     → reward name
    //   discount  → string like "200 pts" — extract the integer for pointsCost
    //   price     → SGD price; may be 0 for pure-points rewards
    //   storeName → merchant display name (or null)
    //
    // We hand off to /(customer)/checkout, which already wires the full
    // initiate → reserve → (simulated pay) → confirm → success flow against
    // the rewards-service backend. That's the same flow the Rewards tab uses.
    const handleRedeem = () => {
        if (!offer?.id) {
            router.back();
            return;
        }

        // Parse "200 pts" → 200; missing or non-numeric falls back to 0
        const pointsCost = (() => {
            if (typeof offer.discount !== 'string') return 0;
            const m = offer.discount.match(/(\d+)/);
            return m ? parseInt(m[1], 10) : 0;
        })();

        const total = Number(offer.price) || 0;
        const merchantName = offer.storeName || offer.title || 'Reward';

        // Minimal cart so the checkout page's render guard passes. The
        // checkout treats this as a reward redemption because rewardId is set.
        const cartItems = [{
            id:       offer.id,
            name:     offer.title,
            price:    total,
            quantity: 1,
        }];

        setRedeemed(true);

        router.push({
            pathname: '/(customer)/checkout' as any,
            params: {
                cartStr:      JSON.stringify(cartItems),
                totalAmount:  String(total),
                merchantName,
                pointsCost:   String(pointsCost),
                rewardId:     String(offer.id),
                rewardName:   offer.title || 'Reward',
            },
        });
    };

    return (
        <OfferDetails
            offer={offer}
            redeemed={redeemed}
            onBack={() => router.back()}
            onCheckout={handleRedeem}
        />
    );
}
