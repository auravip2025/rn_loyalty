import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Gift, Lock, Package } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Button from '../../components/old_app/common/Button';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

// Shape returned by the gateway's `rewards` resolver (maps to RewardItem)
interface RewardItem {
  id: string;
  name: string;
  description: string | null;
  type: string;           // 'SINGLE' | 'BUNDLE'
  price: number;
  pointsPrice: number | null;
  stock: number;
  isEnabled: boolean;
  imageUrl: string | null;
  merchantId: string;
}

interface RewardsProps {
  onBack: () => void;
  balance: number;
  onRedeem: (reward: any) => void;
}

const PLACEHOLDER_COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed'];
const placeholderColor = (id: string) =>
  PLACEHOLDER_COLORS[id.charCodeAt(0) % PLACEHOLDER_COLORS.length];

const RewardCard: React.FC<{ item: RewardItem; balance: number; onRedeem: (r: any) => void }> = ({ item, balance, onRedeem }) => {
  const cost = item.pointsPrice ?? 0;
  // null / undefined = unlimited (merchant chose no stock cap)
  // 0               = depleted (all units sold)
  // > 0             = available
  const outOfStock = item.stock !== null && item.stock !== undefined && item.stock === 0;
  const locked = !item.isEnabled || outOfStock;
  const canAfford = balance >= cost && cost > 0;
  const isBundle = item.type?.toUpperCase() === 'BUNDLE';

  return (
    <Card style={styles.rewardCard}>
      {isBundle && (
        <View style={styles.bundleBadge}>
          <Text style={styles.bundleBadgeText}>BUNDLE</Text>
        </View>
      )}
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.rewardImage} />
      ) : (
        <View style={[styles.rewardImage, styles.imagePlaceholder, { backgroundColor: placeholderColor(item.id) }]}>
          {isBundle
            ? <Package size={28} color="rgba(255,255,255,0.8)" />
            : <Gift size={28} color="rgba(255,255,255,0.8)" />
          }
        </View>
      )}
      <View style={styles.rewardContent}>
        <Text style={styles.rewardTitle} numberOfLines={2}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.rewardDesc} numberOfLines={1}>{item.description}</Text>
        ) : null}
        {cost > 0 && (
          <Text style={styles.rewardCost}>{cost.toLocaleString()} dandan</Text>
        )}
        {item.price > 0 && (
          <Text style={styles.rewardPrice}>${Number(item.price).toFixed(2)}</Text>
        )}

        {locked ? (
          <View style={styles.lockedRow}>
            <Lock size={12} color="#94a3b8" />
            <Text style={styles.lockedText}>{item.stock === 0 ? 'Out of stock' : 'Unavailable'}</Text>
          </View>
        ) : (
          <Button
            onPress={() => onRedeem({ ...item, title: item.name, cost, isCash: false })}
            disabled={!canAfford && cost > 0}
            variant={canAfford || cost === 0 ? 'primary' : 'secondary'}
            style={styles.redeemButton}
          >
            {cost > 0 ? 'Redeem' : 'Get Free'}
          </Button>
        )}
      </View>
    </Card>
  );
};

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

const Rewards: React.FC<RewardsProps> = ({ onBack, balance, onRedeem }) => {
    const [rewards, setRewards] = useState<RewardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(useCallback(() => {
        let cancelled = false;
        const load = async () => {
            // Always wipe stale data before fetching so nothing from a previous
            // session or Fast Refresh cycle can bleed through.
            setRewards([]);
            setError(null);
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('@dandan_auth_token');
                const res = await fetch(`${API_URL}/catalog/rewards`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
                const json = await res.json();
                if (!cancelled) {
                    const items = Array.isArray(json) ? json : (json.rewards || []);
                    setRewards(items.filter((r: RewardItem) => r.isEnabled));
                }
            } catch (err: any) {
                console.warn('[Rewards] fetch failed:', err);
                if (!cancelled) setError(err?.message ?? 'Failed to load rewards');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []));

    const bundles = rewards.filter(r => r.type?.toUpperCase() === 'BUNDLE');
    const singles = rewards.filter(r => r.type?.toUpperCase() !== 'BUNDLE');

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
                        {(balance || 0).toLocaleString()} <Text style={styles.balanceUnit}>dandan</Text>
                    </Text>
                </View>

                {loading && (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#4f46e5" />
                    </View>
                )}

                {!loading && error && (
                    <View style={styles.empty}>
                        <Gift size={48} color="#fca5a5" />
                        <Text style={[styles.emptyText, { color: '#dc2626' }]}>Couldn't load rewards</Text>
                        <Text style={styles.emptySubtext}>{error}</Text>
                    </View>
                )}

                {!loading && !error && rewards.length === 0 && (
                    <View style={styles.empty}>
                        <Gift size={48} color="#e2e8f0" />
                        <Text style={styles.emptyText}>No rewards available yet</Text>
                        <Text style={styles.emptySubtext}>Check back soon — merchants are adding new rewards!</Text>
                    </View>
                )}

                {bundles.length > 0 && (
                    <View style={styles.ssection}>
                        <Text style={styles.sectionTitle}>Bundles</Text>
                        <View style={styles.grid}>
                            {bundles.map(item => (
                                <RewardCard key={item.id} item={item} balance={balance} onRedeem={onRedeem} />
                            ))}
                        </View>
                    </View>
                )}

                {singles.length > 0 && (
                    <View style={[styles.ssection, bundles.length > 0 ? { marginTop: 24 } : {}]}>
                        <Text style={styles.sectionTitle}>Single Rewards</Text>
                        <View style={styles.grid}>
                            {singles.map(item => (
                                <RewardCard key={item.id} item={item} balance={balance} onRedeem={onRedeem} />
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    center: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
    },
    emptySubtext: {
        fontSize: 13,
        color: '#94a3b8',
        textAlign: 'center',
        paddingHorizontal: 24,
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
        marginBottom: 20,
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
    ssection: {},
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
        minHeight: 110,
    },
    rewardImage: {
        width: 100,
        minHeight: 110,
        backgroundColor: '#f1f5f9',
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    rewardContent: {
        flex: 1,
        padding: 12,
        gap: 4,
        justifyContent: 'center',
    },
    rewardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
    rewardDesc: {
        fontSize: 11,
        color: '#64748b',
    },
    rewardCost: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    rewardPrice: {
        fontSize: 11,
        color: '#94a3b8',
    },
    redeemButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 4,
    },
    lockedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    lockedText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    bundleBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        backgroundColor: '#7c3aed',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    bundleBadgeText: {
        color: '#ffffff',
        fontSize: 8,
        fontWeight: '900',
    },
});

export default Rewards;
