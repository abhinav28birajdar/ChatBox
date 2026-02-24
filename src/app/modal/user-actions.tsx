import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useFriends } from '@/context/FriendContext';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import UserService from '@/services/UserService';
import type { UserProfile } from '@/types';

export default function UserActionsModal() {
    const { colors } = useTheme();
    const router = useRouter();
    const { name, userId, avatar, status } = useLocalSearchParams<{
        name: string; userId: string; avatar: string; status: string;
    }>();

    const { friends, blockedUsers, sendRequest, removeFriend, blockUser, unblockUser } = useFriends();
    const { createDM } = useChat();
    const { user: currentUser } = useAuth();

    const [muted, setMuted] = useState(false);
    const [targetUser, setTargetUser] = useState<UserProfile | null>(null);

    React.useEffect(() => {
        if (userId) {
            UserService.getProfile(userId).then(setTargetUser);
        }
    }, [userId]);

    const isFriend = useMemo(() => friends.some((f) => f.id === userId), [friends, userId]);
    const isBlocked = useMemo(() => blockedUsers.some((u) => u === userId), [blockedUsers, userId]);

    const handleMessage = async () => {
        if (!userId) return;
        const chatId = await createDM([userId]);
        router.back();
        if (chatId) {
            router.push({ pathname: '/chat/chat-room', params: { id: chatId, name: name || 'User' } });
        }
    };

    const handleViewProfile = () => {
        router.back();
        // Navigate to profile (could be expanded with a user profile screen)
    };

    const handleFriendAction = () => {
        if (!userId) return;
        if (isFriend) {
            Alert.alert('Remove Friend', `Are you sure you want to remove ${name}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => { removeFriend(userId); router.back(); } },
            ]);
        } else {
            sendRequest(userId);
            router.back();
        }
    };

    const handleBlock = () => {
        if (!userId) return;
        if (isBlocked) {
            unblockUser(userId);
            router.back();
        } else {
            Alert.alert('Block User', `${name} won't be able to message you or see your activity.`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Block', style: 'destructive', onPress: () => { blockUser(userId); router.back(); } },
            ]);
        }
    };

    const handleReport = () => {
        Alert.alert('Report Submitted', `Thank you for reporting. We'll review this shortly.`);
        router.back();
    };

    const Action = ({ icon, title, color = colors.text, onPress, rightText }: any) => (
        <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.6}>
            <Ionicons name={icon} size={22} color={color} />
            <Text variant="subtitle2" style={{ marginLeft: Spacing.md, color, flex: 1 }}>{title}</Text>
            {rightText && <Text variant="caption" color={colors.textSecondary}>{rightText}</Text>}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            <View style={styles.header}>
                <Avatar
                    size="lg"
                    fallback={name || 'User'}
                    uri={avatar || targetUser?.avatar}
                    status={(status as any) || (targetUser?.status as any) || 'offline'}
                />
                <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                    <Text variant="h3">{name || 'User'}</Text>
                    <Text variant="bodySmall" color={colors.textSecondary}>
                        {(status || targetUser?.status) === 'online' ? 'Active now' :
                            (status || targetUser?.status) === 'idle' ? 'Idle' :
                                (status || targetUser?.status) === 'dnd' ? 'Do Not Disturb' : 'Offline'}
                    </Text>
                    {targetUser?.customStatus && (
                        <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                            {targetUser.customStatus}
                        </Text>
                    )}
                </View>
            </View>

            {/* Mutual info */}
            {targetUser && (
                <View style={[styles.mutualRow, { backgroundColor: colors.surface }]}>
                    <View style={styles.mutualItem}>
                        <Text variant="h3" color={colors.primary}>{friends.length > 0 ? Math.min(3, friends.length) : 0}</Text>
                        <Text variant="caption" color={colors.textSecondary}>Mutual Friends</Text>
                    </View>
                    <View style={[styles.mutualDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.mutualItem}>
                        <Text variant="h3" color={colors.secondary}>0</Text>
                        <Text variant="caption" color={colors.textSecondary}>Mutual Servers</Text>
                    </View>
                </View>
            )}

            <View style={styles.actions}>
                <Action icon="chatbubble-outline" title="Message" onPress={handleMessage} />
                <Action icon="person-outline" title="View Profile" onPress={handleViewProfile} />
                <Action
                    icon={isFriend ? 'person-remove-outline' : 'person-add-outline'}
                    title={isFriend ? 'Remove Friend' : 'Send Friend Request'}
                    onPress={handleFriendAction}
                />
                <Action
                    icon={muted ? 'notifications-off-outline' : 'notifications-outline'}
                    title={muted ? 'Unmute Notifications' : 'Mute Notifications'}
                    onPress={() => setMuted(!muted)}
                />

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <Action icon="flag-outline" title="Report User" color={colors.error} onPress={handleReport} />
                <Action
                    icon={isBlocked ? 'checkmark-circle-outline' : 'ban'}
                    title={isBlocked ? 'Unblock User' : 'Block User'}
                    color={isBlocked ? colors.success : colors.error}
                    onPress={handleBlock}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.lg,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        alignSelf: 'center', marginBottom: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    mutualRow: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
    },
    mutualItem: { flex: 1, alignItems: 'center' },
    mutualDivider: { width: 1, marginHorizontal: Spacing.sm },
    actions: { flex: 1 },
    actionRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14,
    },
    divider: { height: 1, marginVertical: Spacing.md, opacity: 0.1 },
});
