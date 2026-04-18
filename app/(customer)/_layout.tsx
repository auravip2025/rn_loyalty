import { TabBar } from "@/components/navigation/TabBar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function CustomerLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return null;
    // useEffect(() => {
    //     console.log("CustomerLayout isAuthenticated", isAuthenticated);
    //     if (!isAuthenticated) {
    //         router.replace('/');
    //     }
    // }, [isAuthenticated]);

    // if (!isAuthenticated) {
    //     return <Redirect href="/" />;
    // }


    return (
        <Tabs
            tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#4f46e5',
            }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: 'Wallet',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="creditcard.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode" color={color} />,
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="offer-details"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="nearby"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="checkout"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="games"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="rewards"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="preferences"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
