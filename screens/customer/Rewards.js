import { ArrowLeft, Lock } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Badge from '../../components/old_app/common/Badge';
import Button from '../../components/old_app/common/Button';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const REWARDS = [
    {
        id: 1,
        title: 'Free Coffee',
        cost: 500,
        type: 'single',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400',
        locked: false,
    },
    {
        id: 101,
        title: '10x Coffee Pass',
        cost: 4500,
        price: 45.00,
        type: 'bundle',
        bundleCount: 10,
        originalCost: 5000,
        originalPrice: 50.00,
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400',
        locked: false,
    },
    {
        id: 102,
        title: '5x Lunch Set',
        cost: 6000,
        price: 60.00,
        type: 'bundle',
        bundleCount: 5,
        originalCost: 7500,
        originalPrice: 75.00,
        image: 'https://images.unsplash.com/photo-1549396535-c11d5c55b9df?auto=format&fit=crop&q=80&w=400',
        locked: false,
    },
    {
        id: 2,
        title: '$10 Voucher',
        cost: 1000,
        type: 'single',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400',
        locked: false,
    },
    {
        id: 3,
        title: 'Premium T-Shirt',
        cost: 2500,
        type: 'single',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400',
        locked: true,
    },
    {
        id: 4,
        title: 'VIP Access Pass',
        cost: 5000,
        type: 'single',
        image: 'https://images.unsplash.com/photo-1560416313-21c60623a808?auto=format&fit=crop&q=80&w=400',
        locked: true,
    },
];

const Rewards = ({ onBack, balance, onRedeem }) => {
    const bundles = REWARDS.filter(r => r.type === 'bundle');
    const singles = REWARDS.filter(r => r.type === 'single' || !r.type);

    return (
        <ScreenWrapper paddingHorizontal={0}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ArrowLeft size={20} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.title}>Rewards</Text>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={[styles.contentContainer, { paddingBottom: 40 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.balanceHeader}>
                    <Text style={styles.balanceLabel}>Your Balance</Text>
                    <Text style={styles.balanceAmount}>
                        {balance.toLocaleString()} <Text style={styles.balanceUnit}>dandan</Text>
                    </Text>
                </View>

                {bundles.length > 0 && (
                    <View style={styles.ssection}>
                        <Text style={styles.sectionTitle}>Pre-paid Bundles</Text>
                        <View style={styles.grid}>
                            {bundles.map((reward) => (
                                <Card key={reward.id} style={styles.rewardCard}>
                                    <View style={styles.bundleBadge}>
                                        <Text style={styles.bundleBadgeText}>SAVE 10%</Text>
                                    </View>
                                    <Image source={{ uri: reward.image }} style={styles.rewardImage} />
                                    <View style={styles.rewardContent}>
                                        <Text style={styles.rewardTitle}>{reward.title}</Text>
                                        <Text style={styles.rewardCost}>
                                            {reward.cost} dandan
                                            <Text style={styles.originalCost}> {reward.originalCost}</Text>
                                        </Text>
                                        <View style={styles.bundleInfo}>
                                            <Badge color="indigo">{reward.bundleCount} items</Badge>
                                        </View>

                                        <View style={styles.actionRow}>
                                            <Button
                                                onPress={() => onRedeem(reward)}
                                                disabled={balance < reward.cost}
                                                variant={balance >= reward.cost ? "secondary" : "disabled"}
                                                style={styles.actionButton}
                                                textStyle={styles.actionButtonText}
                                            >
                                                {reward.cost} dandan
                                            </Button>
                                            <Button
                                                onPress={() => onRedeem({ ...reward, isCash: true })}
                                                variant="merchant"
                                                style={styles.actionButton}
                                                textStyle={styles.actionButtonText}
                                            >
                                                ${reward.price}
                                            </Button>
                                        </View>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    </View>
                )}

                <View style={[styles.ssection, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Single Rewards</Text>
                    <View style={styles.grid}>
                        {singles.map((reward) => (
                            <Card key={reward.id} style={styles.rewardCard}>
                                <Image source={{ uri: reward.image }} style={styles.rewardImage} />
                                <View style={styles.rewardContent}>
                                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                                    <Text style={styles.rewardCost}>{reward.cost} dandan</Text>

                                    {reward.locked ? (
                                        <Button disabled variant="secondary" style={styles.redeemButton}>
                                            <Lock size={14} color="#64748b" />
                                            <Text style={styles.lockedText}>Locked</Text>
                                        </Button>
                                    ) : (
                                        <Button
                                            onPress={() => onRedeem(reward)}
                                            disabled={balance < reward.cost}
                                            variant={balance >= reward.cost ? "primary" : "secondary"}
                                            style={styles.redeemButton}
                                        >
                                            Redeem
                                        </Button>
                                    )}
                                </View>
                            </Card>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 8,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    balanceHeader: {
        marginBottom: 16,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
    },
    balanceLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
    },
    balanceUnit: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 12,
    },
    grid: {
        gap: 16,
    },
    rewardCard: {
        padding: 0,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    rewardImage: {
        width: 100,
        height: '100%',
        backgroundColor: '#f1f5f9',
    },
    rewardContent: {
        flex: 1,
        padding: 12,
        gap: 6,
    },
    rewardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    rewardCost: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4f46e5',
        marginBottom: 2,
    },
    redeemButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    lockedText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
    },
    originalCost: {
        textDecorationLine: 'line-through',
        color: '#94a3b8',
        fontSize: 10,
    },
    bundleInfo: {
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    bundleBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        backgroundColor: '#ef4444',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    bundleBadgeText: {
        color: '#ffffff',
        fontSize: 8,
        fontWeight: '900',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    actionButtonText: {
        fontSize: 10,
    },
});

export default Rewards;
