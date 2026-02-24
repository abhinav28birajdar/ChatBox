import React, { memo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Message } from '@/services/MessageService';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { formatMessageTime, shouldGroupMessages } from '@/utils/helpers';
import * as Haptics from 'expo-haptics';

interface MessageItemProps {
    message: Message;
    previousMessage: Message | null;
    nextMessage: Message | null;
    onReact?: (messageId: string, emoji: string) => void;
    onEdit?: (messageId: string) => void;
    onDelete?: (messageId: string) => void;
    onReply?: (messageId: string) => void;
    isMe?: boolean;
}

const MessageItem = memo(({
    message,
    previousMessage,
    nextMessage,
    onReact,
    onEdit,
    onDelete,
    onReply,
    isMe = false,
}: MessageItemProps) => {
    const { colors } = useTheme();
    const [showActions, setShowActions] = useState(false);

    const isGrouped = shouldGroupMessages(previousMessage, message);

    const handleLongPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowActions(!showActions);
    };

    const handleReaction = (emoji: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onReact?.(message.id, emoji);
        setShowActions(false);
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={handleLongPress}
            style={[
                styles.container,
                isGrouped && styles.groupedContainer,
                showActions && { backgroundColor: colors.surface + '40' }
            ]}
        >
            {!isGrouped && (
                <View style={styles.header}>
                    <Avatar
                        size={36}
                        uri={message.authorAvatar}
                        fallback={message.authorName}
                    />
                    <View style={styles.headerText}>
                        <Text variant="bodyBold" color={isMe ? colors.primary : colors.text}>
                            {message.authorName}
                        </Text>
                        <Text variant="caption" color={colors.textSecondary} style={styles.time}>
                            {formatMessageTime(message.createdAt)}
                        </Text>
                    </View>
                </View>
            )}

            <View style={[styles.content, isGrouped && styles.groupedContent]}>
                {/* Reply Preview */}
                {message.replyTo && (
                    <View style={[styles.replyPreview, { borderLeftColor: colors.primary, backgroundColor: colors.surface }]}>
                        <Text variant="caption" color={colors.primary} numberOfLines={1}>
                            Replying to message...
                        </Text>
                    </View>
                )}

                <Text variant="body" style={styles.messageText}>
                    {message.content}
                </Text>

                {message.edited && (
                    <Text variant="caption" color={colors.textSecondary} style={styles.edited}>
                        (edited)
                    </Text>
                )}

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <View style={styles.attachments}>
                        {message.attachments.map((attachment, index) => (
                            <View key={index} style={styles.attachment}>
                                {attachment.type === 'image' ? (
                                    <Image
                                        source={{ uri: attachment.url }}
                                        style={styles.attachmentImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[styles.fileAttachment, { backgroundColor: colors.surface }]}>
                                        <Ionicons name="document" size={24} color={colors.primary} />
                                        <View style={{ flex: 1 }}>
                                            <Text variant="caption" numberOfLines={1}>{attachment.name}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Reactions */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <View style={styles.reactions}>
                        {Object.entries(message.reactions).map(([emoji, users]) => (
                            <TouchableOpacity
                                key={emoji}
                                style={[styles.reaction, { backgroundColor: colors.surface }]}
                                onPress={() => handleReaction(emoji)}
                            >
                                <Text variant="caption">{emoji}</Text>
                                <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
                                    {(users as string[]).length}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Quick Actions Overlay */}
            {showActions && (
                <View style={[styles.actions, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleReaction('👍')}>
                        <Text>👍</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleReaction('❤️')}>
                        <Text>❤️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => { onReply?.(message.id); setShowActions(false); }}>
                        <Ionicons name="arrow-undo" size={18} color={colors.text} />
                    </TouchableOpacity>
                    {isMe && (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => { onEdit?.(message.id); setShowActions(false); }}>
                            <Ionicons name="create-outline" size={18} color={colors.text} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.actionBtn} onPress={() => { onDelete?.(message.id); setShowActions(false); }}>
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
});

MessageItem.displayName = 'MessageItem';

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        width: '100%',
    },
    groupedContainer: {
        marginTop: -2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
        marginBottom: 4,
    },
    headerText: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Spacing.sm,
    },
    time: {
        marginLeft: Spacing.sm,
        opacity: 0.6,
    },
    content: {
        marginLeft: 44,
    },
    groupedContent: {
        marginTop: 0,
    },
    messageText: {
        lineHeight: 22,
    },
    replyPreview: {
        borderLeftWidth: 2,
        paddingLeft: Spacing.sm,
        paddingVertical: 4,
        marginBottom: 4,
        borderRadius: 4,
        opacity: 0.8,
    },
    edited: {
        fontSize: 10,
        marginTop: 2,
        opacity: 0.6,
    },
    attachments: {
        marginTop: Spacing.sm,
        gap: Spacing.sm,
    },
    attachment: {
        borderRadius: 8,
        overflow: 'hidden',
        maxWidth: '100%',
    },
    attachmentImage: {
        width: 260,
        height: 180,
        borderRadius: 8,
    },
    fileAttachment: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: 8,
        gap: Spacing.sm,
    },
    reactions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: Spacing.sm,
    },
    reaction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        right: Spacing.md,
        top: -20,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 0,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 10,
    },
    actionBtn: {
        padding: 10,
    },
});

export default MessageItem;
