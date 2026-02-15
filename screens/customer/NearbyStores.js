import {
  ArrowLeft,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Store,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../components/old_app/common/Button';
import Card from '../../components/old_app/common/Card';
import ScreenWrapper from '../../components/old_app/common/ScreenWrapper';

const NearbyStores = ({ onBack }) => {
  const [status, setStatus] = useState('prompt'); // prompt, loading, list
  const [stores, setStores] = useState([]);
  const [expandedMap, setExpandedMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const mockStores = [
    { name: 'The Coffee House', category: 'Cafe', distance: '0.2 km', rating: 4.8, active: true, address: '123 Orchard Road' },
    { name: 'Urban Outfitters', category: 'Fashion', distance: '0.5 km', rating: 4.5, active: false, address: '456 Somerset' },
    { name: 'Tech Junction', category: 'Electronics', distance: '1.1 km', rating: 4.2, active: true, address: '789 Plaza Sing' },
    { name: 'Green Grocer', category: 'Grocery', distance: '1.4 km', rating: 4.9, active: true, address: '321 Tiong Bahru' },
    { name: 'Fit Gym', category: 'Fitness', distance: '2.0 km', rating: 4.7, active: false, address: '654 Bugis' },
  ];

  const filters = ['All', 'Food', 'Fashion', 'Tech', 'Grocery', 'Fitness'];

  const handleAllowAccess = () => {
    setStatus('loading');
    setTimeout(() => {
      setStores(mockStores);
      setStatus('list');
    }, 1500);
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || store.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (status === 'prompt') {
    return (
      <ScreenWrapper scroll={false} paddingHorizontal={0}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.title}>Nearby Outlets</Text>
        </View>

        <View style={styles.promptContainer}>
          <View style={styles.locationIcon}>
            <MapPin size={48} color="#4f46e5" />
          </View>
          <Text style={styles.promptTitle}>Enable Location</Text>
          <Text style={styles.promptText}>
            We need access to your location to find the best offers and stores around you.
          </Text>
          <View style={styles.promptButtons}>
            <Button onPress={handleAllowAccess} style={styles.allowButton}>
              Allow Access
            </Button>
            <Button variant="ghost" onPress={onBack} style={styles.notNowButton}>
              Not Now
            </Button>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (status === 'loading') {
    return (
      <ScreenWrapper scroll={false} paddingHorizontal={0}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.title}>Nearby Outlets</Text>
        </View>

        <View style={styles.loadingContainer}>
          <RefreshCw size={32} color="#4f46e5" style={styles.spinner} />
          <Text style={styles.loadingText}>Locating you...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scroll={false} paddingHorizontal={0}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Nearby Outlets</Text>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
              ]}>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Store List */}
        <ScrollView
          style={styles.storeList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.storeListContent}>
          {filteredStores.map((store, i) => (
            <Card key={i} style={styles.storeCard}>
              <View style={styles.storeRow}>
                <View style={styles.storeIcon}>
                  <Store size={20} color="#475569" />
                </View>
                <View style={styles.storeInfo}>
                  <View style={styles.storeHeader}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <Text style={styles.storeDistance}>{store.distance}</Text>
                  </View>
                  <Text style={styles.storeMeta}>
                    {store.category} • {store.rating} ★
                  </Text>
                </View>
                <View style={styles.storeActions}>
                  {store.active && <Badge color="emerald">Open</Badge>}
                  <TouchableOpacity
                    onPress={() => setExpandedMap(expandedMap === i ? null : i)}
                    style={[
                      styles.mapButton,
                      expandedMap === i && styles.mapButtonActive,
                    ]}>
                    {expandedMap === i ? (
                      <X size={14} color="#ffffff" />
                    ) : (
                      <MapPin size={14} color="#4f46e5" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {expandedMap === i && (
                <View style={styles.mapContainer}>
                  <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapText}>Map View</Text>
                    <Text style={styles.mapAddress}>{store.address}</Text>
                  </View>
                  <TouchableOpacity style={styles.directionsButton}>
                    <Navigation size={12} color="#4f46e5" />
                    <Text style={styles.directionsText}>Directions</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))}
        </ScrollView>
      </View>
    </ScreenWrapper >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
    gap: 8,
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  locationIcon: {
    width: 128,
    height: 128,
    backgroundColor: '#eef2ff',
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
  },
  promptText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 250,
  },
  promptButtons: {
    width: '100%',
    gap: 12,
  },
  allowButton: {
    width: '100%',
  },
  notNowButton: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  spinner: {
    transform: [{ rotate: '0deg' }],
  },
  loadingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 0,
    marginHorizontal: 24,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 14,
    color: '#0f172a',
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  filtersScroll: {
    maxHeight: 40,
    marginBottom: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    gap: 8,
    paddingHorizontal: 24,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 999,
  },
  filterChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  storeList: {
    flex: 1,
  },
  storeListContent: {
    paddingBottom: 100,
    gap: 12,
    paddingHorizontal: 24,
  },
  storeCard: {
    paddingVertical: 16,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  storeIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  storeDistance: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4f46e5',
  },
  storeMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  storeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapButton: {
    padding: 8,
    backgroundColor: '#eef2ff',
    borderRadius: 20,
  },
  mapButtonActive: {
    backgroundColor: '#4f46e5',
  },
  mapContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  mapAddress: {
    fontSize: 12,
    color: '#64748b',
  },
  directionsButton: {
    position: 'absolute',
    bottom: 20,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  directionsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
});

export default NearbyStores;
