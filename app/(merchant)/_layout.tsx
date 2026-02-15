import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';
import React from 'react';

export default function MerchantLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#4f46e5',
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="store"
                options={{
                    title: 'Store',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="building.2.fill" color={color} />,
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
                name="catalog"
                options={{
                    title: 'Catalog',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
                }}
            />
        </Tabs>
    );
}
