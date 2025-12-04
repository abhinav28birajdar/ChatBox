import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeContainer } from '@/components/common/safe-container';
import { Avatar, LoadingSpinner } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore, useChatStore } from '@/store';
import { Message } from '@/types';

export default function ConversationScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const chatId = String(params.chatId || params.chatID || params.id || '');

  const theme = useTheme();
  const { user } = useAuthStore();

  const {
    activeChat,
    setActiveChat,
    messages,
    loadMessages,
    sendMessage,
    isLoadingMessages,
  } = useChatStore();

  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const chatMessages = messages[chatId] || [];

  useEffect(() => {
    if (!chatId) {
      router.back();
      return;
    }

    setActiveChat(chatId);

    // load initial messages
    loadMessages(chatId).catch((e) => console.warn(e));

    return () => {
      // clear active chat on unmount
      setActiveChat(null);
    };
  }, [chatId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const success = await sendMessage(chatId, trimmed, 'text');
    if (success) {
      setText('');
      // scroll to bottom
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.user?.id === user?.id;

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowRight : styles.messageRowLeft]}>
        {!isMe && (
          <Avatar size={36} imageUri={item.user?.avatar_url} name={item.user?.full_name || item.user?.username} />
        )}

        <View style={[styles.bubble, { backgroundColor: isMe ? theme.colors.primary : theme.colors.surface }]}> 
          <Text style={[styles.messageText, { color: isMe ? theme.colors.textInverse : theme.colors.text }]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, { color: theme.colors.textMuted }]}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>

        {isMe && (
          <Avatar size={36} imageUri={user?.avatar_url} name={user?.full_name || user?.username} />
        )}
      </View>
    );
  };

  if (!activeChat) {
    return (
      <SafeContainer>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={90}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar size={44} imageUri={activeChat.avatar_url} name={activeChat.name || 'Chat'} />
            <View style={styles.headerInfo}>
              <Text style={[styles.chatTitle, { color: theme.colors.text }]} numberOfLines={1}>{activeChat.name || 'Conversation'}</Text>
              <Text style={[styles.chatSubtitle, { color: theme.colors.textMuted }]} numberOfLines={1}>{activeChat.description || ''}</Text>
            </View>
          </View>
        </View>

        <View style={styles.messagesContainer}>
          {isLoadingMessages && chatMessages.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {chatMessages.map((message) => renderMessage({ item: message }))}
            </ScrollView>
          )}
        </View>

        <View style={[styles.composer, { backgroundColor: theme.colors.surface }]}> 
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Type a message"
            placeholderTextColor={theme.colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity onPress={handleSend} style={[styles.sendButton, { backgroundColor: theme.colors.primary }]} activeOpacity={0.8}>
            <Text style={[styles.sendText, { color: theme.colors.textInverse }]}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#00000005' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerInfo: { marginLeft: spacing.md, flex: 1 },
  chatTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold },
  chatSubtitle: { fontSize: typography.fontSizes.sm },
  messagesContainer: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.sm },
  messageRowLeft: { justifyContent: 'flex-start' },
  messageRowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', padding: spacing.sm, borderRadius: borderRadius.md, marginHorizontal: spacing.xs },
  messageText: { fontSize: typography.fontSizes.md, lineHeight: 20 },
  messageTime: { marginTop: 6, fontSize: typography.fontSizes.xs, textAlign: 'right' },
  composer: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderTopWidth: 1, borderTopColor: '#00000005' },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: 'transparent' },
  sendButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, marginLeft: spacing.sm },
  sendText: { fontWeight: typography.fontWeights.semibold },
});
