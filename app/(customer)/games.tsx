import { useRouter } from 'expo-router';
import React from 'react';
import { GET_DAILY_QUESTS, GET_MERCHANTS, useQuery } from '../../api/client';
import { usePrograms } from '../../contexts/ProgramContext';
import GamesScreen from '../../screens/customer/GamesScreen';

export default function GamesPage() {
    const { programs } = usePrograms() as any;
    const { data: questsData } = useQuery(GET_DAILY_QUESTS);
    const { data: merchantsData } = useQuery(GET_MERCHANTS);
    const router = useRouter();
    const [dailySpinUsed, setDailySpinUsed] = React.useState(false);
    const [dailyScratchUsed, setDailyScratchUsed] = React.useState(false);
    const [activeCoupon, setActiveCoupon] = React.useState(null);

    return (
        <GamesScreen
            programs={programs}
            merchants={(merchantsData as any)?.merchants || []}
            dailyQuests={(questsData as any)?.dailyQuests || []}
            dailySpinUsed={dailySpinUsed}
            setDailySpinUsed={setDailySpinUsed}
            dailyScratchUsed={dailyScratchUsed}
            setDailyScratchUsed={setDailyScratchUsed}
            setActiveCoupon={setActiveCoupon}
            onBack={() => router.back()}
        />
    );
}
