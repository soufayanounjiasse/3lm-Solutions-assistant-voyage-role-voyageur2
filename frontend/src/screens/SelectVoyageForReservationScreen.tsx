import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StyleSheet,
  ActivityIndicator, Pressable, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Voyage } from '../types';
import { fetchVoyages } from '../api/voya';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectVoyageForReservation'>;

export default function SelectVoyageForReservationScreen({ navigation }: Props) {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchVoyages();
      setVoyages(data.filter((v) => v.statut !== 'ANNULE'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: 'Réserver pour quel voyage ?' });
    load();
  }, [load, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  if (voyages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="airplane-outline" size={40} color="#8fa3a3" />
          <Text style={styles.emptyTitle}>Aucun voyage pour l'instant</Text>
          <Text style={styles.emptyHint}>
            Crée d'abord un voyage pour pouvoir y ajouter des réservations.
          </Text>
          <Pressable
            style={styles.button}
            onPress={() => navigation.getParent()?.navigate('Nouveau' as never)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#0d2b2b" />
            <Text style={styles.buttonText}>Ajouter un voyage</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
      >
        {voyages.map((v) => (
          <Pressable
            key={v.id}
            style={styles.card}
            onPress={() => navigation.navigate('Reservations', { voyageId: v.id, destination: v.destination })}
          >
            <View>
              <Text style={styles.cardDestination}>{v.destination}</Text>
              <Text style={styles.cardDates}>
                {formatDate(v.dateDebut)} → {formatDate(v.dateFin)} · {v.reservations.length} réservation(s)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8fa3a3" />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginTop: 14, textAlign: 'center' },
  emptyHint: { color: '#8fa3a3', fontSize: 13, marginTop: 8, textAlign: 'center', marginBottom: 20 },
  button: {
    flexDirection: 'row', backgroundColor: ACCENT, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center',
  },
  buttonText: { color: '#0d2b2b', fontSize: 14, fontWeight: '700', marginLeft: 6 },
  scrollContent: { padding: 20 },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#123a3a', borderRadius: 16, padding: 16, marginBottom: 12,
  },
  cardDestination: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardDates: { color: '#8fa3a3', fontSize: 13 },
});