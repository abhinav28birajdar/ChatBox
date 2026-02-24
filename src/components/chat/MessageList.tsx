import React, { memo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Message } from '@/services/MessageService';
import MessageItem from './MessageItem';
import { Text } from '@/components/ui/Text';
import { Spacing } from '@/constants/Spacing';
import { useAuth } from '@/context/AuthContext';

interface MessageListProps {
    messages: Message[];
    loading?: boolean;
    onLoadMore?: () => void;
    onReact?: (messageId: string, emoji: string) => void;
    onEdit?: (messageId: string) => void;
    onDelete?: (messageId: string) => void;
    onReply?: (messageId: string) => void;
}

const MessageList = memo(({
    messages,
    loading = false,
    onLoadMore,
    onReact,
    onEdit,
    onDelete,
    onReply,
}: MessageListProps) => {
    const { colors } = useTheme();
    const { user } = useAuth();

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        // In inverted FlatList, index 0 is newest. Previous = index+1 (older), next = index-1 (newer)
        const previousMessage = index < messages.length - 1 ? messages[index + 1] : null;
        const nextMessage = index > 0 ? messages[index - 1] : null;

        return (
            <MessageItem
                message={item}
                previousMessage={previousMessage}
                nextMessage={nextMessage}
                isMe={item.authorId === user?.uid}
                onReact={onReact}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
            />
        );
    };

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.empty}>
                <Text variant="body" color={colors.textSecondary}>
                    No messages yet. Start the conversation!
                </Text>
            </View>
        );
    };

    return (
        <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.contentContainer}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            inverted={true}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={20}
        />
    );
});

MessageList.displayName = 'MessageList';

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    footer: {
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
    },
});

export default MessageList;
