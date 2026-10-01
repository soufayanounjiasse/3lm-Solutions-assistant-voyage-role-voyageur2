import React, { useState, useRef } from 'react';
import {
  SafeAreaView, View, Text, TextInput, StyleSheet, Pressable,
  FlatList, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatWithAssistant } from '../api/voya';
import { useLanguage } from '../i18n';

const ACCENT = '#f4a259';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

export default function ChatScreen() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: `${Date.now()}-u`, role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const { reply } = await chatWithAssistant(text, history.slice(0, -1));
      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-err`, role: 'assistant', content: e.message ?? t('genericError') },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={40} color={ACCENT} />
            <Text style={styles.emptyText}>{t('assistant')}</Text>
            <Text style={styles.emptyHint}>Où puis-je manger ? Que faire à mon arrivée ?</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messagesList}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                <Text style={[styles.bubbleText, item.role === 'user' && styles.bubbleTextUser]}>
                  {item.content}
                </Text>
              </View>
            )}
          />
        )}

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={ACCENT} />
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('search')}
            placeholderTextColor="#8fa3a3"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
          />
          <Pressable style={styles.sendButton} onPress={send} disabled={loading}>
            <Ionicons name="send" size={18} color="#0d2b2b" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d2b2b' },
  flex: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginTop: 14 },
  emptyHint: { color: '#8fa3a3', fontSize: 13, marginTop: 8, textAlign: 'center' },
  messagesList: { padding: 16, gap: 10 },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 4 },
  bubbleUser: { backgroundColor: ACCENT, alignSelf: 'flex-end' },
  bubbleAssistant: { backgroundColor: '#123a3a', alignSelf: 'flex-start' },
  bubbleText: { color: '#ffffff', fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: '#0d2b2b' },
  loadingRow: { paddingHorizontal: 16, paddingBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10,
    borderTopWidth: 1, borderTopColor: '#1f4d4d',
  },
  input: {
    flex: 1, backgroundColor: '#123a3a', color: '#ffffff', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14,
  },
  sendButton: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: ACCENT,
    justifyContent: 'center', alignItems: 'center',
  },
});