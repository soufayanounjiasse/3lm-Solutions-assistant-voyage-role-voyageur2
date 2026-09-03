import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Reservation } from '../types';
import { fetchReservation, updateReservation } from '../api/voya';
import ConfirmModal from '../components/ConfirmModal';

const ACCENT = '#f4a259';
const DANGER = '#f28b82';

type Props = NativeStackScreenProps<RootStackParamList, 'ReservationDetail'>;

const iconForType = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'VOL': return 'airplane';
    case 'HOTEL': return 'bed';
    default: return 'ellipse';
  }
};

export default function ReservationDetailScreen({ route }: Props) {
  const { reservationId } = route.params;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const load = useCallback(() => {
    fetchReservation(reservationId).then((r) => {
      setReservation(r);
      setLoading(false);
    });
  }, [reservationId]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      const updated = await updateReservation(reservationId, { statut: 'ANNULEE' });
      setReservation(updated);
    } catch (e: any) {
      console.error(e);
    } finally {
      setCancelling(false);
      setConfirmVisible(false);
    }
  };

  if (loading || !reservation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  const formatDateTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  const isCancelled = reservation.statut === 'ANNULEE';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={iconForType(reservation.type)} size={32} color={ACCENT} />
        </View>
        <Text style={styles.title}>{reservation.type} — {reservation.fournisseur}</Text>
        <View style={[styles.badge, isCancelled && styles.badgeCancelled]}>
          <Text style={[styles.badgeText, isCancelled && styles.badgeTextCancelled]}>{reservation.statut}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Référence</Text>
          <Text style={styles.infoValue}>{reservation.reference}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Départ / Début</Text>
          <Text style={styles.infoValue}>{formatDateTime(reservation.dateDebut)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Arrivée / Fin</Text>
          <Text style={styles.infoValue}>{formatDateTime(reservation.dateFin)}</Text>
        </View>

        {!isCancelled && (
          <Pressable style={styles.cancelButton} onPress={() => setConfirmVisible(true)}>
            <Ionicons name="close-circle-outline" size={18} color={DANGER} />
            <Text style={styles.cancelButtonText}>Annuler la réservation</Text>
          </Pressable>
        )}
      </View>

      <ConfirmModal
        visible={confirmVisible}
        title="Annuler la réservation"
        message="Es-tu sûr de vouloir annuler cette réservation ?"
        confirmLabel="Annuler la réservation"
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, alignItems: 'center' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#123a3a', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  badge: { backgroundColor: '#1f4d4d', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 24 },
  badgeCancelled: { backgroundColor: 'rgba(242,139,130,0.15)' },
  badgeText: { color: ACCENT, fontSize: 12, fontWeight: '700' },
  badgeTextCancelled: { color: DANGER },
  infoRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f4d4d' },
  infoLabel: { color: '#8fa3a3', fontSize: 14 },
  infoValue: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  cancelButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: DANGER, borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 20, marginTop: 30, width: '100%',
  },
  cancelButtonText: { color: DANGER, fontSize: 14, fontWeight: '700', marginLeft: 8 },
});