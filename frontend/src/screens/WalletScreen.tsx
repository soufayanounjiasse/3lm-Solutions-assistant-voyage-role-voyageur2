import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchWallet } from '../api/voya';
import { RootStackParamList, Wallet } from '../types';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'Wallet'>;

type SectionProps = { icon: keyof typeof Ionicons.glyphMap; title: string; count: number; children: React.ReactNode };

function Section({ icon, title, count, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitle}>
          <Ionicons name={icon} size={20} color={ACCENT} />
          <Text style={styles.heading}>{title}</Text>
        </View>
        <Text style={styles.count}>{count}</Text>
      </View>
      {children}
    </View>
  );
}

export default function WalletScreen({ route, navigation }: Props) {
  const { voyageId, destination } = route.params;
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async (refresh = false) => {
    try {
      const result = await fetchWallet(voyageId);
      setWallet(result);
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [voyageId]);

  useEffect(() => {
    navigation.setOptions({ title: `Wallet · ${destination}` });
    void load();
  }, [destination, load, navigation]);

  if (loading) {
    return <SafeAreaView style={styles.container}><View style={styles.centered}><ActivityIndicator size="large" color={ACCENT} /></View></SafeAreaView>;
  }

  if (!wallet) {
    return <SafeAreaView style={styles.container}><View style={styles.centered}><Text style={styles.empty}>Wallet indisponible hors connexion.</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(true); }} tintColor={ACCENT} />}
      >
        <View style={styles.hero}>
          <Ionicons name="wallet-outline" size={30} color={ACCENT} />
          <View style={styles.heroText}><Text style={styles.title}>{wallet.voyage.destination}</Text><Text style={styles.muted}>{wallet.voyage.dateDebut} → {wallet.voyage.dateFin}</Text></View>
        </View>
        {offline && <Text style={styles.offline}><Ionicons name="cloud-offline-outline" size={15} color={ACCENT} /> Données locales</Text>}
        <Section icon="airplane-outline" title="Billets et réservations" count={wallet.reservations.length}>
          {wallet.reservations.length === 0 ? <Text style={styles.empty}>Aucune réservation</Text> : wallet.reservations.map((item) => <View style={styles.item} key={item.id}><Text style={styles.itemTitle}>{item.fournisseur}</Text><Text style={styles.muted}>{item.type} · {item.reference}</Text></View>)}
        </Section>
        <Section icon="document-text-outline" title="Documents importants" count={wallet.documents.length}>
          {wallet.documents.length === 0 ? <Text style={styles.empty}>Aucun document</Text> : wallet.documents.map((item) => <Pressable style={styles.item} key={item.id} onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}><Text style={styles.itemTitle}>{item.nomFichier}</Text><Text style={styles.muted}>{item.type}</Text></Pressable>)}
        </Section>
        <Section icon="cellular-outline" title="Informations eSIM" count={wallet.esims.length}>
          {wallet.esims.length === 0 ? <Text style={styles.empty}>Aucune eSIM associée</Text> : wallet.esims.map((item) => <View style={styles.item} key={item.id}><Text style={styles.itemTitle}>{item.country} · {item.dataMb / 1024} Go</Text><Text style={styles.muted}>{item.status} · {item.dataUsedMb} Mo utilisés</Text></View>)}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#123a3a', borderRadius: 16, padding: 18 },
  heroText: { marginLeft: 14, flex: 1 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heading: { color: '#fff', fontSize: 16, fontWeight: '800', marginLeft: 8 },
  muted: { color: '#9bb0b0', fontSize: 13, marginTop: 4 },
  offline: { color: ACCENT, fontSize: 13 },
  section: { backgroundColor: '#123a3a', borderRadius: 16, padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center' },
  count: { color: ACCENT, fontWeight: '800' },
  item: { borderTopWidth: 1, borderTopColor: '#1f4d4d', paddingVertical: 11 },
  itemTitle: { color: '#fff', fontWeight: '700' },
  empty: { color: '#9bb0b0', fontSize: 13 },
});
