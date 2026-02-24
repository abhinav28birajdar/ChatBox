import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useChat } from '@/context/ChatContext';
import { useServers } from '@/context/ServerContext';
import MessageList from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import MessageService from '@/services/MessageService';
import DMService from '@/services/DMService';
import { useFriends } from '@/context/FriendContext';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function ChatRoomScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { id, type, serverId } = useLocalSearchParams<{
        id: string;
        type: 'dm' | 'channel';
        serverId?: string;
    }>();

    const {
        messages,
        loading: messagesLoading,
        setActiveChat,
        sendMessage,
        sendTyping,
        typingUsers,
        addReaction,
        dms
    } = useChat();

    const { friends } = useFriends();
    const { userProfile } = useAuth();

    const { activeServer, activeChannel, setActiveChannel, setActiveServer } = useServers();

    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [editingMessage, setEditingMessage] = useState<any>(null);

    // Set active chat/channel on mount
    useEffect(() => {
        if (type === 'channel') {
            if (serverId) setActiveServer(serverId);
            setActiveChannel(id);
        }
        setActiveChat(id);

        return () => {
            setActiveChat(null);
            // We don't always want to clear active server here as user might go back to channel list
        };
    }, [id, type, serverId]);

    const headerTitle = useMemo(() => {
        if (type === 'channel') return `# ${activeChannel?.name || 'channel'}`;

        const dm = dms.find(d => d.id === id);
        if (!dm) return 'Direct Message';

        if (dm.name) return dm.name;

        if (dm.isGroup) return 'Group Chat';

        // Find other participant
        const otherId = dm.participants.find(p => p !== userProfile?.uid);
        if (!otherId) return 'Chat';

        // Check friends list
        const friend = friends.find(f => f.uid === otherId);
        if (friend) return friend.displayName;

        return 'User';
    }, [type, activeChannel, dms, id, userProfile, friends]);

    const handleSend = async (content: string, attachments?: any[]) => {
        try {
            await sendMessage(
                type === 'channel' ? activeServer?.id || null : null,
                id,
                {
                    content,
                    replyTo: replyingTo?.id,
                    attachments
                }
            );
            setReplyingTo(null);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = () => {
        sendTyping(id);
    };

    const handleReact = (messageId: string, emoji: string) => {
        addReaction(
            type === 'channel' ? activeServer?.id || null : null,
            id,
            messageId,
            emoji
        );
    };

    const handleReply = (messageId: string) => {
        const msg = messages.find(m => m.id === messageId);
        if (msg) setReplyingTo(msg);
    };

    const handleEdit = (messageId: string) => {
        const msg = messages.find(m => m.id === messageId);
        if (msg) setEditingMessage(msg);
    };

    const handleDelete = async (messageId: string) => {
        try {
            if (type === 'channel' && activeServer) {
                await MessageService.deleteMessage(activeServer.id, id, messageId);
            } else if (type === 'dm') {
                await DMService.deleteMessage(id, messageId);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text variant="bodyBold" numberOfLines={1}>{headerTitle}</Text>
                        {type === 'channel' && activeChannel?.topic && (
                            <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
                                {activeChannel.topic}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="call-outline" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="videocam-outline" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="people-outline" size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.content}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <MessageList
                    messages={messages}
                    loading={messagesLoading}
                    onReact={handleReact}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <View style={styles.typingContainer}>
                        <Text variant="caption" color={colors.textSecondary}>
                            {typingUsers.length > 1
                                ? `${typingUsers.length} people are typing...`
                                : `${typingUsers[0]} is typing...`}
                        </Text>
                    </View>
                )}

                <MessageInput
                    onSend={handleSend}
                    onTyping={handleTyping}
                    replyingTo={replyingTo ? { name: replyingTo.authorName || 'User', content: replyingTo.content } : null}
                    onCancelReply={() => setReplyingTo(null)}
                    editingMessage={editingMessage}
                    onCancelEdit={() => setEditingMessage(null)}
                />
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backBtn: {
        padding: Spacing.xs,
        marginRight: Spacing.xs,
    },
    titleContainer: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        padding: Spacing.sm,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    typingContainer: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xs,
    },
});
