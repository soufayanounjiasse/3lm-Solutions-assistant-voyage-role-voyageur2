import React, { useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatAssistant, AssistantMessage } from '../api/voya';
import { useLanguage } from '../i18n';

type Message = AssistantMessage & { id: string };

const ACCENT = '#f4a259';

export default function AssistantScreen() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

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
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={styles.icon}><Ionicons name="sparkles" size={22} color="#0d2b2b" /></View>
          <Text style={styles.welcome}>{t('assistantWelcome')}</Text>
        </View>
        <FlatList
          data={messages}
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
            placeholderTextColor="#8fa3a3"
            multiline
            editable={!sending}
            onSubmitEditing={sendMessage}
          />
          <Pressable style={styles.sendButton} onPress={sendMessage} disabled={sending || !input.trim()}>
            {sending ? <ActivityIndicator color="#0d2b2b" /> : <Ionicons name="arrow-up" size={21} color="#0d2b2b" />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  content: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12 },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  welcome: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
  list: { flexGrow: 1, justifyContent: 'flex-end', paddingVertical: 12, gap: 10 },
  message: { maxWidth: '86%', borderRadius: 14, padding: 12 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: ACCENT },
  assistantMessage: { alignSelf: 'flex-start', backgroundColor: '#123a3a' },
  messageText: { color: '#fff', fontSize: 15, lineHeight: 21 },
  userMessageText: { color: '#0d2b2b' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 10 },
  input: { flex: 1, maxHeight: 110, backgroundColor: '#123a3a', color: '#fff', borderWidth: 1, borderColor: '#1f4d4d', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },
  sendButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
});
