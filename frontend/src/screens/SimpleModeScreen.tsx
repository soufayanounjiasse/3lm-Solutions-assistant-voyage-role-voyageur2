import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAccessibility } from '../accessibility';

type Props = NativeStackScreenProps<RootStackParamList, 'SimpleMode'>;

type SimpleAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: 'Assistant' | 'Transport' | 'Emergency' | 'VoyagesList';
};

const SIMPLE_ACTIONS: SimpleAction[] = [
  { icon: 'mic-outline', label: 'Parler à l’assistant', route: 'Assistant' },
  { icon: 'car-outline', label: 'Appeler un chauffeur', route: 'Transport' },
  { icon: 'medical-outline', label: 'Aide d’urgence', route: 'Emergency' },
  { icon: 'document-text-outline', label: 'Mes documents', route: 'VoyagesList' },
];

export default function SimpleModeScreen({ navigation }: Props) {
  const { setSimpleMode } = useAccessibility();

  const handleAction = (route: SimpleAction['route']) => {
    if (route === 'VoyagesList') {
      navigation.navigate('VoyagesList');
      return;
    }
    navigation.navigate(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.time}>9:41</Text>
        <Text style={styles.brand}>VOYA · FR → TN</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setSimpleMode(false);
            navigation.goBack();
          }}
          style={styles.closeButton}
        >
          <Ionicons name="close-circle-outline" size={18} color="#123a3a" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mode simple</Text>
        <Text style={styles.subtitle}>Grands boutons, une action à la fois</Text>

        {SIMPLE_ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            style={styles.card}
            onPress={() => handleAction(action.route)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={action.icon} size={28} color="#0d2b2b" />
            </View>
            <Text style={styles.cardText}>{action.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f3d3e', paddingTop: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  time: { color: '#123a3a', fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'left' },
  brand: { color: '#123a3a', fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'center' },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f6ef',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dfe4dd',
    flex: 1,
    maxWidth: 28,
  },
  content: { paddingHorizontal: 18, paddingBottom: 28 },
  title: { color: '#123a3a', fontSize: 38, fontWeight: '800', marginTop: 8, marginBottom: 4 },
  subtitle: { color: '#123a3a', fontSize: 18, marginBottom: 18 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 2,
    borderColor: '#123a3a',
    borderRadius: 24,
    backgroundColor: '#f8f6ef',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
    minHeight: 96,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#e8f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  cardText: { color: '#123a3a', fontSize: 24, fontWeight: '700' },
});
