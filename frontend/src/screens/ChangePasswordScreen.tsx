import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { changePassword } from '../api/voya';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

type Props = { token: string; userId: string };

export default function ChangePasswordScreen({ token, userId }: Props) {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert(t('missingFields'), t('missingLogin'));
      return;
    }
    setLoading(true);
    try {
      await changePassword(token, userId, currentPassword, newPassword);
      Alert.alert(t('saved'), t('savedMessage'));
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      Alert.alert(t('genericError'), e.message ?? t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>{t('security')}</Text>
        <TextInput
          style={styles.input}
          placeholder="Mot de passe actuel"
          placeholderTextColor="#8fa3a3"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Nouveau mot de passe"
          placeholderTextColor="#8fa3a3"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#0d2b2b" /> : <Text style={styles.buttonText}>{t('save')}</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { padding: 20 },
  header: { color: '#ffffff', fontSize: 22, fontWeight: '800', marginBottom: 20 },
  input: { backgroundColor: '#123a3a', color: '#fff', borderWidth: 1, borderColor: '#1f4d4d', borderRadius: 12, padding: 15, marginBottom: 12, fontSize: 15 },
  button: { backgroundColor: ACCENT, borderRadius: 12, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#0d2b2b', fontWeight: '800', fontSize: 16 },
});