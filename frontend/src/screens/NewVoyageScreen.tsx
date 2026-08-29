import React, { useState } from 'react';
import {
  SafeAreaView, ScrollView, Text, StyleSheet, Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createVoyage } from '../api/voya';
import DatePickerField from '../components/DatePickerField';
import SelectField from '../components/SelectField';

const ACCENT = '#f4a259';
const PLACEHOLDER_USER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

const DESTINATIONS = [
  'Paris, France', 'Lyon, France', 'Marseille, France',
  'Tunis, Tunisie', 'Casablanca, Maroc', 'Dakar, Sénégal',
  'Douala, Cameroun', 'Yaoundé, Cameroun', 'Lagos, Nigeria',
  'Londres, Royaume-Uni', 'New York, États-Unis', 'Dubaï, Émirats Arabes Unis',
];

export default function NewVoyageScreen() {
  const [destination, setDestination] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!destination || !dateDebut || !dateFin) {
      Alert.alert('Champs manquants', 'Choisis une destination et les deux dates.');
      return;
    }
    setLoading(true);
    try {
      await createVoyage({ userId: PLACEHOLDER_USER_ID, destination, dateDebut, dateFin });
      Alert.alert('Voyage créé', `${destination} a bien été ajouté.`);
      setDestination('');
      setDateDebut('');
      setDateFin('');
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible de créer le voyage.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Nouveau voyage</Text>

        <SelectField
          label="Destination"
          value={destination}
          options={DESTINATIONS}
          onChange={setDestination}
          placeholder="Choisir une destination"
        />

        <DatePickerField label="Date de début" value={dateDebut} onChange={setDateDebut} />
        <DatePickerField label="Date de fin" value={dateFin} onChange={setDateFin} />

        <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#0d2b2b" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={18} color="#0d2b2b" />
              <Text style={styles.buttonText}>Créer le voyage</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { padding: 20 },
  header: { color: '#ffffff', fontSize: 22, fontWeight: '800', marginBottom: 20 },
  button: {
    flexDirection: 'row', backgroundColor: ACCENT, borderRadius: 14,
    paddingVertical: 14, justifyContent: 'center', alignItems: 'center', marginTop: 26,
  },
  buttonText: { color: '#0d2b2b', fontSize: 15, fontWeight: '700', marginLeft: 6 },
});