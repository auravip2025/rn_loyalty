import { MapPin, Navigation, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

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
  const [detecting, setDetecting] = useState(false);
  const autocompleteRef = useRef<any>(null);

  const handleUseCurrentLocation = async () => {
    if (!Location) {
      alert('Location unavailable — run a development build (npx expo run:ios) to use this feature.');
      return;
    }
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission denied.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy?.High });
      const { latitude, longitude } = loc.coords;

      // Reverse geocode via Google Geocoding API
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${MAPS_KEY}`
      );
      const json = await res.json();
      const result = json.results?.[0];
      if (result) {
        onChange({
          address: result.formatted_address,
          latitude,
          longitude,
          placeId: result.place_id || '',
        });
        autocompleteRef.current?.setAddressText(result.formatted_address);
      }
    } catch (err) {
      console.warn('[LocationPicker] current location failed:', err);
    } finally {
      setDetecting(false);
    }
  };

  const handleClear = () => {
    onChange(null);
    autocompleteRef.current?.setAddressText('');
    autocompleteRef.current?.clear();
  };

  return (
    <View style={styles.container}>
      {/* Search input */}
      <View style={styles.searchRow}>
        <View style={styles.autocompleteWrap}>
          <GooglePlacesAutocomplete
            ref={autocompleteRef}
            placeholder="Search for a location…"
            fetchDetails
            onPress={(data, details) => {
              if (!details) return;
              const { lat, lng } = details.geometry.location;
              onChange({
                address: data.description,
                latitude: lat,
                longitude: lng,
                placeId: data.place_id,
              });
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
            minLength={2}
            debounce={300}
            textInputProps={{
              placeholderTextColor: '#94a3b8',
              clearButtonMode: 'never',
            }}
          />
        </View>

        {/* Current location button */}
        <TouchableOpacity
          style={styles.myLocationBtn}
          onPress={handleUseCurrentLocation}
          disabled={detecting}
        >
          {detecting
            ? <ActivityIndicator size="small" color="#4f46e5" />
            : <Navigation size={18} color="#4f46e5" />
          }
        </TouchableOpacity>
      </View>

      {/* Selected location preview */}
      {value && (
        <View style={styles.preview}>
          {/* Static map thumbnail */}
          {MAPS_KEY ? (
            <Image
              source={{ uri: staticMapUrl(value.latitude, value.longitude) }}
              style={styles.mapImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.mapImage, styles.mapPlaceholder]}>
              <MapPin size={28} color="#4f46e5" />
            </View>
          )}

          {/* Address chip */}
          <View style={styles.addressRow}>
            <MapPin size={14} color="#4f46e5" style={{ flexShrink: 0 }} />
            <Text style={styles.addressText} numberOfLines={2}>{value.address}</Text>
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={15} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  autocompleteWrap: {
    flex: 1,
    // GooglePlacesAutocomplete renders its own absolute dropdown — needs zIndex
    zIndex: 10,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 4,
  },
  textInput: {
    height: 48,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
    backgroundColor: 'transparent',
    marginBottom: 0,
  },
  listView: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  suggestionText: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  myLocationBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0e7ff',
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mapImage: {
    width: '100%',
    height: 130,
    backgroundColor: '#e2e8f0',
  },
  mapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    lineHeight: 17,
  },
});

export default LocationPicker;
