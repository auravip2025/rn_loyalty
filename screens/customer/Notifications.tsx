import { ArrowLeft, Bell, Calendar, ChevronRight, Gift, Star, Tag } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { useRouter } from 'expo-router';
import { GET_NOTIFICATIONS, useQuery } from '../../api/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'earn' | 'offer' | 'info' | 'reward';
  date: string;
  read: boolean;
  link?: string;
}

interface NotificationsProps {
  onBack: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onBack }) => {
  const router = useRouter();
  const { data, loading } = useQuery(GET_NOTIFICATIONS);
  const notifications: Notification[] = data?.notifications || [];

  const handleNotificationPress = (notification: Notification) => {
    if (notification.link) {
      router.push(notification.link as any);
    }
  };

  const renderItem = ({ item, index }: { item: Notification; index: number }) => {
    let Icon = Bell;
    let iconColor = '#64748b';
    let bgColor = '#f1f5f9';

    if (item.type === 'earn') {
      Icon = Star;
      iconColor = '#4f46e5';
      bgColor = '#eef2ff';
    } else if (item.type === 'offer') {
      Icon = Tag;
      iconColor = '#d97706';
      bgColor = '#fffbeb';
    } else if (item.type === 'reward') {
      Icon = Gift;
      iconColor = '#059669';
      bgColor = '#f0fdf4';
    }

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(500)}>
        <TouchableOpacity 
          style={[styles.card, !item.read && styles.unreadCard]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
            <Icon size={20} color={iconColor} />
          </View>
          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
            <View style={styles.footer}>
              <Calendar size={12} color="#94a3b8" />
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#cbd5e1" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper paddingHorizontal={0}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Bell size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
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
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  unreadCard: {
    borderColor: '#e0e7ff',
    backgroundColor: '#f8fafc',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4f46e5',
  },
  message: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
  },
});

export default Notifications;
