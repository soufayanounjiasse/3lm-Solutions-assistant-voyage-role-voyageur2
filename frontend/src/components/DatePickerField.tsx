import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

type Props = {
  label: string;
  value: string; // format AAAA-MM-JJ, ou '' si non défini
  onChange: (isoDate: string) => void;
};

export default function DatePickerField({ label, value, onChange }: Props) {
  if (Platform.OS === 'web') {
    return <WebDatePickerField label={label} value={value} onChange={onChange} />;
  }
  return <NativeDatePickerField label={label} value={value} onChange={onChange} />;
}

// --- Version WEB : input HTML natif du navigateur ---
function WebDatePickerField({ label, value, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Ionicons name="calendar-outline" size={18} color={ACCENT} />
        {/* @ts-ignore - élément HTML natif valide uniquement en mode web */}
        <input
          type="date"
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: 15,
            marginLeft: 10,
            outline: 'none',
            flex: 1,
            colorScheme: 'dark',
          }}
        />
      </View>
    </View>
  );
}

// --- Version MOBILE (iOS/Android) : picker natif ---
function NativeDatePickerField({ label, value, onChange }: Props) {
  const { t, language } = useLanguage();
  const [show, setShow] = useState(false);
  // Import différé : ce module casse le bundle web s'il est chargé en haut du fichier
  const DateTimePicker = require('@react-native-community/datetimepicker').default;
  const currentDate = value ? new Date(value) : new Date();

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (event.type === 'dismissed') return;
    if (selectedDate) {
      const iso = selectedDate.toISOString().slice(0, 10);
      onChange(iso);
    }
  };

  const displayText = value
    ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : t('chooseDate');

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setShow(true)}>
        <Ionicons name="calendar-outline" size={18} color={ACCENT} />
        <Text style={[styles.fieldText, !value && styles.placeholder]}>{displayText}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 14 },
  label: { color: '#8fa3a3', fontSize: 13, marginBottom: 6 },
  field: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#123a3a',
    borderRadius: 12, padding: 14,
  },
  fieldText: { color: '#ffffff', fontSize: 15, marginLeft: 10 },
  placeholder: { color: '#5a7373' },
});