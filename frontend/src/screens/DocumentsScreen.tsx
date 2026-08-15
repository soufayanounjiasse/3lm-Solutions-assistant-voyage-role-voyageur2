import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StyleSheet,
  ActivityIndicator, Pressable, RefreshControl, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, DocumentItem } from '../types';
import { API_BASE_URL, uploadDocument } from '../api/voya';

const ACCENT = '#f4a259';

type Props = NativeStackScreenProps<RootStackParamList, 'Documents'>;

const DOC_TYPES = [
  { value: 'PASSEPORT', label: 'Passeport', icon: 'card-outline' as const },
  { value: 'VISA', label: 'Visa', icon: 'document-attach-outline' as const },
  { value: 'BILLET', label: 'Billet', icon: 'airplane-outline' as const },
  { value: 'VOUCHER', label: 'Voucher', icon: 'pricetag-outline' as const },
  { value: 'AUTRE', label: 'Autre', icon: 'document-text-outline' as const },
];

const iconForDocType = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'PASSEPORT': return 'card-outline';
    case 'VISA': return 'document-attach-outline';
    case 'BILLET': return 'airplane-outline';
    case 'VOUCHER': return 'pricetag-outline';
    default: return 'document-text-outline';
  }
};

export default function DocumentsScreen({ route, navigation }: Props) {
  const { voyageId, destination } = route.params;
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/voyages/${voyageId}/document`);
    const data = await res.json();
    setDocuments(data);
    setLoading(false);
    setRefreshing(false);
  }, [voyageId]);

  useEffect(() => {
    navigation.setOptions({ title: `Documents · ${destination}` });
    load();
  }, [load, navigation, destination]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const startAddDocument = () => {
    setTypePickerVisible(true);
  };

  const pickAndUpload = async (type: string) => {
    setTypePickerVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      setUploading(true);
      await uploadDocument(voyageId, type, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
      });
      await load();
    } catch (e: any) {
      Alert.alert('Échec de l\'upload', e.message ?? 'Une erreur est survenue.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
      >
        {documents.length === 0 ? (
          <Text style={styles.emptyText}>Aucun document pour ce voyage.</Text>
        ) : (
          documents.map((d) => (
            <Pressable
              key={d.id}
              style={styles.item}
              onPress={() => navigation.navigate('DocumentDetail', { documentId: d.id })}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={iconForDocType(d.type)} size={20} color={ACCENT} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title}>{d.nomFichier}</Text>
                <Text style={styles.sub}>{d.type}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8fa3a3" />
            </Pressable>
          ))
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={startAddDocument} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator size="small" color="#0d2b2b" />
        ) : (
          <Ionicons name="add" size={26} color="#0d2b2b" />
        )}
      </Pressable>

      <Modal
        visible={typePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setTypePickerVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Type de document</Text>
            {DOC_TYPES.map((t) => (
              <Pressable
                key={t.value}
                style={styles.modalItem}
                onPress={() => pickAndUpload(t.value)}
              >
                <View style={styles.modalIconWrap}>
                  <Ionicons name={t.icon} size={18} color={ACCENT} />
                </View>
                <Text style={styles.modalItemText}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#8fa3a3', fontSize: 14, textAlign: 'center', marginTop: 40 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#123a3a', borderRadius: 16, padding: 14, marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f4d4d', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  textWrap: { flex: 1 },
  title: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  sub: { color: '#8fa3a3', fontSize: 13 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#123a3a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  modalIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1f4d4d', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  modalItemText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});