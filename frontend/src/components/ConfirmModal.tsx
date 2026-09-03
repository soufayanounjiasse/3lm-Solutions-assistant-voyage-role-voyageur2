import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DANGER = '#f28b82';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ visible, title, message, confirmLabel, loading, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="warning-outline" size={28} color={DANGER} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelText}>Retour</Text>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={onConfirm} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.confirmText}>{confirmLabel}</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#123a3a', borderRadius: 18, padding: 22, width: '100%', maxWidth: 340, alignItems: 'center' },
  iconWrap: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(242,139,130,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  title: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  message: { color: '#c9d6d6', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#1f4d4d' },
  cancelText: { color: '#c9d6d6', fontWeight: '600' },
  confirmButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: DANGER },
  confirmText: { color: '#ffffff', fontWeight: '700' },
});