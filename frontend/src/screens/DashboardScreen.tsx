import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StyleSheet,
  ActivityIndicator, RefreshControl, Platform, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Voyage } from '../types';
import { fetchVoyageById, API_BASE_URL } from '../api/voya';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const iconForType = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'VOL': return 'airplane';
    case 'HOTEL': return 'bed';
    default: return 'ellipse';
  }
};

export default function DashboardScreen({ navigation, route }: Props) {
  const { t } = useLanguage();
  const { voyageId } = route.params;
  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchVoyageById(voyageId);
      setVoyage(data);
      navigation.setOptions({ title: data.destination });
    } catch (e: any) {
      setError(e.message ?? 'Impossible de charger le voyage');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [voyageId, navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

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
          <Text style={styles.loadingText}>{t('tripLoading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !voyage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={40} color="#f28b82" />
          <Text style={styles.errorText}>{error ?? t('tripNotFound')}</Text>
          <Text style={styles.errorHint}>{t('verifyBackend')} {API_BASE_URL}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const reservationsTriees = [...voyage.reservations].sort(
    (a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
  );
  const prochaineReservation = reservationsTriees.find((r) => r.statut !== 'ANNULEE');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroAccentBar} />
          <View style={styles.heroBody}>
            <Text style={styles.heroLabel}>
              {formatDate(voyage.dateDebut)} → {formatDate(voyage.dateFin)}
            </Text>
            <Text style={styles.heroDestination}>{voyage.destination}</Text>
            {prochaineReservation && (
              <View style={styles.heroSubRow}>
                <Ionicons name={iconForType(prochaineReservation.type)} size={14} color={ACCENT} />
                <Text style={styles.heroSub}>
                  {' '}{prochaineReservation.fournisseur} · {prochaineReservation.reference}
                </Text>
              </View>
            )}
            <View style={styles.heroDivider} />
            <View style={styles.heroFooter}>
              <Text style={styles.heroFooterText}>{t('reservations')}: {voyage.reservations.length} {t('confirmedReservations')}</Text>
              <Text style={styles.heroFooterText}>{t('documentsCount')}: {voyage.documents.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          <Pressable
            style={styles.statCard}
            onPress={() => navigation.navigate('Reservations', { voyageId: voyage.id, destination: voyage.destination })}
          >
            <View style={styles.statIconWrap}>
              <Ionicons name="calendar-outline" size={16} color={ACCENT} />
            </View>
            <Text style={styles.statTitle}>{t('reservations')}</Text>
            <Text style={styles.statValue}>{voyage.reservations.length} {t('activeReservations')}</Text>
          </Pressable>

          <Pressable
            style={styles.statCard}
            onPress={() => navigation.navigate('Documents', { voyageId: voyage.id, destination: voyage.destination })}
          >
            <View style={styles.statIconWrap}>
              <Ionicons name="document-text-outline" size={16} color={ACCENT} />
            </View>
            <Text style={styles.statTitle}>{t('documentsCount')}</Text>
            <Text style={styles.statValue}>{voyage.documents.length} {t('filesCount')}</Text>
          </Pressable>

          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="sparkles-outline" size={16} color={ACCENT} />
            </View>
            <Text style={styles.statTitle}>{t('recommendations')}</Text>
            <Text style={styles.statValue}>{t('comingSoon')}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="briefcase-outline" size={16} color={ACCENT} />
            </View>
            <Text style={styles.statTitle}>{t('services')}</Text>
            <Text style={styles.statValue}>{t('comingSoon')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('upcomingSection')}</Text>
        {reservationsTriees.length === 0 ? (
          <Text style={styles.emptyText}>{t('noReservationsTrip')}</Text>
        ) : (
          reservationsTriees.map((r) => (
            <Pressable
              key={r.id}
              style={styles.upcomingItem}
              onPress={() => navigation.navigate('ReservationDetail', { reservationId: r.id })}
            >
              <View style={styles.upcomingIconWrap}>
                <Ionicons name={iconForType(r.type)} size={18} color={ACCENT} />
              </View>
              <View style={styles.upcomingTextWrap}>
                <Text style={styles.upcomingTitle}>{r.type} — {r.fournisseur}</Text>
                <Text style={styles.upcomingSub}>{formatDate(r.dateDebut)} · {r.statut}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8fa3a3" />
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const cardShadow = Platform.select({
  web: { boxShadow: '0px 6px 16px rgba(0,0,0,0.25)' },
  default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: '#c9d6d6', marginTop: 12, fontSize: 16 },
  errorText: { color: '#f28b82', fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 10 },
  errorHint: { color: '#8fa3a3', fontSize: 13, marginTop: 8, textAlign: 'center' },
  heroCard: { backgroundColor: '#123a3a', borderRadius: 22, marginBottom: 22, overflow: 'hidden', ...cardShadow },
  heroAccentBar: { height: 4, backgroundColor: ACCENT },
  heroBody: { padding: 22 },
  heroLabel: { color: '#8fa3a3', fontSize: 12, letterSpacing: 1.2, marginBottom: 8, fontWeight: '600' },
  heroDestination: { color: '#ffffff', fontSize: 26, fontWeight: '800', marginBottom: 6, letterSpacing: 0.3 },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  heroSub: { color: '#c9d6d6', fontSize: 14 },
  heroDivider: { height: 1, backgroundColor: '#1f4d4d', marginBottom: 14 },
  heroFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  heroFooterText: { color: '#c9d6d6', fontSize: 13, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 26 },
  statCard: { width: '48%', backgroundColor: '#ffffff', borderRadius: 18, padding: 18, marginBottom: 14, ...cardShadow },
  statIconWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#fdf1e4', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statTitle: { color: '#5a6b6b', fontSize: 13, marginBottom: 6, fontWeight: '500' },
  statValue: { color: '#0d2b2b', fontSize: 16, fontWeight: '700' },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 14, letterSpacing: 0.2 },
  emptyText: { color: '#8fa3a3', fontSize: 14 },
  upcomingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#123a3a', borderRadius: 16, padding: 14, marginBottom: 12, ...cardShadow },
  upcomingIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f4d4d', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  upcomingTextWrap: { flex: 1 },
  upcomingTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  upcomingSub: { color: '#8fa3a3', fontSize: 13 },
});