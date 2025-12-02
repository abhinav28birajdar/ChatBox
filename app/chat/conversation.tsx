import { useRouter, useSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform, ScrollView, StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { SafeContainer } from '@/components/common/safe-container';
import { Avatar, LoadingSpinner } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore, useChatStore } from '@/store';
import { Message } from '@/types';

export default function ConversationScreen() {
  const params = useSearchParams();
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
              {chatMessages.map((message, index) => renderMessage({ item: message, index }))}
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
/**
 * Chat Conversation Screen
 * Real-time messaging with typing indicators and message status
 */

import { useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback } from 'react';
import {
    Animated,
    FlatList
} from 'react-native';

import { KeyboardAwareContainer } from '@/components/common/keyboard-aware-container';
import { MessageSkeleton } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MessageStatus } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar,
  showTimestamp,
}) => {
  const theme = useTheme();

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sending':
        return 'clock';
      case 'sent':
        return 'checkmark';
      case 'delivered':
        return 'checkmark.circle';
      case 'read':
        return 'checkmark.circle.fill';
      case 'failed':
        return 'exclamationmark.triangle';
      default:
        return null;
    }
  };

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'read':
        return theme.colors.primary;
      case 'delivered':
        return theme.colors.success;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <MotiView
      animate={{ opacity: 1, translateY: 0 }}
      from={{ opacity: 0, translateY: 20 }}
      transition={{ type: 'timing', duration: 300 }}
      style={[
        styles.messageContainer,
        isOwn ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}
    >
      {!isOwn && showAvatar && (
        <Avatar
          size={32}
          imageUri={message.user?.avatar_url}
          name={message.user?.full_name || 'User'}
        />
      )}

      <View
        style={[
          styles.messageBubble,
          isOwn
            ? [styles.ownBubble, { backgroundColor: theme.colors.primary }]
            : [styles.otherBubble, { backgroundColor: theme.colors.surface }],
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: isOwn ? theme.colors.textInverse : theme.colors.text,
            },
          ]}
        >
          {message.content}
        </Text>

        <View style={styles.messageFooter}>
          {showTimestamp && (
            <Text
              style={[
                styles.messageTime,
                {
                  color: isOwn
                    ? theme.colors.textInverse + '80'
                    : theme.colors.textMuted,
                },
              ]}
            >
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}

          {isOwn && message.status && (
            <View style={styles.statusContainer}>
              <IconSymbol
                name={getStatusIcon(message.status) || 'clock'}
                size={12}
                color={getStatusColor(message.status)}
              />
            </View>
          )}
        </View>
      </View>

      {isOwn && showAvatar && <View style={styles.avatarPlaceholder} />}
    </MotiView>
  );
};

const TypingIndicator: React.FC<{ isVisible: boolean; userName: string }> = ({
  isVisible,
  userName,
}) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, opacity]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.typingContainer, { opacity }]}>
      <View
        style={[
          styles.typingBubble,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text
          style={[
            styles.typingText,
            { color: theme.colors.textMuted },
          ]}
        >
          {userName} is typing...
        </Text>
        <View style={styles.typingDots}>
          {[1, 2, 3].map((dot) => (
            <MotiView
              key={dot}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                type: 'timing',
                duration: 1000,
                loop: true,
                delay: dot * 200,
              }}
              style={[
                styles.typingDot,
                { backgroundColor: theme.colors.textMuted },
              ]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

export default function ChatConversationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatId = params.chatId as string;

  const { user } = useAuthStore();
  const { 
    currentChat, 
    messages, 
    isLoading, 
    loadMessages, 
    sendMessage, 
    markAsRead,
    typingUsers 
  } = useChatStore();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
      markAsRead(chatId);
    }
  }, [chatId, loadMessages, markAsRead]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || isSending || !chatId || !user) return;

    setIsSending(true);
    try {
      await sendMessage(chatId, messageText.trim());
      setMessageText('');
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [messageText, isSending, chatId, user, sendMessage]);

  const renderMessage = ({ item: message, index }: { item: Message; index: number }) => {
    const isOwn = message.user_id === user?.id;
    const previousMessage = messages[index - 1];
    const nextMessage = messages[index + 1];

    const isFirstInGroup = !previousMessage || 
      previousMessage.user_id !== message.user_id ||
      new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() > 300000; // 5 minutes

    const isLastInGroup = !nextMessage || 
      nextMessage.user_id !== message.user_id ||
      new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime() > 300000; // 5 minutes

    const showAvatar = !isOwn && isLastInGroup;
    const showTimestamp = isLastInGroup;

    return (
      <MessageBubble
        message={message}
        isOwn={isOwn}
        showAvatar={showAvatar}
        showTimestamp={showTimestamp}
      />
    );
  };

  const isTyping = typingUsers.some(u => u.user_id !== user?.id);
  const typingUserName = typingUsers.find(u => u.user_id !== user?.id)?.user_name || 'Someone';

  if (isLoading) {
    return (
      <SafeContainer>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Loading...
            </Text>
          </View>
          <MessageSkeleton count={10} />
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <KeyboardAwareContainer>
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Avatar
                size={36}
                imageUri={currentChat?.avatar_url}
                name={currentChat?.name || 'Chat'}
                showStatus={true}
                status="online"
              />
              <View style={styles.headerText}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                  {currentChat?.name || 'Chat'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.colors.textMuted }]}>
                  {currentChat?.type === 'group' ? `${currentChat.member_count} members` : 'Online'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.headerAction}>
              <IconSymbol name="info.circle" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            inverted={false}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Typing Indicator */}
          <TypingIndicator isVisible={isTyping} userName={typingUserName} />

          {/* Input */}
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surface }]}>
              <TextInput
                style={[styles.textInput, { color: theme.colors.text }]}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.textMuted}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
              />
              
              <TouchableOpacity
                onPress={handleSend}
                disabled={!messageText.trim() || isSending}
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: messageText.trim()
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              >
                <IconSymbol
                  name={isSending ? "ellipsis" : "arrow.up"}
                  size={20}
                  color={messageText.trim() ? theme.colors.textInverse : theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareContainer>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
  },
  headerAction: {
    marginLeft: spacing.sm,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xs,
  },
  ownBubble: {
    borderBottomRightRadius: borderRadius.xs,
  },
  otherBubble: {
    borderBottomLeftRadius: borderRadius.xs,
  },
  messageText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  messageTime: {
    fontSize: typography.fontSizes.xs,
    marginRight: spacing.xs,
  },
  statusContainer: {
    marginLeft: spacing.xs,
  },
  avatarPlaceholder: {
    width: 32,
  },
  typingContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  typingBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: typography.fontSizes.sm,
    marginRight: spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  inputContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    maxHeight: 100,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
});