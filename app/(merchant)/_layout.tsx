import { TabBar } from "@/components/navigation/TabBar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function MerchantLayout() {
    const { logout } = useAuth() as any;
    const router = useRouter();

    return (
        <Tabs
            tabBar={(props: BottomTabBarProps) => (
                <TabBar {...props} activeTintColor="#10b981" />
            )}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#10b981',
            }}
        >
            {/* ── Visible tabs ── */}
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={26} name="building.2.fill" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="programs"
                options={{
                    title: 'Store',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={26} name="storefront" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="catalog"
                options={{
                    title: 'Rewards',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={26} name="gift.fill" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="menu"
                options={{
                    title: 'Menu',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={26} name="fork.knife" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={26} name="qrcode.viewfinder" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={26} name="gear" color={color} />
                    ),
                }}
            />

            {/* ── Hidden screens (full-screen overlays, no tab shown) ── */}
            <Tabs.Screen name="store"       options={{ href: null }} />
            <Tabs.Screen name="onboarding"  options={{ href: null }} />
            <Tabs.Screen name="profile"     options={{ href: null }} />
            <Tabs.Screen name="settlement"  options={{ href: null }} />
        </Tabs>
    );
}
