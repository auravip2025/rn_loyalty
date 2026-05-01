import { ArrowLeft, Bell, Calendar, ChevronRight, Gift, ShoppingBag, Star, Tag, Zap } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { useRouter } from 'expo-router';
import { GET_NOTIFICATIONS, useQuery } from '../../api/client';
import { useFocusEffect } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface AppNotification {
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
  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: 'cache-and-network',
  });
  const notifications: AppNotification[] = data?.notifications || [];

  // Refresh on every focus so new notifications appear after returning to the screen
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleNotificationPress = async (notification: AppNotification) => {
    // Mark as read via REST (fire-and-forget — don't block UI)
    if (!notification.read) {
      fetch(`${API_BASE}/notifications/${notification.id}/read`, { method: 'PATCH' })
        .catch(() => {/* non-fatal */});
      // Optimistically refetch after a tick so the unread dot disappears
      setTimeout(() => refetch(), 300);
    }
    if (notification.type === 'offer') {
      // Extract merchantId from the stored link (present on notifications sent
      // after notification-service was restarted with the link column in place)
      const merchantIdMatch = (notification.link || '').match(/merchantId=([^&]+)/);
      const merchantId = merchantIdMatch ? merchantIdMatch[1] : null;

      if (merchantId) {
        router.push({
          pathname: '/(customer)/campaign-offer' as any,
          params: {
            merchantId,
            title:   notification.title   || 'Campaign Offer',
            message: notification.message || '',
          },
        });
      } else {
        // Older notification saved before the link column existed — fall back
        // to the general rewards screen so the tap is never a dead end
        router.push('/(customer)/rewards' as any);
      }
    } else if (notification.link) {
      router.push(notification.link as any);
    }
  };

  const renderItem = ({ item, index }: { item: AppNotification; index: number }) => {
    // ── Campaign / offer notifications → rich offer card ─────────────────────
    if (item.type === 'offer') {
      return (
        <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
          <TouchableOpacity
            style={[styles.offerCard, !item.read && styles.offerCardUnread]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.85}
          >
            {/* accent bar */}
            <View style={styles.offerAccent} />

            <View style={styles.offerInner}>
              <View style={styles.offerHeader}>
                <View style={styles.offerIconWrap}>
                  <Zap size={16} color="#d97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.offerTitleRow}>
                    <Text style={styles.offerTitle} numberOfLines={1}>{item.title || 'Special Offer'}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.offerDate}>
                    <Calendar size={10} color="#94a3b8" /> {item.date}
                  </Text>
                </View>
              </View>

              <Text style={styles.offerMessage} numberOfLines={3}>{item.message}</Text>

              {/* CTA row */}
              <View style={styles.offerCta}>
                <ShoppingBag size={13} color="#d97706" />
                <Text style={styles.offerCtaText}>Browse rewards to redeem</Text>
                <ChevronRight size={14} color="#d97706" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    // ── Standard notifications ────────────────────────────────────────────────
    let Icon = Bell;
    let iconColor = '#64748b';
    let bgColor = '#f1f5f9';

    if (item.type === 'earn') {
      Icon = Star;
      iconColor = '#4f46e5';
      bgColor = '#eef2ff';
    } else if (item.type === 'reward') {
      Icon = Gift;
      iconColor = '#059669';
      bgColor = '#f0fdf4';
    }

    return (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
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
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title || 'Notification'}</Text>
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
        {notifications.some(n => !n.read) && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {notifications.filter(n => !n.read).length}
            </Text>
          </View>
        )}
      </View>

      {loading && notifications.length === 0 ? (
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
              <Text style={styles.emptySubText}>
                You'll see campaign offers, rewards, and updates here.
              </Text>
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
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#f43f5e',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
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
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4f46e5',
    marginLeft: 6,
    flexShrink: 0,
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
  // ── Campaign offer card ─────────────────────────────────────────────────
  offerCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#fde68a',
    overflow: 'hidden',
  },
  offerCardUnread: {
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  offerAccent: {
    height: 4,
    backgroundColor: '#f59e0b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  offerInner: {
    padding: 16,
    gap: 10,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  offerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400e',
    flex: 1,
  },
  offerDate: {
    fontSize: 11,
    color: '#92400e',
    opacity: 0.6,
    fontWeight: '500',
  },
  offerMessage: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 19,
    fontWeight: '500',
  },
  offerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#fde68a',
  },
  offerCtaText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#d97706',
  },
  // ── End offer card ──────────────────────────────────────────────────────

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
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '700',
  },
  emptySubText: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Notifications;
