import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';
import { fetchProfile, updateProfile } from '../api/voya';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';
type Props = { token: string; onLogout: () => Promise<void> };

export default function ProfileScreen({ token, onLogout, navigation }: Props & { navigation?: { goBack: () => void } }) {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const profile = await fetchProfile(token);
        setUser(profile);
        setPrenom(profile.prenom);
        setNom(profile.nom);
        setEmail(profile.email ?? '');
        setTelephone(profile.telephone ?? '');
      } catch (error: any) {
        Alert.alert(t('genericError'), error.message ?? t('noProfile'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateProfile(token, user.id, {
        prenom, nom, email: email || undefined, telephone: telephone || undefined,
      });
      setUser(updated);
      Alert.alert(t('saved'), t('savedMessage'));
    } catch (error: any) {
      Alert.alert(t('genericError'), error.message ?? t('genericError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={ACCENT} size="large" />
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
        </View>
        <View style={styles.heading}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#0d2b2b" />
          </View>
          <View>
            <Text style={styles.title}>{t('profile')}</Text>
            <Text style={styles.subtitle}>{user?.email ?? user?.telephone}</Text>
          </View>
        </View>

        <Text style={styles.section}>{t('personalInfo')}</Text>
        <TextInput style={styles.input} placeholder={t('firstName')} placeholderTextColor="#8fa3a3" value={prenom} onChangeText={setPrenom} />
        <TextInput style={styles.input} placeholder={t('lastName')} placeholderTextColor="#8fa3a3" value={nom} onChangeText={setNom} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8fa3a3" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder={t('emailOrPhone')} placeholderTextColor="#8fa3a3" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />

        <Pressable style={styles.button} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#0d2b2b" /> : <Text style={styles.buttonText}>{t('save')}</Text>}
        </Pressable>

        <Pressable style={styles.logout} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={18} color="#e87878" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6ef' },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3dacb', alignItems: 'center', justifyContent: 'center' },
  heading: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  title: { color: '#123a3a', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#667777', marginTop: 4 },
  section: { color: '#123a3a', fontSize: 14, fontWeight: '800', marginBottom: 12, marginTop: 10 },
  input: { backgroundColor: '#fff', color: '#123a3a', borderWidth: 1, borderColor: '#e3dacb', borderRadius: 12, padding: 14, marginBottom: 10, fontSize: 15 },
  button: { backgroundColor: ACCENT, borderRadius: 12, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#0d2b2b', fontWeight: '800', fontSize: 16 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20 },
  logoutText: { color: '#e87878', fontWeight: '700', marginLeft: 8 },
});