import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StyleSheet,
  ActivityIndicator, Pressable, RefreshControl, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Reservation } from '../types';
import { API_BASE_URL, createReservation } from '../api/voya';
import DatePickerField from '../components/DatePickerField';
import SelectField from '../components/SelectField';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'Reservations'>;

const FOURNISSEURS_BY_TYPE: Record<string, string[]> = {
  VOL: ['Air France', 'Camair-Co', 'Ethiopian Airlines', 'Royal Air Maroc', 'Turkish Airlines', 'Emirates'],
  HOTEL: ['Hôtel Le Marais', 'Ibis', 'Novotel', 'Radisson Blu', 'Mercure', 'Sheraton'],
  AUTRE: ['Agence locale', 'Prestataire externe', 'Compagnie de transport'],
};

const iconForType = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'VOL': return 'airplane';
    case 'HOTEL': return 'bed';
    default: return 'ellipse';
  }
};

function generateReference(type: string): string {
  const prefixMap: Record<string, string> = { VOL: 'VOL', HOTEL: 'HTL', AUTRE: 'RES' };
  const prefix = prefixMap[type] ?? 'RES';
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${datePart}-${rand}`;
}

export default function ReservationsScreen({ route, navigation }: Props) {
  const { t } = useLanguage();
  const { voyageId, destination } = route.params;
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const RES_TYPES = [
    { value: 'VOL', label: t('flight'), icon: 'airplane' as const },
    { value: 'HOTEL', label: t('hotelType'), icon: 'bed' as const },
    { value: 'AUTRE', label: t('otherType'), icon: 'ellipse' as const },
  ];

  const [type, setType] = useState('VOL');
  const [fournisseur, setFournisseur] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/voyages/${voyageId}/reservation`);
    const data = await res.json();
    setReservations(data);
    setLoading(false);
    setRefreshing(false);
  }, [voyageId]);

  useEffect(() => {
    navigation.setOptions({ title: `${t('reservations')} · ${destination}` });
    load();
  }, [load, navigation, destination]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setFournisseur('');
  };

  const resetForm = () => {
    setType('VOL');
    setFournisseur('');
    setDateDebut('');
    setDateFin('');
  };

  const handleCreate = async () => {
    if (!fournisseur || !dateDebut) {
      Alert.alert(t('missingFields'), t('missingLogin'));
      return;
    }
    setSubmitting(true);
    try {
      await createReservation(voyageId, {
        type,
        fournisseur,
        reference: generateReference(type),
        dateDebut,
        dateFin: dateFin || undefined,
      });
      setFormVisible(false);
      resetForm();
      await load();
    } catch (e: any) {
      Alert.alert(t('genericError'), e.message ?? t('genericError'));
    } finally {
      setSubmitting(false);
    }
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
          <Text style={styles.emptyText}>{t('noReservationsTrip')}</Text>
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

      <Pressable style={styles.fab} onPress={() => setFormVisible(true)}>
        <Ionicons name="add" size={26} color="#0d2b2b" />
      </Pressable>

      <Modal visible={formVisible} transparent animationType="slide" onRequestClose={() => setFormVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('newReservation')}</Text>

            <View style={styles.typeRow}>
              {RES_TYPES.map((rt) => (
                <Pressable
                  key={rt.value}
                  style={[styles.typeChip, type === rt.value && styles.typeChipActive]}
                  onPress={() => handleTypeChange(rt.value)}
                >
                  <Ionicons name={rt.icon} size={16} color={type === rt.value ? '#0d2b2b' : ACCENT} />
                  <Text style={[styles.typeChipText, type === rt.value && styles.typeChipTextActive]}>{rt.label}</Text>
                </Pressable>
              ))}
            </View>

            <SelectField
              label={t('supplier')}
              value={fournisseur}
              options={FOURNISSEURS_BY_TYPE[type] ?? []}
              onChange={setFournisseur}
              placeholder={t('chooseSupplier')}
            />

            <DatePickerField label={t('startDate')} value={dateDebut} onChange={setDateDebut} />
            <DatePickerField label={`${t('endDate')} ${t('optionalLabel')}`} value={dateFin} onChange={setDateFin} />

            <Text style={styles.refHint}>{t('referenceAutoHint')}</Text>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setFormVisible(false)}>
                <Text style={styles.cancelButtonText}>{t('back')}</Text>
              </Pressable>
              <Pressable style={styles.submitButton} onPress={handleCreate} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#0d2b2b" />
                ) : (
                  <Text style={styles.submitButtonText}>{t('create')}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#8fa3a3', fontSize: 14, textAlign: 'center', marginTop: 40 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#123a3a', borderRadius: 16, padding: 14, marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f4d4d', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textWrap: { flex: 1 },
  title: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  sub: { color: '#8fa3a3', fontSize: 13 },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: ACCENT, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#123a3a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  modalTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f4d4d', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  typeChipActive: { backgroundColor: ACCENT },
  typeChipText: { color: ACCENT, fontSize: 12, fontWeight: '600', marginLeft: 4 },
  typeChipTextActive: { color: '#0d2b2b' },
  refHint: { color: '#8fa3a3', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  modalActions: { flexDirection: 'row', marginTop: 16, gap: 10 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#1f4d4d' },
  cancelButtonText: { color: '#c9d6d6', fontWeight: '600' },
  submitButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: ACCENT },
  submitButtonText: { color: '#0d2b2b', fontWeight: '700' },
});