import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { fetchMarketplaceOffers } from '../api/voya';
import { MarketplaceOffer } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  tourism: 'Tourisme',
  personal: 'Services personnels',
  emergency: 'Urgence',
  lifestyle: 'Lifestyle',
};

export default function MarketplaceScreen() {
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('100');
  const [search, setSearch] = useState('');
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const results = await fetchMarketplaceOffers({
        category: category.trim() || undefined,
        maxPrice: Number(maxPrice || 0),
        search: search.trim() || undefined,
      });
      setOffers(results);
    } catch {
      Alert.alert('Marketplace', 'Impossible de charger les offres.');
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOffers();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Marketplace de services locaux</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Catégorie</Text>
        <TextInput value={category} onChangeText={setCategory} style={styles.input} placeholder="tourism / personal / emergency / lifestyle" placeholderTextColor="#8fa3a3" />

        <Text style={styles.label}>Prix maximum (€)</Text>
        <TextInput value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" style={styles.input} placeholder="100" placeholderTextColor="#8fa3a3" />

        <Text style={styles.label}>Recherche</Text>
        <TextInput value={search} onChangeText={setSearch} style={styles.input} placeholder="guide, médecin, photographe..." placeholderTextColor="#8fa3a3" />

        <Pressable style={styles.button} onPress={() => void loadOffers()}>
          <Text style={styles.buttonText}>{loading ? 'Chargement...' : 'Rechercher'}</Text>
        </Pressable>
      </View>

      {offers.map((offer) => (
        <View key={offer.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{offer.name}</Text>
            <Text style={styles.price}>{offer.price ? `${offer.price}€` : 'Gratuit'}</Text>
          </View>
          <Text style={styles.muted}>{CATEGORY_LABELS[offer.category] ?? offer.category} · note {offer.rating}/5</Text>
          <Text style={styles.muted}>{offer.verificationStatus} · {offer.isVerified ? 'Prestataire vérifié' : 'En vérification'}</Text>
          <Text style={styles.badge}>{offer.badge}</Text>
          <Text style={styles.description}>{offer.description}</Text>
          {offer.contact ? <Text style={styles.contact}>Contact : {offer.contact}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { padding: 16, gap: 14 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800' },
  formCard: { backgroundColor: '#123a3a', borderRadius: 16, padding: 14, gap: 10 },
  label: { color: '#dfe9e9', fontWeight: '600' },
  input: { backgroundColor: '#0d2b2b', color: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1f4d4d' },
  button: { backgroundColor: '#f4a259', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#0d2b2b', fontWeight: '800' },
  card: { backgroundColor: '#123a3a', borderRadius: 14, padding: 14, gap: 7 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  price: { color: '#f4a259', fontWeight: '800' },
  muted: { color: '#9bb0b0' },
  badge: { color: '#dff5f5', backgroundColor: '#1f4d4d', borderRadius: 999, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
  description: { color: '#fff', lineHeight: 20 },
  contact: { color: '#f4a259', fontWeight: '700' },
});
