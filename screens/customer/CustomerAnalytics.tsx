import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BarChart2,
  Coffee,
  Flame,
  Leaf,
  ShoppingBag,
  Shirt,
  Sparkles,
  TrendingUp,
  Utensils,
  Zap,
} from 'lucide-react-native';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Mock analytics data ───────────────────────────────────────────────────────
// In production these would come from a real analytics endpoint.
const MONTHLY = [
  { month: 'Dec', saved: 8.5,  rewards: 2, co2: 0.4 },
  { month: 'Jan', saved: 14.0, rewards: 3, co2: 0.6 },
  { month: 'Feb', saved: 11.5, rewards: 2, co2: 0.5 },
  { month: 'Mar', saved: 22.0, rewards: 5, co2: 1.1 },
  { month: 'Apr', saved: 18.5, rewards: 4, co2: 0.8 },
  { month: 'May', saved: 32.0, rewards: 6, co2: 1.4 },
];

const CATEGORIES = [
  { name: 'Coffee & Drinks', emoji: '☕', Icon: Coffee,      pct: 38, amount: 54.20, color: '#6366f1' },
  { name: 'Food & Meals',    emoji: '🍔', Icon: Utensils,    pct: 27, amount: 38.40, color: '#f59e0b' },
  { name: 'Beauty & Spa',    emoji: '💆', Icon: Sparkles,    pct: 18, amount: 25.60, color: '#ec4899' },
  { name: 'Shopping',        emoji: '🛍️', Icon: ShoppingBag, pct: 11, amount: 15.70, color: '#10b981' },
  { name: 'Fashion',         emoji: '👗', Icon: Shirt,       pct: 6,  amount: 8.50,  color: '#3b82f6' },
];

const WEEKLY = [
  { day: 'Mon', visits: 2 },
  { day: 'Tue', visits: 5 },
  { day: 'Wed', visits: 3 },
  { day: 'Thu', visits: 6 },
  { day: 'Fri', visits: 8 },
  { day: 'Sat', visits: 4 },
  { day: 'Sun', visits: 2 },
];

const CO2 = {
  totalKg: 4.8,
  treesEquivalent: 0.5,
  drivingKmAvoided: 19,
  greenRewards: 7,
  bottlesAvoided: 32,
};

// Derived summary stats
const TOTAL_SAVED   = MONTHLY.reduce((s, m) => s + m.saved, 0).toFixed(2);
const TOTAL_REWARDS = MONTHLY.reduce((s, m) => s + m.rewards, 0);
const TOTAL_CO2     = MONTHLY.reduce((s, m) => s + m.co2, 0).toFixed(1);

// ── Animated bar (individual) ─────────────────────────────────────────────────
const AnimatedBar = ({
  value, maxValue, barW, maxH, color, delay = 0,
}: {
  value: number; maxValue: number; barW: number; maxH: number;
  color: string; delay?: number;
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const targetH = maxValue > 0 ? (value / maxValue) * maxH : 4;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: targetH,
      duration: 600,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: barW,
        height: anim,
        borderRadius: 6,
        backgroundColor: color,
      }}
    />
  );
};

// ── Animated category bar ─────────────────────────────────────────────────────
const CategoryBar = ({
  pct, color, delay = 0,
}: { pct: number; color: string; delay?: number }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const maxW  = SCREEN_W - 48 - 120; // available width after label/pct

  useEffect(() => {
    Animated.timing(anim, {
      toValue: (pct / 100) * maxW,
      duration: 700,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{ height: 8, borderRadius: 6, backgroundColor: color, width: anim }}
    />
  );
};

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, sub }: { title: string; sub?: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {sub && <Text style={styles.sectionSub}>{sub}</Text>}
  </View>
);

// ── Main screen ───────────────────────────────────────────────────────────────
const CustomerAnalytics = ({ user }: { user?: any }) => {
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'You';

  const maxSaved   = Math.max(...MONTHLY.map(m => m.saved));
  const maxVisits  = Math.max(...WEEKLY.map(w => w.visits));
  const BAR_MAX_H  = 80;
  const BAR_W      = 32;

  return (
    <ScreenWrapper scroll showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderIcon}>
          <BarChart2 size={22} color="#4f46e5" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Your Insights</Text>
          <Text style={styles.pageSub}>{firstName}'s loyalty & savings overview</Text>
        </View>
      </View>

      {/* ── Hero stat strip ─────────────────────────────────────────────── */}
      <View style={styles.statStrip}>
        <View style={[styles.statCard, { backgroundColor: '#eef2ff' }]}>
          <Text style={styles.statEmoji}>💰</Text>
          <Text style={[styles.statValue, { color: '#4f46e5' }]}>${TOTAL_SAVED}</Text>
          <Text style={styles.statLabel}>Total Saved</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
          <Text style={styles.statEmoji}>🎁</Text>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{TOTAL_REWARDS}</Text>
          <Text style={styles.statLabel}>Rewards Used</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f0fdf9' }]}>
          <Text style={styles.statEmoji}>🌿</Text>
          <Text style={[styles.statValue, { color: '#059669' }]}>{TOTAL_CO2} kg</Text>
          <Text style={styles.statLabel}>CO₂ Saved</Text>
        </View>
      </View>

      {/* ── Monthly savings bar chart ────────────────────────────────────── */}
      <View style={styles.card}>
        <SectionHeader title="Monthly Savings" sub="Rewards value redeemed per month" />
        <View style={styles.barChart}>
          {MONTHLY.map((m, i) => (
            <View key={m.month} style={styles.barCol}>
              <Text style={styles.barValue}>${m.saved.toFixed(0)}</Text>
              <View style={[styles.barTrack, { height: BAR_MAX_H }]}>
                <AnimatedBar
                  value={m.saved}
                  maxValue={maxSaved}
                  barW={BAR_W}
                  maxH={BAR_MAX_H}
                  color={i === MONTHLY.length - 1 ? '#4f46e5' : '#c7d2fe'}
                  delay={i * 80}
                />
              </View>
              <Text style={styles.barLabel}>{m.month}</Text>
            </View>
          ))}
        </View>
        {/* Trend callout */}
        <View style={styles.trendChip}>
          <TrendingUp size={13} color="#10b981" />
          <Text style={styles.trendText}>
            Up {Math.round(((MONTHLY[5].saved - MONTHLY[4].saved) / MONTHLY[4].saved) * 100)}% from last month
          </Text>
        </View>
      </View>

      {/* ── Category breakdown ───────────────────────────────────────────── */}
      <View style={styles.card}>
        <SectionHeader title="Spending by Category" sub="Where you redeem the most" />
        {CATEGORIES.map((cat, i) => {
          const CatIcon = cat.Icon;
          return (
            <View key={cat.name} style={styles.catRow}>
              <View style={[styles.catIconBox, { backgroundColor: cat.color + '1a' }]}>
                <CatIcon size={16} color={cat.color} />
              </View>
              <View style={styles.catInfo}>
                <View style={styles.catNameRow}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={[styles.catPct, { color: cat.color }]}>{cat.pct}%</Text>
                </View>
                <View style={styles.catBarTrack}>
                  <CategoryBar pct={cat.pct} color={cat.color} delay={i * 100} />
                </View>
                <Text style={styles.catAmount}>${cat.amount.toFixed(2)} saved</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Weekly activity ──────────────────────────────────────────────── */}
      <View style={styles.card}>
        <SectionHeader title="Weekly Activity" sub="Average visits per day of week" />
        <View style={styles.weekChart}>
          {WEEKLY.map((w, i) => (
            <View key={w.day} style={styles.weekCol}>
              <Text style={styles.weekCount}>{w.visits}</Text>
              <View style={[styles.barTrack, { height: 56 }]}>
                <AnimatedBar
                  value={w.visits}
                  maxValue={maxVisits}
                  barW={28}
                  maxH={56}
                  color={w.day === 'Fri' || w.day === 'Thu' ? '#4f46e5' : '#e0e7ff'}
                  delay={i * 70}
                />
              </View>
              <Text style={[
                styles.weekDay,
                (w.day === 'Fri' || w.day === 'Thu') && { color: '#4f46e5', fontWeight: '800' },
              ]}>
                {w.day}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.insightChip}>
          <Flame size={13} color="#f59e0b" />
          <Text style={styles.insightText}>Most active on Fridays — your favourite reward day!</Text>
        </View>
      </View>

      {/* ── Purchase patterns ────────────────────────────────────────────── */}
      <View style={styles.card}>
        <SectionHeader title="Purchase Patterns" sub="Your shopping behaviour" />
        <View style={styles.patternGrid}>
          <View style={[styles.patternTile, { backgroundColor: '#eef2ff' }]}>
            <Text style={styles.patternEmoji}>⏰</Text>
            <Text style={[styles.patternValue, { color: '#4f46e5' }]}>12–2 PM</Text>
            <Text style={styles.patternLabel}>Peak time</Text>
          </View>
          <View style={[styles.patternTile, { backgroundColor: '#fff7ed' }]}>
            <Text style={styles.patternEmoji}>📅</Text>
            <Text style={[styles.patternValue, { color: '#f59e0b' }]}>2.4×</Text>
            <Text style={styles.patternLabel}>Weekly visits</Text>
          </View>
          <View style={[styles.patternTile, { backgroundColor: '#ecfdf5' }]}>
            <Text style={styles.patternEmoji}>🏆</Text>
            <Text style={[styles.patternValue, { color: '#10b981' }]}>94%</Text>
            <Text style={styles.patternLabel}>Redemption rate</Text>
          </View>
          <View style={[styles.patternTile, { backgroundColor: '#fdf4ff' }]}>
            <Text style={styles.patternEmoji}>🎯</Text>
            <Text style={[styles.patternValue, { color: '#a855f7' }]}>3.1×</Text>
            <Text style={styles.patternLabel}>Avg items/visit</Text>
          </View>
        </View>
      </View>

      {/* ── 🌿 Green / CO2 impact ────────────────────────────────────────── */}
      <View style={[styles.card, styles.greenCard]}>
        <View style={styles.greenHeader}>
          <View style={styles.greenIconBox}>
            <Leaf size={20} color="#059669" />
          </View>
          <View>
            <Text style={styles.greenTitle}>Your Green Impact</Text>
            <Text style={styles.greenSub}>From eco-conscious reward choices</Text>
          </View>
        </View>

        {/* Big CO2 number */}
        <View style={styles.co2Hero}>
          <Text style={styles.co2Value}>{CO2.totalKg}</Text>
          <Text style={styles.co2Unit}>kg CO₂</Text>
          <Text style={styles.co2Label}>avoided this year</Text>
        </View>

        {/* Equivalents grid */}
        <View style={styles.equivGrid}>
          <View style={styles.equivTile}>
            <Text style={styles.equivEmoji}>🌳</Text>
            <Text style={styles.equivVal}>{CO2.treesEquivalent}</Text>
            <Text style={styles.equivLabel}>trees planted equivalent</Text>
          </View>
          <View style={styles.equivTile}>
            <Text style={styles.equivEmoji}>🚗</Text>
            <Text style={styles.equivVal}>{CO2.drivingKmAvoided} km</Text>
            <Text style={styles.equivLabel}>of driving avoided</Text>
          </View>
          <View style={styles.equivTile}>
            <Text style={styles.equivEmoji}>🍾</Text>
            <Text style={styles.equivVal}>{CO2.bottlesAvoided}</Text>
            <Text style={styles.equivLabel}>plastic bottles saved</Text>
          </View>
          <View style={styles.equivTile}>
            <Text style={styles.equivEmoji}>🎁</Text>
            <Text style={styles.equivVal}>{CO2.greenRewards}</Text>
            <Text style={styles.equivLabel}>green rewards redeemed</Text>
          </View>
        </View>

        {/* Monthly CO2 bar chart */}
        <Text style={styles.greenBarTitle}>Monthly CO₂ Reduction (kg)</Text>
        <View style={styles.co2BarRow}>
          {MONTHLY.map((m, i) => {
            const maxCo2 = Math.max(...MONTHLY.map(x => x.co2));
            const h = (m.co2 / maxCo2) * 48;
            return (
              <View key={m.month} style={styles.co2BarCol}>
                <AnimatedBar
                  value={m.co2}
                  maxValue={maxCo2}
                  barW={26}
                  maxH={48}
                  color="#34d399"
                  delay={i * 90}
                />
                <Text style={styles.co2BarLabel}>{m.month}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.greenBadgeRow}>
          <Zap size={12} color="#059669" />
          <Text style={styles.greenBadgeText}>
            You're in the top 15% of eco-conscious customers!
          </Text>
        </View>
      </View>

      {/* ── Loyalty milestones ───────────────────────────────────────────── */}
      <View style={styles.card}>
        <SectionHeader title="Loyalty Journey" sub="Milestones you've hit" />
        {[
          { emoji: '🥇', label: 'First Reward Redeemed',  done: true,  pts: null },
          { emoji: '🔥', label: '7-Day Streak',           done: true,  pts: 50 },
          { emoji: '🌿', label: 'First Green Reward',      done: true,  pts: 25 },
          { emoji: '💎', label: '10 Rewards Redeemed',     done: true,  pts: 100 },
          { emoji: '🚀', label: 'Silver Member',           done: true,  pts: 200 },
          { emoji: '👑', label: 'Gold Member',             done: false, pts: 300 },
          { emoji: '🏆', label: '30-Day Streak',           done: false, pts: 150 },
        ].map((m, i) => (
          <View key={i} style={styles.milestoneRow}>
            <View style={[styles.milestoneIcon, m.done ? styles.milestoneDone : styles.milestonePending]}>
              <Text style={{ fontSize: 16 }}>{m.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.milestoneName, !m.done && { color: '#94a3b8' }]}>{m.label}</Text>
              {m.pts && m.done && (
                <Text style={styles.milestonePts}>+{m.pts} bonus pts earned</Text>
              )}
              {!m.done && (
                <Text style={styles.milestoneLocked}>Not yet unlocked</Text>
              )}
            </View>
            {m.done && (
              <View style={styles.milestoneBadge}>
                <Text style={styles.milestoneBadgeText}>✓</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScreenWrapper>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Page header
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  pageHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  pageSub: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 1,
  },

  // Stat strip
  statStrip: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 3,
  },
  statEmoji: { fontSize: 20 },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },

  // Card wrapper
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Section header
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a' },
  sectionSub:   { fontSize: 11, color: '#94a3b8', fontWeight: '500', marginTop: 2 },

  // Bar chart (monthly)
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  barCol: { alignItems: 'center', gap: 4 },
  barTrack: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barValue: { fontSize: 9, fontWeight: '700', color: '#94a3b8', marginBottom: 2 },
  barLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8', marginTop: 4 },

  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  trendText: { fontSize: 12, fontWeight: '700', color: '#10b981' },

  // Category rows
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  catIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  catInfo: { flex: 1, gap: 4 },
  catNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName:   { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  catPct:    { fontSize: 13, fontWeight: '900' },
  catBarTrack: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    height: 8,
    overflow: 'hidden',
  },
  catAmount: { fontSize: 10, color: '#94a3b8', fontWeight: '500' },

  // Weekly chart
  weekChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  weekCol: { alignItems: 'center', gap: 4 },
  weekCount: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
  weekDay: { fontSize: 10, fontWeight: '600', color: '#94a3b8', marginTop: 4 },

  insightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  insightText: { fontSize: 12, fontWeight: '700', color: '#d97706' },

  // Pattern grid
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  patternTile: {
    width: (SCREEN_W - 32 - 36 - 10) / 2,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  patternEmoji: { fontSize: 22 },
  patternValue: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  patternLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', textAlign: 'center' },

  // Green card
  greenCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  greenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  greenIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenTitle: { fontSize: 16, fontWeight: '900', color: '#064e3b' },
  greenSub:   { fontSize: 11, color: '#6ee7b7', fontWeight: '600', marginTop: 1 },

  co2Hero: { alignItems: 'center', marginBottom: 20 },
  co2Value: { fontSize: 52, fontWeight: '900', color: '#059669', letterSpacing: -2, lineHeight: 58 },
  co2Unit:  { fontSize: 18, fontWeight: '700', color: '#059669', marginTop: -4 },
  co2Label: { fontSize: 13, color: '#065f46', fontWeight: '600', marginTop: 4 },

  equivGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  equivTile: {
    width: (SCREEN_W - 32 - 36 - 8) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  equivEmoji: { fontSize: 22 },
  equivVal:   { fontSize: 16, fontWeight: '900', color: '#059669' },
  equivLabel: { fontSize: 10, color: '#065f46', fontWeight: '600', textAlign: 'center', lineHeight: 14 },

  greenBarTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  co2BarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  co2BarCol: { alignItems: 'center', gap: 4 },
  co2BarLabel: { fontSize: 9, fontWeight: '600', color: '#6ee7b7', marginTop: 3 },

  greenBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  greenBadgeText: { fontSize: 12, fontWeight: '700', color: '#059669' },

  // Milestones
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneDone:    { backgroundColor: '#f0fdf4' },
  milestonePending: { backgroundColor: '#f8fafc' },
  milestoneName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  milestonePts:    { fontSize: 11, color: '#10b981', fontWeight: '600', marginTop: 2 },
  milestoneLocked: { fontSize: 11, color: '#cbd5e1', fontWeight: '500', marginTop: 2 },
  milestoneBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneBadgeText: { fontSize: 11, fontWeight: '900', color: '#ffffff' },
});

export default CustomerAnalytics;
