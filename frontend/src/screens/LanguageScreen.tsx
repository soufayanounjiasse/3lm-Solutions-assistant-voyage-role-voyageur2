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

export default function LanguageScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { t, language, setLanguage } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#123a3a" />
        </Pressable>
        <Text style={styles.header}>{t('chooseLanguage')}</Text>
      </View>
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
  container: { flex: 1, backgroundColor: '#f8f6ef' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 },
  backButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3dacb', alignItems: 'center', justifyContent: 'center' },
  header: { color: '#123a3a', fontSize: 20, fontWeight: '800', paddingLeft: 12 },
  list: { paddingHorizontal: 16 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderColor: '#e3dacb', borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 10,
  },
  label: { color: '#123a3a', fontSize: 16, fontWeight: '600' },
});