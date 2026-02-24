/**
 * MessageInput - Feature-rich message input with attachments and typing indicators
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { Text } from '../ui/Text';

interface Props {
  onSend: (text: string) => void;
  onAttachPress?: () => void;
  onEmojiPress?: () => void;
  onTyping?: () => void;
  placeholder?: string;
  replyingTo?: { name: string; content: string } | null;
  onCancelReply?: () => void;
  editingMessage?: { id: string; content: string } | null;
  onCancelEdit?: () => void;
  onSaveEdit?: (id: string, content: string) => void;
}

export const MessageInput = ({
  onSend,
  onAttachPress,
  onEmojiPress,
  onTyping,
  placeholder = 'Type a message...',
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  onSaveEdit,
}: Props) => {
  const { colors } = useTheme();
  const [text, setText] = useState(editingMessage?.content || '');
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleTextChange = (t: string) => {
    setText(t);
    if (onTyping) {
      // Fire typing immediately on first keystroke, then debounce the stop
      onTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        // Typing stopped - timeout fires after 2s of inactivity
      }, 2000);
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (editingMessage && onSaveEdit) {
      onSaveEdit(editingMessage.id, trimmed);
    } else {
      onSend(trimmed);
    }
    setText('');
    inputRef.current?.blur();
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {/* Reply/Edit Bar */}
      {(replyingTo || editingMessage) && (
        <View style={[styles.replyBar, { backgroundColor: colors.surface }]}>
          <View style={[styles.replyIndicator, { backgroundColor: colors.primary }]} />
          <View style={styles.replyContent}>
            <Text variant="caption" color={colors.primary}>
              {editingMessage ? 'Editing message' : `Replying to ${replyingTo?.name}`}
            </Text>
            <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
              {editingMessage?.content || replyingTo?.content}
            </Text>
          </View>
          <TouchableOpacity onPress={editingMessage ? onCancelEdit : onCancelReply}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.container}>
        <TouchableOpacity style={styles.iconButton} onPress={onAttachPress}>
          <Ionicons name="add-circle-outline" size={26} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text }]}
            value={text}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={2000}
            textAlignVertical="center"
          />
          <TouchableOpacity style={styles.emojiButton} onPress={onEmojiPress}>
            <Ionicons name="happy-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: text.trim() ? colors.primary : colors.surface },
          ]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons
            name={editingMessage ? 'checkmark' : 'send'}
            size={20}
            color={text.trim() ? colors.background : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Padding for safe area if not using ScreenWrapper bottom
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  replyIndicator: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  replyContent: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.xs,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    ...Typography.body,
    paddingVertical: Spacing.sm,
    minHeight: 40,
  },
  emojiButton: {
    paddingBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
