import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createTransportBooking, fetchTransportBookings, fetchTransportDrivers, updateTransportBooking } from '../api/voya';
import { TransportBooking, TransportBookingStatus, TransportDriver } from '../types';

const ACCENT = '#f4a259';
const STATUS_LABELS: Record<TransportBookingStatus, string> = {
  CONFIRMED: 'Confirmée', EN_ROUTE: 'En route', ARRIVED: 'Arrivée', COMPLETED: 'Terminée', CANCELLED: 'Annulée',
};
const NEXT_STATUS: Partial<Record<TransportBookingStatus, TransportBookingStatus>> = {
  CONFIRMED: 'EN_ROUTE', EN_ROUTE: 'ARRIVED', ARRIVED: 'COMPLETED',
};

type Props = { userId: string };

export default function TransportScreen({ userId }: Props) {
  const [drivers, setDrivers] = useState<TransportDriver[]>([]);
  const [bookings, setBookings] = useState<TransportBooking[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<TransportDriver | null>(null);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [availableDrivers, currentBookings] = await Promise.all([
        fetchTransportDrivers(),
        fetchTransportBookings(userId),
      ]);
      setDrivers(availableDrivers);
      setBookings(currentBookings);
    } catch (error: any) {
      Alert.alert('Transport', error.message ?? 'Impossible de charger les chauffeurs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const book = async () => {
    if (!selectedDriver || !pickup.trim() || !dropoff.trim()) {
      Alert.alert('Transport', 'Indique les adresses de départ et d’arrivée.');
      return;
    }
    setSubmitting(true);
    try {
      await createTransportBooking({
        userId,
        driverId: selectedDriver.id,
        pickupAddress: pickup.trim(),
        dropoffAddress: dropoff.trim(),
        scheduledAt: new Date().toISOString(),
      });
      setSelectedDriver(null);
      setPickup('');
      setDropoff('');
      await load();
    } catch (error: any) {
      Alert.alert('Transport', error.message ?? 'La réservation a échoué.');
    } finally {
      setSubmitting(false);
    }
  };

  const advance = async (booking: TransportBooking) => {
    const next = NEXT_STATUS[booking.status];
    if (!next) return;
    try {
      const updated = await updateTransportBooking(booking.id, { status: next });
      setBookings((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error: any) {
      Alert.alert('Transport', error.message ?? 'Impossible de mettre à jour le statut.');
    }
  };

  if (loading) {
    return <SafeAreaView style={styles.container}><View style={styles.centered}><ActivityIndicator size="large" color={ACCENT} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={ACCENT} />}
      >
        <Text style={styles.heading}>Chauffeurs disponibles</Text>
        <Text style={styles.subtitle}>Compare les profils avant de réserver.</Text>
        {drivers.map((driver) => (
          <View key={driver.id} style={styles.card}>
            <View style={styles.driverIcon}><Ionicons name="person" size={24} color="#0d2b2b" /></View>
            <View style={styles.driverInfo}>
              <Text style={styles.title}>{driver.name}</Text>
              <Text style={styles.muted}>{driver.vehicleModel} · {driver.vehicleColor}</Text>
              <Text style={styles.muted}>Plaque {driver.vehiclePlate}</Text>
              <View style={styles.meta}><Text style={styles.rating}>★ {Number(driver.rating).toFixed(1)}</Text><Text style={styles.price}>{Number(driver.pricePerKm).toFixed(2)} €/km</Text></View>
            </View>
            <Pressable style={styles.button} onPress={() => setSelectedDriver(driver)}><Text style={styles.buttonText}>Réserver</Text></Pressable>
          </View>
        ))}

        <Text style={styles.heading}>Mes réservations</Text>
        {bookings.length === 0 ? <Text style={styles.muted}>Aucune course réservée.</Text> : bookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.row}><Text style={styles.title}>{booking.driver?.name ?? 'Chauffeur'}</Text><Text style={styles.status}>{STATUS_LABELS[booking.status]}</Text></View>
            <Text style={styles.muted}>{booking.pickupAddress} → {booking.dropoffAddress}</Text>
            <Text style={styles.price}>{Number(booking.price).toFixed(2)} €</Text>
            {NEXT_STATUS[booking.status] && <Pressable style={styles.outlineButton} onPress={() => void advance(booking)}><Text style={styles.outlineText}>Actualiser le statut</Text></Pressable>}
            {booking.status === 'COMPLETED' && <Text style={styles.muted}>Merci pour ta course. La notation sera disponible prochainement.</Text>}
          </View>
        ))}
      </ScrollView>

      <Modal visible={selectedDriver !== null} transparent animationType="slide" onRequestClose={() => setSelectedDriver(null)}>
        <View style={styles.modalBackdrop}><View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Réserver avec {selectedDriver?.name}</Text>
          <TextInput value={pickup} onChangeText={setPickup} placeholder="Adresse de départ" placeholderTextColor="#8fa3a3" style={styles.input} />
          <TextInput value={dropoff} onChangeText={setDropoff} placeholder="Adresse d’arrivée" placeholderTextColor="#8fa3a3" style={styles.input} />
          <View style={styles.modalActions}>
            <Pressable style={styles.cancelButton} onPress={() => setSelectedDriver(null)}><Text style={styles.cancelText}>Annuler</Text></Pressable>
            <Pressable style={styles.button} onPress={() => void book()} disabled={submitting}><Text style={styles.buttonText}>{submitting ? 'Réservation...' : 'Confirmer'}</Text></Pressable>
          </View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8, marginBottom: 4 },
  subtitle: { color: '#8fa3a3', marginBottom: 12 },
  card: { backgroundColor: '#123a3a', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  driverIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  driverInfo: { flex: 1 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  muted: { color: '#9bb0b0', marginTop: 4 },
  meta: { flexDirection: 'row', gap: 14, marginTop: 6 },
  rating: { color: ACCENT, fontWeight: '700' },
  price: { color: ACCENT, fontWeight: '800', marginTop: 6 },
  button: { backgroundColor: ACCENT, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  buttonText: { color: '#0d2b2b', fontWeight: '800' },
  bookingCard: { backgroundColor: '#123a3a', borderRadius: 14, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  status: { color: ACCENT, fontWeight: '700' },
  outlineButton: { borderWidth: 1, borderColor: ACCENT, borderRadius: 10, paddingVertical: 9, alignItems: 'center', marginTop: 12 },
  outlineText: { color: ACCENT, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#123a3a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  input: { backgroundColor: '#0d2b2b', borderRadius: 10, color: '#fff', padding: 12, marginBottom: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 8 },
  cancelButton: { padding: 10 },
  cancelText: { color: '#f28b82', fontWeight: '700' },
});
