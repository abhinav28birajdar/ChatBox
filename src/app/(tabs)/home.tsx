import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';

import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useServers } from '@/context/ServerContext';
import { useFriends } from '@/context/FriendContext';
import { formatRelativeTime, truncateText } from '@/utils/helpers';
import ChannelList from '@/components/server/ChannelList';
import * as Haptics from 'expo-haptics';

// Memoized Friend Item - defined outside component to preserve memo identity
const FriendItem = React.memo(({ item }: { item: any }) => (
    <TouchableOpacity style={friendItemStyle}>
        <Avatar
            size="md"
            uri={item.avatar}
            fallback={item.displayName}
            status={item.status as any}
        />
        <Text variant="caption" style={friendNameStyle} numberOfLines={1}>
            {item.displayName.split(' ')[0]}
        </Text>
    </TouchableOpacity>
));
FriendItem.displayName = 'FriendItem';

const friendItemStyle = { alignItems: 'center' as const, marginRight: Spacing.lg, width: 60 };
const friendNameStyle = { marginTop: 4 };

// Memoized DM List Item - defined outside component to preserve memo identity
const DMListItem = React.memo(({
    item,
    userProfile,
    friends,
    colors,
    onPress
}: {
    item: any;
    userProfile: any;
    friends: any[];
    colors: any;
    onPress: (id: string) => void;
}) => {
    const otherParticipantId = useMemo(() => item.participants.find((p: string) => p !== userProfile?.uid), [item.participants, userProfile?.uid]);

    const { name, icon } = useMemo(() => {
        let n = item.name;
        let c = item.icon;
        if (!item.isGroup && otherParticipantId) {
            const friend = friends.find((f: any) => f.uid === otherParticipantId);
            if (friend) {
                n = friend.displayName;
                c = friend.avatar;
            }
        }
        return { name: n, icon: c };
    }, [item, otherParticipantId, friends]);

    return (
        <TouchableOpacity
            style={dmItemStyle}
            onPress={() => onPress(item.id)}
        >
            <Avatar size="lg" uri={icon} fallback={name || "User"} />
            <View style={dmInfoStyle}>
                <View style={dmHeaderStyle}>
                    <Text variant="bodyBold" numberOfLines={1} style={dmNameStyle}>{name || "Direct Message"}</Text>
                    <Text variant="caption" color={colors.textSecondary}>
                        {item.lastMessageAt ? formatRelativeTime(item.lastMessageAt) : ''}
                    </Text>
                </View>
                <View style={dmHeaderStyle}>
                    <Text variant="bodySmall" color={colors.textSecondary} numberOfLines={1} style={dmMessageStyle}>
                        {item.lastMessage?.content || "No messages yet"}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});
DMListItem.displayName = 'DMListItem';

const dmItemStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderRadius: Spacing.round.md };
const dmInfoStyle = { flex: 1, marginLeft: Spacing.md };
const dmHeaderStyle = { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 4 };
const dmNameStyle = { flex: 1, marginRight: Spacing.sm };
const dmMessageStyle = { flex: 1 };

export default function HomeScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { userProfile } = useAuth();
    const { dms, loading: chatLoading, setActiveChat, refreshDMs } = useChat();
    const {
        servers,
        channels,
        loading: serverLoading,
        activeServer,
        setActiveServer,
        setActiveChannel
    } = useServers();
    const { friends, loading: friendLoading } = useFriends();

    const [activeView, setActiveView] = useState<'DM' | string>('DM');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await refreshDMs();
        setRefreshing(false);
    };

    const handleServerPress = (serverId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveView(serverId);
        setActiveServer(serverId);
    };

    const handleChannelPress = (channelId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveChannel(channelId);
        router.push({
            pathname: '/chat/chat-room',
            params: {
                id: channelId,
                type: 'channel',
                serverId: activeServer?.id
            }
        });
    };

    const handleDMPress = (dmId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveChat(dmId);
        router.push({
            pathname: '/chat/chat-room',
            params: { id: dmId, type: 'dm' }
        });
    };

    const renderSidebar = () => (
        <View style={[styles.sidebar, { backgroundColor: colors.surface }]}>
            {/* DM Button */}
            <TouchableOpacity
                style={[
                    styles.sidebarIcon,
                    { backgroundColor: activeView === 'DM' ? colors.primary : colors.background }
                ]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveView('DM');
                    setActiveServer(null);
                }}
            >
                <Ionicons
                    name="chatbubble"
                    size={24}
                    color={activeView === 'DM' ? colors.background : colors.primary}
                />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
                {servers.map((server) => {
                    const isActive = activeView === server.id;
                    return (
                        <TouchableOpacity
                            key={server.id}
                            style={[
                                styles.sidebarIcon,
                                { borderRadius: isActive ? 16 : 24, backgroundColor: colors.background }
                            ]}
                            onPress={() => handleServerPress(server.id)}
                        >
                            {server.icon ? (
                                <Avatar uri={server.icon} size={48} fallback={server.name} />
                            ) : (
                                <Text variant="h3" color={colors.primary}>{server.name.charAt(0)}</Text>
                            )}
                            {isActive && (
                                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
                            )}
                        </TouchableOpacity>
                    );
                })}

                <TouchableOpacity
                    style={[styles.addServer, { borderColor: colors.border }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/(modals)/create');
                    }}
                >
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );

    const renderDMView = () => (
        <View style={styles.mainContent}>
            <View style={styles.header}>
                <Text variant="h2">ChatBox</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => router.push('/search')}>
                        <Ionicons name="search-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginLeft: Spacing.md }} onPress={() => router.push('/settings')}>
                        <Ionicons name="settings-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Online friends row */}
            {friends.length > 0 && (
                <View style={styles.friendsSection}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>
                        FRIENDS — {friends.length}
                    </Text>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={friends}
                        keyExtractor={(item) => item.uid}
                        renderItem={({ item }) => <FriendItem item={item} />}
                        contentContainerStyle={{ paddingLeft: Spacing.lg }}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                    />
                </View>
            )}

            {/* DM list */}
            <FlatList
                data={dms}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                initialNumToRender={15}
                maxToRenderPerBatch={15}
                windowSize={10}
                removeClippedSubviews={true}
                ListEmptyComponent={
                    !chatLoading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={64} color={colors.surface} />
                            <Text variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.md }}>
                                No active conversations
                            </Text>
                            <Button
                                title="Start Chatting"
                                size="sm"
                                variant="outline"
                                onPress={() => router.push('/search')}
                                style={{ marginTop: Spacing.lg }}
                            />
                        </View>
                    ) : (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: Spacing.xxl }} />
                    )
                }
                renderItem={({ item }) => (
                    <DMListItem
                        item={item}
                        userProfile={userProfile}
                        friends={friends}
                        colors={colors}
                        onPress={handleDMPress}
                    />
                )}
            />
        </View>
    );

    const renderServerView = () => (
        <View style={styles.mainContent}>
            <View style={styles.header}>
                <Text variant="h2" numberOfLines={1} style={{ flex: 1 }}>{activeServer?.name}</Text>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {serverLoading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: Spacing.xxl }} />
            ) : (
                <ChannelList
                    channels={channels}
                    onChannelPress={handleChannelPress}
                />
            )}
        </View>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {renderSidebar()}
                {activeView === 'DM' ? renderDMView() : renderServerView()}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, flexDirection: 'row' },
    sidebar: {
        width: 72,
        alignItems: 'center',
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
    },
    sidebarScroll: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    sidebarIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        position: 'relative',
    },
    activeIndicator: {
        position: 'absolute',
        left: -12,
        width: 4,
        height: 32,
        borderRadius: 2,
    },
    divider: {
        width: 32,
        height: 2,
        borderRadius: 1,
        marginBottom: Spacing.md,
    },
    addServer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderStyle: 'dashed',
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    mainContent: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.sm,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionLabel: {
        fontWeight: '700',
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.lg,
        opacity: 0.6,
    },
    friendsSection: { marginBottom: Spacing.xl },
    friendItem: { alignItems: 'center', marginRight: Spacing.lg, width: 60 },
    chatList: {
        paddingHorizontal: Spacing.md,
        flexGrow: 1,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderRadius: Spacing.round.md,
    },
    chatInfo: { flex: 1, marginLeft: Spacing.md },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
});
