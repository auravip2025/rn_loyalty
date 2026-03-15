import {
  ArrowLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Gift,
  List,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Store,
  Tag,
  X,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Badge from '../../components/old_app/common/Badge';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';
import { GET_MERCHANTS, useQuery } from '../../api/client';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', '☕ Café', '👗 Fashion', '🍜 Restaurant', '💻 Electronics', '🛒 Grocery', '💪 Fitness'];
const SORT_OPTIONS = [
  { key: 'distance', label: 'Nearest' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'popular', label: 'Popular' },
];

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => {
  const rotation = useSharedValue(0);
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1, false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  return <Animated.View style={style}><RefreshCw size={32} color="#4f46e5" /></Animated.View>;
};

// ─── Tag Badge ────────────────────────────────────────────────────────────────
const TagBadge = ({ label }) => {
  const map = {
    Popular: { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
    Trending: { bg: '#fce7f3', text: '#db2777', border: '#fbcfe8' },
    New: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0' },
    'Eco-Friendly': { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  };
  const c = map[label] || map.Popular;
  return (
    <Text style={[styles.tagBadge, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}>
      {label}
    </Text>
  );
};

// ─── Merchant List Card ───────────────────────────────────────────────────────
const MerchantCard = ({ merchant, index, onPress }) => (
  <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
    <TouchableOpacity onPress={() => onPress(merchant)} activeOpacity={0.85}>
      <Card style={styles.merchantCard}>
        <View style={styles.mcInner}>
          <View style={styles.thumbWrap}>
            <Image source={{ uri: merchant.image }} style={styles.thumb} />
            <View style={[styles.openBadge, { backgroundColor: merchant.open ? '#10b981' : '#94a3b8' }]}>
              <Text style={styles.openBadgeText}>{merchant.open ? 'OPEN' : 'CLOSED'}</Text>
            </View>
          </View>
          <View style={styles.mcInfo}>
            <View style={styles.mcNameRow}>
              <Text style={styles.mcName} numberOfLines={1}>{merchant.name}</Text>
              <Text style={styles.mcEmoji}>{merchant.categoryEmoji}</Text>
            </View>
            <View style={styles.mcMeta}>
              <Star size={11} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.mcMetaText}>{merchant.rating} ({merchant.reviewCount})</Text>
              <View style={styles.dot} />
              <MapPin size={11} color="#94a3b8" />
              <Text style={styles.mcMetaText}>{merchant.distance}</Text>
            </View>
            {merchant.tags?.length > 0 && (
              <View style={styles.tagsRow}>
                {merchant.tags.slice(0, 2).map(t => <TagBadge key={t} label={t} />)}
              </View>
            )}
            <View style={styles.pillsRow}>
              {merchant.programs?.length > 0 && (
                <View style={styles.pill}>
                  <Star size={10} color="#4f46e5" />
                  <Text style={styles.pillText}>{merchant.programs.length} program{merchant.programs.length > 1 ? 's' : ''}</Text>
                </View>
              )}
              {merchant.offers?.length > 0 && (
                <View style={[styles.pill, styles.pillOffer]}>
                  <Tag size={10} color="#d97706" />
                  <Text style={[styles.pillText, { color: '#d97706' }]}>{merchant.offers.length} offer{merchant.offers.length > 1 ? 's' : ''}</Text>
                </View>
              )}
            </View>
          </View>
          <ChevronRight size={18} color="#cbd5e1" />
        </View>
      </Card>
    </TouchableOpacity>
  </Animated.View>
);

// ─── Recommendation Card ──────────────────────────────────────────────────────
const RecoCard = ({ merchant, onPress }) => (
  <TouchableOpacity onPress={() => onPress(merchant)} style={styles.recoCard} activeOpacity={0.85}>
    <Image source={{ uri: merchant.image }} style={StyleSheet.absoluteFillObject} />
    <View style={styles.recoOverlay} />
    <View style={styles.recoContent}>
      <Text style={styles.recoEmoji}>{merchant.categoryEmoji}</Text>
      <Text style={styles.recoName} numberOfLines={1}>{merchant.name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
        <Star size={10} color="#fbbf24" fill="#fbbf24" />
        <Text style={styles.recoRating}>{merchant.rating}</Text>
        <Text style={styles.recoDistance}>{merchant.distance}</Text>
      </View>
      {merchant.offers?.length > 0 && (
        <View style={styles.recoOffer}>
          <Text style={styles.recoOfferText}>{merchant.offers[0].discount}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// ─── Merchant Detail Sheet ────────────────────────────────────────────────────
const MerchantDetail = ({ merchant, onClose }) => {
  const [activeTab, setActiveTab] = useState('offers');

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
      <Animated.View entering={FadeInDown.duration(350)} style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Hero */}
          <View style={styles.heroWrap}>
            <Image source={{ uri: merchant.image }} style={StyleSheet.absoluteFillObject} />
            <View style={styles.heroGrad} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#fff" />
            </TouchableOpacity>
            <View style={styles.heroContent}>
              <Text style={styles.heroEmoji}>{merchant.categoryEmoji}</Text>
              <Text style={styles.heroName}>{merchant.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Star size={13} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.heroRating}>{merchant.rating} ({merchant.reviewCount} reviews)</Text>
                <View style={[styles.heroBadge, { backgroundColor: merchant.open ? '#10b981' : '#64748b' }]}>
                  <Text style={styles.heroBadgeText}>{merchant.open ? '● OPEN' : '● CLOSED'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(merchant.address)}`)}>
              <Navigation size={18} color="#4f46e5" />
              <Text style={styles.actionBtnText}>Directions</Text>
            </TouchableOpacity>
            <View style={styles.actionDiv} />
            <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${merchant.phone}`)}>
              <Phone size={18} color="#4f46e5" />
              <Text style={styles.actionBtnText}>Call</Text>
            </TouchableOpacity>
            <View style={styles.actionDiv} />
            <TouchableOpacity style={styles.actionBtn}>
              <Star size={18} color="#4f46e5" />
              <Text style={styles.actionBtnText}>Check In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sheetBody}>
            <Text style={styles.sheetDesc}>{merchant.description}</Text>

            {/* Info rows */}
            <View style={styles.infoList}>
              {[
                { Icon: MapPin, value: merchant.address },
                { Icon: Clock, value: merchant.hours },
                { Icon: Phone, value: merchant.phone },
                { Icon: ExternalLink, value: merchant.website, color: '#4f46e5' },
              ].map(({ Icon, value, color }, i) => (
                <View key={i} style={styles.infoRow}>
                  <Icon size={14} color="#64748b" />
                  <Text style={[styles.infoValue, color && { color }]}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              {[
                { key: 'offers', label: `Offers (${merchant.offers?.length || 0})` },
                { key: 'programs', label: `Programs (${merchant.programs?.length || 0})` },
                { key: 'reviews', label: `Reviews` },
              ].map(tab => (
                <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tab, activeTab === tab.key && styles.tabActive]}>
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Offers Tab */}
            {activeTab === 'offers' && (
              <View style={styles.tabContent}>
                {merchant.offers?.map((offer, i) => (
                  <Card key={i} style={styles.offerCard}>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                      <View style={styles.discBadge}>
                        <Text style={styles.discText}>{offer.discount}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.offerTitle}>{offer.title}</Text>
                        <Text style={styles.offerDesc}>{offer.desc}</Text>
                        <Text style={styles.offerExpiry}>Expires: {offer.expires}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.redeemBtn}>
                      <Text style={styles.redeemText}>Redeem</Text>
                    </TouchableOpacity>
                  </Card>
                ))}
                {(!merchant.offers || !merchant.offers.length) && (
                  <Text style={styles.emptyTabText}>No active offers right now.</Text>
                )}
              </View>
            )}

            {/* Programs Tab */}
            {activeTab === 'programs' && (
              <View style={styles.tabContent}>
                {merchant.programs?.map((prog, i) => (
                  <Card key={i} style={styles.progCard}>
                    <View style={styles.progIcon}>
                      <Star size={20} color="#4f46e5" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.progName}>{prog.name}</Text>
                      <Text style={styles.progDesc}>{prog.desc}</Text>
                    </View>
                    <Badge color={prog.color || 'indigo'}>Active</Badge>
                  </Card>
                ))}
              </View>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <View style={styles.tabContent}>
                <View style={styles.ratingSummary}>
                  <Text style={styles.ratingBig}>{merchant.rating}</Text>
                  <View>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14} color="#fbbf24" fill={s <= Math.round(merchant.rating) ? '#fbbf24' : 'transparent'} />
                      ))}
                    </View>
                    <Text style={styles.ratingCount}>{merchant.reviewCount} reviews</Text>
                  </View>
                </View>
                {merchant.reviews?.map((r, i) => (
                  <View key={i} style={styles.reviewItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarLetter}>{r.author[0]}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewAuthor}>{r.author}</Text>
                        <Text style={styles.reviewDate}>{r.date}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={11} color="#fbbf24" fill={s <= r.rating ? '#fbbf24' : 'transparent'} />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewText}>{r.text}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const NearbyStores = ({ onBack }) => {
  const [status, setStatus] = useState('prompt');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const { data } = useQuery(GET_MERCHANTS);
  const allMerchants = data?.merchants || [];

  const handleAllowAccess = () => {
    setStatus('loading');
    setTimeout(() => setStatus('ready'), 1400);
  };

  const displayMerchants = useMemo(() => {
    let list = [...allMerchants];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.address || '').toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') {
      const cat = selectedCategory.replace(/^\S+\s/, '');
      list = list.filter(m => m.category === cat);
    }
    if (sortBy === 'distance') list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0));
    return list;
  }, [allMerchants, searchQuery, selectedCategory, sortBy]);

  const recommendations = useMemo(
    () => allMerchants.filter(m => m.open && m.rating >= 4.7).slice(0, 5),
    [allMerchants]
  );

  if (status === 'prompt') {
    return (
      <ScreenWrapper scroll={false} paddingHorizontal={0}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}><ArrowLeft size={20} color="#0f172a" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Nearby</Text>
        </View>
        <View style={styles.promptWrap}>
          <View style={styles.promptIconWrap}><MapPin size={52} color="#4f46e5" /></View>
          <Text style={styles.promptTitle}>Discover Nearby Merchants</Text>
          <Text style={styles.promptDesc}>
            Find loyalty programs, exclusive offers, and personalised recommendations from merchants around you.
          </Text>
          <TouchableOpacity style={styles.allowBtn} onPress={handleAllowAccess}>
            <Navigation size={18} color="#fff" />
            <Text style={styles.allowBtnText}>Enable Location Access</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBack} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  if (status === 'loading') {
    return (
      <ScreenWrapper scroll={false} paddingHorizontal={0}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}><ArrowLeft size={20} color="#0f172a" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Nearby</Text>
        </View>
        <View style={styles.loadingWrap}>
          <Spinner />
          <Text style={styles.loadingTitle}>Finding merchants near you…</Text>
          <Text style={styles.loadingSubtitle}>Checking loyalty programs & live offers</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false} paddingHorizontal={0}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><ArrowLeft size={20} color="#0f172a" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby</Text>
        <View style={styles.locPill}>
          <MapPin size={11} color="#4f46e5" />
          <Text style={styles.locText}>Orchard, SG</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search merchants, categories…"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}><X size={15} color="#94a3b8" /></TouchableOpacity>
          )}
        </View>

        {/* Recommendations */}
        {!searchQuery && selectedCategory === 'All' && recommendations.length > 0 && (
          <View style={styles.recoSection}>
            <View style={styles.sectionHeading}>
              <Sparkles size={16} color="#d946ef" />
              <Text style={styles.sectionTitle}>Recommended For You</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recoList}>
              {recommendations.map(m => <RecoCard key={m.id} merchant={m} onPress={setSelectedMerchant} />)}
            </ScrollView>
          </View>
        )}

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList} style={{ marginBottom: 8 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}
              style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}>
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort + Count */}
        <View style={styles.sortRow}>
          <List size={14} color="#94a3b8" />
          <Text style={styles.sortLabel}>Sort:</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity key={opt.key} onPress={() => setSortBy(opt.key)}
              style={[styles.sortChip, sortBy === opt.key && styles.sortChipActive]}>
              <Text style={[styles.sortChipText, sortBy === opt.key && styles.sortChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ flex: 1 }} />
          <Text style={styles.countText}>{displayMerchants.length} result{displayMerchants.length !== 1 ? 's' : ''}</Text>
        </View>

        {/* List */}
        <View style={styles.listWrap}>
          {displayMerchants.map((m, i) => (
            <MerchantCard key={m.id} merchant={m} index={i} onPress={setSelectedMerchant} />
          ))}
          {!displayMerchants.length && (
            <View style={styles.emptyState}>
              <Store size={40} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No merchants found</Text>
              <Text style={styles.emptyDesc}>Try adjusting your search or filters.</Text>
            </View>
          )}
        </View>

        {/* Notification Banner */}
        {!searchQuery && selectedCategory === 'All' && (
          <View style={styles.notifBanner}>
            <View style={styles.notifIcon}><Gift size={20} color="#d97706" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifTitle}>Get Nearby Offers Alerts</Text>
              <Text style={styles.notifDesc}>We'll notify you when you're near a merchant with active deals.</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}><Text style={styles.notifBtnText}>Enable</Text></TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {selectedMerchant && (
        <MerchantDetail merchant={selectedMerchant} onClose={() => setSelectedMerchant(null)} />
      )}
    </ScreenWrapper>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a', flex: 1 },
  locPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eef2ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  locText: { fontSize: 11, fontWeight: '700', color: '#4f46e5' },

  promptWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, gap: 16 },
  promptIconWrap: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  promptTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a', textAlign: 'center' },
  promptDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22 },
  allowBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4f46e5', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 28, width: '100%', justifyContent: 'center', marginTop: 8 },
  allowBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },
  skipBtn: { paddingVertical: 12 },
  skipBtnText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  loadingSubtitle: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f1f5f9', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a' },

  recoSection: { marginBottom: 16 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  recoList: { paddingHorizontal: 20, gap: 12 },
  recoCard: { width: 140, height: 180, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f1f5f9' },
  recoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  recoContent: { position: 'absolute', bottom: 10, left: 10, right: 10 },
  recoEmoji: { fontSize: 20, marginBottom: 2 },
  recoName: { fontSize: 12, fontWeight: '900', color: '#fff', marginBottom: 4 },
  recoRating: { fontSize: 10, color: '#fbbf24', fontWeight: '700' },
  recoDistance: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginLeft: 4 },
  recoOffer: { backgroundColor: '#f59e0b', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start' },
  recoOfferText: { fontSize: 9, fontWeight: '900', color: '#fff' },

  catList: { paddingHorizontal: 20, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  catChipActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  catText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  catTextActive: { color: '#fff' },

  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 6, marginVertical: 10 },
  sortLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#f1f5f9' },
  sortChipActive: { backgroundColor: '#0f172a' },
  sortChipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  sortChipTextActive: { color: '#fff' },
  countText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },

  listWrap: { paddingHorizontal: 20, gap: 10, marginBottom: 8 },
  merchantCard: { padding: 0, overflow: 'hidden' },
  mcInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  thumbWrap: { width: 72, height: 72, borderRadius: 12, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  openBadge: { position: 'absolute', top: 4, left: 4, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  openBadgeText: { fontSize: 7, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  mcInfo: { flex: 1, gap: 3 },
  mcNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mcName: { fontSize: 14, fontWeight: '900', color: '#0f172a', flex: 1 },
  mcEmoji: { fontSize: 16, marginLeft: 4 },
  mcMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mcMetaText: { fontSize: 11, color: '#64748b' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#cbd5e1' },
  tagsRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
  tagBadge: { fontSize: 9, fontWeight: '900', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, overflow: 'hidden' },
  pillsRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: '#eef2ff', borderRadius: 8, borderWidth: 1, borderColor: '#e0e7ff' },
  pillOffer: { backgroundColor: '#fef3c7', borderColor: '#fde68a' },
  pillText: { fontSize: 9, fontWeight: '700', color: '#4f46e5' },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#64748b' },
  emptyDesc: { fontSize: 13, color: '#94a3b8' },

  notifBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginTop: 8, backgroundColor: '#fffbeb', borderRadius: 16, borderWidth: 1, borderColor: '#fde68a', padding: 14 },
  notifIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef3c7', justifyContent: 'center', alignItems: 'center' },
  notifTitle: { fontSize: 13, fontWeight: '900', color: '#92400e' },
  notifDesc: { fontSize: 11, color: '#b45309', marginTop: 2, lineHeight: 16 },
  notifBtn: { backgroundColor: '#f59e0b', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  notifBtnText: { fontSize: 11, fontWeight: '900', color: '#fff' },

  // Detail Sheet
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', overflow: 'hidden' },
  heroWrap: { height: 200, position: 'relative' },
  heroGrad: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  closeBtn: { position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  heroContent: { position: 'absolute', bottom: 14, left: 16, right: 16 },
  heroEmoji: { fontSize: 22, marginBottom: 2 },
  heroName: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 6 },
  heroRating: { fontSize: 12, color: '#fbbf24', fontWeight: '700' },
  heroBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  heroBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  actionBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  actionBtnText: { fontSize: 11, fontWeight: '700', color: '#4f46e5' },
  actionDiv: { width: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },

  sheetBody: { paddingHorizontal: 20, paddingBottom: 60 },
  sheetDesc: { fontSize: 13, color: '#475569', lineHeight: 20, marginTop: 14, marginBottom: 14 },
  infoList: { gap: 8, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoValue: { fontSize: 13, color: '#334155', flex: 1, lineHeight: 19 },

  tabs: { flexDirection: 'row', gap: 0, marginBottom: 16, borderRadius: 12, backgroundColor: '#f1f5f9', padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  tabTextActive: { color: '#0f172a' },

  tabContent: { gap: 10 },
  emptyTabText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingVertical: 20 },

  offerCard: { paddingVertical: 14 },
  discBadge: { backgroundColor: '#4f46e5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  discText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  offerTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  offerDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  offerExpiry: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  redeemBtn: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  redeemText: { fontSize: 11, fontWeight: '900', color: '#16a34a' },

  progCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  progIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  progName: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
  progDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },

  ratingSummary: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, marginBottom: 12 },
  ratingBig: { fontSize: 40, fontWeight: '900', color: '#0f172a' },
  ratingCount: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  reviewItem: { paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 4 },
  reviewAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  reviewAvatarLetter: { fontSize: 14, fontWeight: '900', color: '#4f46e5' },
  reviewAuthor: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  reviewDate: { fontSize: 10, color: '#94a3b8' },
  reviewText: { fontSize: 13, color: '#475569', lineHeight: 19 },
});

export default NearbyStores;
