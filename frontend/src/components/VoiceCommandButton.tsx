import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

const ACCENT = '#f4a259';

type Props = {
  onCommand: (command: string) => void;
};

export default function VoiceCommandButton({ onCommand }: Props) {
  const [listening, setListening] = useState(false);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    if (event.error !== 'no-speech') Alert.alert('Commande vocale', 'La reconnaissance vocale est indisponible.');
  });
  useSpeechRecognitionEvent('result', (event) => {
    const command = event.results[0]?.transcript?.trim();
    if (command) onCommand(command);
  });

  const startListening = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Commande vocale', 'La commande vocale est disponible dans l’application mobile.');
      return;
    }
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Commande vocale', 'Autorisez le microphone dans les réglages de votre appareil.');
      return;
    }
    ExpoSpeechRecognitionModule.start({ lang: 'fr-FR', interimResults: false, maxAlternatives: 1 });
  };

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Commande vocale" style={[styles.button, listening && styles.listening]} onPress={() => void startListening()}>
      <Ionicons name={listening ? 'mic' : 'mic-outline'} size={24} color="#0d2b2b" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 54, height: 54, borderRadius: 27, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  listening: { backgroundColor: '#e87878' },
});
