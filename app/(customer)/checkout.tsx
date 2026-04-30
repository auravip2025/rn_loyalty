import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import CustomerCheckout from '../../screens/customer/CustomerCheckout';
import SimulatedPaymentModal from '../../components/payment/SimulatedPaymentModal';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

interface InitiateResult {
    redemptionId: string;
    type: 'pure_points' | 'hybrid' | 'cash_only';
    pointsReserved: number;
    cashRequired: number;
    reservationId: string | null;
    reward: { id: string; name: string };
}

export default function CheckoutPage() {
    const router   = useRouter();
    const params   = useLocalSearchParams();
    const { balance, deductPoints, refetch: refreshBalance } = useWallet() as any;
    const { user } = useAuth() as any;

    // ── Parse route params ──────────────────────────────────────────────────
    const cartStr         = Array.isArray(params.cartStr)      ? params.cartStr[0]      : params.cartStr;
    const totalAmount     = Array.isArray(params.totalAmount)  ? params.totalAmount[0]  : params.totalAmount;
    const merchantName    = Array.isArray(params.merchantName) ? params.merchantName[0] : params.merchantName;
    const pointsCostParam = Array.isArray(params.pointsCost)   ? params.pointsCost[0]   : params.pointsCost;
    const rewardIdParam   = Array.isArray(params.rewardId)     ? params.rewardId[0]     : params.rewardId;
    const rewardNameParam = Array.isArray(params.rewardName)   ? params.rewardName[0]   : params.rewardName;

    const rewardId   = rewardIdParam as string | undefined;
    const total      = parseFloat(totalAmount as string) || 0;
    const pointsCost = parseInt(pointsCostParam as string) || 0;

    // ── Flow state ──────────────────────────────────────────────────────────
    // NOTE: do NOT use this to replace the view — that would unmount CustomerCheckout
    // and kill the in-flight await. Use it only to disable the Pay button.
    const [confirming, setConfirming] = useState(false);
    // True while a cancelled reservation is being released — blocks re-tap until done
    const [releasing, setReleasing] = useState(false);

    // Simulated payment
    const [simPayment, setSimPayment] = useState<{ cashRequired: number; redemptionId: string } | null>(null);
    const [showSimPay,  setShowSimPay]  = useState(false);

    // Promise resolvers — held open during simulated payment so CustomerCheckout
    // doesn't navigate away before the payment modal finishes.
    const resolveRef = useRef<((id: string) => void) | null>(null);
    const rejectRef  = useRef<((e: Error)   => void) | null>(null);

    // ── Backend: initiate redemption ────────────────────────────────────────
    const runInitiate = async (pointsToUse: number): Promise<InitiateResult> => {
        const token = await AsyncStorage.getItem('@dandan_auth_token');
        const res = await fetch(`${API_URL}/rewards/${rewardId}/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ userId: String(user?.id), pointsToUse }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to initiate redemption');
        return data as InitiateResult;
    };

    // ── Reward confirm: called by CustomerCheckout when user taps Pay ───────
    // Returns a Promise that NEVER resolves from CustomerCheckout's perspective —
    // the resolve is called only after feedback is done, at which point we
    // navigate away ourselves. CustomerCheckout's onConfirmSuccess is a no-op.
    const handleRewardConfirm = async (pointsUsed: number): Promise<string> => {
        setConfirming(true);
        let result: InitiateResult;
        try {
            result = await runInitiate(pointsUsed);
        } finally {
            setConfirming(false);
        }

        if (result.type === 'pure_points') {
            refreshBalance?.();
            // Navigate to success immediately — feedback is shown there after animations
            router.push({
                pathname: '/(customer)/payment-success',
                params: {
                    amount:         '0',
                    pointsUsed:     String(pointsUsed),
                    merchantName:   merchantName as string,
                    transactionRef: result.redemptionId,
                    redemptionId:   result.redemptionId,
                    rewardName:     result.reward?.name || (rewardNameParam as string) || 'Reward',
                    feedbackUrl:    `${API_URL}/rewards/redemptions/${result.redemptionId}/feedback`,
                },
            });
            return result.redemptionId;
        }

        // hybrid or cash_only — show simulated payment
        setSimPayment({ cashRequired: result.cashRequired, redemptionId: result.redemptionId });
        setShowSimPay(true);
        return new Promise<string>((resolve, reject) => {
            resolveRef.current = resolve;
            rejectRef.current  = reject;
        });
    };

    const onSimPaySuccess = () => {
        setShowSimPay(false);
        refreshBalance?.();
        if (simPayment) {
            // Navigate to success immediately — feedback shown there after animations
            router.push({
                pathname: '/(customer)/payment-success',
                params: {
                    amount:         String(total),
                    pointsUsed:     String(Math.min(balance ?? 0, pointsCost)),
                    merchantName:   merchantName as string,
                    transactionRef: simPayment.redemptionId,
                    redemptionId:   simPayment.redemptionId,
                    rewardName:     (rewardNameParam as string) || 'Reward',
                    feedbackUrl:    `${API_URL}/rewards/redemptions/${simPayment.redemptionId}/feedback`,
                },
            });
            resolveRef.current?.(simPayment.redemptionId);
            resolveRef.current = null;
            rejectRef.current  = null;
            setSimPayment(null);
        }
    };

    const onSimPayCancel = async () => {
        setShowSimPay(false);
        rejectRef.current?.(new Error('Payment cancelled'));
        rejectRef.current  = null;
        resolveRef.current = null;

        // Release the token reservation so the user's balance is restored.
        // We await this and then refresh the balance so the Pay button stays
        // disabled until the reservation is fully released — otherwise a quick
        // re-tap hits the wallet while the old reservation is still active and
        // gets "Insufficient available balance".
        const idToRelease = simPayment?.redemptionId;
        setSimPayment(null);
        if (idToRelease) {
            setReleasing(true);
            try {
                const token = await AsyncStorage.getItem('@dandan_auth_token');
                await fetch(`${API_URL}/rewards/redemptions/${idToRelease}/cancel-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ reason: 'User cancelled payment' }),
                });
            } catch (err: any) {
                console.warn('[Checkout] cancel-payment release failed:', err.message);
            } finally {
                refreshBalance?.();   // sync wallet balance before re-enabling Pay
                setReleasing(false);
            }
        }
    };

    // ── Render guards ───────────────────────────────────────────────────────
    if (!cartStr || !merchantName) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <Text style={{ fontSize: 16, color: '#64748b' }}>No items to checkout</Text>
            </View>
        );
    }

    let cartItems: any[] = [];
    try { cartItems = JSON.parse(cartStr as string); } catch (_) {}

    return (
        <>
            <CustomerCheckout
                merchantName={merchantName as string}
                cartItems={cartItems}
                totalAmount={total}
                pointsCostOverride={pointsCost}
                balance={balance ?? 0}
                cashRequired={0}
                paymentType={undefined}
                confirming={confirming || releasing}
                onConfirm={async (pointsUsed: number, merchant: string) => {
                    if (rewardId) {
                        return handleRewardConfirm(pointsUsed);
                    }
                    await deductPoints(pointsUsed, merchant);
                    return undefined;
                }}
                // For reward flow this is a no-op — navigation is driven by onFeedbackDone.
                // For regular cart flow it navigates to payment-success normally.
                onConfirmSuccess={rewardId ? undefined : (details: any) => {
                    router.push({
                        pathname: '/(customer)/payment-success',
                        params: {
                            amount:         details.amount,
                            pointsUsed:     details.pointsUsed,
                            merchantName:   details.merchantName,
                            transactionRef: details.transactionRef,
                        },
                    });
                }}
                onDone={() => router.back()}
                onCancel={() => router.back()}
            />

            {/* Simulated payment modal for hybrid / cash_only */}
            {simPayment && (
                <SimulatedPaymentModal
                    visible={showSimPay}
                    cashRequired={simPayment.cashRequired}
                    redemptionId={simPayment.redemptionId}
                    confirmUrl={`${API_URL}/rewards/redemptions/${simPayment.redemptionId}/confirm-payment`}
                    onSuccess={onSimPaySuccess}
                    onCancel={onSimPayCancel}
                />
            )}

        </>
    );
}
