import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useLanguage } from '../i18n';
import { useAccessibility } from '../accessibility';
import SimpleModeScreen from './SimpleModeScreen';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'> & {
  token?: string;
  onLogout?: () => Promise<void>;
};

type ModuleItem = {
  labelKey: Parameters<ReturnType<typeof useLanguage>['t']>[0];
  icon: keyof typeof Ionicons.glyphMap;
  available: boolean;
  route?: keyof RootStackParamList;
  params?: Record<string, string>;
};

const MODULES: ModuleItem[] = [
  { labelKey: 'myTrips', icon: 'airplane-outline', available: true, route: 'VoyagesList' },
  { labelKey: 'reservations', icon: 'calendar-outline', available: true, route: 'SelectVoyageForReservation' },
  { labelKey: 'assistant', icon: 'chatbubble-ellipses-outline', available: true, route: 'Assistant' },
  { labelKey: 'esim', icon: 'cellular-outline', available: true, route: 'Esim' },
  { labelKey: 'hotels', icon: 'bed-outline', available: true, route: 'Hotel' },
  { labelKey: 'marketplace', icon: 'storefront-outline', available: true, route: 'Marketplace' },
  { labelKey: 'driver', icon: 'car-outline', available: true, route: 'Transport' },
  { labelKey: 'emergency', icon: 'medical-outline', available: true, route: 'Emergency' },
  { labelKey: 'wallet', icon: 'wallet-outline', available: true, route: 'Payment' },
  { labelKey: 'payment', icon: 'card-outline', available: false },
  { labelKey: 'simpleMode', icon: 'accessibility-outline', available: true, route: 'SimpleMode' },
];

const TOP_ICONS: { key: string; icon: keyof typeof Ionicons.glyphMap; labelKey: Parameters<ReturnType<typeof useLanguage>['t']>[0] }[] = [
  { key: 'search', icon: 'search-outline', labelKey: 'search' },
  { key: 'profile', icon: 'person-circle-outline', labelKey: 'profile' },
  { key: 'chat', icon: 'chatbubbles-outline', labelKey: 'chat' },
  { key: 'notifications', icon: 'notifications-outline', labelKey: 'notifications' },
];

const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'Réservation confirmée', message: 'Votre trajet Paris → Tunis a été confirmé.', time: 'Il y a 10 min' },
  { id: 'n2', title: 'Chauffeur assigné', message: 'Karim arrive dans 15 minutes à l’aéroport.', time: 'Il y a 35 min' },
  { id: 'n3', title: 'Document requis', message: 'Ajoutez votre visa avant le départ.', time: 'Il y a 1h' },
];

export default function MainMenuScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const { setSimpleMode } = useAccessibility();
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MODULES;
    return MODULES.filter((item) => t(item.labelKey).toLowerCase().includes(query));
  }, [search, t]);

  const handlePress = (item: ModuleItem) => {
    if (item.labelKey === 'simpleMode') {
      setSimpleMode(true);
      navigation.navigate('SimpleMode');
      return;
    }

    if (item.available && item.route) {
      navigation.navigate(item.route as any, item.params);
    } else {
      navigation.navigate('Unavailable', { title: t(item.labelKey) });
    }
  };

  const handleTopIconPress = (icon: (typeof TOP_ICONS)[number]) => {
    switch (icon.key) {
      case 'search':
        setSearchVisible((value) => !value);
        return;
      case 'profile':
        navigation.navigate('ProfileDetail');
        return;
      case 'chat':
        navigation.navigate('Assistant');
        return;
      case 'notifications':
        setNotificationsVisible(true);
        return;
      default:
        navigation.navigate('Unavailable', { title: t(icon.labelKey) });
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
              onPress={() => handleTopIconPress(icon)}
            >
              <Ionicons name={icon.icon} size={20} color={ACCENT} />
            </Pressable>
          ))}
        </View>
      </View>

      {searchVisible && (
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#123a3a" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher..."
            placeholderTextColor="#667777"
            style={styles.searchInput}
            autoFocus
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.grid}>
        {filteredModules.map((item) => (
          <Pressable key={item.labelKey} style={styles.card} onPress={() => handlePress(item)}>
            <View style={[styles.iconWrap, item.available && styles.iconWrapActive]}>
              <Ionicons name={item.icon} size={26} color={item.available ? '#f8f6ef' : '#f4a259'} />
            </View>
            <Text style={styles.label}>{t(item.labelKey)}</Text>
            {!item.available && <Text style={styles.badge}>{t('soon')}</Text>}
          </Pressable>
        ))}
      </ScrollView>

      <Modal transparent visible={notificationsVisible} animationType="slide" onRequestClose={() => setNotificationsVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setNotificationsVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeading}>
                <View style={styles.modalIcon}>
                  <Ionicons name="notifications-outline" size={19} color="#f8f6ef" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Notifications</Text>
                  <Text style={styles.modalSubtitle}>{MOCK_NOTIFICATIONS.length} alertes récentes</Text>
                </View>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setNotificationsVisible(false)}>
                <Ionicons name="close" size={20} color="#123a3a" />
              </Pressable>
            </View>
            <ScrollView style={styles.notificationList} showsVerticalScrollIndicator={false}>
              {MOCK_NOTIFICATIONS.map((notification) => (
                <View key={notification.id} style={styles.notificationItem}>
                  <View style={styles.notificationIcon}>
                    <Ionicons name="airplane-outline" size={18} color="#123a3a" />
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationTopLine}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                    <Text style={styles.notificationText}>{notification.message}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6ef' },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10,
  },
  header: { color: '#123a3a', fontSize: 24, fontWeight: '800' },
  topIcons: { flexDirection: 'row', gap: 8 },
  topIconButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3dacb',
    justifyContent: 'center', alignItems: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 30 },
  card: {
    width: '31%',
    backgroundColor: '#f8f6ef',
    borderColor: '#123a3a',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#123a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapActive: { backgroundColor: '#123a3a' },
  label: { color: '#123a3a', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  badge: { color: '#667777', fontSize: 10, marginTop: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#123a3a',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#123a3a',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#123a3a' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(18,58,58,0.36)', justifyContent: 'flex-end', padding: 12 },
  modalCard: {
    backgroundColor: '#f8f6ef',
    borderColor: '#123a3a',
    borderWidth: 1.5,
    borderRadius: 22,
    padding: 16,
    maxHeight: '72%',
    shadowColor: '#123a3a',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalHandle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: '#b9c5c1', marginBottom: 14 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#123a3a', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { color: '#123a3a', fontSize: 18, fontWeight: '800' },
  modalSubtitle: { color: '#667777', fontSize: 11, marginTop: 2 },
  closeButton: { width: 34, height: 34, borderRadius: 17, borderColor: '#d2ddd8', borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  notificationList: { flexGrow: 0 },
  notificationItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#dce5df' },
  notificationIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#edf3ef', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  notificationContent: { flex: 1 },
  notificationTopLine: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  notificationTitle: { flex: 1, color: '#123a3a', fontSize: 13, fontWeight: '700' },
  notificationText: { color: '#667777', fontSize: 12, lineHeight: 18 },
  notificationTime: { color: '#8fa3a3', fontSize: 10 },
});