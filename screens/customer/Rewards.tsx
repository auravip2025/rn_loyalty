import { ArrowLeft, Lock } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Badge from '../../components/old_app/common/Badge';
import Button from '../../components/old_app/common/Button';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { useQuery, GET_REWARDS } from '../../api/client';

interface Reward {
  id: number;
  title: string;
  cost: number;
  type: 'single' | 'bundle';
  image: string;
  locked: boolean;
  price?: number;
  bundleCount?: number;
  originalCost?: number;
  originalPrice?: number;
  isCash?: boolean;
}

interface RewardsProps {
  onBack: () => void;
  balance: number;
  onRedeem: (reward: Reward) => void;
}

const Rewards: React.FC<RewardsProps> = ({ onBack, balance, onRedeem }) => {
    const { data, loading, error } = useQuery(GET_REWARDS);

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            </ScreenWrapper>
        );
    }

    const rewards: Reward[] = data?.rewards || [];
    const bundles = rewards.filter(r => r.type === 'bundle');
    const singles = rewards.filter(r => r.type === 'single' || !r.type);

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
                                            {reward.originalCost && <Text style={styles.originalCost}> {reward.originalCost}</Text>}
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    ssection: {
        // section
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
        marginLeft: 6,
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
