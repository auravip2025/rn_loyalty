import { MapPin, Navigation, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';

// expo-location requires a native build — safe-require so Expo Go doesn't crash
let Location: any = null;
try { Location = require('expo-location'); } catch (_) {}

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';

export interface PlaceResult {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

interface LocationPickerProps {
  value?: PlaceResult | null;
  onChange: (place: PlaceResult | null) => void;
}

const staticMapUrl = (lat: number, lng: number) =>
  `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x200&scale=2&markers=color:red%7C${lat},${lng}&key=${MAPS_KEY}`;

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detecting, setDetecting] = useState(false);
  
  // Track temporary location while map is open
  const [tempLoc, setTempLoc] = useState<PlaceResult | null>(value || null);
  
  const mapRef = useRef<MapView>(null);
  const autocompleteRef = useRef<any>(null);

  // Sync tempLoc when modal opens
  React.useEffect(() => {
    if (modalVisible) {
      setTempLoc(value || null);
    }
  }, [modalVisible, value]);

  const handleUseCurrentLocation = async () => {
    if (!Location) {
      Alert.alert('Unavailable', 'Run a development build to use this feature.');
      return;
    }
    setDetecting(true);
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert('Location Disabled', 'Please turn on your device location services.', [{ text: 'OK' }]);
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]);
        return;
      }
      
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy?.High });
      const { latitude, longitude } = loc.coords;

      // Reverse geocode
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAPS_KEY}`);
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.warn('Failed to parse geocode response:', text);
        return;
      }
      const result = json.results?.[0];
      
      const newLoc = {
        address: result?.formatted_address || 'Current Location',
        latitude,
        longitude,
        placeId: result?.place_id || '',
      };
      
      setTempLoc(newLoc);
      mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 1000);
      autocompleteRef.current?.setAddressText(newLoc.address);
    } catch (err) {
      console.warn('Location error:', err);
    } finally {
      setDetecting(false);
    }
  };

  const handleConfirm = () => {
    onChange(tempLoc);
    setModalVisible(false);
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAPS_KEY}`);
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.warn('Failed to parse geocode response:', text);
        return;
      }
      const result = json.results?.[0];
      
      const newLoc = {
        address: result?.formatted_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        latitude,
        longitude,
        placeId: result?.place_id || '',
      };
      setTempLoc(newLoc);
      autocompleteRef.current?.setAddressText(newLoc.address);
    } catch (err) {
      console.warn('Geocode error:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Main Button ── */}
      {value ? (
        <View style={styles.selectedContainer}>
          <View style={styles.addressRow}>
            <MapPin size={16} color="#4f46e5" style={{ flexShrink: 0 }} />
            <Text style={styles.addressText} numberOfLines={2}>{value.address}</Text>
            <TouchableOpacity onPress={() => onChange(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.editMapBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.editMapBtnText}>Edit on Map</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.mainBtn} onPress={() => setModalVisible(true)}>
          <MapPin size={18} color="#4f46e5" />
          <Text style={styles.mainBtnText}>Select Location</Text>
        </TouchableOpacity>
      )}

      {/* ── Fullscreen Map Modal ── */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set Location</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFillObject}
              initialRegion={tempLoc ? {
                latitude: tempLoc.latitude,
                longitude: tempLoc.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              } : {
                // Default fallback (e.g., city center)
                latitude: 37.7749,
                longitude: -122.4194,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
              onPress={handleMapPress}
            >
              {tempLoc && <Marker coordinate={{ latitude: tempLoc.latitude, longitude: tempLoc.longitude }} />}
            </MapView>

            {/* Search overlay */}
            <View style={styles.searchOverlay}>
              <View style={styles.searchRow}>
                <View style={styles.autocompleteWrap}>
                  <GooglePlacesAutocomplete
                    ref={autocompleteRef}
                    placeholder="Search address..."
                    fetchDetails
                    onPress={(data, details) => {
                      if (!details) return;
                      const { lat, lng } = details.geometry.location;
                      const newLoc = { address: data.description, latitude: lat, longitude: lng, placeId: data.place_id };
                      setTempLoc(newLoc);
                      mapRef.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 }, 1000);
                    }}
                    query={{ key: MAPS_KEY, language: 'en' }}
                    styles={{
                      textInputContainer: styles.inputContainer,
                      textInput: styles.textInput,
                      listView: styles.listView,
                      row: styles.suggestionRow,
                      description: styles.suggestionText,
                      separator: styles.separator,
                    }}
                    enablePoweredByContainer={false}
                    keepResultsAfterBlur={false}
                  />
                </View>
                <TouchableOpacity style={styles.myLocationBtn} onPress={handleUseCurrentLocation}>
                  {detecting ? <ActivityIndicator size="small" color="#4f46e5" /> : <Navigation size={18} color="#4f46e5" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm button overlay */}
            <View style={styles.confirmOverlay}>
              <TouchableOpacity 
                style={[styles.confirmBtn, !tempLoc && styles.confirmBtnDisabled]} 
                onPress={handleConfirm}
                disabled={!tempLoc}
              >
                <Text style={styles.confirmBtnText}>Confirm Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    height: 52,
  },
  mainBtnText: { fontSize: 15, fontWeight: '700', color: '#334155' },
  selectedContainer: {
    borderWidth: 1.5,
    borderColor: '#e0e7ff',
    borderRadius: 14,
    backgroundColor: '#f5f3ff',
    overflow: 'hidden',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
  },
  addressText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#374151', lineHeight: 18 },
  editMapBtn: {
    backgroundColor: '#eef2ff',
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e7ff',
  },
  editMapBtnText: { fontSize: 13, fontWeight: '700', color: '#4f46e5' },
  
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: '#ffffff' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  closeText: { fontSize: 15, fontWeight: '600', color: '#4f46e5' },
  mapContainer: { flex: 1 },
  searchOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchRow: { flexDirection: 'row', gap: 8 },
  autocompleteWrap: { flex: 1 },
  inputContainer: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 0,
  },
  textInput: { height: 48, fontSize: 14, color: '#0f172a', fontWeight: '500', backgroundColor: 'transparent' },
  listView: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  suggestionRow: { padding: 14 },
  suggestionText: { fontSize: 13, color: '#0f172a', fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#f1f5f9' },
  myLocationBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  confirmOverlay: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
  },
  confirmBtn: {
    backgroundColor: '#4f46e5',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  confirmBtnDisabled: { backgroundColor: '#a5b4fc', shadowOpacity: 0 },
  confirmBtnText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
});

export default LocationPicker;
