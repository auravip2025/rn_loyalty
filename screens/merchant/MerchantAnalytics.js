import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import {
  Clock,
  Package,
  Gift,
  Award,
  Settings,
  Plus,
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Sparkles,
  Search,
} from 'lucide-react-native';
import Card from '../../components/old_app/common/Card';
import Button from '../../components/old_app/common/Button';
import Badge from '../../components/old_app/common/Badge';
import RewardConfigEditor from '../../components/old_app/merchant/RewardConfigEditor';
import PropertyOverview from '../../components/old_app/merchant/PropertyOverview';

const { width } = Dimensions.get('window');

const MetricDetail = ({ metric, onBack }) => {
  const [timeRange, setTimeRange] = useState('1M');

  // Mock data generator based on metric type and range
  const getData = () => {
    const count = timeRange === '1M' ? 30 : 6; // 30 days or 6 months
    return Array.from({ length: count }, (_, i) => ({
      value: Math.floor(Math.random() * 100) + 20,
      label: timeRange === '1M' ? `${i + 1}` : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]
    }));
  };

  const data = getData();
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>{metric.label}</Text>
      </View>

      <View style={styles.rangeSelector}>
        {['1W', '1M', '3M', '6M', '1Y'].map((range) => (
          <TouchableOpacity
            key={range}
            onPress={() => setTimeRange(range)}
            style={[styles.rangeBtn, timeRange === range && styles.rangeBtnActive]}
          >
            <Text style={[styles.rangeText, timeRange === range && styles.rangeTextActive]}>
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.chartCard}>
        <Text style={styles.chartValue}>{metric.value}</Text>
        <Text style={[styles.chartChange, { color: metric.color }]}>{metric.change}</Text>

        <View style={styles.chartArea}>
          {data.map((d, i) => (
            <View key={i} style={styles.chartBarContainer}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: `${(d.value / maxVal) * 100}%`,
                    backgroundColor: metric.color,
                    opacity: 0.8
                  }
                ]}
              />
              {(timeRange !== '1M' || i % 5 === 0) && (
                <Text style={styles.chartLabel}>{d.label}</Text>
              )}
            </View>
          ))}
        </View>
      </Card>

      <Text style={styles.insightTitle}>Key Insights</Text>
      <View style={styles.insightGrid}>
        <Card style={styles.insightCard}>
          <Text style={styles.insightLabel}>Peak Time</Text>
          <Text style={styles.insightValue}>12:00 PM</Text>
        </Card>
        <Card style={styles.insightCard}>
          <Text style={styles.insightLabel}>Lowest</Text>
          <Text style={styles.insightValue}>3:00 AM</Text>
        </Card>
        <Card style={styles.insightCard}>
          <Text style={styles.insightLabel}>Average</Text>
          <Text style={styles.insightValue}>45/day</Text>
        </Card>
      </View>
    </View>
  );
};

const MerchantAnalytics = () => {
  const [selectedReward, setSelectedReward] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [prompt, setPrompt] = useState('');

  const [rewards, setRewards] = useState([
    { id: 1, title: 'Free Latte', points: 500, stock: 124, icon: Package },
    { id: 2, title: '$5 Discount', points: 1000, stock: '∞', icon: Gift },
    { id: 3, title: 'VIP Merch Bag', points: 5000, stock: 12, icon: Award },
  ]);

  const metrics = [
    { id: 'scans', label: 'Daily Scans', value: '128', change: '+14% vs avg', color: '#10b981', icon: Activity },
    { id: 'users', label: 'New Users', value: '42', change: '↑ 5.4% growth', color: '#6366f1', icon: Users },
    { id: 'cost', label: 'Acquisition Cost', value: '$8.50', change: '-12% vs market', color: '#f59e0b', icon: DollarSign },
    { id: 'roi', label: 'Total ROI', value: '4.2x', change: 'Top 5% Rank', color: '#f43f5e', icon: TrendingUp },
  ];

  const heatmapData = [20, 35, 80, 60, 90, 45, 30, 15];
  const hours = ['6AM', '12PM', '6PM', '12AM'];

  const handleUpdateReward = (updatedReward) => {
    setRewards(rewards.map(r => r.id === updatedReward.id ? updatedReward : r));
    setSelectedReward(null);
  };

  const handlePromptSubmit = () => {
    if (!prompt.trim()) return;

    const p = prompt.toLowerCase();
    let targetMetric = null;

    if (p.includes('user') || p.includes('growth')) targetMetric = metrics.find(m => m.id === 'users');
    else if (p.includes('scan') || p.includes('daily')) targetMetric = metrics.find(m => m.id === 'scans');
    else if (p.includes('cost') || p.includes('acquisition')) targetMetric = metrics.find(m => m.id === 'cost');
    else if (p.includes('roi') || p.includes('return')) targetMetric = metrics.find(m => m.id === 'roi');

    if (targetMetric) {
      setSelectedMetric(targetMetric);
      setPrompt('');
    } else {
      console.log('No matching metric found');
    }
  };

  if (selectedMetric) {
    return (
      <MetricDetail
        metric={selectedMetric}
        onBack={() => setSelectedMetric(null)}
      />
    );
  }

  if (selectedReward) {
    return (
      <RewardConfigEditor
        reward={selectedReward}
        onSave={handleUpdateReward}
        onBack={() => setSelectedReward(null)}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>

      {/* Property Overview Card */}
      <PropertyOverview />

      {/* AI Assistant Bar */}
      <View style={styles.aiContainer}>
        <View style={styles.aiInputWrapper}>
          <Sparkles size={16} color="#d946ef" style={styles.aiIcon} />
          <TextInput
            style={styles.aiInput}
            placeholder="Ask AI: 'Show user growth last month'..."
            placeholderTextColor="#94a3b8"
            value={prompt}
            onChangeText={setPrompt}
            onSubmitEditing={handlePromptSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handlePromptSubmit} style={styles.searchButton}>
            <Search size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <Card
            key={index}
            style={[styles.metricCard, { width: '47%', borderLeftColor: metric.color }]}
            onPress={() => setSelectedMetric(metric)}
          >
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              {metric.icon && <metric.icon size={16} color={metric.color} />}
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={[styles.metricChange, { color: metric.color }]}>
              {metric.change}
            </Text>
          </Card>
        ))}
      </View>

      {/* Redemption Heatmap */}
      <Card style={styles.heatmapCard}>
        <View style={styles.heatmapHeader}>
          <Text style={styles.heatmapTitle}>Redemption Heatmap</Text>
          <Clock size={16} color="#94a3b8" />
        </View>

        <View style={styles.heatmapBars}>
          {heatmapData.map((height, i) => (
            <View key={i} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  { height: `${height}%` },
                  i === 4 && styles.barHighlight
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.heatmapLabels}>
          {hours.map((hour, i) => (
            <Text key={i} style={styles.heatmapLabel}>{hour}</Text>
          ))}
        </View>
      </Card>

      {/* Reward Inventory */}
      <View style={styles.inventoryHeader}>
        <Text style={styles.inventoryTitle}>Reward Inventory</Text>
        <TouchableOpacity>
          <Text style={styles.exportButton}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rewardsList}>
        {rewards.map((reward) => (
          <Card
            key={reward.id}
            style={styles.rewardCard}
            onPress={() => setSelectedReward(reward)}
          >
            <View style={styles.rewardIcon}>
              <reward.icon size={24} color="#64748b" />
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>{reward.title}</Text>
              <View style={styles.rewardMeta}>
                <Badge color="indigo">{reward.points} pts</Badge>
                <Text style={styles.rewardStock}>Stock: {reward.stock}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.rewardSettings}
              onPress={() => setSelectedReward(reward)}
            >
              <Settings size={16} color="#64748b" />
            </TouchableOpacity>
          </Card>
        ))}
      </View>

      <Button variant="outline" style={styles.addRewardButton}>
        <Plus size={18} color="#64748b" />
        <Text style={styles.addRewardText}>Add New Reward</Text>
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricWrapper: {
    width: '48%',
  },
  metricCard: {
    padding: 16,
    borderLeftWidth: 4,
    height: 120, // increased height for better touch area
    justifyContent: 'space-between',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  metricChange: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669', // Default green, will be overridden
  },
  detailContainer: {
    padding: 24,
    flex: 1,
    backgroundColor: '#ffffff',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 24,
  },
  backButton: {
    padding: 8,
    borderRadius: 99,
    backgroundColor: '#f1f5f9',
    marginRight: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  rangeBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  rangeTextActive: {
    color: '#0f172a',
  },
  chartCard: {
    padding: 24,
    marginBottom: 24,
  },
  chartValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  chartChange: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    gap: 4,
  },
  chartBarContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: '100%', // Full width of container minus gap
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 16,
  },
  insightGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  heatmapCard: {
    marginBottom: 24,
  },
  aiContainer: {
    marginBottom: 24,
  },
  aiInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 8,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#d946ef',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  aiIcon: {
    marginRight: 12,
  },
  aiInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  searchButton: {
    width: 32,
    height: 32,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  heatmapTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  heatmapBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 112,
    gap: 8,
    marginBottom: 8,
  },
  barContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  barHighlight: {
    backgroundColor: '#6366f1',
  },
  heatmapLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  heatmapLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inventoryTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  exportButton: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    textTransform: 'uppercase',
  },
  rewardsList: {
    gap: 12,
    marginBottom: 16,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardStock: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rewardSettings: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  addRewardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    paddingVertical: 16,
  },
  addRewardText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
});

export default MerchantAnalytics;
