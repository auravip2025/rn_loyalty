import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  PieChart,
  TrendingUp,
  Gift,
  Zap,
} from 'lucide-react-native';
import Card from '../../components/old_app/common/Card';

const CustomerAnalytics = () => {
  const monthlyData = [
    { month: 'Jan', spend: 450, saved: 45 },
    { month: 'Feb', spend: 320, saved: 30 },
    { month: 'Mar', spend: 550, saved: 80 },
    { month: 'Apr', spend: 480, saved: 55 },
    { month: 'May', spend: 600, saved: 120 },
    { month: 'Jun', spend: 380, saved: 40 },
  ];

  const pointsData = [
    { month: 'Jan', points: 1200 },
    { month: 'Feb', points: 950 },
    { month: 'Mar', points: 1600 },
    { month: 'Apr', points: 1100 },
    { month: 'May', points: 2100 },
    { month: 'Jun', points: 1750 },
  ];

  const maxPoints = Math.max(...pointsData.map(d => d.points));

  const categories = [
    { name: 'Food & Dining', percent: 65, color: '#f97316' },
    { name: 'Shopping', percent: 20, color: '#3b82f6' },
    { name: 'Transport', percent: 10, color: '#10b981' },
    { name: 'Others', percent: 5, color: '#94a3b8' },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <View style={styles.headerIcon}>
          <PieChart size={20} color="#475569" />
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <Card style={[styles.summaryCard, styles.summaryCardDark]}>
          <View style={styles.summaryIcon}>
            <TrendingUp size={18} color="#ffffff" />
          </View>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>$2,780</Text>
          <Text style={styles.summaryChange}>+12% vs last month</Text>
        </Card>

        <Card style={[styles.summaryCard, styles.summaryCardGreen]}>
          <View style={[styles.summaryIcon, styles.summaryIconLight]}>
            <Gift size={18} color="#ffffff" />
          </View>
          <Text style={styles.summaryLabel}>Total Saved</Text>
          <Text style={styles.summaryValue}>$370</Text>
          <Text style={styles.summaryChange}>13% Savings Rate</Text>
        </Card>
      </View>

      {/* Monthly Activity */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>Monthly Activity</Text>
        <View style={styles.chartBars}>
          {monthlyData.map((d, i) => (
            <View key={i} style={styles.barGroup}>
              <View style={styles.bars}>
                <View
                  style={[
                    styles.barSpend,
                    { height: `${(d.spend / 600) * 100}%` },
                  ]}
                />
                <View
                  style={[
                    styles.barSaved,
                    { height: `${(d.saved / 600) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{d.month}</Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotSpend]} />
            <Text style={styles.legendText}>Spend</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotSaved]} />
            <Text style={styles.legendText}>Saved</Text>
          </View>
        </View>
      </Card>

      {/* Points Activity */}
      <Card style={styles.chartCard}>
        <View style={styles.pointsHeader}>
          <View>
            <Text style={styles.chartTitle}>Points Activity</Text>
            <Text style={styles.chartSubtitle}>Earned over last 6 months</Text>
          </View>
          <View style={styles.pointsIcon}>
            <Zap size={16} color="#f59e0b" />
          </View>
        </View>

        <View style={styles.pointsChart}>
          {/* Grid Lines */}
          <View style={styles.pointsGrid}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>

          {/* Bars */}
          <View style={styles.pointsBars}>
            {pointsData.map((d, i) => (
              <View key={i} style={styles.pointsBarGroup}>
                <View
                  style={[
                    styles.pointsBar,
                    { height: `${(d.points / maxPoints) * 80}%` },
                  ]}
                />
                <Text style={styles.pointsBarLabel}>{d.month}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      {/* Category Breakdown */}
      <View style={styles.categoriesSection}>
        <Text style={styles.categoriesTitle}>Top Categories</Text>
        <View style={styles.categoriesList}>
          {categories.map((cat, i) => (
            <View key={i} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryPercent}>{cat.percent}%</Text>
              </View>
              <View style={styles.categoryBar}>
                <View
                  style={[
                    styles.categoryBarFill,
                    { width: `${cat.percent}%`, backgroundColor: cat.color },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderWidth: 0,
  },
  summaryCardDark: {
    backgroundColor: '#0f172a',
  },
  summaryCardGreen: {
    backgroundColor: '#059669',
  },
  summaryIcon: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIconLight: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  summaryChange: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    opacity: 0.8,
  },
  chartCard: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 16,
  },
  chartSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 128,
    marginBottom: 16,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: '100%',
  },
  barSpend: {
    width: 8,
    backgroundColor: '#cbd5e1',
    borderRadius: 4,
  },
  barSaved: {
    width: 8,
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotSpend: {
    backgroundColor: '#cbd5e1',
  },
  legendDotSaved: {
    backgroundColor: '#10b981',
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pointsIcon: {
    padding: 8,
    backgroundColor: '#fffbeb',
    borderRadius: 20,
  },
  pointsChart: {
    height: 160,
    position: 'relative',
  },
  pointsGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  pointsBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 24,
  },
  pointsBarGroup: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  pointsBar: {
    width: 24,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    minHeight: 4,
  },
  pointsBarLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginTop: 8,
    position: 'absolute',
    bottom: -20,
  },
  categoriesSection: {
    marginTop: 8,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 16,
  },
  categoriesList: {
    gap: 16,
  },
  categoryItem: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  categoryPercent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default CustomerAnalytics;
