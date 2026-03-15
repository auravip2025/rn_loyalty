import { useRouter } from 'expo-router';
import {
  CheckCircle,
  ChevronLeft,
  Coffee,
  Eraser,
  RefreshCw,
  Trophy,
  MapPin,
  UserPlus,
  Crown,
  Flame,
  Zap,
  Store,
  Gift,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../components/old_app/common/Button';
import Card from '../../components/old_app/common/Card';
import ScratchCardGame from '../../components/old_app/games/ScratchCardGame';
import SpinWheelGame from '../../components/old_app/games/SpinWheelGame';
import StampCardModal from '../../components/old_app/games/StampCardModal';

const iconMap = {
  RefreshCw,
  MapPin,
  Coffee,
  UserPlus,
  Trophy,
  Star: Crown,
};

const MerchantBadge = ({ merchant }) => {
  if (!merchant) return null;
  return (
    <View style={styles.merchantBadge}>
      <Image source={{ uri: merchant.image }} style={styles.merchantAvatar} />
      <View style={styles.merchantBadgeInfo}>
        <Text style={styles.merchantBadgeName}>
          {merchant.categoryEmoji} {merchant.name}
        </Text>
        <Text style={styles.merchantBadgeAddress} numberOfLines={1}>
          {merchant.address}
        </Text>
      </View>
      {merchant.offers && merchant.offers.length > 0 && (
        <View style={styles.merchantOfferTag}>
          <Gift size={10} color="#059669" />
          <Text style={styles.merchantOfferTagText}>
            {merchant.offers.length} offer{merchant.offers.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const GamesScreen = ({
  programs,
  merchants,
  dailyQuests,
  dailySpinUsed,
  setDailySpinUsed,
  dailyScratchUsed,
  setDailyScratchUsed,
  setActiveCoupon,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showWheel, setShowWheel] = useState(false);
  const [showScratch, setShowScratch] = useState(false);
  const [showStamps, setShowStamps] = useState(false);

  const wheelProgram = programs?.find(p => p.name === 'Wheel of Fortune' && p.active);
  const scratchProgram = programs?.find(p => p.name === 'Scratch & Win' && p.active);
  const stampsProgram = programs?.find(p => p.name === 'Digital Stamps' && p.active);

  const getMerchant = (program) => {
    if (!program?.merchantId || !merchants) return null;
    return merchants.find(m => m.id === program.merchantId);
  };

  const wheelMerchant = getMerchant(wheelProgram);
  const scratchMerchant = getMerchant(scratchProgram);
  const stampsMerchant = getMerchant(stampsProgram);

  const navigateToCheckout = (prize, merchant) => {
    if (!merchant) return;

    const cartItem = {
      id: `prize-${Date.now()}`,
      title: prize.label,
      price: prize.type === 'discount' ? 0 : 0,
      quantity: 1,
    };

    router.push({
      pathname: '/(customer)/checkout',
      params: {
        cartStr: JSON.stringify([cartItem]),
        totalAmount: '0',
        merchantName: merchant.name,
      },
    });
  };

  const handleWin = (prize, type) => {
    if (type === 'wheel') setDailySpinUsed(true);
    if (type === 'scratch') setDailyScratchUsed(true);

    const merchant = type === 'wheel' ? wheelMerchant : scratchMerchant;

    if (prize.type === 'discount' || prize.type === 'item') {
      setActiveCoupon(prize);
      // Close the game modal first, then navigate after a short delay
      setTimeout(() => {
        if (type === 'wheel') setShowWheel(false);
        if (type === 'scratch') setShowScratch(false);
        setTimeout(() => navigateToCheckout(prize, merchant), 300);
      }, 1500);
    } else if (prize.type === 'points' || prize.type === 'multiplier') {
      Alert.alert(
        '🎉 You Won!',
        `${prize.label} has been added to your wallet!`,
        [{ text: 'Awesome!' }]
      );
    }
    // 'none' type — game modal handles "try again" UI
  };

  const gamePrograms = [wheelProgram, scratchProgram, stampsProgram].filter(Boolean);
  const completedQuests = dailyQuests?.filter(q => q.completed)?.length || 0;
  const totalQuests = (dailyQuests?.length || 0) + gamePrograms.length;
  const completedTotal = completedQuests + (dailySpinUsed ? 1 : 0) + (dailyScratchUsed ? 1 : 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Games & Quests</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Stats Banner */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsBanner}>
          <View style={styles.statsIcon}>
            <Flame size={28} color="#f59e0b" />
          </View>
          <View style={styles.statsInfo}>
            <Text style={styles.statsTitle}>Today's Progress</Text>
            <Text style={styles.statsSubtitle}>
              {completedTotal}/{totalQuests} completed
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Zap size={14} color="#f59e0b" />
            <Text style={styles.streakText}>5 day streak</Text>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: totalQuests > 0 ? `${(completedTotal / totalQuests) * 100}%` : '0%' }]} />
          </View>
        </Animated.View>

        {/* Games Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>🎮 Merchant Games</Text>
        </Animated.View>

        {/* Wheel of Fortune */}
        {wheelProgram && (
          <Animated.View entering={FadeInDown.delay(350).duration(500)}>
            <Card style={styles.gameCard}>
              <View style={styles.gameCardLeft}>
                <View style={[styles.gameIcon, { backgroundColor: '#fffbeb' }]}>
                  <RefreshCw size={32} color="#d97706" />
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName}>{wheelProgram.name}</Text>
                  <Text style={styles.gameDesc}>
                    {dailySpinUsed ? '✅ Completed today' : 'Spin to win prizes & points!'}
                  </Text>
                  <Text style={styles.gameReward}>Up to 500 points</Text>
                </View>
              </View>
              <MerchantBadge merchant={wheelMerchant} />
              <Button
                variant="primary"
                onPress={() => !dailySpinUsed && setShowWheel(true)}
                disabled={dailySpinUsed}
                style={[styles.playButton, dailySpinUsed && styles.playButtonDisabled]}>
                <Text style={styles.playButtonText}>
                  {dailySpinUsed ? 'Done' : '▶ Play'}
                </Text>
              </Button>
            </Card>
          </Animated.View>
        )}

        {/* Scratch & Win */}
        {scratchProgram && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <Card style={styles.gameCard}>
              <View style={styles.gameCardLeft}>
                <View style={[styles.gameIcon, { backgroundColor: '#fff1f2' }]}>
                  <Eraser size={32} color="#e11d48" />
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName}>{scratchProgram.name}</Text>
                  <Text style={styles.gameDesc}>
                    {dailyScratchUsed ? '✅ Completed today' : 'Scratch & reveal your prize!'}
                  </Text>
                  <Text style={styles.gameReward}>Coupons & discounts</Text>
                </View>
              </View>
              <MerchantBadge merchant={scratchMerchant} />
              <Button
                variant="primary"
                onPress={() => !dailyScratchUsed && setShowScratch(true)}
                disabled={dailyScratchUsed}
                style={[styles.playButton, { backgroundColor: '#e11d48' }, dailyScratchUsed && styles.playButtonDisabled]}>
                <Text style={styles.playButtonText}>
                  {dailyScratchUsed ? 'Done' : '▶ Play'}
                </Text>
              </Button>
            </Card>
          </Animated.View>
        )}

        {/* Digital Stamps */}
        {stampsProgram && (
          <Animated.View entering={FadeInDown.delay(450).duration(500)}>
            <Card style={styles.gameCard}>
              <View style={styles.gameCardLeft}>
                <View style={[styles.gameIcon, { backgroundColor: '#ecfdf5' }]}>
                  <Coffee size={32} color="#059669" />
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameName}>{stampsProgram.name}</Text>
                  <Text style={styles.gameDesc}>6/10 stamps collected</Text>
                  <Text style={styles.gameReward}>Free coffee at 10!</Text>
                </View>
              </View>
              <MerchantBadge merchant={stampsMerchant} />
              <Button
                variant="primary"
                onPress={() => setShowStamps(true)}
                style={[styles.playButton, { backgroundColor: '#059669' }]}>
                <Text style={styles.playButtonText}>View</Text>
              </Button>
            </Card>
          </Animated.View>
        )}

        {/* Platform Quests Section */}
        {dailyQuests && dailyQuests.length > 0 && (
          <>
            <Animated.View entering={FadeInDown.delay(500).duration(500)}>
              <Text style={[styles.sectionTitle, { marginTop: 28 }]}>⚡ Platform Quests</Text>
            </Animated.View>

            {dailyQuests.map((quest, idx) => {
              const IconComp = iconMap[quest.icon] || Trophy;
              return (
                <Animated.View key={quest.id} entering={FadeInDown.delay(550 + idx * 60).duration(500)}>
                  <Card style={[styles.questCard, quest.completed && styles.questCardCompleted]}>
                    <View style={[styles.questIcon, quest.completed && { backgroundColor: '#d1fae5' }]}>
                      {quest.completed
                        ? <CheckCircle size={24} color="#059669" />
                        : <IconComp size={24} color="#0f172a" />
                      }
                    </View>
                    <View style={styles.questInfo}>
                      <Text style={[styles.questName, quest.completed && { textDecorationLine: 'line-through', color: '#94a3b8' }]}>
                        {quest.title}
                      </Text>
                      <Text style={styles.questDesc}>{quest.desc}</Text>
                    </View>
                    <View style={[styles.pointsBadge, quest.completed && { backgroundColor: '#d1fae5' }]}>
                      <Text style={[styles.pointsText, quest.completed && { color: '#059669' }]}>
                        +{quest.points} pts
                      </Text>
                    </View>
                  </Card>
                </Animated.View>
              );
            })}
          </>
        )}

        {/* Empty State */}
        {!wheelProgram && !scratchProgram && !stampsProgram && (!dailyQuests || dailyQuests.length === 0) && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View style={styles.emptyState}>
              <Trophy size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No Active Games</Text>
              <Text style={styles.emptyDesc}>Check back later for new quests and games!</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 12,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsInfo: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400e',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 12,
  },
  gameCard: {
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    padding: 16,
  },
  gameCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 3,
  },
  gameDesc: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  gameReward: {
    fontSize: 11,
    color: '#d97706',
    fontWeight: '700',
  },
  // Merchant Badge
  merchantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  merchantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#e2e8f0',
  },
  merchantBadgeInfo: {
    flex: 1,
  },
  merchantBadgeName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 1,
  },
  merchantBadgeAddress: {
    fontSize: 10,
    color: '#94a3b8',
  },
  merchantOfferTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  merchantOfferTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  playButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f59e0b',
    alignSelf: 'flex-end',
    borderRadius: 12,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  playButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  questCardCompleted: {
    opacity: 0.7,
    borderColor: '#d1fae5',
  },
  questIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questInfo: {
    flex: 1,
  },
  questName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 3,
  },
  questDesc: {
    fontSize: 11,
    color: '#64748b',
  },
  pointsBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pointsText: {
    color: '#d97706',
    fontWeight: '900',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#94a3b8',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#cbd5e1',
  },
});

export default GamesScreen;
