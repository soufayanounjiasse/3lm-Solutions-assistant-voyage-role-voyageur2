import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchPreferences, updatePreferences } from '../api/voya';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

type Props = { token: string; userId: string; navigation?: { goBack: () => void } };

const TRIP_TYPES = ['TOURISME', 'AFFAIRES', 'FAMILLE', 'ETUDIANT'] as const;

export default function PreferencesScreen({ token, userId, navigation }: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [centresInteret, setCentresInteret] = useState('');
  const [typeVoyage, setTypeVoyage] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchPreferences(token, userId)
      .then((pref) => {
        setBudgetMin(pref.budgetMin?.toString() ?? '');
        setBudgetMax(pref.budgetMax?.toString() ?? '');
        setCentresInteret((pref.centresInteret ?? []).join(', '));
        setTypeVoyage(pref.typeVoyage ?? undefined);
      })
      .catch(() => Alert.alert(t('genericError'), t('noProfile')))
      .finally(() => setLoading(false));
  }, [token, userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(token, userId, {
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        centresInteret: centresInteret ? centresInteret.split(',').map((s) => s.trim()).filter(Boolean) : [],
        typeVoyage: typeVoyage as any,
      });
      Alert.alert(t('saved'), t('savedMessage'));
    } catch (e: any) {
      Alert.alert(t('genericError'), e.message ?? t('genericError'));
    } finally {
      setSaving(false);
    }
  };

  const tripTypeLabel = (type: string) => {
    switch (type) {
      case 'TOURISME': return t('tourism');
      case 'AFFAIRES': return t('business');
      case 'FAMILLE': return t('family');
      case 'ETUDIANT': return t('student');
      default: return type;
    }
  };

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
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => navigation?.goBack?.()}>
            <Ionicons name="chevron-back" size={22} color="#123a3a" />
          </Pressable>
          <Text style={styles.header}>{t('preferences')}</Text>
        </View>

        <Text style={styles.label}>{t('tripType')}</Text>
        <View style={styles.typeRow}>
          {TRIP_TYPES.map((type) => (
            <Pressable
              key={type}
              style={[styles.typeChip, typeVoyage === type && styles.typeChipActive]}
              onPress={() => setTypeVoyage(type)}
            >
              <Text style={[styles.typeChipText, typeVoyage === type && styles.typeChipTextActive]}>
                {tripTypeLabel(type)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>{t('budgetMin')}</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor="#8fa3a3"
          keyboardType="numeric"
          value={budgetMin}
          onChangeText={setBudgetMin}
        />

        <Text style={styles.label}>{t('budgetMax')}</Text>
        <TextInput
          style={styles.input}
          placeholder="1000"
          placeholderTextColor="#8fa3a3"
          keyboardType="numeric"
          value={budgetMax}
          onChangeText={setBudgetMax}
        />

        <Text style={styles.label}>{t('interests')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('interestsPlaceholder')}
          placeholderTextColor="#8fa3a3"
          value={centresInteret}
          onChangeText={setCentresInteret}
        />

        <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#0d2b2b" /> : <Text style={styles.buttonText}>{t('save')}</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6ef' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  backButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3dacb', alignItems: 'center', justifyContent: 'center' },
  header: { color: '#123a3a', fontSize: 22, fontWeight: '800', marginLeft: 12 },
  label: { color: '#667777', fontSize: 13, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: '#fff', color: '#123a3a', borderWidth: 1, borderColor: '#e3dacb', borderRadius: 12, padding: 15, fontSize: 15 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3dacb' },
  typeChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  typeChipText: { color: '#123a3a', fontSize: 13, fontWeight: '600' },
  typeChipTextActive: { color: '#0d2b2b' },
  button: { backgroundColor: ACCENT, borderRadius: 12, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 26 },
  buttonText: { color: '#0d2b2b', fontWeight: '800', fontSize: 16 },
});