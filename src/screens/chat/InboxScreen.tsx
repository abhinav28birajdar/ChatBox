import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { messageService } from '../../services/messageService';
import { Conversation } from '../../types/message';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Avatar } from '../../components/common/Avatar';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

export default function InboxScreen() {
    const { colors, isDark } = useTheme();
    const { user } = useAuthStore();
    const navigation = useNavigation<any>();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = messageService.getConversations(user.uid, (convs) => {
            setConversations(convs);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const renderItem = ({ item }: { item: Conversation }) => {
        // Note: Temporary logic as we need to fetch other user details for conversation item
        // In a full implementation, we'd have a userService or use a lookup.
        return (
            <TouchableOpacity
                style={[styles.item, { borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('DirectMessage', {
                    conversationId: item.id,
                    otherUser: { uid: item.participants.find(p => p !== user?.uid), displayName: 'Chat User', isOnline: false }
                })}
            >
                <Avatar name="User" size={50} />
                <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                        <Text style={[styles.itemName, { color: colors.text }]}>Chat User</Text>
                        <Text style={[styles.itemTime, { color: colors.textMuted }]}>
                            {item.lastMessage?.timestamp ? format(item.lastMessage.timestamp.toDate(), 'HH:mm') : ''}
                        </Text>
                    </View>
                    <Text style={[styles.itemMessage, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.lastMessage?.text || 'No messages yet'}
                    </Text>
                </View>
                {item.unreadCount?.[user!.uid] > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.badgeText}>{item.unreadCount[user!.uid]}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No conversations yet.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 0.5,
        alignItems: 'center',
    },
    itemContent: {
        flex: 1,
        marginLeft: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    itemTime: {
        fontSize: 12,
    },
    itemMessage: {
        fontSize: 14,
    },
    badge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
    },
});
