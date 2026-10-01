import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchEmergencyContacts } from '../api/voya';
import { MarketplaceOffer } from '../types';

export default function EmergencyScreen() {
  const [contacts, setContacts] = useState<MarketplaceOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchEmergencyContacts();
        setContacts(result);
      } catch {
        Alert.alert('Urgence', 'Impossible de charger les contacts d’urgence.');
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Urgence</Text>
      <Text style={styles.subheading}>Contacts vérifiés et accessibles en 2 clics.</Text>

      {loading ? <Text style={styles.muted}>Chargement...</Text> : null}

      {contacts.map((contact) => (
        <View key={contact.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{contact.name}</Text>
            <Text style={styles.status}>{contact.verificationStatus}</Text>
          </View>
          <Text style={styles.muted}>{contact.description}</Text>
          {contact.contact ? (
            <Pressable
              style={styles.button}
              onPress={() => {
                const phone = contact.contact?.replace(/\s+/g, '') ?? '';
                if (phone) void Linking.openURL(`tel:${phone}`);
              }}
            >
              <Text style={styles.buttonText}>Appeler {contact.contact}</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { padding: 16, gap: 12 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subheading: { color: '#9bb0b0' },
  muted: { color: '#9bb0b0' },
  card: { backgroundColor: '#123a3a', borderRadius: 14, padding: 14, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  status: { color: '#f4a259', fontWeight: '700' },
  button: { backgroundColor: '#f4a259', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#0d2b2b', fontWeight: '800' },
});
