import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Linking, Platform, Pressable, SafeAreaView, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { RootStackParamList } from '../types';
import { MapPlace, searchMapPlaces } from '../api/voya';

const ACCENT = '#f4a259';
const DEFAULT_REGION: Region = { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.08, longitudeDelta: 0.08 };
const FILTERS = [
  { label: 'Hôtels', query: 'hôtel' },
  { label: 'Urgences', query: 'service médical urgence' },
  { label: 'Restaurants', query: 'restaurant' },
  { label: 'Guides', query: 'guide touristique' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Maps'>;

export default function MapsScreen({ route }: Props) {
  const [query, setQuery] = useState(route.params.destination);
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selected, setSelected] = useState<MapPlace | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    void search(route.params.destination);
  }, [route.params.destination]);

  async function search(text: string, center = position) {
    const term = text.trim();
    if (!term) {
      setMessage('Saisissez une adresse ou une destination pour chercher sur la carte.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const results = await searchMapPlaces(term, center ?? undefined);
      setPlaces(results);
      setSelected(null);
      if (results[0]) {
        const nextRegion = { latitude: results[0].latitude, longitude: results[0].longitude, latitudeDelta: 0.045, longitudeDelta: 0.045 };
        setRegion(nextRegion);
        mapRef.current?.animateToRegion(nextRegion, 450);
      } else {
        setMessage('Aucun lieu trouvé. Essayez une adresse ou une autre recherche.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'La recherche est momentanément indisponible.');
    } finally {
      setLoading(false);
    }
  }

  async function locateMe() {
    setMessage(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setMessage('Position non autorisée. La recherche par adresse reste disponible.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: current.coords.latitude, longitude: current.coords.longitude };
      setPosition(coords);
      const nextRegion = { ...coords, latitudeDelta: 0.045, longitudeDelta: 0.045 };
      setRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 450);
      await search(query || 'lieux à proximité', coords);
    } catch {
      setMessage('Position indisponible. Vous pouvez continuer avec une adresse.');
    }
  }

  function openDirections(place: MapPlace) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    void Linking.openURL(url);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.permissionNote}>
          <Ionicons name="location-outline" size={19} color={ACCENT} />
          <Text style={styles.permissionText}>Votre position sert à centrer la carte et à rapprocher les résultats. Elle n’est demandée que si vous choisissez « Ma position ».</Text>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={19} color="#9aabaa" />
          <TextInput
            accessibilityLabel="Rechercher une adresse ou un lieu"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => void search(query)}
            placeholder="Adresse, hôtel, service médical…"
            placeholderTextColor="#8fa3a3"
            returnKeyType="search"
            style={styles.searchInput}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Lancer la recherche" onPress={() => void search(query)} style={styles.searchButton}>
            <Ionicons name="arrow-forward" size={19} color="#0d2b2b" />
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" onPress={() => void locateMe()} style={styles.locateButton}>
          <Ionicons name="navigate-outline" size={17} color={ACCENT} />
          <Text style={styles.locateText}>Ma position</Text>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((filter) => (
            <Pressable key={filter.label} onPress={() => void search(`${filter.query} ${query || route.params.destination}`)} style={styles.filterButton}>
              <Text style={styles.filterText}>{filter.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {Platform.OS === 'web' ? (
          <View style={styles.webMapFallback}>
            <Ionicons name="map-outline" size={28} color={ACCENT} />
            <Text style={styles.webMapTitle}>Carte interactive disponible sur mobile</Text>
            <Text style={styles.webMapText}>Les lieux recherchés restent accessibles ci-dessous.</Text>
          </View>
        ) : (
          <MapView ref={mapRef} style={styles.map} region={region} onRegionChangeComplete={setRegion}>
            {position && <Marker coordinate={position} title="Ma position" pinColor="#168c78" />}
            {places.map((place) => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                title={place.name}
                description={place.address}
                onPress={() => setSelected(place)}
              />
            ))}
          </MapView>
        )}

        {selected && (
          <Pressable onPress={() => openDirections(selected)} style={styles.selectedPlace}>
            <View style={styles.resultIcon}><Ionicons name="location" size={18} color={ACCENT} /></View>
            <View style={styles.resultBody}>
              <Text style={styles.resultName}>{selected.name}</Text>
              <Text style={styles.resultAddress}>{selected.address}</Text>
            </View>
            <Ionicons name="navigate-outline" size={19} color={ACCENT} />
          </Pressable>
        )}

        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>Lieux à proximité</Text>
          {loading && <ActivityIndicator color={ACCENT} size="small" />}
          {!loading && <Text style={styles.resultCount}>{places.length}</Text>}
        </View>
        {message && <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>}
        {places.map((place) => (
          <Pressable key={place.id} onPress={() => { setSelected(place); openDirections(place); }} style={styles.resultRow}>
            <View style={styles.resultIcon}><Ionicons name="location-outline" size={18} color={ACCENT} /></View>
            <View style={styles.resultBody}>
              <Text style={styles.resultName}>{place.name}</Text>
              <Text numberOfLines={2} style={styles.resultAddress}>{place.address || place.types.join(' · ')}</Text>
              {place.rating !== undefined && <Text style={styles.rating}>★ {place.rating.toFixed(1)}</Text>}
            </View>
            <Ionicons name="navigate-outline" size={19} color="#8fa3a3" />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { padding: 16, paddingBottom: 36 },
  permissionNote: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#123a3a', padding: 13, borderRadius: 12, marginBottom: 14 },
  permissionText: { color: '#c9d6d6', fontSize: 13, lineHeight: 19, flex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingLeft: 13, minHeight: 52 },
  searchInput: { color: '#0d2b2b', flex: 1, fontSize: 15, paddingHorizontal: 10, paddingVertical: 12 },
  searchButton: { width: 42, height: 42, marginRight: 5, borderRadius: 9, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  locateButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, paddingVertical: 12 },
  locateText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  filters: { gap: 8, paddingBottom: 14 },
  filterButton: { backgroundColor: '#1f4d4d', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 9 },
  filterText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  map: { width: '100%', height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 18 },
  webMapFallback: { height: 180, borderRadius: 12, backgroundColor: '#123a3a', alignItems: 'center', justifyContent: 'center', marginBottom: 18, padding: 20 },
  webMapTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginTop: 10, textAlign: 'center' },
  webMapText: { color: '#9aabaa', fontSize: 13, marginTop: 5, textAlign: 'center' },
  selectedPlace: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f4d4d', padding: 12, borderRadius: 10, marginBottom: 14 },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
  resultCount: { color: '#9aabaa', fontSize: 13 },
  message: { color: '#f4c18f', fontSize: 13, lineHeight: 19, paddingVertical: 8 },
  resultRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#123a3a', padding: 12, borderRadius: 10, marginTop: 8 },
  resultIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1f4d4d', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  resultBody: { flex: 1 },
  resultName: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  resultAddress: { color: '#9aabaa', fontSize: 12, lineHeight: 17, marginTop: 3 },
  rating: { color: '#f4c18f', fontSize: 12, marginTop: 3 },
});