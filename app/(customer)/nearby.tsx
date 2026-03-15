import { useRouter } from 'expo-router';
import NearbyStores from '../../screens/customer/NearbyStores';

export default function NearbyPage() {
    const router = useRouter();
    return <NearbyStores onBack={() => router.back()} />;
}
