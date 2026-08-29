import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ACCENT = '#f4a259';

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SelectField({ label, value, options, onChange, placeholder }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setVisible(true)}>
        <Ionicons name="list-outline" size={18} color={ACCENT} />
        <Text style={[styles.fieldText, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder || 'Sélectionner...'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#8fa3a3" />
      </Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView style={{ maxHeight: 340 }}>
              {options.map((opt) => (
                <Pressable
                  key={opt}
                  style={styles.option}
                  onPress={() => {
                    onChange(opt);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, opt === value && styles.optionTextActive]}>{opt}</Text>
                  {opt === value && <Ionicons name="checkmark" size={18} color={ACCENT} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 14 },
  label: { color: '#8fa3a3', fontSize: 13, marginBottom: 6 },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#123a3a', borderRadius: 12, padding: 14 },
  fieldText: { color: '#ffffff', fontSize: 15, marginLeft: 10, flex: 1 },
  placeholder: { color: '#5a7373' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#123a3a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  sheetTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f4d4d' },
  optionText: { color: '#c9d6d6', fontSize: 15 },
  optionTextActive: { color: ACCENT, fontWeight: '700' },
});