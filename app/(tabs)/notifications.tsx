import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

const NOTIFICATIONS = [
    { id: '1', type: 'invite', user: 'Sophia', target: 'Unicorn Galaxy', time: '2m', read: false },
    { id: '2', type: 'mention', user: 'Frank', content: 'Hey @you, are you coming?', time: '1h', read: false },
    { id: '3', type: 'friend_request', user: 'Jones', time: '5h', read: true },
    { id: '4', type: 'message', user: 'Abi', content: 'Sent you a photo.', time: 'Yesterday', read: true },
];

export default function NotificationsScreen() {
    const { colors } = useTheme();

    const getIcon = (type: string) => {
        switch (type) {
            case 'invite': return { name: 'mail', color: '#8A4FFF' };
            case 'mention': return { name: 'at', color: '#FFE031' };
            case 'friend_request': return { name: 'person-add', color: '#4ADE80' };
            default: return { name: 'chatbubble', color: colors.textSecondary };
        }
    };

    const getMessage = (notif: typeof NOTIFICATIONS[0]) => {
        switch (notif.type) {
            case 'invite': return `invited you to join ${notif.target}`;
            case 'mention': return `mentioned you: "${notif.content}"`;
            case 'friend_request': return `sent you a friend request`;
            default: return notif.content;
        }
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text variant="h2">Notifications</Text>
                <TouchableOpacity>
                    <Text variant="button" color={colors.primary}>Mark all as read</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={NOTIFICATIONS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const icon = getIcon(item.type);
                    return (
                        <TouchableOpacity
                            style={[
                                styles.item,
                                !item.read && { backgroundColor: 'rgba(255,224,49,0.03)' }
                            ]}
                        >
                            <View style={styles.avatarContainer}>
                                <Avatar size="md" name={item.user} />
                                <View style={[styles.typeBadge, { backgroundColor: icon.color }]}>
                                    <Ionicons name={icon.name as any} size={10} color="#000" />
                                </View>
                            </View>

                            <View style={styles.content}>
                                <Text variant="bodySmall" style={{ lineHeight: 18 }}>
                                    <Text variant="subtitle2" style={{ fontSize: 14 }}>{item.user} </Text>
                                    {getMessage(item)}
                                </Text>
                                <Text variant="caption" color={colors.textSecondary}>{item.time}</Text>
                            </View>

                            {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={styles.list}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    list: {
        paddingVertical: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    typeBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#120C17',
    },
    content: {
        flex: 1,
        marginLeft: 16,
        marginRight: 12,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    }
});
