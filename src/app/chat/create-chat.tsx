import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useFriends } from '@/context/FriendContext';
import { useChat } from '@/context/ChatContext';
import type { UserProfile } from '@/types';

export default function CreateChatScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { friends } = useFriends();
    const { createDM } = useChat();

    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<UserProfile[]>([]);
    const [isGroup, setIsGroup] = useState(false);

    const filteredFriends = useMemo(() => {
        if (!search.trim()) return friends;
        const q = search.toLowerCase();
        return friends.filter(
            (f) => f.displayName.toLowerCase().includes(q) || f.username.toLowerCase().includes(q)
        );
    }, [friends, search]);

    const toggleSelect = (user: UserProfile) => {
        if (isGroup) {
            setSelected((prev) =>
                prev.find((u) => u.uid === user.uid)
                    ? prev.filter((u) => u.uid !== user.uid)
                    : [...prev, user]
            );
        } else {
            handleStartChat(user);
        }
    };

    const handleStartChat = async (user: UserProfile) => {
        const chatId = await createDM([user.uid]);
        if (chatId) {
            router.replace({
                pathname: '/chat/chat-room',
                params: { id: chatId, name: user.displayName },
            });
        }
    };

    const handleCreateGroup = async () => {
        if (selected.length < 2) return;
        try {
            const participantIds = selected.map(u => u.uid);
            const chatId = await createDM(participantIds);
            if (chatId) {
                const groupName = selected.map((u) => u.displayName.split(' ')[0]).join(', ');
                router.replace({
                    pathname: '/chat/chat-room',
                    params: { id: chatId, name: groupName },
                });
            }
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const isSelected = (userId: string) => selected.some((u) => u.uid === userId);

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text variant="button" color={colors.primary}>Cancel</Text>
                    </TouchableOpacity>
                    <Text variant="subtitle1">{isGroup ? 'New Group' : 'New Chat'}</Text>
                    <TouchableOpacity onPress={() => setIsGroup(!isGroup)}>
                        <Ionicons name={isGroup ? 'person' : 'people'} size={22} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                    <Text variant="caption" color={colors.textSecondary}>To:</Text>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Type a name"
                        placeholderTextColor={colors.textSecondary}
                        value={search}
                        onChangeText={setSearch}
                        autoFocus
                    />
                </View>

                {/* Selected users chips */}
                {isGroup && selected.length > 0 && (
                    <View style={styles.selectedRow}>
                        {selected.map((u) => (
                            <TouchableOpacity
                                key={u.id}
                                style={[styles.selectedChip, { backgroundColor: colors.primary + '20' }]}
                                onPress={() => toggleSelect(u)}
                            >
                                <Text variant="caption" color={colors.primary}>{u.displayName.split(' ')[0]}</Text>
                                <Ionicons name="close" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>
                {search ? 'RESULTS' : 'FRIENDS'}
            </Text>

            <FlatList
                data={filteredFriends}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.userItem,
                            isGroup && isSelected(item.uid) && { backgroundColor: colors.primary + '10' },
                        ]}
                        onPress={() => toggleSelect(item)}
                    >
                        <Avatar size="md" uri={item.avatar} fallback={item.displayName} status={item.status as any} />
                        <View style={styles.userInfo}>
                            <Text variant="subtitle2">{item.displayName}</Text>
                            <Text variant="caption" color={colors.textSecondary}>@{item.username}</Text>
                        </View>
                        {isGroup && (
                            <Ionicons
                                name={isSelected(item.uid) ? 'checkmark-circle' : 'ellipse-outline'}
                                size={24}
                                color={isSelected(item.uid) ? colors.primary : colors.textSecondary}
                            />
                        )}
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={10}
                ListEmptyComponent={
                    <EmptyState
                        icon="people-outline"
                        title="No friends found"
                        subtitle={search ? 'Try a different search' : 'Add some friends first'}
                    />
                }
            />

            {isGroup && selected.length >= 2 && (
                <View style={styles.footer}>
                    <Button
                        title={`Create Group (${selected.length})`}
                        onPress={handleCreateGroup}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: Spacing.md },
    titleRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: Spacing.lg,
    },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.md, height: 48, borderRadius: 12,
    },
    input: { flex: 1, marginLeft: Spacing.sm, fontSize: 16 },
    selectedRow: {
        flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm,
    },
    selectedChip: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 16,
    },
    sectionTitle: {
        fontWeight: '800', paddingHorizontal: Spacing.lg,
        marginTop: Spacing.sm, marginBottom: Spacing.sm,
    },
    list: { paddingHorizontal: Spacing.md },
    userItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, paddingHorizontal: Spacing.sm, borderRadius: Spacing.round.md,
    },
    userInfo: { flex: 1, marginLeft: Spacing.md },
    footer: { padding: Spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
});
