import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Gift, Lock, Package, Zap } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { getRewardImage } from '../../utils/rewardImages';

interface RewardItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  pointsPrice: number | null;
  stock: number;
  isEnabled: boolean;
  imageUrl: string | null;
  merchantId: string;
}

interface CampaignOfferProps {
  onBack: () => void;
  balance: number;
  merchantId: string;
  campaignTitle?: string;
  campaignMessage?: string;
  onRedeemReward: (offer: any) => void;
}

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

const PLACEHOLDER_COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed'];
const placeholderColor = (id: string) =>
  PLACEHOLDER_COLORS[id.charCodeAt(0) % PLACEHOLDER_COLORS.length];

// ── Reward tile —— tapping opens offer-details hero view ─────────────────────
const RewardTile: React.FC<{
  item: RewardItem;
  balance: number;
  onPress: (item: RewardItem) => void;
}> = ({ item, balance, onPress }) => {
  const cost = item.pointsPrice ?? 0;
  const outOfStock = item.stock !== null && item.stock !== undefined && item.stock === 0;
  const locked = !item.isEnabled || outOfStock;
  const canAfford = balance >= cost && cost > 0;
  const isBundle = item.type?.toUpperCase() === 'BUNDLE';

  return (
    <TouchableOpacity
      onPress={() => !locked && onPress(item)}
      activeOpacity={locked ? 1 : 0.75}
      style={[styles.tile, locked && styles.tileLocked]}
    >
      <Card style={styles.tileCard}>
        {isBundle && (
          <View style={styles.bundleBadge}>
            <Text style={styles.bundleBadgeText}>BUNDLE</Text>
          </View>
        )}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.tileImage} resizeMode="cover" />
        ) : (() => {
          const local = getRewardImage(item.name);
          return local
            ? <Image source={local} style={styles.tileImage} resizeMode="cover" />
            : (
              <View style={[styles.tileImage, styles.tilePlaceholder, { backgroundColor: placeholderColor(item.id) }]}>
                {isBundle
                  ? <Package size={28} color="rgba(255,255,255,0.8)" />
                  : <Gift size={28} color="rgba(255,255,255,0.8)" />
                }
              </View>
            );
        })()}

        <View style={styles.tileBody}>
          <Text style={styles.tileName} numberOfLines={2}>{item.name}</Text>
          {!!item.description && (
            <Text style={styles.tileDesc} numberOfLines={1}>{item.description}</Text>
          )}
          {cost > 0 && (
            <Text style={styles.tileCost}>{cost.toLocaleString()} dandan</Text>
          )}
          {item.price > 0 && (
            <Text style={styles.tilePrice}>${Number(item.price).toFixed(2)}</Text>
          )}

          {locked ? (
            <View style={styles.lockedRow}>
              <Lock size={12} color="#94a3b8" />
              <Text style={styles.lockedText}>
                {outOfStock ? 'Out of stock' : 'Unavailable'}
              </Text>
            </View>
          ) : (
            <View style={[styles.tapHint, (!canAfford && cost > 0) && styles.tapHintDisabled]}>
              <Text style={[styles.tapHintText, (!canAfford && cost > 0) && styles.tapHintTextDisabled]}>
                {cost === 0 ? 'Tap to get free' : canAfford ? 'Tap to redeem →' : 'Not enough points'}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const CampaignOffer: React.FC<CampaignOfferProps> = ({
  onBack,
  balance,
  merchantId,
  campaignTitle,
  campaignMessage,
  onRedeemReward,
}) => {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        setRewards([]);
        setError(null);
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('@dandan_auth_token');
          const res = await fetch(`${API_URL}/catalog/rewards/merchant/${merchantId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) throw new Error(`Server returned ${res.status}`);
          const json = await res.json();
          if (!cancelled) {
            const items: RewardItem[] = Array.isArray(json) ? json : (json.rewards || []);
            setRewards(items.filter(r => r.isEnabled));
          }
        } catch (err: any) {
          console.warn('[CampaignOffer] fetch failed:', err);
          if (!cancelled) setError(err?.message ?? 'Failed to load rewards');
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      load();
      return () => { cancelled = true; };
    }, [merchantId])
  );

  const bundles = rewards.filter(r => r.type?.toUpperCase() === 'BUNDLE');
  const singles = rewards.filter(r => r.type?.toUpperCase() !== 'BUNDLE');

  const handleTile = (item: RewardItem) => {
    // Build offer object compatible with offer-details → checkout flow
    const offer = {
      id:        item.id,
      title:     item.name,
      desc:      item.description || '',
      image:     item.imageUrl || null,
      price:     Number(item.price) || 0,
      discount:  item.pointsPrice != null ? `${item.pointsPrice} pts` : null,
      expires:   null,
      storeName: 'Campaign Reward',
    };
    onRedeemReward(offer);
  };

  return (
    <ScreenWrapper paddingHorizontal={0}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campaign Offer</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Campaign promo banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIconWrap}>
            <Zap size={22} color="#d97706" fill="#d97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              {campaignTitle || 'Special Campaign Offer'}
            </Text>
            {!!campaignMessage && (
              <Text style={styles.bannerMessage}>{campaignMessage}</Text>
            )}
          </View>
        </View>

        {/* Balance pill */}
        <View style={styles.balancePill}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>
            {(balance || 0).toLocaleString()}{' '}
            <Text style={styles.balanceUnit}>dandan</Text>
          </Text>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#d97706" />
          </View>
        )}

        {/* Error */}
        {!loading && !!error && (
          <View style={styles.empty}>
            <Gift size={48} color="#fca5a5" />
            <Text style={[styles.emptyText, { color: '#dc2626' }]}>Couldn't load rewards</Text>
            <Text style={styles.emptySub}>{error}</Text>
          </View>
        )}

        {/* Empty */}
        {!loading && !error && rewards.length === 0 && (
          <View style={styles.empty}>
            <Gift size={48} color="#fde68a" />
            <Text style={styles.emptyText}>No rewards yet</Text>
            <Text style={styles.emptySub}>
              This merchant hasn't added campaign rewards yet. Check back soon!
            </Text>
          </View>
        )}

        {/* Bundles */}
        {bundles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bundles</Text>
            {bundles.map(item => (
              <RewardTile key={item.id} item={item} balance={balance} onPress={handleTile} />
            ))}
          </View>
        )}

        {/* Singles */}
        {singles.length > 0 && (
          <View style={[styles.section, bundles.length > 0 && { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            {singles.map(item => (
              <RewardTile key={item.id} item={item} balance={balance} onPress={handleTile} />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  // ── Campaign banner ────────────────────────────────────────────────────────
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    marginTop: 4,
  },
  bannerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#92400e',
    marginBottom: 4,
  },
  bannerMessage: {
    fontSize: 13,
    color: '#b45309',
    fontWeight: '500',
    lineHeight: 18,
  },
  // ── Balance pill ───────────────────────────────────────────────────────────
  balancePill: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingVertical: 14,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  balanceUnit: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  // ── States ─────────────────────────────────────────────────────────────────
  center: {
    paddingVertical: 48,
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
  emptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 19,
  },
  // ── Section ────────────────────────────────────────────────────────────────
  section: {},
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
  },
  // ── Reward tile ────────────────────────────────────────────────────────────
  tile: {
    marginBottom: 14,
  },
  tileLocked: {
    opacity: 0.6,
  },
  tileCard: {
    padding: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 110,
  },
  tileImage: {
    width: 100,
    height: 110,
    backgroundColor: '#f1f5f9',
  },
  tilePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileBody: {
    flex: 1,
    padding: 12,
    gap: 4,
    justifyContent: 'center',
  },
  tileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  tileDesc: {
    fontSize: 11,
    color: '#64748b',
  },
  tileCost: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  tilePrice: {
    fontSize: 11,
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
  tapHint: {
    marginTop: 6,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  tapHintDisabled: {
    backgroundColor: '#f1f5f9',
  },
  tapHintText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4f46e5',
  },
  tapHintTextDisabled: {
    color: '#94a3b8',
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
});

export default CampaignOffer;
