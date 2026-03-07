import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';
import { Typography } from '../../constants/typography';
import { format, isToday, isYesterday } from 'date-fns';
import { Conversation } from '../../types/message';
import { useAuthStore } from '../../store/authStore';

interface ConversationItemProps {
    conversation: Conversation;
    otherUserName: string;
    otherUserPhoto?: string;
    isOnline?: boolean;
    onPress: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
    conversation,
    otherUserName,
    otherUserPhoto,
    isOnline,
    onPress
}) => {
    const { colors } = useTheme();
    const { user } = useAuthStore();
    const unreadCount = conversation.unreadCount[user?.uid || ''] || 0;

    const lastMessageDate = conversation.lastMessage?.timestamp?.toDate
        ? conversation.lastMessage.timestamp.toDate()
        : new Date(conversation.lastMessage?.timestamp || Date.now());

    const formatChatDate = (date: Date) => {
        if (isToday(date)) {
            return format(date, 'h:mm a');
        } else if (isYesterday(date)) {
            return 'Yesterday';
        } else {
            return format(date, 'MMM d');
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.avatarContainer}>
                <Avatar
                    uri={otherUserPhoto}
                    name={otherUserName}
                    size={64}
                    showPresence={false}
                />
            </View>

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{otherUserName}</Text>
                    {conversation.lastMessage && (
                        <Text style={[styles.time, { color: colors.textMuted }]}>
                            {formatChatDate(lastMessageDate)}
                        </Text>
                    )}
                </View>

                <View style={styles.bottomRow}>
                    <Text
                        style={[
                            styles.lastMessage,
                            { color: unreadCount > 0 ? colors.text : colors.textSecondary },
                            unreadCount > 0 && styles.unreadText
                        ]}
                        numberOfLines={1}
                    >
                        {conversation.lastMessage?.text || 'Start a conversation'}
                    </Text>
                    {unreadCount > 0 && (
                        <View style={[styles.customBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.customBadgeText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    avatarContainer: {
        paddingVertical: 12,
        marginRight: 16,
    },
    content: {
        flex: 1,
        paddingVertical: 16,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 18,
        fontFamily: Typography.fontFamily.bold,
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        fontFamily: Typography.fontFamily.medium,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 15,
        fontFamily: Typography.fontFamily.regular,
        flex: 1,
        marginRight: 16,
    },
    unreadText: {
        fontFamily: Typography.fontFamily.semiBold,
    },
    customBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    customBadgeText: {
        color: '#110D18',
        fontSize: 11,
        fontFamily: Typography.fontFamily.bold,
    },
});
