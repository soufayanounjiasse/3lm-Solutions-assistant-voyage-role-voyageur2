import React, { useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatAssistant, AssistantMessage } from '../api/voya';
import { useLanguage } from '../i18n';

type Message = AssistantMessage & { id: string };

type Props = {
  navigation?: { goBack: () => void };
};

const ACCENT = '#f4a259';

export default function AssistantScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const previewMessages: Message[] = [
    { id: 'sample-user-arrival', role: 'user', content: t('assistantSampleArrival') },
    { id: 'sample-assistant-arrival', role: 'assistant', content: t('assistantSampleWelcome') },
    { id: 'sample-assistant-driver', role: 'assistant', content: t('assistantSampleDriver') },
    { id: 'sample-user-contact', role: 'user', content: t('assistantSampleContact') },
    { id: 'sample-assistant-contact', role: 'assistant', content: t('assistantSampleCall') },
  ];

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', content };
    const history = messages.map(({ role, content: messageContent }) => ({ role, content: messageContent }));
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setSending(true);

    try {
      const result = await chatAssistant(content, history);
      setMessages((current) => [...current, { id: `${Date.now()}-assistant`, role: 'assistant', content: result.reply }]);
    } catch {
      setMessages((current) => [...current, { id: `${Date.now()}-error`, role: 'assistant', content: t('assistantError') }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f6ef" />
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.brandRow}>
          <Pressable style={styles.backButton} onPress={() => navigation?.goBack?.()}>
            <Ionicons name="chevron-back" size={22} color="#123a3a" />
          </Pressable>
          <Text style={styles.brand}>VOYA · FR → TN</Text>
        </View>
        <Text style={styles.welcome}>{t('assistantTitle')}</Text>
        <Text style={styles.subtitle}>{t('assistantSubtitle')}</Text>
        <FlatList
          data={messages.length > 0 ? messages : previewMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.message, item.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
              <Text style={[styles.messageText, item.role === 'user' && styles.userMessageText]}>{item.content}</Text>
            </View>
          )}
        />
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('assistantPlaceholder')}
            placeholderTextColor="#788787"
            multiline
            editable={!sending}
            onSubmitEditing={sendMessage}
            accessibilityLabel={t('assistantPlaceholder')}
          />
          <Pressable style={styles.sendButton} onPress={sendMessage} disabled={sending || !input.trim()}>
            {sending ? <ActivityIndicator color="#173536" /> : <Ionicons name="send" size={19} color="#173536" />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f6ef' },
  content: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 28, paddingTop: 8, paddingBottom: 12 },
  brandRow: { minHeight: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3dacb', alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#123a3a', fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
  welcome: { color: '#123a3a', fontSize: 24, lineHeight: 30, fontWeight: '700' },
  subtitle: { color: '#667777', fontSize: 15, lineHeight: 21, marginBottom: 8 },
  list: { flexGrow: 1, justifyContent: 'flex-end', paddingVertical: 12, gap: 12 },
  message: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 13 },
  userMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', borderColor: '#e3dacb', borderWidth: 1, borderBottomLeftRadius: 3 },
  assistantMessage: { alignSelf: 'flex-end', backgroundColor: '#0e4141', borderBottomRightRadius: 3 },
  messageText: { color: '#fff', fontSize: 16, lineHeight: 22 },
  userMessageText: { color: '#173536' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 8 },
  input: { flex: 1, minHeight: 48, maxHeight: 110, backgroundColor: '#fff', color: '#173536', borderWidth: 1, borderColor: '#e3dacb', borderRadius: 25, paddingHorizontal: 16, paddingVertical: 11, fontSize: 16 },
  sendButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
});
