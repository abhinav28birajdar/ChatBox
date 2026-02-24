import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useFriends } from '@/context/FriendContext';
import { useChat } from '@/context/ChatContext';
import { getStatusColor } from '@/utils/helpers';
import type { User, FriendRequest, UserProfile } from '@/types';

import Toast from 'react-native-toast-message';

type Tab = 'all' | 'online' | 'pending' | 'blocked';

export default function FriendsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const {
        friends, pendingRequests: friendRequests, sentRequests, blockedUsers,
        acceptRequest: acceptFriendRequest, declineRequest: declineFriendRequest, declineRequest: cancelSentRequest,
        removeFriend, blockUser, unblockUser, sendRequest: sendFriendRequest,
    } = useFriends();
    const { createDM } = useChat();

    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<Tab>('all');
    const [addUsername, setAddUsername] = useState('');

    const onlineFriends = useMemo(() => friends.filter((f) => f.status !== 'offline'), [friends]);

    const filteredFriends = useMemo(() => {
        let list: UserProfile[] = [];
        switch (tab) {
            case 'online': list = onlineFriends; break;
            case 'blocked': list = blockedUsers.map(id => ({ id, uid: id, email: '', displayName: 'Blocked User', username: id, status: 'offline', createdAt: null, settings: { privacy: { friendRequests: 'everyone', directMessages: 'everyone', serverInvites: 'everyone' }, notifications: { mentions: true, directMessages: true, friendRequests: true } } } as UserProfile)); break;
            default: list = friends; break;
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (u) => u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
            );
        }
        return list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    }, [friends, onlineFriends, blockedUsers, tab, search]);

    const handleMessage = async (user: UserProfile) => {
        const chatId = await createDM([user.id]);
        if (chatId) {
            router.push({ pathname: '/chat/chat-room', params: { id: chatId, name: user.displayName } });
        }
    };

    const handleRemove = (user: UserProfile) => {
        Alert.alert('Remove Friend', `Remove ${user.displayName} from friends?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => removeFriend(user.id) },
        ]);
    };

    const TabButton = ({ label, value, count }: { label: string; value: Tab; count?: number }) => (
        <TouchableOpacity
            style={[styles.tab, { backgroundColor: tab === value ? colors.primary : colors.surface }]}
            onPress={() => setTab(value)}
        >
            <Text variant="caption" color={tab === value ? '#000' : colors.text} style={{ fontWeight: '600' }}>
                {label}
            </Text>
            {count !== undefined && count > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: tab === value ? '#000' : colors.error }]}>
                    <Text variant="caption" color={tab === value ? colors.primary : '#fff'} style={{ fontSize: 10, fontWeight: '700' }}>
                        {count}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderPendingSection = () => (
        <View style={styles.pendingSection}>
            {/* Incoming */}
            {friendRequests.length > 0 && (
                <>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>
                        INCOMING — {friendRequests.length}
                    </Text>
                    {friendRequests.map((req) => (
                        <View key={req.id} style={styles.requestItem}>
                            <Avatar size="md" uri={req.senderAvatar} fallback={req.senderName} />
                            <View style={styles.requestInfo}>
                                <Text variant="subtitle2">{req.senderName}</Text>
                                <Text variant="caption" color={colors.textSecondary}>@{req.userId}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.requestBtn, { backgroundColor: colors.primary }]}
                                onPress={() => acceptFriendRequest(req.id)}
                            >
                                <Ionicons name="checkmark" size={18} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.requestBtn, { backgroundColor: colors.surface }]}
                                onPress={() => declineFriendRequest(req.id)}
                            >
                                <Ionicons name="close" size={18} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </>
            )}

            {/* Outgoing */}
            {sentRequests.length > 0 && (
                <>
                    <Text variant="caption" color={colors.textSecondary} style={[styles.sectionLabel, { marginTop: Spacing.md }]}>
                        SENT — {sentRequests.length}
                    </Text>
                    {sentRequests.map((req) => (
                        <View key={req.id} style={styles.requestItem}>
                            <Avatar size="md" uri={req.receiverAvatar} fallback={req.receiverName} />
                            <View style={styles.requestInfo}>
                                <Text variant="subtitle2">{req.receiverName || 'User'}</Text>
                                <Text variant="caption" color={colors.textSecondary}>Pending</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.requestBtn, { backgroundColor: colors.surface }]}
                                onPress={() => cancelSentRequest(req.id)}
                            >
                                <Text variant="caption" color={colors.error}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </>
            )}

            {friendRequests.length === 0 && sentRequests.length === 0 && (
                <EmptyState icon="people-outline" title="No pending requests" subtitle="All caught up!" />
            )}
        </View>
    );

    const renderFriend = (item: UserProfile) => {
        const showLetter = filteredFriends.indexOf(item) === 0 ||
            filteredFriends[filteredFriends.indexOf(item) - 1]?.displayName.charAt(0).toUpperCase() !== item.displayName.charAt(0).toUpperCase();

        return (
            <View>
                {showLetter && tab !== 'blocked' && (
                    <Text variant="subtitle2" color={colors.textSecondary} style={styles.letterSection}>
                        {item.displayName.charAt(0).toUpperCase()}
                    </Text>
                )}
                <TouchableOpacity
                    style={styles.friendItem}
                    onPress={() => tab === 'blocked' ? undefined : handleMessage(item)}
                    onLongPress={() => tab === 'blocked' ? unblockUser(item.id) : handleRemove(item)}
                >
                    <Avatar size="md" uri={item.avatar} fallback={item.displayName} status={tab !== 'blocked' ? item.status as any : undefined} />
                    <View style={styles.friendInfo}>
                        <Text variant="subtitle2">{item.displayName}</Text>
                        <Text variant="caption" color={tab === 'blocked' ? colors.error : colors.textSecondary}>
                            {tab === 'blocked' ? 'Blocked' : item.customStatus || item.status}
                        </Text>
                    </View>
                    {tab !== 'blocked' ? (
                        <TouchableOpacity onPress={() => handleMessage(item)}>
                            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => unblockUser(item.id)}>
                            <Text variant="caption" color={colors.primary}>Unblock</Text>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text variant="h3" style={{ marginLeft: Spacing.md }}>Friends</Text>
                </View>
            </View>

            {/* Add friend bar */}
            <View style={[styles.addBar, { backgroundColor: colors.surface }]}>
                <TextInput
                    style={[styles.addInput, { color: colors.text }]}
                    placeholder="Add friend by username..."
                    placeholderTextColor={colors.textSecondary}
                    value={addUsername}
                    onChangeText={setAddUsername}
                />
                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: addUsername.trim() ? colors.primary : colors.border }]}
                    onPress={async () => {
                        if (addUsername.trim()) {
                            try {
                                await sendFriendRequest(addUsername.trim());
                                setAddUsername('');
                                Toast.show({ type: 'success', text1: 'Request sent successfully!' });
                            } catch (e: any) {
                                Toast.show({ type: 'error', text1: e.message || 'Failed to send request' });
                            }
                        }
                    }}
                >
                    <Text variant="caption" color={addUsername.trim() ? '#000' : colors.textSecondary} style={{ fontWeight: '700' }}>
                        Send
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                <TabButton label="All" value="all" count={friends.length} />
                <TabButton label="Online" value="online" count={onlineFriends.length} />
                <TabButton label="Pending" value="pending" count={friendRequests.length} />
                <TabButton label="Blocked" value="blocked" />
            </View>

            {/* Search */}
            {tab !== 'pending' && (
                <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search friends..."
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            )}

            {tab === 'pending' ? (
                renderPendingSection()
            ) : (
                <FlatList
                    data={filteredFriends}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => renderFriend(item)}
                    contentContainerStyle={styles.list}
                    initialNumToRender={15}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    removeClippedSubviews={true}
                    ListEmptyComponent={
                        <EmptyState
                            icon="people-outline"
                            title={search ? 'No results' : tab === 'blocked' ? 'No blocked users' : 'No friends yet'}
                            subtitle={search ? 'Try a different search' : 'Add friends to get started'}
                        />
                    }
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
    addBar: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg,
        borderRadius: 12, paddingLeft: Spacing.md, height: 44, marginBottom: Spacing.md,
    },
    addInput: { flex: 1, fontSize: 14 },
    addBtn: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: 8, marginRight: 4 },
    tabRow: {
        flexDirection: 'row', paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.sm, gap: Spacing.sm,
    },
    tab: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: 20, gap: 4,
    },
    tabBadge: {
        minWidth: 16, height: 16, borderRadius: 8,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
    },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg,
        paddingHorizontal: Spacing.md, height: 40, borderRadius: 20, marginBottom: Spacing.sm,
    },
    searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: 14 },
    pendingSection: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
    sectionLabel: { fontWeight: '700', marginBottom: Spacing.sm },
    requestItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.sm,
    },
    requestInfo: { flex: 1, marginLeft: Spacing.sm },
    requestBtn: {
        paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: 20,
    },
    list: { paddingBottom: 100 },
    letterSection: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
    friendItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: 12,
    },
    friendInfo: { flex: 1, marginLeft: Spacing.sm },
});
