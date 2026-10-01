import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

type Props = {
  navigation: any;
};

type OptionItem = {
  labelKey: Parameters<ReturnType<typeof useLanguage>['t']>[0];
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function SettingsListScreen({ navigation }: Props) {
  const { t } = useLanguage();

  const OPTIONS: OptionItem[] = [
    { labelKey: 'profile', icon: 'person-outline', onPress: () => navigation.navigate('ProfileDetail') },
    { labelKey: 'preferences', icon: 'options-outline', onPress: () => navigation.navigate('Preferences') },
    { labelKey: 'security', icon: 'lock-closed-outline', onPress: () => navigation.navigate('Unavailable', { title: t('security') }) },
    { labelKey: 'termsOfUse', icon: 'document-text-outline', onPress: () => navigation.navigate('Unavailable', { title: t('termsOfUse') }) },
    { labelKey: 'map', icon: 'map-outline', onPress: () => navigation.navigate('Unavailable', { title: t('map') }) },
    { labelKey: 'about', icon: 'information-circle-outline', onPress: () => navigation.navigate('Unavailable', { title: t('about') }) },
    { labelKey: 'language', icon: 'language-outline', onPress: () => navigation.navigate('Language') },
    { labelKey: 'notifications', icon: 'notifications-outline', onPress: () => navigation.navigate('Unavailable', { title: t('notifications') }) },
    { labelKey: 'chat', icon: 'chatbubbles-outline', onPress: () => navigation.navigate('Unavailable', { title: t('chat') }) },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#123a3a" />
        </Pressable>
        <Text style={styles.header}>{t('settingsTitle')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {OPTIONS.map((opt) => (
          <Pressable key={opt.labelKey} style={styles.item} onPress={opt.onPress}>
            <View style={styles.iconWrap}>
              <Ionicons name={opt.icon} size={20} color={ACCENT} />
            </View>
            <Text style={styles.label}>{t(opt.labelKey)}</Text>
            <Ionicons name="chevron-forward" size={18} color="#8fa3a3" />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6ef' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 },
  backButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3dacb', alignItems: 'center', justifyContent: 'center' },
  header: { color: '#123a3a', fontSize: 24, fontWeight: '800', paddingLeft: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderColor: '#e3dacb', borderWidth: 1,
    borderRadius: 14, padding: 14, marginBottom: 10,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#edf1f1',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  label: { flex: 1, color: '#123a3a', fontSize: 15, fontWeight: '600' },
});