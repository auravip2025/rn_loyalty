import { ArrowLeft, Gift, Tag, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const { height } = Dimensions.get('window');

const OfferDetails = ({ offer, onBack, onCheckout }) => {
  const insets = useSafeAreaInsets();
  const [redeemed, setRedeemed] = useState(false);

  if (!offer) return null;

  const hasImage  = !!offer.image;
  const hasPoints = !!offer.discount; // e.g. "200 pts"
  const hasPrice  = offer.price != null && offer.price > 0;

  const handleRedeem = () => {
    Alert.alert(
      'Redeem Reward',
      `Use ${offer.discount || 'this reward'} to redeem "${offer.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: () => {
            setRedeemed(true);
            if (onCheckout) onCheckout(offer.price || 0);
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      paddingHorizontal={0}
      backgroundColor="#000000"
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        style={{ flex: 1 }}
        bounces={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          {hasImage ? (
            <Image source={{ uri: offer.image }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Gift size={64} color="rgba(255,255,255,0.2)" />
            </View>
          )}
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            {hasPoints && (
              <View style={styles.pointsBadge}>
                <Zap size={12} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.pointsBadgeText}>{offer.discount}</Text>
              </View>
            )}
            <Text style={styles.heroTitle}>{offer.title}</Text>
          </View>
        </View>

        {/* Content sheet */}
        <View style={styles.sheet}>
          <View style={styles.sheetContent}>

            {/* Description */}
            {!!offer.desc && (
              <Text style={styles.description}>{offer.desc}</Text>
            )}

            {/* Cost row */}
            <View style={styles.costRow}>
              {hasPoints && (
                <View style={styles.costCard}>
                  <Zap size={18} color="#4f46e5" fill="#4f46e5" />
                  <View>
                    <Text style={styles.costLabel}>Points Cost</Text>
                    <Text style={styles.costValue}>{offer.discount}</Text>
                  </View>
                </View>
              )}
              {hasPrice && (
                <View style={[styles.costCard, styles.costCardAlt]}>
                  <Tag size={18} color="#10b981" />
                  <View>
                    <Text style={styles.costLabel}>Price</Text>
                    <Text style={[styles.costValue, { color: '#10b981' }]}>
                      ${Number(offer.price).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Expires */}
            {!!offer.expires && (
              <View style={styles.expiryRow}>
                <Text style={styles.expiryLabel}>Valid until</Text>
                <Text style={styles.expiryValue}>{offer.expires}</Text>
              </View>
            )}

            {/* Redeemed confirmation */}
            {redeemed && (
              <View style={styles.redeemedBanner}>
                <Text style={styles.redeemedText}>✓ Reward redeemed! Show this to the merchant.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Back button */}
      <TouchableOpacity
        onPress={onBack}
        style={[styles.backButton, { top: insets.top + 16 }]}
      >
        <ArrowLeft size={20} color="#ffffff" />
      </TouchableOpacity>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity
          style={[styles.redeemBtn, redeemed && styles.redeemBtnDone]}
          onPress={redeemed ? onBack : handleRedeem}
        >
          <Text style={styles.redeemBtnText}>
            {redeemed ? 'Done' : hasPoints ? `Redeem for ${offer.discount}` : 'Redeem Reward'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hero: {
    height: height * 0.42,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroPlaceholder: {
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  pointsBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fbbf24',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 34,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    flex: 1,
    marginTop: -24,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetContent: {
    padding: 28,
    gap: 20,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    fontWeight: '500',
  },
  costRow: {
    flexDirection: 'row',
    gap: 12,
  },
  costCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 16,
  },
  costCardAlt: {
    backgroundColor: '#f0fdf4',
  },
  costLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  costValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4f46e5',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  expiryLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  expiryValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  redeemedBanner: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 16,
  },
  redeemedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  redeemBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 20,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  redeemBtnDone: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  redeemBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default OfferDetails;
