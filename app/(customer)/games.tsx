import { useRouter } from 'expo-router';
import React from 'react';
import { GET_DAILY_QUESTS, GET_MERCHANTS, useQuery } from '../../api/client';
import { usePrograms } from '../../contexts/ProgramContext';
import GamesScreen from '../../screens/customer/GamesScreen';

export default function GamesPage() {
    const { data: questsData, refetch: refetchQuests } = useQuery(GET_DAILY_QUESTS);
    const { data: merchantsData, refetch: refetchMerchants } = useQuery(GET_MERCHANTS);
    const router = useRouter();
    const [dailySpinUsed, setDailySpinUsed] = React.useState(false);
    const [dailyScratchUsed, setDailyScratchUsed] = React.useState(false);
    const [activeCoupon, setActiveCoupon] = React.useState(null);

    const merchants = (merchantsData as any)?.merchants || [];

    const handleRefresh = async () => {
        await Promise.all([refetchQuests(), refetchMerchants()]);
    };

    // Derive programs directly from merchant data (removing global programs dependency)
    const merchantPrograms = React.useMemo(() => {
        return merchants.flatMap((m: any) =>
            (m.programs || []).map((p: any) => ({
                ...p,
                merchantId: m.id,
                active: true
            }))
        );
    }, [merchants]);

    return (
        <GamesScreen
            programs={merchantPrograms}
            merchants={merchants}
            dailyQuests={(questsData as any)?.dailyQuests || []}
            dailySpinUsed={dailySpinUsed}
            setDailySpinUsed={setDailySpinUsed}
            dailyScratchUsed={dailyScratchUsed}
            setDailyScratchUsed={setDailyScratchUsed}
            setActiveCoupon={setActiveCoupon}
            onBack={() => router.back()}
            onRefresh={handleRefresh}
        />
    );
}
