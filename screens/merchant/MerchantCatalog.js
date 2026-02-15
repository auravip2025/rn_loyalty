import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Package,
  Gift,
  Award,
  Settings,
  Plus,
} from 'lucide-react-native';
import Card from '../../components/old_app/common/Card';
import Button from '../../components/old_app/common/Button';
import Badge from '../../components/old_app/common/Badge';
import RewardConfigEditor from '../../components/old_app/merchant/RewardConfigEditor';

const MerchantCatalog = () => {
  const [selectedReward, setSelectedReward] = useState(null);
  const [rewards, setRewards] = useState([
    { id: 1, title: 'Free Latte', points: 500, stock: 124, icon: Package },
    { id: 2, title: '$5 Discount', points: 1000, stock: '∞', icon: Gift },
    { id: 3, title: 'VIP Merch Bag', points: 5000, stock: 12, icon: Award },
    { id: 4, title: 'Coffee Subscription', points: 2500, stock: 45, icon: Gift },
    { id: 5, title: 'Birthday Reward', points: 750, stock: '∞', icon: Gift },
  ]);

  const handleUpdateReward = (updatedReward) => {
    setRewards(rewards.map(r => r.id === updatedReward.id ? updatedReward : r));
    setSelectedReward(null);
  };

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

      <View style={styles.header}>
        <Text style={styles.title}>Reward Inventory</Text>
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

      <Button variant="outline" style={styles.addButton}>
        <Plus size={18} color="#64748b" />
        <Text style={styles.addButtonText}>Add New Reward</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
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
    marginBottom: 24,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderStyle: 'dashed',
    borderWidth: 2,
    paddingVertical: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
});

export default MerchantCatalog;
