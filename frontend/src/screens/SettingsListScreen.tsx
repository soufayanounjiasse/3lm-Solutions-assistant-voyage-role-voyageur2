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
      <Text style={styles.header}>{t('settingsTitle')}</Text>
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
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  header: { color: '#ffffff', fontSize: 24, fontWeight: '800', padding: 20, paddingBottom: 10 },
  list: { paddingHorizontal: 16, paddingBottom: 30 },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#123a3a',
    borderRadius: 14, padding: 14, marginBottom: 10,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#1f4d4d',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  label: { flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '600' },
});