import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useNotifications } from '@/context/NotificationContext';
import { formatRelativeTime } from '@/utils/helpers';
import * as Haptics from 'expo-haptics';
import { AppNotification } from '@/types';

// ─── Helpers (defined at module level so React.memo is effective) ──────────────

function getNotificationIcon(type: string): string {
    switch (type) {
        case 'friend_request': return 'person-add';
        case 'message': return 'chatbubble';
        case 'server_invite': return 'people';
        case 'mention': return 'at';
        case 'system': return 'information-circle';
        default: return 'notifications';
    }
}

// ─── NotificationItem (module-level so React.memo compares identity correctly) ─

const NotificationItem = React.memo(({
    item,
    colors,
    onPress
}: {
    item: AppNotification;
    colors: any;
    onPress: (notification: AppNotification) => void;
}) => (
    <TouchableOpacity
        style={[
            styles.notificationCard,
            {
                backgroundColor: item.isRead ? colors.background : colors.surface,
                borderLeftColor: item.isRead ? 'transparent' : colors.primary,
            }
        ]}
        onPress={() => onPress(item)}
    >
        <View style={styles.notificationLeft}>
            {item.data?.senderAvatar ? (
                <Avatar
                    size={48}
                    uri={item.data.senderAvatar}
                    fallback={item.data.senderName || 'U'}
                />
            ) : (
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons
                        name={getNotificationIcon(item.type) as any}
                        size={24}
                        color={colors.primary}
                    />
                </View>
            )}

            <View style={styles.notificationContent}>
                <Text variant="bodyBold" numberOfLines={1}>
                    {item.title}
                </Text>
                <Text variant="bodySmall" color={colors.textSecondary} numberOfLines={2}>
                    {item.body}
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
                    {formatRelativeTime(item.createdAt)}
                </Text>
            </View>
        </View>

        {!item.isRead && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
    </TouchableOpacity>
));
NotificationItem.displayName = 'NotificationItem';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleNotificationPress = useCallback(async (notification: AppNotification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        switch (notification.type) {
            case 'friend_request':
                router.push('/friends');
                break;
            case 'message':
                if (notification.data?.chatId) {
                    router.push({
                        pathname: '/chat/chat-room',
                        params: {
                            id: notification.data.chatId,
                            type: notification.data.serverId ? 'channel' : 'dm',
                            serverId: notification.data.serverId
                        }
                    });
                }
                break;
            case 'server_invite':
                if (notification.data?.serverId) {
                    router.push('/(tabs)/explore');
                }
                break;
            case 'mention':
                if (notification.data?.chatId) {
                    router.push({
                        pathname: '/chat/chat-room',
                        params: {
                            id: notification.data.chatId,
                            type: 'channel',
                            serverId: notification.data.serverId
                        }
                    });
                }
                break;
        }
    }, [markAsRead, router]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        // Real-time subscription auto-updates; just reset the refreshing indicator.
        setTimeout(() => setRefreshing(false), 600);
    }, []);

    const renderItem = useCallback(({ item }: { item: AppNotification }) => (
        <NotificationItem
            item={item}
            colors={colors}
            onPress={handleNotificationPress}
        />
    ), [colors, handleNotificationPress]);

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View>
                    <Text variant="h2">Notifications</Text>
                    {unreadCount > 0 && (
                        <Text variant="caption" color={colors.textSecondary}>
                            {unreadCount} unread
                        </Text>
                    )}
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Text variant="bodySmall" color={colors.primary} style={{ fontWeight: '600' }}>
                            Mark all read
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <Text variant="body" color={colors.textSecondary}>
                        Loading notifications...
                    </Text>
                </View>
            ) : notifications.length === 0 ? (
                <EmptyState
                    icon="notifications-outline"
                    title="No notifications"
                    subtitle="You're all caught up!"
                />
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                    windowSize={10}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingBottom: Spacing.xxl,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
        borderRadius: Spacing.round.lg,
        borderLeftWidth: 3,
    },
    notificationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationContent: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: Spacing.sm,
    },
});

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleNotificationPress = async (notification: AppNotification) => {
        // Mark as read
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Navigate based on type
        switch (notification.type) {
            case 'friend_request':
                router.push('/friends');
                break;
            case 'message':
                if (notification.data?.chatId) {
                    router.push({
                        pathname: '/chat/chat-room',
                        params: {
                            id: notification.data.chatId,
                            type: notification.data.serverId ? 'channel' : 'dm',
                            serverId: notification.data.serverId
                        }
                    });
                }
                break;
            case 'server_invite':
                if (notification.data?.serverId) {
                    // Navigate to server join modal or similar
                    // router.push(`/server/${notification.data.serverId}`);
                }
                break;
            case 'mention':
                if (notification.data?.chatId) {
                    router.push({
                        pathname: '/chat/chat-room',
                        params: {
                            id: notification.data.chatId,
                            type: 'channel',
                            serverId: notification.data.serverId
                        }
                    });
                }
                break;
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        // Context handles subscription, but we can simulate refresh or re-fetch if needed.
        // For real-time, it's auto-updated.
        setTimeout(() => setRefreshing(false), 1000);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'friend_request': return 'person-add';
            case 'message': return 'chatbubble';
            case 'server_invite': return 'people';
            case 'mention': return 'at';
            case 'system': return 'information-circle';
            default: return 'notifications';
        }
    };

    const NotificationItem = React.memo(({
        item,
        colors,
        onPress
    }: {
        item: AppNotification;
        colors: any;
        onPress: (notification: AppNotification) => void;
    }) => (
        <TouchableOpacity
            style={[
                styles.notificationCard,
                {
                    backgroundColor: item.isRead ? colors.background : colors.surface,
                    borderLeftColor: item.isRead ? 'transparent' : colors.primary,
                }
            ]}
            onPress={() => onPress(item)}
        >
            <View style={styles.notificationLeft}>
                {item.data?.senderAvatar ? (
                    <Avatar
                        size={48}
                        uri={item.data.senderAvatar}
                        fallback={item.data.senderName || 'U'}
                    />
                ) : (
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons
                            name={getNotificationIcon(item.type) as any}
                            size={24}
                            color={colors.primary}
                        />
                    </View>
                )}

                <View style={styles.notificationContent}>
                    <Text variant="bodyBold" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text variant="bodySmall" color={colors.textSecondary} numberOfLines={2}>
                        {item.body}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
                        {formatRelativeTime(item.createdAt)}
                    </Text>
                </View>
            </View>

            {!item.isRead && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
        </TouchableOpacity>
    ));
    NotificationItem.displayName = 'NotificationItem';

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View>
                    <Text variant="h2">Notifications</Text>
                    {unreadCount > 0 && (
                        <Text variant="caption" color={colors.textSecondary}>
                            {unreadCount} unread
                        </Text>
                    )}
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Text variant="bodySmall" color={colors.primary} style={{ fontWeight: '600' }}>
                            Mark all read
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <Text variant="body" color={colors.textSecondary}>
                        Loading notifications...
                    </Text>
                </View>
            ) : notifications.length === 0 ? (
                <EmptyState
                    icon="notifications-outline"
                    title="No notifications"
                    subtitle="You're all caught up!"
                />
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={({ item }) => (
                        <NotificationItem
                            item={item}
                            colors={colors}
                            onPress={handleNotificationPress}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                    windowSize={10}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingBottom: Spacing.xxl,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
        borderRadius: Spacing.round.lg,
        borderLeftWidth: 3,
    },
    notificationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationContent: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: Spacing.sm,
    },
});
