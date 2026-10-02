import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchMarketplaceOffers } from '../api/voya';
import { MarketplaceOffer } from '../types';

const CATEGORY_DEFS = [
  { key: 'tourism', label: 'Tourisme', icon: 'map-outline', tint: '#0d2b2b' },
  { key: 'personal', label: 'Personnels', icon: 'hand-left-outline', tint: '#0d2b2b' },
  { key: 'emergency', label: 'Urgence', icon: 'medical-outline', tint: '#0d2b2b' },
  { key: 'lifestyle', label: 'Lifestyle', icon: 'restaurant-outline', tint: '#0d2b2b' },
] as const;

const FALLBACK_OFFERS: MarketplaceOffer[] = [
  {
    id: 'guide-marais',
    name: 'Visite guidée — Le Marais',
    category: 'tourism',
    price: 35,
    currency: '€',
    rating: 4.9,
    badge: 'Amel G. · Guide certifiée',
    isVerified: true,
    verificationStatus: 'Vérifié',
    description: 'Balades à pied dans le Marais avec anecdotes et points d’intérêt.',
  },
  {
    id: 'translator-fr-ar',
    name: 'Traducteur FR/AR',
    category: 'personal',
    price: 20,
    currency: '€',
    rating: 4.8,
    badge: 'Disponible aujourd\'hui',
    isVerified: true,
    verificationStatus: 'Vérifié',
    description: 'Interprétation et aide de communication en français et arabe.',
  },
  {
    id: 'medical-assistance',
    name: 'Aide médicale rapide',
    category: 'emergency',
    price: 0,
    currency: '€',
    rating: 4.9,
    badge: 'Urgence 24/7',
    isVerified: true,
    verificationStatus: 'Vérifié',
    description: 'Assistance locale pour situations urgentes et conseils rapides.',
  },
  {
    id: 'wellness-local',
    name: 'Massage express',
    category: 'lifestyle',
    price: 45,
    currency: '€',
    rating: 4.7,
    badge: 'Bien-être',
    isVerified: true,
    verificationStatus: 'Vérifié',
    description: 'Séance locale relaxante, idéale après un long vol.',
  },
];

export default function MarketplaceScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('tourism');
  const [offers, setOffers] = useState<MarketplaceOffer[]>(FALLBACK_OFFERS);
  const [loading, setLoading] = useState(false);

  const loadOffers = async (nextCategory?: string) => {
    setLoading(true);
    try {
      const results = await fetchMarketplaceOffers({
        category: nextCategory && nextCategory !== 'all' ? nextCategory : undefined,
        maxPrice: 100,
      });
      if (results && results.length > 0) {
        setOffers(results);
      } else {
        setOffers(FALLBACK_OFFERS.filter((item) => !nextCategory || nextCategory === 'all' || item.category === nextCategory));
      }
    } catch {
      setOffers(FALLBACK_OFFERS.filter((item) => !nextCategory || nextCategory === 'all' || item.category === nextCategory));
      Alert.alert('Marketplace', 'Impossible de charger les offres. Affichage local.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOffers(selectedCategory);
  }, []);

  const filteredOffers = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return offers;
    return offers.filter((offer) => offer.category === selectedCategory);
  }, [offers, selectedCategory]);

  const setCategory = (category: string) => {
    setSelectedCategory(category);
    void loadOffers(category);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.time}>9:41</Text>
        <Text style={styles.brand}>VOYA · FR → TN</Text>
      </View>

      <Text style={styles.heading}>Services locaux</Text>
      <Text style={styles.subheading}>Prestataires vérifiés autour de vous</Text>

      <View style={styles.grid}>
        {CATEGORY_DEFS.map((item) => {
          const active = selectedCategory === item.key;
          const isPersonnels = item.key === 'personal';

          return (
            <Pressable
              key={item.key}
              style={[styles.categoryCard, active && styles.categoryCardActive, isPersonnels && active && styles.personalCardActive]}
              onPress={() => setCategory(item.key)}
            >
              <View style={[styles.categoryIconWrap, active && styles.categoryIconWrapActive, isPersonnels && active && styles.personalIconActive]}>
                <Ionicons name={item.icon as any} size={28} color={active ? '#0d2b2b' : '#0d2b2b'} />
              </View>
              <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Populaire à Paris</Text>

      {loading ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : (
        filteredOffers.map((offer) => (
          <View key={offer.id} style={styles.offerRow}>
            <View style={[styles.offerAvatar, offer.category === 'tourism' ? styles.avatarTourism : styles.avatarDefault]}>
              <Ionicons name={offer.category === 'tourism' ? 'map-outline' : 'language-outline'} size={22} color="#0d2b2b" />
            </View>

            <View style={styles.offerBody}>
              <View style={styles.offerHeader}>
                <Text style={styles.offerTitle}>{offer.name}</Text>
                <Text style={styles.offerPrice}>{offer.price ? `${offer.price} €` : 'Gratuit'}</Text>
              </View>

              <Text style={styles.offerMeta}>
                {offer.badge}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3d3e', paddingTop: 8 },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  time: { color: '#123a3a', fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'left' },
  brand: { color: '#123a3a', fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'center' },
  heading: { color: '#123a3a', fontSize: 32, fontWeight: '800', marginTop: 6 },
  subheading: { color: '#123a3a', fontSize: 16, marginBottom: 18 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    minHeight: 112,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#123a3a',
    backgroundColor: '#f3f0e6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  categoryCardActive: {
    backgroundColor: '#f2f4ef',
  },
  personalCardActive: {
    borderColor: '#123a3a',
  },
  categoryIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#f0f3f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryIconWrapActive: {
    backgroundColor: '#e5f0ee',
  },
  personalIconActive: {
    backgroundColor: '#dff1df',
  },
  categoryLabel: { color: '#123a3a', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  categoryLabelActive: { color: '#123a3a' },
  sectionTitle: { color: '#123a3a', fontSize: 28, fontWeight: '800', marginTop: 20, marginBottom: 10 },
  loadingText: { color: '#123a3a', fontSize: 16, marginVertical: 10 },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  offerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarTourism: { backgroundColor: '#f3d59a' },
  avatarDefault: { backgroundColor: '#d7f2d1' },
  offerBody: { flex: 1 },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  offerTitle: { color: '#123a3a', fontSize: 16, fontWeight: '700', flexShrink: 1 },
  offerPrice: { color: '#123a3a', fontSize: 15, fontWeight: '800' },
  offerMeta: { color: '#123a3a', fontSize: 13, marginTop: 2 },
});
