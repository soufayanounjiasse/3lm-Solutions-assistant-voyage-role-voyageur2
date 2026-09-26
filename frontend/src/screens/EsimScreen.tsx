import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { activateEsim, EsimOrder, EsimPlan, fetchEsimOrders, fetchEsimPlans, PaymentMethod, purchaseEsim } from '../api/voya';

type Props = { userId: string };

export default function EsimScreen({ userId }: Props) {
  const navigation = useNavigation();
  const [plans, setPlans] = useState<EsimPlan[]>([]);
  const [orders, setOrders] = useState<EsimOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [paymentPlanId, setPaymentPlanId] = useState<string | null>(null);
  const [countryQuery, setCountryQuery] = useState('France');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showAllPlans, setShowAllPlans] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    const tabNavigation = navigation.getParent();
    tabNavigation?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => tabNavigation?.setOptions({ tabBarStyle: undefined });
  }, [navigation]);

  const load = async () => {
    try {
      const [availablePlans, currentOrders] = await Promise.all([fetchEsimPlans(), fetchEsimOrders(userId)]);
      setPlans(availablePlans);
      setOrders(currentOrders);
    } catch {
      Alert.alert('eSIM', 'Impossible de charger les forfaits eSIM.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [userId]);

  const query = normalizeSearch(countryQuery);
  const filteredPlans = plans.filter((plan) =>
    !query || normalizeSearch(plan.country).includes(query) || plan.countryCode.toLowerCase() === query,
  );
  const comparedPlans = plans.filter((plan) => compareIds.includes(plan.id));
  const visiblePlans = showAllPlans ? filteredPlans : filteredPlans.slice(0, 2);

  const toggleCompare = (planId: string) => {
    setCompareIds((current) => current.includes(planId)
      ? current.filter((id) => id !== planId)
      : current.length < 3 ? [...current, planId] : current);
  };

  const buy = (planId: string) => {
    setPaymentPlanId(planId);
  };

  const completePurchase = async (planId: string, paymentMethod: PaymentMethod) => {
    setPaymentPlanId(null);
    setBuying(planId);
    try {
      await purchaseEsim(userId, planId, paymentMethod);
      await load();
    } catch (error) {
      Alert.alert('Paiement eSIM', error instanceof Error ? error.message : "L'achat du forfait a échoué.");
    } finally {
      setBuying(null);
    }
  };

  const activate = async (orderId: string) => {
    try {
      const updated = await activateEsim(orderId);
      setOrders((current) => current.map((order) => order.id === orderId ? updated : order));
    } catch {
      Alert.alert('eSIM', "L'activation a échoué.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f6ef" />
      <Modal visible={paymentPlanId !== null} transparent animationType="fade" onRequestClose={() => setPaymentPlanId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mode de paiement</Text>
            <Text style={styles.muted}>Choisissez le moyen à utiliser pour ce forfait.</Text>
            <Pressable style={styles.modalButton} onPress={() => paymentPlanId && void completePurchase(paymentPlanId, 'CARD')}><Text style={styles.buttonText}>Carte bancaire</Text></Pressable>
            <Pressable style={styles.modalButton} onPress={() => paymentPlanId && void completePurchase(paymentPlanId, 'MOBILE')}><Text style={styles.buttonText}>Paiement mobile</Text></Pressable>
            <Pressable style={styles.modalButton} onPress={() => paymentPlanId && void completePurchase(paymentPlanId, 'WALLET')}><Text style={styles.buttonText}>Solde Travel Wallet</Text></Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setPaymentPlanId(null)}><Text style={styles.secondaryButtonText}>Annuler</Text></Pressable>
          </View>
        </View>
      </Modal>
      <View style={styles.brandRow}><Text style={styles.brand}>VOYA · FR → TN</Text></View>
      <Text style={styles.heading}>eSIM &amp; connectivité</Text>
      <Text style={styles.subtitle}>Restez connecté dès l'atterrissage.</Text>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color="#123a3a" />
        <TextInput value={countryQuery} onChangeText={setCountryQuery} placeholder="Rechercher un pays" placeholderTextColor="#829091" autoCapitalize="words" accessibilityLabel="Rechercher un pays" style={styles.searchInput} />
      </View>
      {compareIds.length > 0 && (
        <View style={styles.compareCard}>
          <View style={styles.row}>
            <Text style={styles.title}>Comparateur ({comparedPlans.length}/3)</Text>
            <Pressable onPress={() => setCompareIds([])}><Text style={styles.clearText}>Effacer</Text></Pressable>
          </View>
          {comparedPlans.map((plan) => (
            <View key={plan.id} style={styles.compareRow}>
              <Text style={styles.muted}>{plan.country}</Text>
              <Text style={styles.compareValue}>{formatData(plan.dataMb)} · {plan.durationDays} j · {formatPrice(plan.price, plan.currency)}</Text>
            </View>
          ))}
        </View>
      )}
      {loading ? <Text style={styles.muted}>Chargement...</Text> : filteredPlans.length === 0 ? <Text style={styles.muted}>Aucun forfait pour ce pays.</Text> : visiblePlans.map((plan) => (
        <View key={plan.id} style={styles.card}>
          <View style={styles.row}><Text style={styles.title}>{formatData(plan.dataMb)} — {plan.durationDays} jours</Text><Text style={styles.price}>{formatPrice(plan.price, plan.currency)}</Text></View>
          <Text style={styles.muted}>Activation immédiate · 4G/5G</Text>
          <View style={styles.actions}>
            <Pressable style={[styles.secondaryButton, compareIds.includes(plan.id) && styles.selectedButton]} onPress={() => toggleCompare(plan.id)}><Text style={styles.secondaryButtonText}>{compareIds.includes(plan.id) ? 'Retirer' : 'Comparer'}</Text></Pressable>
            <Pressable style={styles.button} onPress={() => void buy(plan.id)} disabled={buying !== null}><Text style={styles.buttonText}>{buying === plan.id ? 'Achat...' : 'Acheter'}</Text></Pressable>
          </View>
        </View>
      ))}
      {!loading && filteredPlans.length > 2 && <Pressable style={styles.morePlans} onPress={() => setShowAllPlans((current) => !current)}><Text style={styles.morePlansText}>{showAllPlans ? 'Réduire les offres' : `Voir les ${filteredPlans.length - 2} autres offres`}</Text></Pressable>}
      {orders.map((order) => (
        <View key={order.id} style={styles.card}>
          <Text style={styles.status}>{order.status === 'ACTIVATED' ? 'eSIM activée' : 'eSIM prête'}</Text>
          <Text style={styles.title}>{order.country} · {formatData(order.dataMb)}</Text>
          <Text style={styles.muted}>Paiement : {order.paymentMethod === 'MOBILE' ? 'Mobile' : order.paymentMethod === 'WALLET' ? 'Travel Wallet' : 'Carte bancaire'}</Text>
          <Text style={styles.muted}>{order.dataUsedMb} / {order.dataMb} Mo utilisés</Text>
          {order.status !== 'ACTIVATED' && <Pressable style={styles.button} onPress={() => void activate(order.id)}><Text style={styles.buttonText}>Activer</Text></Pressable>}
          {order.qrCodeDataUrl && <Image source={{ uri: order.qrCodeDataUrl }} style={styles.qr} />}
          <Text style={styles.usageText}>Scannez pour activer · {formatData(Math.max(0, order.dataMb - order.dataUsedMb))} restants</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6ef' },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 28, paddingTop: 8, paddingBottom: 24, gap: 12 },
  brandRow: { minHeight: 24, alignItems: 'flex-end', justifyContent: 'center' },
  brand: { color: '#123a3a', fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
  heading: { color: '#123a3a', fontSize: 24, lineHeight: 30, fontWeight: '700', marginTop: 18 },
  subtitle: { color: '#667777', fontSize: 15, marginTop: -8 },
  search: { height: 50, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#fff', borderColor: '#e3dacb', borderWidth: 1, borderRadius: 25, paddingHorizontal: 16, marginTop: 8, marginBottom: 4 },
  searchInput: { flex: 1, color: '#123a3a', fontSize: 16, paddingVertical: 0 },
  card: { backgroundColor: '#fff', borderColor: '#e3dacb', borderWidth: 1, borderRadius: 15, padding: 15, gap: 8 },
  compareCard: { backgroundColor: '#fff', borderColor: '#e3dacb', borderWidth: 1, borderRadius: 15, padding: 15, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  compareRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderTopColor: '#e3dacb', paddingTop: 8 },
  compareValue: { color: '#123a3a', fontWeight: '700', textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 2 },
  title: { color: '#123a3a', fontSize: 16, lineHeight: 20, fontWeight: '700', flex: 1 },
  price: { color: '#123a3a', fontSize: 16, fontWeight: '800' },
  status: { alignSelf: 'center', overflow: 'hidden', backgroundColor: '#6b9471', color: '#fff', fontSize: 13, fontWeight: '700', borderRadius: 14, paddingHorizontal: 11, paddingVertical: 4 },
  muted: { color: '#667777', fontSize: 14 },
  button: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eaa331', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  buttonText: { color: '#173536', fontWeight: '800' },
  secondaryButton: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderColor: '#123a3a', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  selectedButton: { backgroundColor: '#edf1ec' },
  secondaryButtonText: { color: '#123a3a', fontWeight: '700' },
  clearText: { color: '#123a3a', fontWeight: '700' },
  morePlans: { alignSelf: 'center', paddingVertical: 4 },
  morePlansText: { color: '#123a3a', fontWeight: '700' },
  usageText: { color: '#667777', fontSize: 14, textAlign: 'center', marginTop: 2 },
  qr: { width: 124, height: 124, alignSelf: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(18, 58, 58, 0.48)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderColor: '#e3dacb', borderWidth: 1, borderRadius: 14, padding: 18, gap: 10 },
  modalTitle: { color: '#123a3a', fontSize: 20, fontWeight: '800' },
  modalButton: { backgroundColor: '#eaa331', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  cancelButton: { alignSelf: 'center', padding: 8 },
});

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function formatData(dataMb: number): string {
  return `${(dataMb / 1024).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Go`;
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0, style: 'currency', currency }).format(price);
}