import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gift,
  MapPin,
  Trophy,
  Utensils,
  Shirt,
  ShoppingBag,
  Monitor,
  Scissors,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const OfferCardItem = ({ offer, index, onPress }) => {
  const translateX = useSharedValue(200);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // Reset values
      translateX.value = 200;
      rotate.value = 0;
      opacity.value = 0;

      const DELAY = index * 300;

      // Fade in
      opacity.value = withDelay(DELAY, withTiming(1, { duration: 600 }));

      // Slide In
      translateX.value = withDelay(DELAY, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }));

      // Rotation Wobble - Starts after slide-in
      rotate.value = withDelay(DELAY + 600, withSequence(
        withTiming(2, { duration: 400, easing: Easing.inOut(Easing.quad) }),  // Tilt right
        withTiming(-2, { duration: 400, easing: Easing.inOut(Easing.quad) }), // Tilt left
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) }),   // Tilt right (smaller)
        withTiming(-1, { duration: 400, easing: Easing.inOut(Easing.quad) }),  // Tilt left (smaller)
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.quad) })     // Center
      ));
    }
  }, [isFocused, index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` }
      ]
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={onPress} style={styles.offerCard}>
        <Image source={{ uri: offer.image }} style={styles.offerImage} />
        <View style={styles.offerOverlay} />
        <View style={styles.offerContent}>
          <Text style={styles.offerDesc}>{offer.desc}</Text>
          <Text style={styles.offerTitle}>{offer.title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Shimmer = ({ width = 160, duration = 2000, delay = 0 }) => {
  const translateX = useSharedValue(-width);

  React.useEffect(() => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(width * 2, {
          duration: duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        -1,
        false
      )
    );
  }, [delay, duration, width]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        {
          overflow: 'hidden',
          zIndex: 10,
        },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          {
            width: width,
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            transform: [{ skewX: '-20deg' }],
          },
          animatedStyle,
        ]}
      />
    </Animated.View>
  );
};

const CATEGORY_DATA = [
  { id: 1, name: 'Food', icon: Utensils, color: '#1e293b', iconColor: '#fbbf24', shops: [{name: 'KFC'}, {name: 'McDonalds'}, {name: 'Dominos'}, {name: 'Subway'}] },
  { id: 2, name: 'Clothing', icon: Shirt, color: '#1e293b', iconColor: '#818cf8', shops: [{name: 'Zara'}, {name: 'H&M'}, {name: 'Nike'}, {name: 'Adidas'}] },
  { id: 3, name: 'Shopping', icon: ShoppingBag, color: '#1e293b', iconColor: '#f472b6', shops: [{name: 'Amazon'}, {name: 'Target'}, {name: 'Walmart'}] },
  { id: 4, name: 'Electronics', icon: Monitor, color: '#1e293b', iconColor: '#38bdf8', shops: [{name: 'Apple'}, {name: 'BestBuy'}, {name: 'Sony'}] },
  { id: 5, name: 'Beauty', icon: Scissors, color: '#1e293b', iconColor: '#e879f9', shops: [{name: 'Sephora'}, {name: 'Ulta'}, {name: 'MAC'}] },
];

const CategoryAccordionItem = ({ cat, isActive, onPress }) => {
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
          <Text style={[styles.categoryName, { color: cat.iconColor }]} numberOfLines={1}>{cat.name}</Text>
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

const CustomerHome = ({
  offers,
  balance,
  onOpenWallet,
  onScan,
}) => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(null);

  const scrollViewRef = useRef(null);
  const mainScrollViewRef = useRef(null);

  const scrollX = useRef(0);

  const scrollRight = () => {
    const nextX = scrollX.current + 172; // Card width (160) + gap (12)
    scrollViewRef.current?.scrollTo({ x: nextX, animated: true });
    scrollX.current = nextX;
  };

  const scrollLeft = () => {
    const nextX = Math.max(0, scrollX.current - 172);
    scrollViewRef.current?.scrollTo({ x: nextX, animated: true });
    scrollX.current = nextX;
  };

  const handleScroll = (event) => {
    scrollX.current = event.nativeEvent.contentOffset.x;
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
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={20} color="#475569" />
            <View style={styles.notificationBadge} />
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
                  {balance.toLocaleString()}
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
          {[
            { icon: Gift, label: 'Rewards', color: '#faf5ff', iconColor: '#9333ea', action: () => router.push('/(customer)/rewards') },
            { icon: MapPin, label: 'Nearby', color: '#ecfdf5', iconColor: '#059669', action: () => router.push('/(customer)/nearby') },
            { icon: Trophy, label: 'Games', color: '#fffbeb', iconColor: '#d97706', action: () => router.push('/(customer)/games') },
          ].map((item, idx) => {
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

        {/* Offers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>For You</Text>
          <View style={styles.scrollButtons}>
            <TouchableOpacity onPress={scrollLeft} style={styles.scrollButton}>
              <ChevronLeft size={16} color="#4f46e5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={scrollRight} style={styles.scrollButton}>
              <ChevronRight size={16} color="#4f46e5" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.offersScroll}
          contentContainerStyle={styles.offersContainer}>
          {offers?.map((offer, i) => (
            <OfferCardItem
              key={i}
              offer={offer}
              index={i}
              onPress={() => {
                router.push({
                  pathname: '/(customer)/offer-details',
                  params: { offer: JSON.stringify(offer) }
                });
              }}
            />
          ))}
        </ScrollView>

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

      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    // paddingBottom: 100, // Handled by wrapper
    // paddingHorizontal: 24, // Handled by wrapper
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
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    backgroundColor: '#f43f5e',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
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
  qrIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  balanceUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
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
  offersScroll: {
    marginBottom: 32,
    marginHorizontal: -24,
  },
  offersContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  offerCard: {
    width: 160,
    height: 144,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  offerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  offerContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  offerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fbbf24', // Gold/Yellow for the deal
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  offerDesc: {
    fontSize: 20, // Much bigger merchant name
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
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
});

export default CustomerHome;
