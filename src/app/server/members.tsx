import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, SectionList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useServers } from '@/context/ServerContext';
import ServerService from '@/services/ServerService';
import UserService from '@/services/UserService';
import type { UserProfile } from '@/types';

type MemberWithProfile = UserProfile & { roles: string[] };
type MemberTab = 'all' | 'online' | 'admins';

export default function ServerMembersScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { serverId } = useLocalSearchParams<{ serverId: string }>();
    const { servers } = useServers();

    const server = useMemo(() => servers.find((s) => s.id === serverId), [servers, serverId]);

    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<MemberTab>('all');
    const [members, setMembers] = useState<MemberWithProfile[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(true);

    React.useEffect(() => {
        if (!serverId) return;

        const fetchMembers = async () => {
            setLoadingMembers(true);
            try {
                const serverMembers = await ServerService.getServerMembers(serverId);
                const profiles = await Promise.all(
                    serverMembers.map(async (m) => {
                        const profile = await UserService.getProfile(m.userId);
                        return { ...profile, roles: m.roles } as MemberWithProfile;
                    })
                );
                setMembers(profiles);
            } catch (error) {
                console.error('Error fetching members:', error);
            } finally {
                setLoadingMembers(false);
            }
        };

        fetchMembers();
    }, [serverId]);

    const onlineMembers = useMemo(() => members.filter((u) => u.status === 'online' || u.status === 'idle'), [members]);
    const adminMembers = useMemo(() => members.filter((m) => m.roles?.includes('owner') || m.roles?.includes('admin')), [members]);

    const displayed = useMemo(() => {
        let base = activeTab === 'online' ? onlineMembers :
            activeTab === 'admins' ? adminMembers : members;

        if (search.trim()) {
            const q = search.toLowerCase();
            base = base.filter(
                (u) => u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
            );
        }
        return base;
    }, [activeTab, search, members, onlineMembers, adminMembers]);

    // Group into online / offline sections
    const sections = useMemo(() => {
        const online = displayed.filter((u) => u.status !== 'offline');
        const offline = displayed.filter((u) => u.status === 'offline');
        const result = [];
        if (online.length > 0) result.push({ title: `ONLINE — ${online.length}`, data: online });
        if (offline.length > 0) result.push({ title: `OFFLINE — ${offline.length}`, data: offline });
        return result;
    }, [displayed]);

    const tabs: { key: MemberTab; label: string }[] = [
        { key: 'all', label: `All (${members.length})` },
        { key: 'online', label: `Online (${onlineMembers.length})` },
        { key: 'admins', label: `Admins (${adminMembers.length})` },
    ];

    const handleMemberPress = (member: MemberWithProfile) => {
        router.push({
            pathname: '/modal/user-actions',
            params: { userId: member.id, name: member.displayName, avatar: member.avatar, status: member.status },
        });
    };

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text variant="h3">Members</Text>
                    <Text variant="caption" color={colors.textSecondary}>{server?.name}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="person-add-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                <Ionicons name="search" size={18} color={colors.textSecondary} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search members..."
                    placeholderTextColor={colors.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                {tabs.map((tab) => {
                    const active = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, { backgroundColor: active ? colors.primary : colors.surface }]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Text
                                variant="caption"
                                color={active ? '#000' : colors.textSecondary}
                                style={{ fontWeight: '600' }}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Member List */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderSectionHeader={({ section }) => (
                    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                        <Text variant="caption" color={colors.textSecondary} style={{ fontWeight: '700' }}>
                            {section.title}
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.memberRow}
                        onPress={() => handleMemberPress(item)}
                        activeOpacity={0.6}
                    >
                        <Avatar
                            size="md"
                            uri={item.avatar}
                            fallback={item.displayName}
                            status={item.status as any}
                        />
                        <View style={{ flex: 1, marginLeft: Spacing.md }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text variant="subtitle2">{item.displayName}</Text>
                                {adminMembers.some((a) => a.id === item.id) && (
                                    <View style={[styles.roleBadge, { backgroundColor: colors.primary + '22' }]}>
                                        <Text variant="caption" color={colors.primary} style={{ fontSize: 10, fontWeight: '700' }}>
                                            ADMIN
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text variant="caption" color={colors.textSecondary}>@{item.username}</Text>
                            {item.customStatus && (
                                <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
                                    {item.customStatus}
                                </Text>
                            )}
                        </View>
                        <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
                        <Text variant="subtitle1" color={colors.textSecondary} style={{ marginTop: Spacing.md }}>
                            No members found
                        </Text>
                    </View>
                }
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: { marginRight: Spacing.sm },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: Spacing.lg, marginTop: Spacing.md,
        borderRadius: 14, paddingHorizontal: Spacing.md, height: 42,
    },
    searchInput: {
        flex: 1, marginLeft: Spacing.sm,
        ...Typography.body, fontSize: 15,
    },
    tabRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    tab: {
        paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: 20,
    },
    sectionHeader: {
        paddingVertical: Spacing.sm,
    },
    memberRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    roleBadge: {
        marginLeft: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    },
    empty: {
        alignItems: 'center', justifyContent: 'center',
        paddingTop: 100,
    },
});
