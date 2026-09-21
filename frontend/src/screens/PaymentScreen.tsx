import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchPaymentReceipts, fetchPaymentWallet, PaymentReceipt, TravelWallet } from '../api/voya';

type Props = { userId: string };

export default function PaymentScreen({ userId }: Props) {
  const [wallet, setWallet] = useState<TravelWallet | null>(null);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);

  useEffect(() => {
    Promise.all([fetchPaymentWallet(userId), fetchPaymentReceipts(userId)])
      .then(([currentWallet, currentReceipts]) => {
        setWallet(currentWallet);
        setReceipts(currentReceipts);
      })
      .catch((error) => Alert.alert('Paiement', error instanceof Error ? error.message : 'Impossible de charger les paiements.'));
  }, [userId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Paiement</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.label}>Solde Travel Wallet</Text>
        <Text style={styles.balance}>{wallet ? `${Number(wallet.balance).toFixed(2)} ${wallet.currency}` : 'Chargement...'}</Text>
        {wallet && <Text style={styles.muted}>Mode préféré : {wallet.preferredMethod === 'CARD' ? 'Carte bancaire' : wallet.preferredMethod === 'MOBILE' ? 'Paiement mobile' : 'Travel Wallet'}</Text>}
      </View>
      <Text style={styles.heading}>Historique</Text>
      {receipts.length === 0 ? <Text style={styles.muted}>Aucun paiement enregistré.</Text> : receipts.map((receipt) => (
        <View style={styles.receipt} key={receipt.id}>
          <View style={styles.row}><Text style={styles.title}>{receipt.serviceType}</Text><Text style={styles.amount}>{receipt.amount} {receipt.currency}</Text></View>
          <Text style={styles.muted}>{receipt.method === 'CARD' ? 'Carte bancaire' : receipt.method === 'MOBILE' ? 'Paiement mobile' : 'Travel Wallet'} · {receipt.receiptNumber}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { padding: 16, gap: 12 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800', marginVertical: 4 },
  balanceCard: { backgroundColor: '#f4a259', borderRadius: 14, padding: 18, gap: 6 },
  label: { color: '#0d2b2b', fontWeight: '700' },
  balance: { color: '#0d2b2b', fontSize: 28, fontWeight: '900' },
  receipt: { backgroundColor: '#123a3a', borderRadius: 12, padding: 14, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  title: { color: '#fff', fontWeight: '800' },
  amount: { color: '#f4a259', fontWeight: '800' },
  muted: { color: '#9bb0b0' },
});