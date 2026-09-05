import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createVoyage } from '../api/voya';
import DatePickerField from '../components/DatePickerField';
import SelectField from '../components/SelectField';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

const DESTINATIONS = [
  'Paris, France', 'Lyon, France', 'Marseille, France',
  'Tunis, Tunisie', 'Casablanca, Maroc', 'Dakar, Sénégal',
  'Douala, Cameroun', 'Yaoundé, Cameroun', 'Lagos, Nigeria',
  'Londres, Royaume-Uni', 'New York, États-Unis', 'Dubaï, Émirats Arabes Unis',
];

type Props = {
  userId: string;
};

export default function NewVoyageScreen({ userId }: Props) {
  const { t } = useLanguage();
  const [destination, setDestination] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!destination || !dateDebut || !dateFin) {
      Alert.alert(t('missingFields'), t('missingLogin'));
      return;
    }
    setLoading(true);
    try {
      await createVoyage({ userId, destination, dateDebut, dateFin });
      Alert.alert(t('saved'), destination);
      setDestination('');
      setDateDebut('');
      setDateFin('');
    } catch (e: any) {
      Alert.alert(t('genericError'), e.message ?? t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>{t('newTrip')}</Text>

        <SelectField
          label={t('destination')}
          value={destination}
          options={DESTINATIONS}
          onChange={setDestination}
          placeholder={t('chooseDestination')}
        />

        <DatePickerField label={t('startDate')} value={dateDebut} onChange={setDateDebut} />
        <DatePickerField label={t('endDate')} value={dateFin} onChange={setDateFin} />

        <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#0d2b2b" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={18} color="#0d2b2b" />
              <Text style={styles.buttonText}>{t('createTrip')}</Text>
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