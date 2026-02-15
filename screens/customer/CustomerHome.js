import { useIsFocused } from '@react-navigation/native';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Crown,
  Eraser,
  Gift,
  MapPin,
  QrCode,
  RefreshCw,
  Trophy
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
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
import Button from '../../components/old_app/common/Button';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import ScratchCardGame from '../../components/old_app/games/ScratchCardGame';
import SpinWheelGame from '../../components/old_app/games/SpinWheelGame';
import StampCardModal from '../../components/old_app/games/StampCardModal';
import { OFFERS } from '../../utils/constants';
import NearbyStores from './NearbyStores';
import OfferDetails from './OfferDetails';
import Rewards from './Rewards';

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

const CustomerHome = ({
  programs,
  balance,
  onOpenWallet,
  onScan,
  dailySpinUsed,
  setDailySpinUsed,
  setActiveCoupon,
  dailyScratchUsed,
  setDailyScratchUsed,
  handleCheckout,
}) => {
  const [showWheel, setShowWheel] = useState(false);
  const [showScratch, setShowScratch] = useState(false);
  const [showStamps, setShowStamps] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedOffer, setSelectedOffer] = useState(null);

  const wheelProgram = programs.find(p => p.name === 'Wheel of Fortune' && p.active);
  const scratchProgram = programs.find(p => p.name === 'Scratch & Win' && p.active);
  const stampsProgram = programs.find(p => p.name === 'Digital Stamps' && p.active);

  const scrollViewRef = useRef(null);
  const mainScrollViewRef = useRef(null);
  const [gamesSectionY, setGamesSectionY] = useState(0);

  const scrollToGames = () => {
    mainScrollViewRef.current?.scrollToEnd({ animated: true });
  };

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

  const handleWin = (prize, type) => {
    if (type === 'wheel') setDailySpinUsed(true);
    if (type === 'scratch') setDailyScratchUsed(true);

    if (prize.type === 'discount') {
      setActiveCoupon(prize);
    }
  };

  if (currentView === 'nearby') {
    return <NearbyStores onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'rewards') {
    return (
      <Rewards
        onBack={() => setCurrentView('dashboard')}
        balance={balance}
        onRedeem={(reward) => {
          setSelectedOffer(reward);
          setCurrentView('offerDetails');
        }}
      />
    );
  }

  if (currentView === 'offerDetails' && selectedOffer) {
    return (
      <OfferDetails
        offer={selectedOffer}
        onBack={() => setCurrentView(selectedOffer.cost ? 'rewards' : 'dashboard')}
        onCheckout={handleCheckout}
      />
    );
  }

  return (
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
            <View style={styles.cardHeader}>
              <View style={styles.memberBadge}>
                <Crown size={14} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.memberText}>Gold Member</Text>
              </View>
              <View style={styles.qrIcon}>
                <QrCode size={20} color="#ffffff" />
              </View>
            </View>

            <Text style={styles.balanceAmount}>
              {balance.toLocaleString()}{' '}
              <Text style={styles.balanceUnit}>dandan</Text>
            </Text>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Next: Platinum</Text>
                <Text style={styles.progressPercentage}>75%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {[
          { icon: QrCode, label: 'Pay', color: '#eef2ff', iconColor: '#4f46e5', action: onScan },
          { icon: Gift, label: 'Rewards', color: '#faf5ff', iconColor: '#9333ea', action: () => setCurrentView('rewards') },
          { icon: MapPin, label: 'Nearby', color: '#ecfdf5', iconColor: '#059669', action: () => setCurrentView('nearby') },
          { icon: Trophy, label: 'Games', color: '#fffbeb', iconColor: '#d97706', action: scrollToGames },
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
        {OFFERS.map((offer, i) => (
          <OfferCardItem
            key={i}
            offer={offer}
            index={i}
            onPress={() => {
              setSelectedOffer(offer);
              setCurrentView('offerDetails');
            }}
          />
        ))}
      </ScrollView>

      {/* Daily Quests */}
      <View>
        <Text
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setGamesSectionY(layout.y);
          }}
          style={[styles.sectionTitle, styles.questsTitle]}
        >
          Daily Quests
        </Text>
      </View>

      <View style={styles.questsList}>
        {wheelProgram && (
          <Card style={styles.questCard}>
            <View style={styles.questIcon}>
              <RefreshCw size={28} color="#d97706" />
            </View>
            <View style={styles.questInfo}>
              <Text style={styles.questName}>{wheelProgram.name}</Text>
              <Text style={styles.questStatus}>
                {dailySpinUsed ? 'Come back tomorrow' : '1 Free daily attempt left'}
              </Text>
            </View>
            <Button
              variant="primary"
              onPress={() => !dailySpinUsed && setShowWheel(true)}
              disabled={dailySpinUsed}
              style={[styles.questButton, dailySpinUsed && styles.questButtonDisabled]}>
              <Text style={styles.questButtonText}>
                {dailySpinUsed ? 'Done' : 'Play'}
              </Text>
            </Button>
          </Card>
        )}

        {scratchProgram && (
          <Card style={styles.questCard}>
            <View style={[styles.questIcon, { backgroundColor: '#fff1f2' }]}>
              <Eraser size={28} color="#e11d48" />
            </View>
            <View style={styles.questInfo}>
              <Text style={styles.questName}>{scratchProgram.name}</Text>
              <Text style={styles.questStatus}>
                {dailyScratchUsed ? 'Come back tomorrow' : 'Scratch & reveal prize'}
              </Text>
            </View>
            <Button
              variant="primary"
              onPress={() => !dailyScratchUsed && setShowScratch(true)}
              disabled={dailyScratchUsed}
              style={[styles.questButton, dailyScratchUsed && styles.questButtonDisabled]}>
              <Text style={styles.questButtonText}>
                {dailyScratchUsed ? 'Done' : 'Play'}
              </Text>
            </Button>
          </Card>
        )}

        {stampsProgram && (
          <Card style={styles.questCard}>
            <View style={[styles.questIcon, { backgroundColor: '#ecfdf5' }]}>
              <Coffee size={28} color="#059669" />
            </View>
            <View style={styles.questInfo}>
              <Text style={styles.questName}>{stampsProgram.name}</Text>
              <Text style={styles.questStatus}>6/10 Stamps Collected</Text>
            </View>
            <Button
              variant="primary"
              onPress={() => setShowStamps(true)}
              style={[styles.questButton, { backgroundColor: '#059669' }]}>
              <Text style={styles.questButtonText}>View</Text>
            </Button>
          </Card>
        )}

        {!wheelProgram && !scratchProgram && !stampsProgram && (
          <Card style={styles.emptyQuestCard}>
            <Text style={styles.emptyQuestText}>No active games right now.</Text>
          </Card>
        )}
      </View>


      {/* Game Modals */}
      {showWheel && wheelProgram && (
        <SpinWheelGame
          onClose={() => setShowWheel(false)}
          segments={wheelProgram.segments}
          onWin={(prize) => handleWin(prize, 'wheel')}
        />
      )}

      {showScratch && scratchProgram && (
        <ScratchCardGame
          onClose={() => setShowScratch(false)}
          outcomes={scratchProgram.segments}
          onWin={(prize) => handleWin(prize, 'scratch')}
        />
      )}

      {showStamps && stampsProgram && (
        <StampCardModal
          onClose={() => setShowStamps(false)}
          program={stampsProgram}
        />
      )}
    </ScreenWrapper>
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
  questsTitle: {
    marginBottom: 16,
  },
  questsList: {
    gap: 12,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: '#fef3c7',
  },
  questIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questInfo: {
    flex: 1,
  },
  questName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  questStatus: {
    fontSize: 10,
    color: '#64748b',
  },
  questButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f59e0b',
  },
  questButtonDisabled: {
    opacity: 0.5,
  },
  questButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyQuestCard: {
    padding: 24,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  emptyQuestText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
});

export default CustomerHome;
