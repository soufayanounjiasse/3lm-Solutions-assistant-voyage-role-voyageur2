import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'Unavailable'>;

export default function UnavailableScreen({ route }: Props) {
  const title = route.params?.title ?? 'Cette fonctionnalité';

  return (
    <SafeAreaView style={styles.container}>
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
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#123a3a',
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
  },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  message: { color: ACCENT, fontSize: 15, fontWeight: '600', marginBottom: 10 },
  hint: { color: '#8fa3a3', fontSize: 13, textAlign: 'center' },
});