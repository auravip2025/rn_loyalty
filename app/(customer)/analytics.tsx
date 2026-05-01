import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CustomerAnalytics from '../../screens/customer/CustomerAnalytics';

export default function AnalyticsPage() {
    const { user } = useAuth();
    return <CustomerAnalytics user={user} />;
}
