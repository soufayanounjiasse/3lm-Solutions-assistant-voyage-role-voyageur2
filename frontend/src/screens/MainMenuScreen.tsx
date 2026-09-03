import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

type ModuleItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  available: boolean;
  route?: keyof RootStackParamList;
};

export default function MainMenuScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const modules: ModuleItem[] = [
    { label: t('reservations'), icon: 'calendar-outline', available: true, route: 'SelectVoyageForReservation' },
    { label: t('myTrips'), icon: 'airplane-outline', available: true, route: 'VoyagesList' },
    { label: t('assistant'), icon: 'chatbubble-ellipses-outline', available: false },
    { label: t('esim'), icon: 'cellular-outline', available: false },
    { label: t('driver'), icon: 'car-outline', available: false },
    { label: t('hotels'), icon: 'bed-outline', available: false },
    { label: t('marketplace'), icon: 'storefront-outline', available: false },
    { label: t('wallet'), icon: 'wallet-outline', available: false },
    { label: t('payment'), icon: 'card-outline', available: false },
    { label: t('simpleMode'), icon: 'accessibility-outline', available: false },
  ];
  const handlePress = (item: ModuleItem) => {
    if (item.available && item.route) {
      navigation.navigate(item.route as any);
    } else {
      navigation.navigate('Unavailable', { title: item.label });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>{t('menu')}</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {modules.map((item) => (
          <Pressable key={item.label} style={styles.card} onPress={() => handlePress(item)}>
            <View style={[styles.iconWrap, item.available && styles.iconWrapActive]}>
              <Ionicons name={item.icon} size={26} color={item.available ? '#0d2b2b' : ACCENT} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
            {!item.available && <Text style={styles.badge}>{t('soon')}</Text>}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  header: { color: '#ffffff', fontSize: 24, fontWeight: '800', padding: 20, paddingBottom: 10 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 30,
  },
  card: {
    width: '31%', backgroundColor: '#123a3a', borderRadius: 16,
    paddingVertical: 18, alignItems: 'center', marginBottom: 14,
  },
  iconWrap: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#1f4d4d',
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  iconWrapActive: { backgroundColor: ACCENT },
  label: { color: '#ffffff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  badge: { color: '#8fa3a3', fontSize: 10, marginTop: 4 },
});