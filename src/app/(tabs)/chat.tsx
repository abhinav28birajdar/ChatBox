import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/shared/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useChat } from '@/context/ChatContext';
import { truncateText } from '@/utils/helpers';

type FilterType = 'all' | 'unread' | 'pinned';

type ChatUIItem = import('@/services/DMService').DirectMessage & {
    unread?: number;
    pinned?: boolean;
    avatar?: string;
    time?: string;
};

export default function ChatScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { chats, pinChat } = useChat();

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredChats = useMemo(() => {
        let list = [...chats] as ChatUIItem[];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((c) =>
                (c.name || 'Chat').toLowerCase().includes(q) ||
                (c.lastMessage?.content || '').toLowerCase().includes(q)
            );
        }
        if (filter === 'unread') list = list.filter((c) => (c.unread || 0) > 0);
        if (filter === 'pinned') list = list.filter((c) => c.pinned);
        return list;
    }, [chats, search, filter]);

    const FilterChip = ({ label, value }: { label: string; value: FilterType }) => (
        <TouchableOpacity
            style={[
                styles.chip,
                { backgroundColor: filter === value ? colors.primary : colors.surface },
            ]}
            onPress={() => setFilter(value)}
        >
            <Text variant="caption" color={filter === value ? '#000' : colors.text} style={{ fontWeight: '600' }}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text variant="h2">Messages</Text>
                <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: colors.surface }]}
                    onPress={() => router.push('/chat/create-chat')}
                >
                    <Ionicons name="create-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
                <SearchBar placeholder="Search messages..." value={search} onChangeText={setSearch} />
            </View>

            <View style={styles.filterRow}>
                <FilterChip label="All" value="all" />
                <FilterChip label="Unread" value="unread" />
                <FilterChip label="Pinned" value="pinned" />
            </View>

            <FlatList
                data={filteredChats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.chatItem, item.pinned && { backgroundColor: colors.primary + '08' }]}
                        onPress={() =>
                            router.push({
                                pathname: '/chat/chat-room',
                                params: { id: item.id, name: item.name || 'Chat' },
                            })
                        }
                        onLongPress={() => pinChat(item.id)}
                    >
                        <Avatar size="lg" uri={item.avatar || item.icon} fallback={item.name || 'Chat'} />
                        <View style={styles.content}>
                            <View style={styles.row}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    {item.pinned && (
                                        <Ionicons name="pin" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                                    )}
                                    <Text variant="subtitle2" numberOfLines={1}>{item.name || 'Chat'}</Text>
                                </View>
                                <Text variant="caption" color={colors.textSecondary}>{item.time || 'Now'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text
                                    variant="bodySmall"
                                    color={(item.unread || 0) > 0 ? colors.text : colors.textSecondary}
                                    numberOfLines={1}
                                    style={{ flex: 1, fontWeight: (item.unread || 0) > 0 ? '600' : '400' }}
                                >
                                    {truncateText(item.lastMessage?.content || 'No messages yet', 40)}
                                </Text>
                                {(item.unread || 0) > 0 && <Badge count={item.unread!} size="sm" />}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={10}
                removeClippedSubviews={true}
                ListEmptyComponent={
                    <EmptyState
                        icon="chatbubble-ellipses-outline"
                        title={search ? 'No results' : 'No conversations yet'}
                        subtitle={search ? 'Try a different search' : 'Start a new chat to begin messaging'}
                    />
                }
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    iconBtn: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
    },
    searchRow: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
    filterRow: {
        flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm, gap: Spacing.sm,
    },
    chip: {
        paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: 20,
    },
    list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
    chatItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderRadius: Spacing.round.md,
    },
    content: { flex: 1, marginLeft: Spacing.md },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2,
    },
});
