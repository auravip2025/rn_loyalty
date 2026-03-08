import { useRouter } from 'expo-router';
import React from 'react';
import { GET_DAILY_QUESTS, GET_OFFERS, useQuery } from '../../api/client';
import { usePrograms } from '../../contexts/ProgramContext';
import { useWallet } from '../../contexts/WalletContext';
import CustomerHome from '../../screens/customer/CustomerHome';

export default function CustomerHomePage() {
    const { balance } = useWallet() as any;
    const { programs } = usePrograms() as any;
    const { data: questsData, loading: questsLoading } = useQuery(GET_DAILY_QUESTS);
    const { data: offersData, loading: offersLoading } = useQuery(GET_OFFERS);
    const router = useRouter();
    const [dailySpinUsed, setDailySpinUsed] = React.useState(false);
    const [dailyScratchUsed, setDailyScratchUsed] = React.useState(false);
    const [activeCoupon, setActiveCoupon] = React.useState(null);

    const handleOpenWallet = () => {
        router.push('/(customer)/wallet');
    };

    const handleScan = () => {
        router.push('/(customer)/scan');
    };

    const handleCheckout = (amount: string) => {
        router.push({
            pathname: '/(customer)/scan',
            params: { amount },
        });
    };

    return (
        <CustomerHome
            programs={programs}
            dailyQuests={(questsData as any)?.dailyQuests || []}
            offers={(offersData as any)?.offers || []}
            balance={balance}
            onOpenWallet={handleOpenWallet}
            onScan={handleScan}
            dailySpinUsed={dailySpinUsed}
            setDailySpinUsed={setDailySpinUsed}
            setActiveCoupon={setActiveCoupon}
            dailyScratchUsed={dailyScratchUsed}
            setDailyScratchUsed={setDailyScratchUsed}
            handleCheckout={handleCheckout}
        />
    );
}
