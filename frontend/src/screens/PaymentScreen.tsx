import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { chargePayment } from '../api/voya';

type PaymentMethodOption = 'CARD' | 'MOBILE' | 'WALLET';

const METHOD_LABELS: Record<PaymentMethodOption, string> = {
  CARD: 'Carte',
  MOBILE: 'Mobile',
  WALLET: 'Wallet Voya',
};
const METHODS: PaymentMethodOption[] = ['CARD', 'MOBILE', 'WALLET'];

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'> & { userId: string };

export default function PaymentScreen({ route, navigation, userId }: Props) {
  const params = route.params ?? {
  serviceLabel: 'Service',
  serviceProvider: 'Voya',
  items: [{ label: 'Prestation', amount: 40 }],
  total: 40,
  currency: '€',
  serviceType: 'TEST',
  serviceId: 'test-service',
};
const { serviceLabel, serviceProvider, items, total, currency, serviceType, serviceId } = params;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodOption>('CARD');
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    setPaying(true);
    try {
      await chargePayment({
        userId,
        serviceType,
        serviceId,
        amount: total,
        currency,
        method: selectedMethod,
      });
      Alert.alert('Paiement réussi', `${total} ${currency} payés avec succès.`);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Paiement échoué', e.message ?? 'Une erreur est survenue.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.cardPanel}>
          <Text style={styles.title}>Paiement</Text>
          <Text style={styles.subtitle}>{serviceLabel} — {serviceProvider}</Text>

          <View style={styles.summaryBox}>
            {items.map((item, idx) => (
              <View key={idx} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={styles.summaryValue}>{item.amount} {currency}</Text>
              </View>
            ))}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total} {currency}</Text>
            </View>
          </View>

          <View style={styles.methodRow}>
            {METHODS.map((method) => {
              const isSelected = selectedMethod === method;
              return (
                <Pressable
                  key={method}
                  style={[styles.methodButton, isSelected && styles.methodButtonSelected]}
                  onPress={() => setSelectedMethod(method)}
                >
                  <Text style={[styles.methodText, isSelected && styles.methodTextSelected]}>
                    {METHOD_LABELS[method]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedMethod === 'CARD' && (
            <View style={styles.cardNumberBox}>
              <Text style={styles.cardNumber}>•••• •••• •••• 4471</Text>
            </View>
          )}

          <Pressable style={styles.payButton} onPress={handlePay} disabled={paying}>
            {paying ? (
              <ActivityIndicator color="#123634" />
            ) : (
              <Text style={styles.payButtonText}>Payer {total} {currency}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a3a3a' },
  shell: {
    flex: 1, backgroundColor: '#0a3a3a', paddingTop: 18, paddingBottom: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  cardPanel: {
    width: '88%', backgroundColor: '#e7e0d5', borderRadius: 30,
    paddingTop: 30, paddingBottom: 24, paddingHorizontal: 26,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 4,
  },
  title: { color: '#0d2d2b', fontSize: 38, fontWeight: '800', lineHeight: 42, marginBottom: 4 },
  subtitle: { color: '#1a3d3b', fontSize: 17, fontWeight: '500', marginBottom: 18 },
  summaryBox: {
    backgroundColor: '#f2eee7', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: '#d9d1c7', overflow: 'hidden',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  totalRow: { borderTopWidth: 2, borderTopColor: '#1d4b4a', borderStyle: 'dashed', marginTop: 6, paddingTop: 14 },
  summaryLabel: { color: '#173d3a', fontSize: 18, fontWeight: '500' },
  summaryValue: { color: '#1a3d3b', fontSize: 18, fontWeight: '700' },
  totalLabel: { color: '#123634', fontSize: 18, fontWeight: '800' },
  totalValue: { color: '#123634', fontSize: 18, fontWeight: '800' },
  methodRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 18, marginBottom: 18,
    backgroundColor: '#efe7dc', borderRadius: 999, padding: 4, borderWidth: 1, borderColor: '#d5c8ba',
  },
  methodButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 999 },
  methodButtonSelected: {
    backgroundColor: '#0d2d2b',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  methodText: { color: '#1a3d3b', fontWeight: '700', fontSize: 14 },
  methodTextSelected: { color: '#f3efea' },
  cardNumberBox: {
    backgroundColor: '#f2eee7', borderRadius: 18, borderWidth: 1, borderColor: '#d3c9bf',
    paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', marginBottom: 18,
  },
  cardNumber: { color: '#1a3d3b', fontSize: 16, fontWeight: '700', letterSpacing: 1.6 },
  payButton: {
    backgroundColor: '#e4a65c', borderRadius: 16, paddingVertical: 16, marginTop: 4,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  payButtonText: { color: '#123634', fontSize: 20, fontWeight: '800' },
});