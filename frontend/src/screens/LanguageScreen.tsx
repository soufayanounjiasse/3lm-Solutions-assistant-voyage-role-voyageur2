import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage, Language } from '../i18n';

const ACCENT = '#f4a259';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
];

export default function LanguageScreen() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{t('chooseLanguage')}</Text>
      <View style={styles.list}>
        {LANGUAGES.map((lang) => (
          <Pressable key={lang.code} style={styles.item} onPress={() => setLanguage(lang.code)}>
            <Text style={styles.label}>{lang.label}</Text>
            {language === lang.code && <Ionicons name="checkmark-circle" size={22} color={ACCENT} />}
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  header: { color: '#ffffff', fontSize: 20, fontWeight: '800', padding: 20 },
  list: { paddingHorizontal: 16 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#123a3a', borderRadius: 14, padding: 16, marginBottom: 10,
  },
  label: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});