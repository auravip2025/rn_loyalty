import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag
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
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const { width, height } = Dimensions.get('window');



const DEFAULT_MENU = [
  { id: 'd1', title: 'Signature Item A', price: 12.00, image: 'https://images.unsplash.com/photo-1505826759037-406b40feb4cd?w=200' },
  { id: 'd2', title: 'Signature Item B', price: 15.00, image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=200' }
];

const OfferDetails = ({
  offer,
  storeMenus = {},
  onBack,
  onCheckout,
}) => {
  const insets = useSafeAreaInsets();

  const [cart, setCart] = useState({
    [offer.id]: 1
  });

  const menu = storeMenus[offer.desc] || DEFAULT_MENU;

  const updateQuantity = (id, delta) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const cartTotal = (offer.price || 0) * (cart[offer.id] || 0) +
    menu.reduce((acc, item) => acc + (item.price * (cart[item.id] || 0)), 0);

  const totalItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const displayTotal = `$${cartTotal.toFixed(2)}`;

  const isBundle = offer.type === 'bundle';

  const handleCheckout = () => {
    if (totalItemsCount > 0) {
      const items = [];
      if (cart[offer.id] > 0) {
        items.push({ id: offer.id, title: offer.title, quantity: cart[offer.id], price: offer.price || 0 });
      }
      menu.forEach(item => {
        if (cart[item.id] > 0) {
          items.push({ id: item.id, title: item.title, quantity: cart[item.id], price: item.price });
        }
      });
      onCheckout(items, cartTotal, offer.desc);
    }
  };

  return (
    <ScreenWrapper
      useSafeAreaTop={false}
      useSafeAreaBottom={false}
      paddingHorizontal={0}
      backgroundColor="#000000"
      style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        style={{ flex: 1 }}
        bounces={false}
      >
        {/* Compact Hero */}
        <View style={styles.hero}>
          <Image source={{ uri: offer.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            {isBundle && (
              <View style={styles.bundleTag}>
                <Text style={styles.bundleTagText}>BUNDLE SAVE</Text>
              </View>
            )}
            <Text style={styles.heroTitle}>{offer.title}</Text>
          </View>
        </View>

        {/* Elegant Content Sheet */}
        <View style={styles.sheetContainer}>
          <View style={styles.scrollContent}>
            <View style={styles.storeHeader}>
              <Text style={styles.storeName}>{offer.desc}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ 4.8</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Featured Offer</Text>
            <View style={styles.menuItem}>
              <Image source={{ uri: offer.image }} style={styles.menuItemImage} />
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemTitle}>{offer.title}</Text>
                <Text style={styles.menuItemPrice}>${(offer.price || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.menuItemAction}>
                {cart[offer.id] > 0 ? (
                  <View style={styles.smallQtyControl}>
                    <TouchableOpacity onPress={() => updateQuantity(offer.id, -1)} style={styles.smallQtyBtn}><Minus size={14} color="#0f172a" /></TouchableOpacity>
                    <Text style={styles.smallQtyValue}>{cart[offer.id]}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(offer.id, 1)} style={styles.smallQtyBtn}><Plus size={14} color="#0f172a" /></TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => updateQuantity(offer.id, 1)} style={styles.addButton}>
                    <Plus size={16} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>Store Menu</Text>
            {menu.map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.menuItemAction}>
                  {(cart[item.id] || 0) > 0 ? (
                    <View style={styles.smallQtyControl}>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.smallQtyBtn}><Minus size={14} color="#0f172a" /></TouchableOpacity>
                      <Text style={styles.smallQtyValue}>{cart[item.id]}</Text>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.smallQtyBtn}><Plus size={14} color="#0f172a" /></TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.addButton}>
                      <Plus size={16} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity onPress={onBack} style={[styles.backButton, { top: insets.top + 16 }]}>
        <ArrowLeft size={20} color="#ffffff" />
      </TouchableOpacity>

      {/* Compact & Elegant Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutBtn, totalItemsCount === 0 && { opacity: 0.5 }]}
          onPress={handleCheckout}
          disabled={totalItemsCount === 0}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItemsCount}</Text>
          </View>
          <Text style={styles.checkoutLabel}>
            Checkout - {displayTotal}
          </Text>
          <View style={styles.checkoutIcon}>
            <ShoppingBag size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
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
    height: height * 0.45,
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
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  storeName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  ratingBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#d97706',
    fontWeight: '900',
    fontSize: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  menuItemImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  menuItemAction: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: '#0f172a',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallQtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 4,
    gap: 12,
  },
  smallQtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  smallQtyValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 24,
  },
  cartBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 14,
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
});

export default OfferDetails;
