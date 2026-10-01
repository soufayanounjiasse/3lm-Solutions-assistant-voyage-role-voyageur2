import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'Unavailable'>;

export default function UnavailableScreen({ route, navigation }: Props) {
  const title = route.params?.title ?? 'Cette fonctionnalité';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#123a3a" />
        </Pressable>
      </View>
      <View style={styles.centered}>
        <View style={styles.iconWrap}>
          <Ionicons name="construct-outline" size={36} color={ACCENT} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>Indisponible pour le moment</Text>
        <Text style={styles.hint}>Cette fonctionnalité est en cours de développement.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6ef' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 18 },
  backButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3dacb', alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', borderColor: '#e3dacb', borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
  },
  title: { color: '#123a3a', fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  message: { color: ACCENT, fontSize: 15, fontWeight: '600', marginBottom: 10 },
  hint: { color: '#667777', fontSize: 13, textAlign: 'center' },
});