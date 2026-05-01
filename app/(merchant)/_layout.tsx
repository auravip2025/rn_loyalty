import { Stack } from 'expo-router';

export default function MerchantLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* The main tab navigation */}
            <Stack.Screen name="(tabs)" />
            
            {/* Full-screen screens that hide the tab bar */}
            <Stack.Screen 
                name="reward-form" 
                options={{ 
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }} 
            />
            <Stack.Screen name="store" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="settlement" />
        </Stack>
    );
}
