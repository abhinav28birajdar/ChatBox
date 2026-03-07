import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types/notification';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function NotificationScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const { user } = useAuthStore();

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Real-time listener — cleans up on unmount
    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = notificationService.subscribeToNotifications(
            user.uid,
            (data) => {
                setNotifications(data);
                setIsLoading(false);
                setRefreshing(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // listener will update state automatically; just reset the flag after a brief delay
        setTimeout(() => setRefreshing(false), 800);
    }, []);

    const handleNotificationPress = useCallback(async (notification: NotificationItem) => {
        try {
            if (!notification.isRead && user?.uid) {
                await notificationService.markAsRead(user.uid, notification.id);
            }

            switch (notification.type) {
                case 'message':
                    navigation.navigate(ROUTES.CHAT.DIRECT, {
                        conversationId: notification.data?.conversationId,
                        otherUser: { uid: notification.data?.userId ?? '', displayName: 'User' }
                    });
                    break;
                case 'friend_request':
                    navigation.navigate(ROUTES.MAIN.FRIENDS);
                    break;
                default:
                    break;
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }, [user?.uid, navigation]);

    const handleMarkAllRead = useCallback(async () => {
        if (!user?.uid) return;
        try {
            await notificationService.markAllAsRead(user.uid);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }, [user?.uid]);

    const handleDelete = useCallback(async (notificationId: string) => {
        if (!user?.uid) return;
        try {
            await notificationService.deleteNotification(user.uid, notificationId);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }, [user?.uid]);

    const getIcon = useCallback((type: string) => {
        switch (type) {
            case 'message': return 'chatbubble-outline';
            case 'friend_request': return 'person-add-outline';
            default: return 'notifications-outline';
        }
    }, []);

    const formatDate = useCallback((createdAt: any): string => {
        if (!createdAt) return '';
        // Firebase Timestamp has a .toDate() method
        const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
        return date.toLocaleString();
    }, []);

    const renderItem = useCallback(({ item }: { item: NotificationItem }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                { backgroundColor: item.isRead ? colors.background : colors.surface, borderBottomColor: colors.border }
            ]}
            onPress={() => handleNotificationPress(item)}
            onLongPress={() =>
                Alert.alert('Delete', 'Remove this notification?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.id) }
                ])
            }
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={getIcon(item.type) as any} size={24} color={colors.primary} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.notifTitle, { color: colors.text, fontWeight: item.isRead ? '500' : '800' }]}>{item.title}</Text>
                <Text style={[styles.notifBody, { color: colors.textSecondary }]}>{item.body}</Text>
                <Text style={[styles.notifTime, { color: colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
            </View>
            {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
    ), [colors, handleNotificationPress, handleDelete, getIcon, formatDate]);

    if (isLoading) return <LoadingSpinner fullScreen />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Alerts</Text>
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.clearBtn}>
                    <Text style={[styles.clearText, { color: colors.primary }]}>Mark all as read</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={80} color={colors.textMuted} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet.</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: Typography.fontFamily.bold,
    },
    backBtn: {
        padding: 4,
    },
    clearBtn: {
        padding: 4,
    },
    clearText: {
        fontSize: Typography.fontSize.xs,
        fontFamily: Typography.fontFamily.bold,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 20,
        borderBottomWidth: 0.5,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    notifTitle: {
        fontSize: 15,
        fontFamily: Typography.fontFamily.bold,
    },
    notifBody: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.regular,
        marginTop: 4,
        lineHeight: 18,
    },
    notifTime: {
        fontSize: 10,
        fontFamily: Typography.fontFamily.medium,
        marginTop: 6,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 12,
    },
    listContent: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.medium,
        marginTop: 16,
    },
});
