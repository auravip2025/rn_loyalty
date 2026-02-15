import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Store, Settings } from 'lucide-react-native';
import Card from '../common/Card';

const PropertyOverview = ({ name = "The Coffee House", status = "Open", rating = "4.8" }) => {
    return (
        <Card style={styles.container}>
            <View style={styles.row}>
                <View style={styles.icon}>
                    <Store size={24} color="#ffffff" />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{name}</Text>
                    <View style={styles.meta}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{status}</Text>
                        </View>
                        <Text style={styles.rating}>⭐ {rating}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity>
                <Settings size={20} color="#94a3b8" />
            </TouchableOpacity>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        justifyContent: 'flex-start',
    },
    name: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 4,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: '#ecfdf5',
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#059669',
        textTransform: 'uppercase',
    },
    rating: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0f172a',
    },
});

export default PropertyOverview;
