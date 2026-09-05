import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

type ModuleItem = {
  labelKey: Parameters<ReturnType<typeof useLanguage>['t']>[0];
  icon: keyof typeof Ionicons.glyphMap;
  available: boolean;
  route?: keyof RootStackParamList;
};

const MODULES: ModuleItem[] = [
  { labelKey: 'onboardingModule', icon: 'sparkles-outline', available: false },
  { labelKey: 'myTrips', icon: 'airplane-outline', available: true, route: 'VoyagesList' },
  { labelKey: 'reservations', icon: 'calendar-outline', available: true, route: 'SelectVoyageForReservation' },
  { labelKey: 'assistant', icon: 'chatbubble-ellipses-outline', available: false },
  { labelKey: 'esim', icon: 'cellular-outline', available: false },
  { labelKey: 'driver', icon: 'car-outline', available: false },
  { labelKey: 'hotels', icon: 'bed-outline', available: false },
  { labelKey: 'marketplace', icon: 'storefront-outline', available: false },
  { labelKey: 'wallet', icon: 'wallet-outline', available: false },
  { labelKey: 'payment', icon: 'card-outline', available: false },
  { labelKey: 'simpleMode', icon: 'accessibility-outline', available: false },
];

const TOP_ICONS: { key: string; icon: keyof typeof Ionicons.glyphMap; labelKey: Parameters<ReturnType<typeof useLanguage>['t']>[0] }[] = [
  { key: 'search', icon: 'search-outline', labelKey: 'search' },
  { key: 'profile', icon: 'person-circle-outline', labelKey: 'profile' },
  { key: 'chat', icon: 'chatbubbles-outline', labelKey: 'chat' },
  { key: 'notifications', icon: 'notifications-outline', labelKey: 'notifications' },
];

export default function MainMenuScreen({ navigation }: Props) {
  const { t } = useLanguage();

  const handlePress = (item: ModuleItem) => {
    if (item.available && item.route) {
      navigation.navigate(item.route as any);
    } else {
      navigation.navigate('Unavailable', { title: t(item.labelKey) });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>{t('menu')}</Text>
        <View style={styles.topIcons}>
          {TOP_ICONS.map((icon) => (
            <Pressable
              key={icon.key}
              style={styles.topIconButton}
              onPress={() => navigation.navigate('Unavailable', { title: t(icon.labelKey) })}
            >
              <Ionicons name={icon.icon} size={20} color={ACCENT} />
            </Pressable>
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {MODULES.map((item) => (
          <Pressable key={item.labelKey} style={styles.card} onPress={() => handlePress(item)}>
            <View style={[styles.iconWrap, item.available && styles.iconWrapActive]}>
              <Ionicons name={item.icon} size={26} color={item.available ? '#0d2b2b' : ACCENT} />
            </View>
            <Text style={styles.label}>{t(item.labelKey)}</Text>
            {!item.available && <Text style={styles.badge}>{t('soon')}</Text>}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10,
  },
  header: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  topIcons: { flexDirection: 'row', gap: 8 },
  topIconButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#123a3a',
    justifyContent: 'center', alignItems: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 30 },
  card: { width: '31%', backgroundColor: '#123a3a', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 14 },
  iconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1f4d4d', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  iconWrapActive: { backgroundColor: ACCENT },
  label: { color: '#ffffff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  badge: { color: '#8fa3a3', fontSize: 10, marginTop: 4 },
});