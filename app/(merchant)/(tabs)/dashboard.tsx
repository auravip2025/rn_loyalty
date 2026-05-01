import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BadgeDollarSign } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MerchantAnalytics from '../../../screens/merchant/MerchantAnalytics';

export default function MerchantHomePage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1 }}>
            <MerchantAnalytics />
            {/* Settlement floating action — bottom-right */}
            <TouchableOpacity
                onPress={() => router.push('/(merchant)/settlement' as any)}
                style={[styles.fab, { bottom: insets.bottom + 80 }]}
            >
                <BadgeDollarSign size={20} color="#ffffff" />
                <Text style={styles.fabText}>Settlement</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#10b981',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '900',
    },
});
