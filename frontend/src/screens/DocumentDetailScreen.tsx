import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Linking, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, DocumentItem } from '../types';
import { fetchDocument, deleteDocument } from '../api/voya';
import ConfirmModal from '../components/ConfirmModal';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';
const DANGER = '#f28b82';

type Props = NativeStackScreenProps<RootStackParamList, 'DocumentDetail'>;

const iconForDocType = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'PASSEPORT': return 'card-outline';
    case 'VISA': return 'document-attach-outline';
    case 'BILLET': return 'airplane-outline';
    case 'VOUCHER': return 'pricetag-outline';
    default: return 'document-text-outline';
  }
};

export default function DocumentDetailScreen({ route, navigation }: Props) {
  const { t } = useLanguage();
  const { documentId } = route.params;
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: t('documentDetailTitle') });
    fetchDocument(documentId).then((d) => {
      setDocument(d);
      setLoading(false);
    });
  }, [documentId, navigation]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteDocument(documentId);
      navigation.goBack();
    } catch (e: any) {
      console.error(e);
      setDeleting(false);
      setConfirmVisible(false);
    }
  };

  if (loading || !document) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name={iconForDocType(document.type)} size={32} color={ACCENT} />
        </View>
        <Text style={styles.title}>{document.nomFichier}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{document.type}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('addedOn')}</Text>
          <Text style={styles.infoValue}>{formatDate(document.dateAjout)}</Text>
        </View>

        <Pressable style={styles.linkButton} onPress={() => Linking.openURL(document.urlS3)}>
          <Ionicons name="open-outline" size={18} color="#0d2b2b" />
          <Text style={styles.linkButtonText}>{t('openDocument')}</Text>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={() => setConfirmVisible(true)}>
          <Ionicons name="trash-outline" size={18} color={DANGER} />
          <Text style={styles.deleteButtonText}>{t('deleteDocument')}</Text>
        </Pressable>
      </View>

      <ConfirmModal
        visible={confirmVisible}
        title={t('deleteDocument')}
        message={t('deleteDocumentConfirmMessage')}
        confirmLabel={t('delete')}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, alignItems: 'center' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#123a3a', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  badge: { backgroundColor: '#1f4d4d', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 24 },
  badgeText: { color: ACCENT, fontSize: 12, fontWeight: '700' },
  infoRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f4d4d', marginBottom: 24 },
  infoLabel: { color: '#8fa3a3', fontSize: 14 },
  infoValue: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  linkButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 12, width: '100%', marginBottom: 12,
  },
  linkButtonText: { color: '#0d2b2b', fontSize: 14, fontWeight: '700', marginLeft: 8 },
  deleteButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: DANGER, borderRadius: 14, paddingVertical: 12, width: '100%',
  },
  deleteButtonText: { color: DANGER, fontSize: 14, fontWeight: '700', marginLeft: 8 },
});