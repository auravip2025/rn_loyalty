import { TabBar } from "@/components/navigation/TabBar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";

export default function CustomerLayout() {
    return (
        <Tabs
            tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#4f46e5',
            }}>
            <Tabs.Screen
                name="index"
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
                name="stats"
                options={{
                    title: 'Stats',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
                }}
            />
        </Tabs>
    );
}
