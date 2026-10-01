import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { fetchHotelRecommendations } from '../api/voya';
import { HotelRecommendation } from '../types';

export default function HotelScreen() {
  const [location, setLocation] = useState('Paris');
  const [maxBudget, setMaxBudget] = useState('100');
  const [preferences, setPreferences] = useState('famille,enfants');
  const [recommendations, setRecommendations] = useState<HotelRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const hotels = await fetchHotelRecommendations({
        location,
        maxBudget: Number(maxBudget || 0),
        preferences: preferences.split(',').map((entry) => entry.trim()).filter(Boolean),
      });
      setRecommendations(hotels);
    } catch {
      Alert.alert('Hébergement', 'Impossible de charger les recommandations.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecommendations();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Hébergement & recommandations</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Localisation</Text>
        <TextInput value={location} onChangeText={setLocation} style={styles.input} placeholder="Paris" placeholderTextColor="#8fa3a3" />

        <Text style={styles.label}>Budget max / nuit (€)</Text>
        <TextInput
          value={maxBudget}
          onChangeText={setMaxBudget}
          keyboardType="numeric"
          style={styles.input}
          placeholder="100"
          placeholderTextColor="#8fa3a3"
        />

        <Text style={styles.label}>Préférences</Text>
        <TextInput value={preferences} onChangeText={setPreferences} style={styles.input} placeholder="famille,enfants" placeholderTextColor="#8fa3a3" />

        <Pressable style={styles.button} onPress={() => void loadRecommendations()}>
          <Text style={styles.buttonText}>{loading ? 'Recherche...' : 'Rechercher'}</Text>
        </Pressable>
      </View>

      {recommendations.length === 0 && !loading ? (
        <Text style={styles.muted}>Aucune recommandation trouvée pour ce budget.</Text>
      ) : null}

      {recommendations.map((hotel) => (
        <View key={hotel.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{hotel.name}</Text>
            <Text style={styles.price}>{hotel.nightPrice}€</Text>
          </View>
          <Text style={styles.muted}>{hotel.location} · {hotel.rating}/5</Text>
          <Text style={styles.tags}>{hotel.tags.join(' • ')}</Text>
          <Text style={styles.justification}>{hotel.justification}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { padding: 16, gap: 14 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  formCard: { backgroundColor: '#123a3a', borderRadius: 16, padding: 14, gap: 10 },
  label: { color: '#dfe9e9', fontWeight: '600' },
  input: { backgroundColor: '#0d2b2b', color: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1f4d4d' },
  button: { backgroundColor: '#f4a259', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#0d2b2b', fontWeight: '800' },
  card: { backgroundColor: '#123a3a', borderRadius: 14, padding: 14, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  price: { color: '#f4a259', fontWeight: '800' },
  muted: { color: '#9bb0b0' },
  tags: { color: '#d0e7e7' },
  justification: { color: '#fff', backgroundColor: '#1f4d4d', borderRadius: 10, padding: 10 },
});
