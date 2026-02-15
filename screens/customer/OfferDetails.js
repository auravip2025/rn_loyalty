import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Info,
  Minus,
  Plus,
  QrCode,
  ShoppingBag,
} from 'lucide-react-native';
import React, { useState } from 'react';
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
import Button from '../../components/old_app/common/Button';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const { width } = Dimensions.get('window');

const OfferDetails = ({
  offer,
  onBack,
  onCheckout,
}) => {
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [showQr, setShowQr] = useState(false);

  // Check if this is a cash purchase (passed from Rewards) or points redemption
  const isCashPurchase = offer.isCash || offer.price > 0 && !offer.cost;

  const unitPrice = isCashPurchase ? (offer.price || 0) : (offer.cost || 0);

  const total = isCashPurchase
    ? `$${(unitPrice * quantity).toFixed(2)}`
    : `${(unitPrice * quantity)} pts`;

  const displayPrice = isCashPurchase
    ? `$${unitPrice.toFixed(2)}`
    : `${unitPrice} pts`;

  const isBundle = offer.type === 'bundle';

  const handleCheckout = () => {
    setShowQr(true);
  };

  if (showQr) {
    return (
      <ScreenWrapper
        useSafeAreaTop={true} // QR view should have safe area
        useSafeAreaBottom={true}
        backgroundColor="#f8fafc"
        paddingHorizontal={0}
        style={styles.qrContainer}>
        <TouchableOpacity onPress={() => setShowQr(false)} style={styles.closeButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.qrCard}>
          <View style={styles.successIcon}>
            <CheckCircle size={48} color="#10b981" />
          </View>
          <Text style={styles.qrTitle}>Payment Successful!</Text>
          <Text style={styles.qrSubtitle}>Show this QR code to the merchant to collect your item.</Text>
          <View style={styles.qrCodeBox}>
            <QrCode size={200} color="#0f172a" />
          </View>
          <Text style={styles.orderId}>Order #{Math.floor(Math.random() * 90000) + 10000}</Text>
          <View style={styles.itemSummary}>
            <Text style={styles.itemTitle}>{quantity}x {offer.title}</Text>
            <Text style={styles.itemTotal}>Total: {total}</Text>
          </View>
        </View>

        <Button variant="primary" onPress={() => onCheckout(total)} style={styles.doneButton}>
          Done
        </Button>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      paddingHorizontal={0}
      backgroundColor="#000000">
      {/* Compact Hero */}
      <View style={styles.heroSection}>
        <Image source={{ uri: offer.image }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />

        <TouchableOpacity onPress={onBack} style={[styles.backButton, { top: insets.top + 16 }]}>
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          {isBundle && (
            <View style={styles.bundleTag}>
              <Text style={styles.bundleTagText}>BUNDLE SAVE</Text>
            </View>
          )}
          <Text style={styles.heroTitle}>{offer.title}</Text>
          <Text style={styles.heroPrice}>{displayPrice}</Text>
        </View>
      </View>

      {/* Elegant Content Sheet */}
      <View style={styles.sheetContainer}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={14} color="#64748b" />
              <Text style={styles.metaText}>Valid 30 days</Text>
            </View>
            <View style={styles.metaItem}>
              <ShoppingBag size={14} color="#64748b" />
              <Text style={styles.metaText}>{offer.stock === '∞' ? 'Always available' : `${offer.stock} left`}</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>
            {offer.desc || "Experience our premium selection. This reward is valid at all participating locations. Terms and conditions apply."}
          </Text>

          {isBundle && (
            <View style={styles.bundleInfoBox}>
              <Info size={16} color="#4f46e5" />
              <Text style={styles.bundleInfoText}>
                Includes {offer.bundleCount}x {offer.title.replace('10x ', '')} vouchers.
                Redeem them individually whenever you visit.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Compact & Elegant Footer */}
        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.qtyBtn}
            >
              <Minus size={16} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={styles.qtyBtn}
            >
              <Plus size={16} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutLabel}>
              {isCashPurchase ? 'Pay ' : 'Redeem '}{total}
            </Text>
            <View style={styles.checkoutIcon}>
              <ShoppingBag size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Dark background for contrast behind sheet
  },
  hero: {
    height: '45%', // Reduced height
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)', // Simulating gradient with solid for RN logic if needed, but simple overlay works
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 50, // Safe area
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)', // Web property, handled gracefully in RN or ignored
  },
  heroContent: {
    position: 'absolute',
    bottom: 40, // Space for sheet overlap
    left: 24,
    right: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ade80', // Bright green for contrast
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bundleTag: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bundleTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sheetContainer: {
    flex: 1,
    marginTop: -24,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 24,
  },
  bundleInfoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#eef2ff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  bundleInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#4338ca',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingBottom: 32, // Safe area
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    padding: 4,
    gap: 12,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    minWidth: 20,
    textAlign: 'center',
  },
  checkoutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  checkoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    padding: 24,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  qrCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 12,
    marginBottom: 32,
  },
  successIcon: {
    marginBottom: 16,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  qrCodeBox: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#0f172a',
    borderRadius: 16,
    marginBottom: 24,
  },
  orderId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  itemSummary: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 14,
    color: '#64748b',
  },
  doneButton: {
    width: '100%',
  },
});

export default OfferDetails;
