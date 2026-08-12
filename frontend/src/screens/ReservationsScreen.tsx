import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StyleSheet,
  ActivityIndicator, Pressable, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Reservation } from '../types';
import { API_BASE_URL } from '../api/voya';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'Reservations'>;

const iconForType = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'VOL': return 'airplane';
    case 'HOTEL': return 'bed';
    default: return 'ellipse';
  }
};

export default function ReservationsScreen({ route, navigation }: Props) {
  const { voyageId, destination } = route.params;
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/voyages/${voyageId}/reservation`);
    const data = await res.json();
    setReservations(data);
    setLoading(false);
    setRefreshing(false);
  }, [voyageId]);

  useEffect(() => {
    navigation.setOptions({ title: `Réservations · ${destination}` });
    load();
  }, [load, navigation, destination]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT} />
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
        {reservations.length === 0 ? (
          <Text style={styles.emptyText}>Aucune réservation pour ce voyage.</Text>
        ) : (
          reservations.map((r) => (
            <Pressable
              key={r.id}
              style={styles.item}
              onPress={() => navigation.navigate('ReservationDetail', { reservationId: r.id })}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={iconForType(r.type)} size={20} color={ACCENT} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title}>{r.type} — {r.fournisseur}</Text>
                <Text style={styles.sub}>{r.reference} · {r.statut}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8fa3a3" />
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  scrollContent: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#8fa3a3', fontSize: 14 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#123a3a', borderRadius: 16, padding: 14, marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f4d4d', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textWrap: { flex: 1 },
  title: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  sub: { color: '#8fa3a3', fontSize: 13 },
});