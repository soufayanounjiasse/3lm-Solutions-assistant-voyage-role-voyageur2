import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StyleSheet,
  ActivityIndicator, Pressable, Modal, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchPaymentReceipts, fetchPaymentWallet, topUpPaymentWallet } from '../api/voya';
import { TravelWallet, PaymentReceipt } from '../types';

const ACCENT = '#f4a259';

type Props = { userId: string };

export default function TravelWalletScreen({ userId }: Props) {
  const [wallet, setWallet] = useState<TravelWallet | null>(null);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeVisible, setRechargeVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [w, r] = await Promise.all([fetchPaymentWallet(userId), fetchPaymentReceipts(userId)]);
      setWallet(w);
      setReceipts(r);
    } catch {
      // écran vide géré ci-dessous
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRecharge = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      Alert.alert('Montant invalide', 'Renseigne un montant positif.');
      return;
    }
    setSubmitting(true);
    try {
      await topUpPaymentWallet(userId, value, wallet?.currency ?? 'EUR');
      setRechargeVisible(false);
      setAmount('');
      await load();
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Le rechargement a échoué.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.balanceCard}>
          <Ionicons name="wallet-outline" size={28} color={ACCENT} />
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balanceValue}>
            {wallet ? `${Number(wallet.balance).toFixed(2)} ${wallet.currency}` : '—'}
          </Text>
          <Pressable style={styles.rechargeButton} onPress={() => setRechargeVisible(true)}>
            <Ionicons name="add-circle-outline" size={18} color="#0d2b2b" />
            <Text style={styles.rechargeButtonText}>Recharger</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Reçus</Text>
        {receipts.length === 0 ? (
          <Text style={styles.emptyText}>Aucune transaction pour l'instant.</Text>
        ) : (
          receipts.map((r) => (
            <View key={r.id} style={styles.receiptItem}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptService}>{r.serviceType}</Text>
                <Text style={[styles.receiptAmount, r.status === 'FAILED' && styles.receiptFailed]}>
                  {r.status === 'FAILED' ? 'Échoué' : `-${Number(r.amount).toFixed(2)} ${r.currency}`}
                </Text>
              </View>
              <Text style={styles.receiptMeta}>{r.receiptNumber} · {formatDate(r.createdAt)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={rechargeVisible} transparent animationType="fade" onRequestClose={() => setRechargeVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Recharger le Wallet</Text>
            <TextInput
              style={styles.input}
              placeholder="Montant"
              placeholderTextColor="#8fa3a3"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setRechargeVisible(false)}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
              <Pressable style={styles.submitButton} onPress={handleRecharge} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#0d2b2b" /> : <Text style={styles.submitButtonText}>Confirmer</Text>}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  balanceCard: { backgroundColor: '#123a3a', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 26 },
  balanceLabel: { color: '#8fa3a3', fontSize: 13, marginTop: 10 },
  balanceValue: { color: '#ffffff', fontSize: 32, fontWeight: '800', marginTop: 4, marginBottom: 16 },
  rechargeButton: { flexDirection: 'row', backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18, alignItems: 'center' },
  rechargeButtonText: { color: '#0d2b2b', fontWeight: '700', marginLeft: 6 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  emptyText: { color: '#8fa3a3', fontSize: 14 },
  receiptItem: { backgroundColor: '#123a3a', borderRadius: 14, padding: 14, marginBottom: 10 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between' },
  receiptService: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  receiptAmount: { color: ACCENT, fontSize: 15, fontWeight: '700' },
  receiptFailed: { color: '#f28b82' },
  receiptMeta: { color: '#8fa3a3', fontSize: 12, marginTop: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#123a3a', borderRadius: 18, padding: 20 },
  modalTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  input: { backgroundColor: '#1f4d4d', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 15, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#1f4d4d' },
  cancelButtonText: { color: '#c9d6d6', fontWeight: '600' },
  submitButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: ACCENT },
  submitButtonText: { color: '#0d2b2b', fontWeight: '700' },
});