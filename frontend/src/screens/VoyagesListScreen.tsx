import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StyleSheet,
  ActivityIndicator, Pressable, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Voyage } from '../types';
import { fetchVoyages, API_BASE_URL } from '../api/voya';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'VoyagesList'>;

const TABS: { label: string; value?: string }[] = [
  { label: 'Tout', value: undefined },
  { label: 'À venir', value: 'A_VENIR' },
  { label: 'En cours', value: 'EN_COURS' },
  { label: 'Passé', value: 'PASSE' },
  { label: 'Annulé', value: 'ANNULE' },
];

const statutColor = (statut: string) => {
  switch (statut) {
    case 'A_VENIR': return '#f4a259';
    case 'EN_COURS': return '#7bc9a3';
    case 'PASSE': return '#8fa3a3';
    case 'ANNULE': return '#f28b82';
    default: return '#8fa3a3';
  }
};

export default function VoyagesListScreen({ navigation }: Props) {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (statut?: string) => {
    try {
      setError(null);
      const data = await fetchVoyages(statut);
      setVoyages(data);
    } catch (e: any) {
      setError(e.message ?? 'Impossible de charger les voyages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusOnMount(() => {
    setLoading(true);
    load(activeTab);
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    load(activeTab);
  };

  const selectTab = (value?: string) => {
    setActiveTab(value);
    setLoading(true);
    load(value);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });


return (
  <SafeAreaView style={styles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsRow}
    >
      {TABS.map((tab) => (
        <Pressable
          key={tab.label}
          style={[styles.tab, activeTab === tab.value && styles.tabActive]}
          onPress={() => selectTab(tab.value)}
        >
          <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>

    {loading ? (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    ) : error ? (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={40} color="#f28b82" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>Vérifie que le backend tourne sur {API_BASE_URL}</Text>
      </View>
    ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
      >
        {voyages.length === 0 ? (
          <Text style={styles.emptyText}>Aucun voyage dans cette catégorie.</Text>
        ) : (
          voyages.map((v) => (
            <Pressable
              key={v.id}
              style={styles.card}
              onPress={() => navigation.navigate('Dashboard', { voyageId: v.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardDestination}>{v.destination}</Text>
                <View style={[styles.badge, { backgroundColor: statutColor(v.statut) + '22' }]}>
                  <Text style={[styles.badgeText, { color: statutColor(v.statut) }]}>
                    {v.statut.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDates}>
                {formatDate(v.dateDebut)} → {formatDate(v.dateFin)}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardFooterText}>
                  {v.reservations.length} réservation(s) · {v.documents.length} document(s)
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#8fa3a3" />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    )}
  </SafeAreaView>
);
}


// Petit hook local pour recharger à chaque focus de l'écran (retour depuis Dashboard inclus)
function useFocusOnMount(effect: () => void, deps: any[]) {
  const navigationHook = require('@react-navigation/native').useNavigation();
  React.useEffect(() => {
    const unsubscribe = navigationHook.addListener('focus', effect);
    effect();
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationHook, ...deps]);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#123a3a',
  },
  tabActive: { backgroundColor: ACCENT },
  tabText: { color: '#c9d6d6', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#0d2b2b' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#f28b82', fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 10 },
  errorHint: { color: '#8fa3a3', fontSize: 13, marginTop: 8, textAlign: 'center' },
  scrollContent: { padding: 16, paddingTop: 8 },
  emptyText: { color: '#8fa3a3', fontSize: 14, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#123a3a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardDestination: { color: '#ffffff', fontSize: 16, fontWeight: '700', flexShrink: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardDates: { color: '#8fa3a3', fontSize: 13, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardFooterText: { color: '#c9d6d6', fontSize: 12 },
});