import { useRouter } from 'expo-router';
import React from 'react';
import { usePrograms } from '../../contexts/ProgramContext';
import { useWallet } from '../../contexts/WalletContext';
import CustomerHome from '../../screens/customer/CustomerHome';

export default function CustomerHomePage() {
    const { balance } = useWallet();
    const { programs } = usePrograms();
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
