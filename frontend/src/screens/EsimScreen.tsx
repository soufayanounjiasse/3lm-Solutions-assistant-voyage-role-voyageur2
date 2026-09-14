import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { activateEsim, EsimOrder, EsimPlan, fetchEsimOrders, fetchEsimPlans, PaymentMethod, purchaseEsim } from '../api/voya';

type Props = { userId: string };

export default function EsimScreen({ userId }: Props) {
  const [plans, setPlans] = useState<EsimPlan[]>([]);
  const [orders, setOrders] = useState<EsimOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [paymentPlanId, setPaymentPlanId] = useState<string | null>(null);

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
      <Text style={styles.heading}>Forfaits eSIM</Text>
      {loading ? <Text style={styles.muted}>Chargement...</Text> : plans.map((plan) => (
        <View key={plan.id} style={styles.card}>
          <View style={styles.row}><Text style={styles.title}>{plan.country} · {plan.dataMb / 1024} Go</Text><Text style={styles.price}>{plan.price} {plan.currency}</Text></View>
          <Text style={styles.muted}>{plan.durationDays} jours · {plan.provider}</Text>
          <Pressable style={styles.button} onPress={() => void buy(plan.id)} disabled={buying !== null}>
            <Text style={styles.buttonText}>{buying === plan.id ? 'Achat...' : 'Acheter'}</Text>
          </Pressable>
        </View>
      ))}
      {orders.length > 0 && <Text style={styles.heading}>Mes eSIM</Text>}
      {orders.map((order) => (
        <View key={order.id} style={styles.card}>
          <View style={styles.row}><Text style={styles.title}>{order.country} · {order.dataMb / 1024} Go</Text><Text style={styles.status}>{order.status === 'ACTIVATED' ? 'Activée' : 'Confirmée'}</Text></View>
          <Text style={styles.muted}>Paiement : {order.paymentMethod === 'MOBILE' ? 'Mobile' : order.paymentMethod === 'WALLET' ? 'Travel Wallet' : 'Carte bancaire'}</Text>
          <Text style={styles.muted}>{order.dataUsedMb} / {order.dataMb} Mo utilisés</Text>
          {order.status !== 'ACTIVATED' && <Pressable style={styles.button} onPress={() => void activate(order.id)}><Text style={styles.buttonText}>Activer</Text></Pressable>}
          {order.qrCodeDataUrl && <Image source={{ uri: order.qrCodeDataUrl }} style={styles.qr} />}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { padding: 16, gap: 12 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800', marginVertical: 4 },
  card: { backgroundColor: '#123a3a', borderRadius: 14, padding: 14, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  price: { color: '#f4a259', fontWeight: '800' },
  status: { color: '#f4a259', fontWeight: '700' },
  muted: { color: '#9bb0b0' },
  button: { alignSelf: 'flex-start', backgroundColor: '#f4a259', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  buttonText: { color: '#0d2b2b', fontWeight: '800' },
  qr: { width: 150, height: 150, alignSelf: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#123a3a', borderRadius: 14, padding: 18, gap: 10 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  modalButton: { backgroundColor: '#f4a259', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  cancelButton: { alignSelf: 'center', padding: 8 },
  secondaryButtonText: { color: '#f4a259', fontWeight: '800' },
});