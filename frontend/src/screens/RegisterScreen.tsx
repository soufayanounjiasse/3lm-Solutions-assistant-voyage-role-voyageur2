import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, User } from '../types';
import { register } from '../api/voya';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';
type Props = NativeStackScreenProps<RootStackParamList, 'Register'> & { onAuthenticated: (token: string, user: User) => Promise<void> };

export default function RegisterScreen({ navigation, onAuthenticated }: Props) {
  const { t } = useLanguage();
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!prenom.trim() || !nom.trim() || !password || (!email.trim() && !telephone.trim())) {
      Alert.alert(t('missingFields'), t('missingRegister'));
      return;
    }
    setLoading(true);
    try {
      const result = await register({ prenom: prenom.trim(), nom: nom.trim(), email: email.trim() || undefined, telephone: telephone.trim() || undefined, password });
      await onAuthenticated(result.accessToken, result.user);
    } catch (error: any) {
      Alert.alert(t('registrationError'), error.message ?? t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('createAccount')}</Text>
        <Text style={styles.subtitle}>{t('welcomeSubtitle')}</Text>
        <TextInput style={styles.input} placeholder={t('firstName')} placeholderTextColor="#8fa3a3" value={prenom} onChangeText={setPrenom} />
        <TextInput style={styles.input} placeholder={t('lastName')} placeholderTextColor="#8fa3a3" value={nom} onChangeText={setNom} />
        <TextInput style={styles.input} placeholder="Email (optionnel si téléphone renseigné)" placeholderTextColor="#8fa3a3" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Téléphone (optionnel si email renseigné)" placeholderTextColor="#8fa3a3" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder={t('password')} placeholderTextColor="#8fa3a3" value={password} onChangeText={setPassword} secureTextEntry />
        <Pressable style={styles.button} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#0d2b2b" /> : <Text style={styles.buttonText}>{t('createAccountButton')}</Text>}
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkButton}><Text style={styles.link}>{t('alreadyAccount')}</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#a7baba', fontSize: 15, marginBottom: 24 },
  input: { backgroundColor: '#123a3a', color: '#fff', borderWidth: 1, borderColor: '#1f4d4d', borderRadius: 12, padding: 14, marginBottom: 10, fontSize: 15 },
  button: { backgroundColor: ACCENT, borderRadius: 12, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#0d2b2b', fontWeight: '800', fontSize: 16 },
  linkButton: { alignItems: 'center', padding: 18 },
  link: { color: ACCENT, fontWeight: '700' },
});
