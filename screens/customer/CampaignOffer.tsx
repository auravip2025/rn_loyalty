import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  ArrowRight,
  Gift,
  Lock,
  Package,
  Zap,
} from 'lucide-react-native';
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
import { getRewardDetails } from '../../utils/rewardDetails';
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
  productDetails?: any;
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

// Build the normalised offer object passed to offer-details + checkout
const rewardToOffer = (item: RewardItem) => ({
  id:             item.id,
  title:          item.name,
  desc:           item.description || '',
  image:          item.imageUrl || null,
  price:          Number(item.price) || 0,
  discount:       item.pointsPrice != null ? `${item.pointsPrice} pts` : null,
  expires:        null,
  storeName:      'Campaign Reward',
  productDetails: item.productDetails || null,
});

// ── Featured hero card ────────────────────────────────────────────────────────
const FeaturedCard: React.FC<{
  item: RewardItem;
  balance: number;
  onRedeem: (item: RewardItem) => void;
}> = ({ item, balance, onRedeem }) => {
  const cost      = item.pointsPrice ?? 0;
  const outOfStock = item.stock === 0;
  const locked    = !item.isEnabled || outOfStock;
  const canAfford = balance >= cost || cost === 0;
  const localImage = getRewardImage(item.name);
  const details   = item.productDetails &&
                    (item.productDetails.highlights?.length ||
                     item.productDetails.specs?.length ||
                     item.productDetails.category)
                    ? item.productDetails
                    : getRewardDetails(item.name);
  const isBundle  = item.type?.toUpperCase() === 'BUNDLE';

  return (
    <View style={featStyles.card}>
      {/* Hero image */}
      <View style={featStyles.imageWrap}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={featStyles.image} resizeMode="cover" />
        ) : localImage ? (
          <Image source={localImage} style={featStyles.image} resizeMode="cover" />
        ) : (
          <View style={[featStyles.image, featStyles.imagePlaceholder,
            { backgroundColor: placeholderColor(item.id) }]}>
            {isBundle
              ? <Package size={48} color="rgba(255,255,255,0.5)" />
              : <Gift    size={48} color="rgba(255,255,255,0.5)" />}
          </View>
        )}
        <View style={featStyles.imageOverlay} />

        {/* Badges on image */}
        <View style={featStyles.badgeRow}>
          {details.category ? (
            <View style={featStyles.categoryBadge}>
              <Text style={featStyles.categoryBadgeText}>
                {String(details.category).toUpperCase()}
              </Text>
            </View>
          ) : null}
          {isBundle && (
            <View style={featStyles.bundleBadge}>
              <Text style={featStyles.bundleBadgeText}>BUNDLE</Text>
            </View>
          )}
        </View>

        {/* Points cost chip */}
        {cost > 0 && (
          <View style={featStyles.costOverlay}>
            <Zap size={12} color="#fbbf24" fill="#fbbf24" />
            <Text style={featStyles.costOverlayText}>{cost.toLocaleString()} pts</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={featStyles.body}>
        <Text style={featStyles.name}>{item.name}</Text>
        {!!item.description && (
          <Text style={featStyles.desc} numberOfLines={2}>{item.description}</Text>
        )}

        {/* Highlights chips */}
        {details.highlights?.filter(Boolean).length > 0 && (
          <View style={featStyles.highlights}>
            {details.highlights.filter(Boolean).slice(0, 3).map((h: string, i: number) => (
              <View key={i} style={featStyles.chip}>
                <Text style={featStyles.chipText}>{h}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Specs table */}
        {details.specs?.length > 0 && (
          <View style={featStyles.specsCard}>
            {details.specs.slice(0, 4).map((s: any, i: number, arr: any[]) => (
              <View key={i}
                style={[featStyles.specRow, i < arr.length - 1 && featStyles.specRowBorder]}>
                <Text style={featStyles.specLabel}>{s.label}</Text>
                <Text style={featStyles.specValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Price */}
        <View style={featStyles.priceRow}>
          {cost > 0 && (
            <Text style={featStyles.pointsCost}>{cost.toLocaleString()} dandan</Text>
          )}
          {item.price > 0 && (
            <Text style={featStyles.cashPrice}>${Number(item.price).toFixed(2)}</Text>
          )}
        </View>

        {/* CTA */}
        {locked ? (
          <View style={featStyles.lockedRow}>
            <Lock size={14} color="#94a3b8" />
            <Text style={featStyles.lockedText}>
              {outOfStock ? 'Out of stock' : 'Unavailable'}
            </Text>
          </View>
        ) : !canAfford && cost > 0 ? (
          <View style={featStyles.insufficientWrap}>
            <Text style={featStyles.insufficientText}>Not enough points to redeem</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={featStyles.redeemBtn}
            onPress={() => onRedeem(item)}
            activeOpacity={0.85}
          >
            <Text style={featStyles.redeemBtnText}>
              {cost === 0 ? 'Get for Free' : 'Redeem Now'}
            </Text>
            <ArrowRight size={16} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ── Compact secondary tile ────────────────────────────────────────────────────
const CompactTile: React.FC<{
  item: RewardItem;
  balance: number;
  onPress: (item: RewardItem) => void;
}> = ({ item, balance, onPress }) => {
  const cost      = item.pointsPrice ?? 0;
  const outOfStock = item.stock === 0;
  const locked    = !item.isEnabled || outOfStock;
  const canAfford = balance >= cost || cost === 0;
  const localImage = getRewardImage(item.name);
  const isBundle  = item.type?.toUpperCase() === 'BUNDLE';

  return (
    <TouchableOpacity
      onPress={() => !locked && onPress(item)}
      activeOpacity={locked ? 1 : 0.75}
      style={[tileStyles.wrap, locked && tileStyles.wrapLocked]}
    >
      <Card style={tileStyles.card}>
        {isBundle && (
          <View style={tileStyles.bundleBadge}>
            <Text style={tileStyles.bundleBadgeText}>BUNDLE</Text>
          </View>
        )}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={tileStyles.image} resizeMode="cover" />
        ) : localImage ? (
          <Image source={localImage} style={tileStyles.image} resizeMode="cover" />
        ) : (
          <View style={[tileStyles.image, tileStyles.imagePlaceholder,
            { backgroundColor: placeholderColor(item.id) }]}>
            {isBundle
              ? <Package size={22} color="rgba(255,255,255,0.8)" />
              : <Gift    size={22} color="rgba(255,255,255,0.8)" />}
          </View>
        )}
        <View style={tileStyles.body}>
          <Text style={tileStyles.name} numberOfLines={2}>{item.name}</Text>
          {cost > 0 && (
            <Text style={tileStyles.cost}>{cost.toLocaleString()} pts</Text>
          )}
          {locked ? (
            <View style={tileStyles.lockedRow}>
              <Lock size={11} color="#94a3b8" />
              <Text style={tileStyles.lockedText}>
                {outOfStock ? 'Out of stock' : 'Unavailable'}
              </Text>
            </View>
          ) : !canAfford && cost > 0 ? (
            <Text style={tileStyles.notEnough}>Not enough points</Text>
          ) : (
            <View style={tileStyles.tapHint}>
              <Text style={tileStyles.tapHintText}>Tap to view →</Text>
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
  const [error,   setError]   = useState<string | null>(null);

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
          if (!cancelled) setError(err?.message ?? 'Failed to load rewards');
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      load();
      return () => { cancelled = true; };
    }, [merchantId])
  );

  const handleTile = (item: RewardItem) => onRedeemReward(rewardToOffer(item));

  // First reward is the featured hero; remainder shown as compact tiles below
  const [featured, ...others] = rewards;

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
        {/* Campaign banner */}
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

        {/* ── Featured hero ── */}
        {!loading && !error && !!featured && (
          <FeaturedCard
            item={featured}
            balance={balance}
            onRedeem={handleTile}
          />
        )}

        {/* ── More rewards ── */}
        {!loading && !error && others.length > 0 && (
          <View style={styles.moreSection}>
            <View style={styles.moreDivider}>
              <View style={styles.moreLine} />
              <Text style={styles.moreLabel}>More Rewards</Text>
              <View style={styles.moreLine} />
            </View>
            {others.map(item => (
              <CompactTile
                key={item.id}
                item={item}
                balance={balance}
                onPress={handleTile}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

// ── Featured card styles ──────────────────────────────────────────────────────
const featStyles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  imageWrap: { position: 'relative', height: 220 },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#e2e8f0',
  },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bundleBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bundleBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  costOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  costOverlayText: { color: '#fbbf24', fontSize: 13, fontWeight: '800' },
  body: { padding: 18, gap: 10 },
  name: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  desc: { fontSize: 14, color: '#64748b', lineHeight: 20, fontWeight: '500' },
  highlights: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  specsCard: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  specRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  specLabel: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  specValue: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pointsCost: { fontSize: 18, fontWeight: '900', color: '#4f46e5' },
  cashPrice: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 4,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  redeemBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  lockedText: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  insufficientWrap: { paddingVertical: 4 },
  insufficientText: { fontSize: 13, color: '#f59e0b', fontWeight: '600' },
});

// ── Compact tile styles ───────────────────────────────────────────────────────
const tileStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  wrapLocked: { opacity: 0.55 },
  card: {
    padding: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 88,
  },
  image: { width: 88, height: 88, backgroundColor: '#f1f5f9' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  bundleBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 10,
    backgroundColor: '#7c3aed',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bundleBadgeText: { color: '#ffffff', fontSize: 8, fontWeight: '900' },
  body: { flex: 1, padding: 12, justifyContent: 'center', gap: 3 },
  name: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  cost: { fontSize: 12, fontWeight: '700', color: '#4f46e5' },
  tapHint: {
    marginTop: 4,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  tapHintText: { fontSize: 11, fontWeight: '700', color: '#4f46e5' },
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  lockedText: { fontSize: 11, color: '#94a3b8' },
  notEnough: { fontSize: 11, color: '#f59e0b', fontWeight: '600', marginTop: 3 },
});

// ── Page-level styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: { padding: 8, borderRadius: 20, backgroundColor: '#f1f5f9' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 48 },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
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
  bannerTitle: { fontSize: 14, fontWeight: '900', color: '#92400e', marginBottom: 4 },
  bannerMessage: { fontSize: 13, color: '#b45309', fontWeight: '500', lineHeight: 18 },
  balancePill: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingVertical: 12,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  balanceAmount: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  balanceUnit: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
  center: { paddingVertical: 48, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#64748b' },
  emptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 19,
  },
  moreSection: { marginTop: 8 },
  moreDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  moreLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  moreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

export default CampaignOffer;
