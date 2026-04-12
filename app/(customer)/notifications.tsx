import { useRouter } from 'expo-router';
import Notifications from '../../screens/customer/Notifications';

export default function NotificationsPage() {
    const router = useRouter();
    return <Notifications onBack={() => router.back()} />;
}
