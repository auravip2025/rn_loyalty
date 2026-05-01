import { AlertCircle, ArrowLeft, CheckCircle, Gift, Tag, Zap } from 'lucide-react-native';
import React from 'react';
import { getRewardImage } from '../../utils/rewardImages';
import { getRewardDetails } from '../../utils/rewardDetails';
import {
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

const OfferDetails = ({ offer, redeemed = false, onBack, onCheckout }) => {
  const insets = useSafeAreaInsets();

  if (!offer) return null;

  const localImage = getRewardImage(offer.title);
  // Prefer merchant-configured details; fall back to keyword-matched mock data
  const details    = offer.productDetails && (
                       offer.productDetails.highlights?.length ||
                       offer.productDetails.specs?.length ||
                       offer.productDetails.category
                     )
                     ? offer.productDetails
                     : getRewardDetails(offer.title);
  const hasPoints  = !!offer.discount;
  const hasPrice   = offer.price != null && offer.price > 0;

  const handleRedeem = () => {
    if (onCheckout) onCheckout(offer.price || 0);
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
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <View style={styles.hero}>
          {offer.image ? (
            <Image source={{ uri: offer.image }} style={styles.heroImage} resizeMode="cover" />
          ) : localImage ? (
            <Image source={localImage} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Gift size={64} color="rgba(255,255,255,0.2)" />
            </View>
          )}
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            {/* Category pill */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{details.category}</Text>
            </View>
            {/* Points badge */}
            {hasPoints && (
              <View style={styles.pointsBadge}>
                <Zap size={12} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.pointsBadgeText}>{offer.discount}</Text>
              </View>
            )}
            <Text style={styles.heroTitle}>{offer.title}</Text>
          </View>
        </View>

        {/* ── White sheet ───────────────────────────────────────────────────── */}
        <View style={styles.sheet}>
          <View style={styles.sheetContent}>

            {/* Redeemed banner */}
            {redeemed && (
              <View style={styles.redeemedBanner}>
                <CheckCircle size={18} color="#059669" />
                <Text style={styles.redeemedText}>Redemption sent to checkout!</Text>
              </View>
            )}

            {/* Description */}
            {!!offer.desc && (
              <Text style={styles.description}>{offer.desc}</Text>
            )}

            {/* ── Highlights row ─────────────────────────────────────────────── */}
            <View style={styles.highlightsRow}>
              {details.highlights.map((h, i) => (
                <View key={i} style={styles.highlightChip}>
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>

            {/* ── Cost cards ─────────────────────────────────────────────────── */}
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

            {/* ── Product details card ───────────────────────────────────────── */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsCardTitle}>Product Details</Text>
              {details.specs.map((spec, i) => (
                <View
                  key={i}
                  style={[
                    styles.specRow,
                    i < details.specs.length - 1 && styles.specRowBorder,
                  ]}
                >
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>

            {/* ── What's included ────────────────────────────────────────────── */}
            {details.includes && details.includes.length > 0 && (
              <View style={styles.includesCard}>
                <Text style={styles.includesTitle}>What's Included</Text>
                {details.includes.map((item, i) => (
                  <View key={i} style={styles.includeRow}>
                    <CheckCircle size={15} color="#10b981" />
                    <Text style={styles.includeText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ── Allergen / dietary notice ──────────────────────────────────── */}
            {!!details.allergens && (
              <View style={styles.allergenRow}>
                <AlertCircle size={14} color="#d97706" style={{ flexShrink: 0 }} />
                <Text style={styles.allergenText}>{details.allergens}</Text>
              </View>
            )}

            {/* ── Expiry ─────────────────────────────────────────────────────── */}
            {!!offer.expires && (
              <View style={styles.expiryRow}>
                <Text style={styles.expiryLabel}>Valid until</Text>
                <Text style={styles.expiryValue}>{offer.expires}</Text>
              </View>
            )}

            {/* ── Terms & conditions ─────────────────────────────────────────── */}
            <View style={styles.termsBox}>
              <Text style={styles.termsTitle}>Terms & Conditions</Text>
              <Text style={styles.termsText}>{details.terms}</Text>
            </View>

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

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity
          style={[styles.redeemBtn, redeemed && styles.redeemBtnDone]}
          onPress={redeemed ? onBack : handleRedeem}
        >
          {redeemed && <CheckCircle size={18} color="#ffffff" />}
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

  // ── Hero ───────────────────────────────────────────────────────────────────
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    gap: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
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

  // ── Sheet ──────────────────────────────────────────────────────────────────
  sheet: {
    flex: 1,
    marginTop: -24,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetContent: {
    padding: 24,
    gap: 20,
  },

  // ── Redeemed banner ────────────────────────────────────────────────────────
  redeemedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ecfdf5',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  redeemedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    flex: 1,
  },

  // ── Description ────────────────────────────────────────────────────────────
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    fontWeight: '500',
  },

  // ── Highlights row ─────────────────────────────────────────────────────────
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  // ── Cost row ───────────────────────────────────────────────────────────────
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

  // ── Product details card ───────────────────────────────────────────────────
  detailsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  detailsCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  specRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  specLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: '58%',
    textAlign: 'right',
  },

  // ── What's included ────────────────────────────────────────────────────────
  includesCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 16,
    gap: 10,
  },
  includesTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065f46',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  includeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  includeText: {
    flex: 1,
    fontSize: 13,
    color: '#065f46',
    fontWeight: '600',
    lineHeight: 19,
  },

  // ── Allergen notice ────────────────────────────────────────────────────────
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  allergenText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    lineHeight: 18,
  },

  // ── Expiry ─────────────────────────────────────────────────────────────────
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

  // ── Terms ──────────────────────────────────────────────────────────────────
  termsBox: {
    gap: 6,
    paddingTop: 4,
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    fontWeight: '500',
  },

  // ── Back button ────────────────────────────────────────────────────────────
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

  // ── Footer CTA ─────────────────────────────────────────────────────────────
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
    backgroundColor: '#059669',
    shadowColor: '#059669',
    flexDirection: 'row',
    gap: 8,
  },
  redeemBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});

export default OfferDetails;
