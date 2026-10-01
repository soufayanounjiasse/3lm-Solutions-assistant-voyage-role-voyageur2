import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, User } from '../types';
import { socialLogin } from '../api/voya';
// import { login } from '../api/voya';
//import { socialLogin } from '../api/voya';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & { onAuthenticated: (token: string, user: User) => Promise<void> };

export default function LoginScreen({ navigation, onAuthenticated }: Props) {
  const { t } = useLanguage();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!identifiant.trim() || !password) {
      Alert.alert(t('missingFields'), t('missingLogin'));
      return;
    }
    setLoading(true);
    try {
      // Vérification réelle avec la base de données, à réactiver lorsque nécessaire :
      // const result = await login({ identifiant: identifiant.trim(), password });
      // await onAuthenticated(result.accessToken, result.user);

      await onAuthenticated('demo-access-token', {
        id: 'demo-user',
        email: identifiant.includes('@') ? identifiant.trim() : undefined,
        telephone: identifiant.includes('@') ? undefined : identifiant.trim(),
        prenom: 'Utilisateur',
        nom: 'Demo',
        langue: 'fr',
        statut: 'ACTIF',
      });
    } catch (error: any) {
      Alert.alert(t('connectionError'), error.message ?? t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'GOOGLE' | 'APPLE' | 'FACEBOOK') => {
  setLoading(true);
  try {
    // TODO: remplacer par un vrai SDK (Google Sign-In, Apple Auth...) une fois configuré.
    // Pour l'instant on simule un identifiant unique par appareil/test.
    const result = await socialLogin({
      provider,
      providerUserId: `${provider.toLowerCase()}-${Date.now()}`,
    });
    await onAuthenticated(result.accessToken, result.user);
  } catch (error: any) {
    Alert.alert(t('connectionError'), error.message ?? t('genericError'));
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logo}><Ionicons name="airplane" size={30} color="#0d2b2b" /></View>
        <Text style={styles.title}>{t('welcome')}</Text>
        <Text style={styles.subtitle}>{t('welcomeSubtitle')}</Text>
        <TextInput style={styles.input} placeholder={t('emailOrPhone')} placeholderTextColor="#8fa3a3" value={identifiant} onChangeText={setIdentifiant} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder={t('password')} placeholderTextColor="#8fa3a3" value={password} onChangeText={setPassword} secureTextEntry />
        <Pressable style={styles.button} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#0d2b2b" /> : <Text style={styles.buttonText}>{t('signIn')}</Text>}
        </Pressable>
        <Text style={styles.orText}>{t('orContinueWith')}</Text>
        <View style={styles.socialRow}>
        <Pressable style={styles.socialButton} onPress={() => handleSocial('GOOGLE')}>
        <Ionicons name="logo-google" size={20} color="#ffffff" />
        </Pressable>
        <Pressable style={styles.socialButton} onPress={() => handleSocial('FACEBOOK')}>
       <Ionicons name="logo-facebook" size={20} color="#ffffff" />
      </Pressable>
      <Pressable style={styles.socialButton} onPress={() => handleSocial('APPLE')}>
    <Ionicons name="logo-apple" size={20} color="#ffffff" />
  </Pressable>
</View>
        <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
          <Text style={styles.link}>{t('createAccountButton')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6ef' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { width: 64, height: 64, borderRadius: 20, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  title: { color: '#123a3a', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#667777', fontSize: 15, marginBottom: 28 },
  input: { backgroundColor: '#fff', color: '#123a3a', borderWidth: 1, borderColor: '#e3dacb', borderRadius: 12, padding: 15, marginBottom: 12, fontSize: 15 },
  button: { backgroundColor: ACCENT, borderRadius: 12, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#0d2b2b', fontWeight: '800', fontSize: 16 },
  linkButton: { alignItems: 'center', padding: 18 },
  link: { color: '#123a3a', fontWeight: '700' },
  orText: { color: '#667777', textAlign: 'center', marginVertical: 16, fontSize: 13 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 10 },
  socialButton: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#123a3a',
    borderWidth: 1, borderColor: '#1f4d4d', alignItems: 'center', justifyContent: 'center',
  },
});
