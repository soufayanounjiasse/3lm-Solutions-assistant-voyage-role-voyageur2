import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';
import { useAccessibility } from '../accessibility';

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
  const { simpleMode, setSimpleMode } = useAccessibility();

  const OPTIONS: OptionItem[] = [
    { labelKey: 'preferences', icon: 'options-outline', onPress: () => navigation.navigate('Preferences') },
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
        <Pressable style={styles.simpleCard} onPress={() => setSimpleMode(!simpleMode)} accessibilityRole="switch" accessibilityState={{ checked: simpleMode }}>
          <View style={styles.iconWrap}><Ionicons name="accessibility-outline" size={20} color={ACCENT} /></View>
          <View style={styles.simpleText}><Text style={styles.label}>{t('simpleMode')}</Text><Text style={styles.description}>{t('simpleModeDescription')}</Text></View>
          <View style={[styles.switch, simpleMode && styles.switchActive]}><View style={[styles.switchThumb, simpleMode && styles.switchThumbActive]} /></View>
        </Pressable>
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
  simpleCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#123a3a',
    borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: ACCENT,
  },
  simpleText: { flex: 1 },
  description: { color: '#9bb0b0', fontSize: 12, marginTop: 3 },
  switch: { width: 46, height: 26, borderRadius: 13, backgroundColor: '#1f4d4d', padding: 3, justifyContent: 'center' },
  switchActive: { backgroundColor: ACCENT },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#9bb0b0' },
  switchThumbActive: { alignSelf: 'flex-end', backgroundColor: '#0d2b2b' },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#1f4d4d',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  label: { flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '600' },
});