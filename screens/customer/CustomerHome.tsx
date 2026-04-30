import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gift,
  History,
  MapPin,
  Monitor,
  Scissors,
  Shirt,
  ShoppingBag,
  Star,
  Trophy,
  Utensils,
  Zap,
  LucideIcon,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { getRewardImage } from '../../utils/rewardImages';
import { GET_NOTIFICATIONS, useQuery } from '../../api/client';

interface Offer {
  id: string | number;
  image: string | null;
  title: string;
  desc: string;
  discount?: string | null;
  expires?: string | null;
  price?: number;
  storeName?: string | null;
  stock?: number | null;    // null = unlimited; integer = finite stock
}

interface Store {
  id: string | number;
  name: string;
  image: string;
  visitDate: string;
  pointsEarned: number;
}

interface Category {
  id: number;
  name: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
  shops: { name: string }[];
}

interface TopOffer {
  id: string | number;
  title: string;
  discount?: string | null;
  price?: number | null;
  image?: string | null;
}

interface Merchant {
  id: string | number;
  name: string;
  category?: string | null;
  categoryEmoji?: string | null;
  image?: string | null;
  address?: string | null;
  rating?: number | null;
  open?: boolean;
  topOffer?: TopOffer | null;
}

// ── Category → card colour ─────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  cafe:        '#f59e0b',
  coffee:      '#f59e0b',
  food:        '#10b981',
  restaurant:  '#10b981',
  fashion:     '#8b5cf6',
  clothing:    '#8b5cf6',
  electronics: '#3b82f6',
  tech:        '#3b82f6',
  beauty:      '#ec4899',
  fitness:     '#ef4444',
  gym:         '#ef4444',
  grocery:     '#22c55e',
  health:      '#06b6d4',
  eco:         '#16a34a',
};

const merchantCardColor = (category?: string | null): string => {
  if (!category) return '#1e293b';
  const key = category.toLowerCase();
  const match = Object.entries(CATEGORY_COLORS).find(([k]) => key.includes(k));
  return match ? match[1] : '#1e293b';
};

// ── MerchantCard ────────────────────────────────────────────────────────────
interface MerchantCardProps {
  merchant: Merchant;
  index: number;
  onPress: () => void;
}

// Card width used for snap calculation — exported so the ScrollView can use it
const MERCHANT_CARD_W = 300;

const MerchantCard: React.FC<MerchantCardProps> = ({ merchant, index, onPress }) => {
  const translateY = useSharedValue(24);
  const opacity    = useSharedValue(0);
  const isFocused  = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      translateY.value = 24;
      opacity.value    = 0;
      const delay = index * 100;
      opacity.value    = withDelay(delay, withTiming(1,  { duration: 400 }));
      translateY.value = withDelay(delay, withSpring(0,  { damping: 16, stiffness: 110 }));
    }
  }, [isFocused, index]);

  const animStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const accentColor = merchantCardColor(merchant.category);
  const hasImage    = !!merchant.image;
  const shortAddr   = merchant.address
    ? merchant.address.split(',').slice(0, 2).join(',').trim()
    : null;
  const offerLabel = merchant.topOffer?.discount
    ?? (merchant.topOffer?.price != null ? `$${Number(merchant.topOffer.price).toFixed(2)}` : null);

  return (
    <Animated.View style={[styles.merchantCard, animStyle]}>
      <TouchableOpacity onPress={onPress} style={{ flex: 1 }} activeOpacity={0.9}>

        {/* ── Background: photo or coloured fallback ── */}
        {hasImage ? (
          <Image
            source={{ uri: merchant.image! }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.merchantFallbackBg, { backgroundColor: accentColor }]}>
            {/* Subtle decorative circle — mirrors the membership card pattern */}
            <View style={styles.merchantBgCircle} />
            <Text style={styles.merchantBgEmoji}>{merchant.categoryEmoji || '🏪'}</Text>
          </View>
        )}

        {/* ── Full-card scrim (photo needs it, fallback gets subtle tint) ── */}
        <View style={styles.merchantScrim} />

        {/* ── TOP ROW: category badge left · open pill right ── */}
        <View style={styles.merchantTopRow}>
          <View style={styles.merchantCategoryBadge}>
            <Text style={styles.merchantCategoryEmoji}>{merchant.categoryEmoji || '🏪'}</Text>
            <Text style={styles.merchantCategoryLabel}>{merchant.category || 'Store'}</Text>
          </View>
          <View style={[styles.merchantOpenPill,
            { backgroundColor: merchant.open ? 'rgba(16,185,129,0.85)' : 'rgba(100,116,139,0.85)' }]}>
            <View style={styles.merchantOpenDot} />
            <Text style={styles.merchantOpenText}>{merchant.open ? 'Open' : 'Closed'}</Text>
          </View>
        </View>

        {/* ── BOTTOM STRIP: mirrors membership card footer ── */}
        <View style={styles.merchantFooter}>
          {/* Name + optional offer badge on same row */}
          <View style={styles.merchantFooterTop}>
            <Text style={styles.merchantName} numberOfLines={1}>{merchant.name}</Text>
            {offerLabel ? (
              <View style={styles.merchantOfferChip}>
                <Text style={styles.merchantOfferText}>{offerLabel}</Text>
              </View>
            ) : null}
          </View>

          {/* Address + rating — matches membership card's bottom meta row */}
          <View style={styles.merchantMetaRow}>
            {merchant.rating != null && (
              <View style={styles.merchantRatingRow}>
                <Star size={11} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.merchantRating}>{Number(merchant.rating).toFixed(1)}</Text>
              </View>
            )}
            {shortAddr ? (
              <View style={styles.merchantAddrRow}>
                <MapPin size={10} color="rgba(255,255,255,0.6)" />
                <Text style={styles.merchantAddr} numberOfLines={1}>{shortAddr}</Text>
              </View>
            ) : null}
          </View>
        </View>

      </TouchableOpacity>
    </Animated.View>
  );
};

interface OfferCardItemProps {
  offer: Offer;
  index: number;
  onPress: () => void;
}

// Stock urgency helpers
const isHot       = (stock?: number | null) => stock !== null && stock !== undefined && stock <= 5;
const isLow       = (stock?: number | null) => stock !== null && stock !== undefined && stock > 5 && stock <= 15;
const stockLabel  = (stock?: number | null): string | null => {
  if (isHot(stock))  return `Only ${stock} left!`;
  if (isLow(stock))  return `${stock} remaining`;
  return null;
};

const OfferCardItem: React.FC<OfferCardItemProps> = ({ offer, index, onPress }) => {
  const translateX = useSharedValue(60);
  const opacity    = useSharedValue(0);
  const isFocused  = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      translateX.value = 60;
      opacity.value    = 0;
      const delay = index * 120;
      opacity.value    = withDelay(delay, withTiming(1, { duration: 400 }));
      translateX.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 120 }));
    }
  }, [isFocused, index]);

  const animStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const hot   = isHot(offer.stock);
  const low   = isLow(offer.stock);
  const label = stockLabel(offer.stock);

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity onPress={onPress} style={styles.offerCard} activeOpacity={0.88}>

        {/* LEFT — square image: remote URL → local asset → placeholder */}
        <View style={styles.offerImageWrap}>
          {offer.image
            ? <Image source={{ uri: offer.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : (() => {
                const localImg = getRewardImage(offer.title);
                return localImg
                  // Local require() assets must use explicit pixel dimensions —
                  // absoluteFill renders them at their natural (huge) resolution.
                  ? <Image source={localImg} style={styles.offerLocalImage} resizeMode="cover" />
                  : <View style={[StyleSheet.absoluteFill, styles.offerImagePlaceholder]}>
                      <Zap size={28} color="rgba(255,255,255,0.3)" fill="rgba(255,255,255,0.3)" />
                    </View>;
              })()
          }
          {/* Hot flame overlay on image */}
          {hot && (
            <View style={styles.offerHotBadge}>
              <Text style={styles.offerHotBadgeText}>🔥</Text>
            </View>
          )}
        </View>

        {/* RIGHT — offer details */}
        <View style={styles.offerBody}>

          {/* Store name */}
          {offer.storeName ? (
            <Text style={styles.offerStoreName} numberOfLines={1}>{offer.storeName}</Text>
          ) : null}

          {/* Offer title */}
          <Text style={styles.offerTitle} numberOfLines={2}>{offer.title}</Text>

          {/* Points + price row */}
          <View style={styles.offerPriceRow}>
            {offer.discount ? (
              <View style={styles.offerPointsChip}>
                <Zap size={10} color="#4f46e5" fill="#4f46e5" />
                <Text style={styles.offerPointsText}>{offer.discount}</Text>
              </View>
            ) : null}
            {offer.price != null && offer.price > 0 ? (
              <Text style={styles.offerPrice}>${Number(offer.price).toFixed(2)}</Text>
            ) : null}
          </View>

          {/* Stock urgency */}
          {label ? (
            <View style={[styles.offerStockRow, { backgroundColor: hot ? '#fef2f2' : '#fffbeb' }]}>
              <Text style={[styles.offerStockText, { color: hot ? '#ef4444' : '#d97706' }]}>
                {hot ? '🔥 ' : '⚡ '}{label}
              </Text>
            </View>
          ) : null}

        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface CategoryAccordionItemProps {
  cat: Category;
  isActive: boolean;
  onPress: () => void;
}

const CategoryAccordionItem: React.FC<CategoryAccordionItemProps> = ({ cat, isActive, onPress }) => {
  const IconComponent = cat.icon;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isActive ? 380 : 80, { duration: 300, easing: Easing.out(Easing.quad) }),
    };
  });

  return (
    <Animated.View style={[styles.categoryAccordionWrapper, animatedStyle, { backgroundColor: cat.color }]}>
      <View style={styles.tagHole} />
      <View style={styles.categoryAccordionInner}>
        <TouchableOpacity
          style={styles.categoryMainContent}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.categoryIconWrap}>
            <IconComponent size={24} color={cat.iconColor} />
          </View>
          <Text style={[styles.categoryName, { color: cat.iconColor, position: "absolute", top: 70, left: 10 }]} numberOfLines={1}>{cat.name}</Text>
        </TouchableOpacity>

        <View style={styles.categoryShopsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shopsScrollContent}
            scrollEnabled={isActive}
          >
            {cat.shops.slice(0, 3).map((shop, i) => (
              <TouchableOpacity key={i} style={styles.shopItem} disabled={!isActive} activeOpacity={0.7}>
                <View style={[styles.shopImagePlaceHolder, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                  <Text style={[styles.shopIconText, { color: cat.iconColor }]}>{shop.name.charAt(0)}</Text>
                </View>
                <Text style={[styles.shopName, { color: cat.iconColor }]} numberOfLines={1}>{shop.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.shopItem} disabled={!isActive} activeOpacity={0.7}>
              <View style={[styles.shopImagePlaceHolder, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <ChevronRight size={24} color={cat.iconColor} />
              </View>
              <Text style={[styles.shopName, { color: cat.iconColor }]} numberOfLines={1}>More</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Animated.View>
  );
};

interface RecentStoreItemProps {
  store: Store;
  index: number;
}

const RecentStoreItem: React.FC<RecentStoreItemProps> = ({ store, index }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 150, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 150, withTiming(0, { duration: 500 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.recentStoreCard, animatedStyle]}>
      <Image source={{ uri: store.image }} style={styles.recentStoreImage} />
      <View style={styles.recentStoreOverlay} />
      <View style={styles.recentStoreContent}>
        <Text style={styles.recentStoreName} numberOfLines={1}>{store.name}</Text>
        <View style={styles.recentStoreMeta}>
          <Text style={styles.recentStoreTime}>{store.visitDate}</Text>
          <View style={styles.recentStorePoints}>
            <Text style={styles.recentStorePointsText}>+{store.pointsEarned} pts</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const CATEGORY_DATA: Category[] = [
  { id: 1, name: 'Food', icon: Utensils, color: '#002244', iconColor: '#fbbf24', shops: [{ name: 'KFC' }, { name: 'McDonalds' }, { name: 'Dominos' }, { name: 'Subway' }] },
  { id: 2, name: 'Clothing', icon: Shirt, color: '#002244', iconColor: '#818cf8', shops: [{ name: 'Zara' }, { name: 'H&M' }, { name: 'Nike' }, { name: 'Adidas' }] },
  { id: 3, name: 'Shopping', icon: ShoppingBag, color: '#002244', iconColor: '#f472b6', shops: [{ name: 'Amazon' }, { name: 'Target' }, { name: 'Walmart' }] },
  { id: 4, name: 'Electronics', icon: Monitor, color: '#002244', iconColor: '#38bdf8', shops: [{ name: 'Apple' }, { name: 'BestBuy' }, { name: 'Sony' }] },
  { id: 5, name: 'Beauty', icon: Scissors, color: '#002244', iconColor: '#e879f9', shops: [{ name: 'Sephora' }, { name: 'Ulta' }, { name: 'MAC' }] },
];

interface CustomerHomeProps {
  offers: Offer[];
  merchants?: Merchant[];
  recentStores?: Store[];
  balance: number;
  onOpenWallet: () => void;
  onScan: () => void;
}

const CustomerHome: React.FC<CustomerHomeProps> = ({
  offers,
  merchants = [],
  recentStores = [],
  balance,
  onOpenWallet,
  onScan,
}) => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Unread notification count — drives the badge on the bell icon
  const { data: notifData } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: 'cache-and-network',
  });
  const unreadCount: number = (notifData?.notifications || []).filter((n: any) => !n.read).length;

  const scrollViewRef = useRef<ScrollView>(null);
  const mainScrollViewRef = useRef<any>(null);
  const merchantScrollRef = useRef<ScrollView>(null);

  const scrollX         = useRef(0);
  const merchantScrollX = useRef(0);

  // Offer scroll  (card 280 + gap 12 = 292)
  const OFFER_STEP = 292;
  const scrollRight = () => {
    const nextX = scrollX.current + OFFER_STEP;
    scrollViewRef.current?.scrollTo({ x: nextX, animated: true });
    scrollX.current = nextX;
  };
  const scrollLeft = () => {
    const nextX = Math.max(0, scrollX.current - OFFER_STEP);
    scrollViewRef.current?.scrollTo({ x: nextX, animated: true });
    scrollX.current = nextX;
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.current = event.nativeEvent.contentOffset.x;
  };

  // Merchant scroll — card 300 + gap 16 = 316 per step
  const MERCHANT_STEP = MERCHANT_CARD_W + 16;
  const merchantScrollRight = () => {
    const nextX = merchantScrollX.current + MERCHANT_STEP;
    merchantScrollRef.current?.scrollTo({ x: nextX, animated: true });
    merchantScrollX.current = nextX;
  };
  const merchantScrollLeft = () => {
    const nextX = Math.max(0, merchantScrollX.current - MERCHANT_STEP);
    merchantScrollRef.current?.scrollTo({ x: nextX, animated: true });
    merchantScrollX.current = nextX;
  };
  const handleMerchantScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    merchantScrollX.current = event.nativeEvent.contentOffset.x;
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenWrapper
        scroll
        ref={mainScrollViewRef}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.userName}>Alex Johnson</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(customer)/notifications' as any)}
          >
            <Bell size={20} color="#475569" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                {unreadCount < 10 && (
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Membership Card */}
        <View>
          <TouchableOpacity onPress={onOpenWallet} style={styles.membershipCard}>
            <View style={styles.cardGradient}>
              {/* Background Pattern */}
              <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', borderRadius: 20 }]}>
                <Crown
                  size={240}
                  color="#ffffff"
                  style={{ position: 'absolute', right: -60, bottom: -60, opacity: 0.04, transform: [{ rotate: '-20deg' }] }}
                />
                <View style={{ position: 'absolute', top: -100, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: '#ffffff', opacity: 0.02 }} />
              </View>

              <View style={styles.cardHeader}>
                <View style={styles.memberBadge}>
                  <Crown size={14} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.memberText}>Gold Member</Text>
                </View>
              </View>

              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 12 }}>
                <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, textAlign: 'center' }}>
                  Available Balance
                </Text>
                <Text style={{ fontSize: 48, fontWeight: '900', color: '#ffffff', letterSpacing: -1, textAlign: 'center' }}>
                  {(balance || 0).toLocaleString()}
                  <Text style={{ fontSize: 20, color: '#fbbf24', fontWeight: '700' }}> dandan</Text>
                </Text>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Next: Platinum</Text>
                  <Text style={styles.progressPercentage}>75%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '75%' }]} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, opacity: 0.5 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }) }}>ID: 8839201</Text>
                  <Text style={{ color: '#fff', fontSize: 10, fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }) }}>09/28</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {( [
            { icon: Gift, label: 'Rewards', color: '#faf5ff', iconColor: '#9333ea', action: () => router.push('/(customer)/rewards') },
            { icon: MapPin, label: 'Nearby', color: '#ecfdf5', iconColor: '#059669', action: () => router.push('/(customer)/nearby') },
            { icon: Trophy, label: 'Games', color: '#fffbeb', iconColor: '#d97706', action: () => router.push('/(customer)/games') },
          ] as const).map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={idx}
                onPress={item.action}
                style={styles.actionButton}>
                <View style={[styles.actionIcon, { backgroundColor: item.color }]}>
                  <IconComponent size={24} color={item.iconColor} />
                </View>
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* For You / Hot Offers */}
        {(() => {
          const anyHot = offers.some(o => isHot(o.stock));
          const anyLow = !anyHot && offers.some(o => isLow(o.stock));
          return (
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.sectionTitle}>For You</Text>
                {anyHot && (
                  <View style={styles.hotLabel}>
                    <Text style={styles.hotLabelText}>🔥 Hot</Text>
                  </View>
                )}
                {anyLow && (
                  <View style={[styles.hotLabel, { backgroundColor: '#fffbeb', borderColor: '#fcd34d' }]}>
                    <Text style={[styles.hotLabelText, { color: '#d97706' }]}>⚡ Low stock</Text>
                  </View>
                )}
              </View>
              <View style={styles.scrollButtons}>
                <TouchableOpacity onPress={scrollLeft} style={styles.scrollButton}>
                  <ChevronLeft size={16} color="#4f46e5" />
                </TouchableOpacity>
                <TouchableOpacity onPress={scrollRight} style={styles.scrollButton}>
                  <ChevronRight size={16} color="#4f46e5" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}

        {offers && offers.length > 0 ? (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={OFFER_STEP}
            snapToAlignment="start"
            style={styles.offersScroll}
            contentContainerStyle={styles.offersContainer}>
            {offers.map((offer, i) => (
              <OfferCardItem
                key={offer.id ?? i}
                offer={offer}
                index={i}
                onPress={() => {
                  router.push({
                    pathname: '/(customer)/offer-details' as any,
                    params: { offer: JSON.stringify(offer) }
                  });
                }}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.offersEmpty}>
            <Text style={styles.offersEmptyText}>
              No rewards available right now. Check back soon!
            </Text>
          </View>
        )}

        {/* Top Merchants */}
        {merchants.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Merchants</Text>
              <View style={styles.scrollButtons}>
                <TouchableOpacity onPress={merchantScrollLeft} style={styles.scrollButton}>
                  <ChevronLeft size={16} color="#4f46e5" />
                </TouchableOpacity>
                <TouchableOpacity onPress={merchantScrollRight} style={styles.scrollButton}>
                  <ChevronRight size={16} color="#4f46e5" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              ref={merchantScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={handleMerchantScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={MERCHANT_STEP}
              snapToAlignment="start"
              style={styles.merchantsScroll}
              contentContainerStyle={styles.merchantsContainer}
            >
              {merchants.map((merchant, i) => (
                <MerchantCard
                  key={merchant.id ?? i}
                  merchant={merchant}
                  index={i}
                  onPress={() => {
                    if (merchant.topOffer) {
                      router.push({
                        pathname: '/(customer)/offer-details' as any,
                        params: {
                          offer: JSON.stringify({
                            id:        merchant.topOffer.id,
                            title:     merchant.topOffer.title,
                            desc:      `From ${merchant.name}`,
                            image:     merchant.topOffer.image || merchant.image,
                            discount:  merchant.topOffer.discount,
                            price:     merchant.topOffer.price,
                            storeName: merchant.name,
                          }),
                        },
                      });
                    }
                  }}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}>
          {CATEGORY_DATA.map((cat) => (
            <CategoryAccordionItem
              key={cat.id}
              cat={cat}
              isActive={activeCategory === cat.id}
              onPress={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            />
          ))}
        </ScrollView>

        {/* Recently Visited Stores Section */}
        {recentStores && recentStores.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.sectionTitle}>Recently Visited</Text>
                <History size={16} color="#64748b" />
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See History</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recentStoresContainer}>
              {recentStores.map((store, i) => (
                <RecentStoreItem key={store.id} store={store} index={i} />
              ))}
            </View>
          </>
        )}

      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  notificationButton: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    backgroundColor: '#f43f5e',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 11,
  },
  membershipCard: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardGradient: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  memberText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressSection: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressPercentage: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  scrollButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  // ── "For You" section label badges ──────────────────────────────────────
  hotLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hotLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ef4444',
  },

  // ── Offer cards (image-left + text-right layout) ──────────────────────
  offersScroll: {
    marginBottom: 32,
    marginHorizontal: -24,
  },
  offersContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  offersEmpty: {
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    alignItems: 'center',
  },
  offersEmptyText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  offerCard: {
    width: 280,
    height: 112,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  // Left: square image
  offerImageWrap: {
    width: 112,
    height: 112,
    position: 'relative',
    overflow: 'hidden',
  },
  // Local require() assets: explicit px dimensions so RN scales them down
  // instead of rendering at natural resolution then overflowing the container.
  offerLocalImage: {
    width: 112,
    height: 112,
  },
  offerImagePlaceholder: {
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerHotBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  offerHotBadgeText: {
    fontSize: 14,
  },
  // Right: text body
  offerBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    gap: 3,
  },
  offerStoreName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    lineHeight: 19,
    letterSpacing: -0.2,
  },
  offerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  offerPointsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  offerPointsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4f46e5',
  },
  offerPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  offerStockRow: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  offerStockText: {
    fontSize: 10,
    fontWeight: '800',
  },
  categoriesScroll: {
    marginBottom: 32,
    marginHorizontal: -24,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  categoryAccordionWrapper: {
    overflow: 'hidden',
    height: 96,
    borderRadius: 24,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 36,
    borderBottomRightRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  tagHole: {
    position: 'absolute',
    left: 8,
    top: 42,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    zIndex: 10,
  },
  categoryAccordionInner: {
    flexDirection: 'row',
    width: 380,
    height: '100%',
  },
  categoryMainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    paddingLeft: 12,
    gap: 6,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  categoryShopsWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 4,
  },
  shopsScrollContent: {
    gap: 12,
    paddingRight: 32,
    alignItems: 'center',
  },
  shopItem: {
    alignItems: 'center',
    width: 56,
    gap: 4,
  },
  shopImagePlaceHolder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopIconText: {
    fontSize: 20,
    fontWeight: '800',
  },
  shopName: {
    fontSize: 10,
    fontWeight: '700',
  },
  recentStoresContainer: {
    gap: 12,
    marginBottom: 32,
  },

  // ── Merchant carousel — membership-card style ─────────────────────────
  merchantsScroll: {
    marginBottom: 32,
    marginHorizontal: -24,
  },
  merchantsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  // Same aspect ratio as the membership card (1.586 ≈ standard credit card)
  merchantCard: {
    width: MERCHANT_CARD_W,
    aspectRatio: 1.586,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  merchantFallbackBg: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  merchantBgCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ffffff',
    opacity: 0.06,
  },
  merchantBgEmoji: {
    fontSize: 64,
    opacity: 0.55,
  },
  // Full-card scrim — heavier at bottom so footer text reads on any photo
  merchantScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  // TOP ROW
  merchantTopRow: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  merchantCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  merchantCategoryEmoji: {
    fontSize: 13,
  },
  merchantCategoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  merchantOpenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  merchantOpenDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  merchantOpenText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  // BOTTOM FOOTER — mirrors membership card footer layout
  merchantFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 24,      // room for the gradient fade
    paddingBottom: 14,
    backgroundColor: 'rgba(0,0,0,0.52)',
    gap: 5,
  },
  merchantFooterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  merchantName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  merchantOfferChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  merchantOfferText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: 0.3,
  },
  merchantMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    opacity: 0.8,
  },
  merchantRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  merchantRating: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fbbf24',
  },
  merchantAddrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  merchantAddr: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
  },
  recentStoreCard: {
    width: '100%',
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f1f5f9',
    flexDirection: 'row',
  },
  recentStoreImage: {
    width: 100,
    height: '100%',
  },
  recentStoreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  recentStoreContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  recentStoreName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  recentStoreMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentStoreTime: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  recentStorePoints: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentStorePointsText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#d97706',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
});

export default CustomerHome;
