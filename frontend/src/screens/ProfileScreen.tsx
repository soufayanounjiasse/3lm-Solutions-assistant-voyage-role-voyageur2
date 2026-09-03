import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, UserPreferences } from '../types';
import { fetchPreferences, fetchProfile, updatePreferences, updateProfile } from '../api/voya';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';
type Props = { token: string; onLogout: () => Promise<void> };

export default function ProfileScreen({ token, onLogout }: Props) {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [centresInteret, setCentresInteret] = useState('');
  const [typeVoyage, setTypeVoyage] = useState<UserPreferences['typeVoyage']>('TOURISME');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const profile = await fetchProfile(token);
        const prefs = await fetchPreferences(token, profile.id);
        setUser(profile); setPreferences(prefs);
        setPrenom(profile.prenom); setNom(profile.nom); setEmail(profile.email ?? ''); setTelephone(profile.telephone ?? '');
        setBudgetMin(String(prefs.budgetMin ?? '')); setBudgetMax(String(prefs.budgetMax ?? ''));
        setCentresInteret(prefs.centresInteret.join(', ')); setTypeVoyage(prefs.typeVoyage ?? 'TOURISME');
      } catch (error: any) { Alert.alert(t('genericError'), error.message ?? t('noProfile')); }
      finally { setLoading(false); }
    }
    load();
  }, [token]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateProfile(token, user.id, { prenom, nom, email: email || undefined, telephone: telephone || undefined });
      const updatedPreferences = await updatePreferences(token, user.id, {
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        centresInteret: centresInteret.split(',').map((item) => item.trim()).filter(Boolean), typeVoyage,
      });
      setUser(updated); setPreferences(updatedPreferences); Alert.alert(t('saved'), t('savedMessage'));
    } catch (error: any) { Alert.alert(t('genericError'), error.message ?? t('genericError')); }
    finally { setSaving(false); }
  };

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator color={ACCENT} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}><View style={styles.avatar}><Ionicons name="person" size={28} color="#0d2b2b" /></View><View><Text style={styles.title}>{t('profile')}</Text><Text style={styles.subtitle}>{user?.email ?? user?.telephone}</Text></View></View>
        <Text style={styles.section}>{t('personalInfo')}</Text>
        <TextInput style={styles.input} placeholder={t('firstName')} placeholderTextColor="#8fa3a3" value={prenom} onChangeText={setPrenom} />
        <TextInput style={styles.input} placeholder={t('lastName')} placeholderTextColor="#8fa3a3" value={nom} onChangeText={setNom} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8fa3a3" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder={t('emailOrPhone')} placeholderTextColor="#8fa3a3" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />
        <Text style={styles.section}>{t('preferences')}</Text>
        <TextInput style={styles.input} placeholder={t('budgetMin')} placeholderTextColor="#8fa3a3" value={budgetMin} onChangeText={setBudgetMin} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder={t('budgetMax')} placeholderTextColor="#8fa3a3" value={budgetMax} onChangeText={setBudgetMax} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder={t('interestsPlaceholder')} placeholderTextColor="#8fa3a3" value={centresInteret} onChangeText={setCentresInteret} />
        <View style={styles.choices}>{(['AFFAIRES', 'TOURISME', 'FAMILLE', 'ETUDIANT'] as const).map((choice) => <Pressable key={choice} onPress={() => setTypeVoyage(choice)} style={[styles.choice, typeVoyage === choice && styles.choiceActive]}><Text style={[styles.choiceText, typeVoyage === choice && styles.choiceTextActive]}>{choice}</Text></Pressable>)}</View>
        <Pressable style={styles.button} onPress={save} disabled={saving}>{saving ? <ActivityIndicator color="#0d2b2b" /> : <Text style={styles.buttonText}>{t('save')}</Text>}</Pressable>
        <Pressable style={styles.logout} onPress={onLogout}><Ionicons name="log-out-outline" size={18} color="#e87878" /><Text style={styles.logoutText}>{t('logout')}</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' }, content: { padding: 20 }, heading: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 }, avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', marginRight: 14 }, title: { color: '#fff', fontSize: 24, fontWeight: '800' }, subtitle: { color: '#a7baba', marginTop: 4 }, section: { color: ACCENT, fontSize: 14, fontWeight: '800', marginBottom: 12, marginTop: 10 }, input: { backgroundColor: '#123a3a', color: '#fff', borderWidth: 1, borderColor: '#1f4d4d', borderRadius: 12, padding: 14, marginBottom: 10, fontSize: 15 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }, choice: { borderWidth: 1, borderColor: '#1f4d4d', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }, choiceActive: { backgroundColor: ACCENT, borderColor: ACCENT }, choiceText: { color: '#a7baba', fontSize: 12, fontWeight: '700' }, choiceTextActive: { color: '#0d2b2b' }, button: { backgroundColor: ACCENT, borderRadius: 12, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, buttonText: { color: '#0d2b2b', fontWeight: '800', fontSize: 16 }, logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20 }, logoutText: { color: '#e87878', fontWeight: '700', marginLeft: 8 },
});
