import React, { useMemo, useState, useEffect } from 'react';
import {
    View, StyleSheet, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { ChannelItem } from '@/components/server/ChannelItem';
import { useServers } from '@/context/ServerContext';
import { useAuth } from '@/context/AuthContext';
import ServerService, { Server } from '@/services/ServerService';
import UserService from '@/services/UserService';

export default function ServerDetailScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { serverId } = useLocalSearchParams<{ serverId: string }>();
    const { servers, channels, leaveServer, setActiveServer, setActiveChannel } = useServers();
    const { user } = useAuth();

    const server = useMemo(() => servers.find((s) => s.id === serverId), [servers, serverId]);
    const serverChannels = useMemo(
        () => channels.filter((c) => c.serverId === serverId),
        [channels, serverId]
    );

    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        if (serverId) {
            const fetchMembers = async () => {
                try {
                    const serverMembers = await ServerService.getServerMembers(serverId);
                    const profiles = await Promise.all(
                        serverMembers.slice(0, 15).map(async (m) => {
                            const profile = await UserService.getProfile(m.userId);
                            return { ...profile, roles: m.roles };
                        })
                    );
                    setMembers(profiles);
                } catch (error) {
                    console.error('Error fetching members:', error);
                }
            };
            fetchMembers();
        }
    }, [serverId]);

    const onlineMembers = useMemo(() => members.filter((u) => u.status === 'online' || u.status === 'idle'), [members]);
    const offlineMembers = useMemo(() => members.filter((u) => u.status === 'offline'), [members]);

    if (!server) {
        return (
            <ScreenWrapper>
                <View style={[styles.center, { flex: 1 }]}>
                    <Ionicons name="server-outline" size={48} color={colors.textSecondary} />
                    <Text variant="subtitle1" color={colors.textSecondary} style={{ marginTop: Spacing.md }}>
                        Server not found
                    </Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing.lg }}>
                        <Text variant="button" color={colors.primary}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const toggleCategory = (catId: string) => {
        setCollapsedCategories((prev) => {
            const next = new Set(prev);
            next.has(catId) ? next.delete(catId) : next.add(catId);
            return next;
        });
    };

    const handleChannelPress = (channelId: string) => {
        setActiveServer(serverId!);
        setActiveChannel(channelId);
        router.push('/(tabs)/home');
    };

    const handleLeave = () => {
        Alert.alert('Leave Server', `Are you sure you want to leave ${server.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Leave', style: 'destructive', onPress: () => { leaveServer(serverId!); router.back(); } },
        ]);
    };

    // Group channels by category
    const sections = useMemo(() => {
        const uncategorized = serverChannels;
        return [{ title: 'Channels', catId: 'uncategorized', data: uncategorized }];
    }, [serverChannels]);

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <Text variant="h3" numberOfLines={1}>{server.name}</Text>
                    <Text variant="caption" color={colors.textSecondary}>
                        {server.memberCount?.toLocaleString() || 0} members
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/server/settings', params: { serverId } })}
                    style={styles.iconBtn}
                >
                    <Ionicons name="settings-outline" size={22} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/server/members', params: { serverId } })}
                    style={styles.iconBtn}
                >
                    <Ionicons name="people-outline" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Server Banner / Info */}
            <View style={[styles.banner, { backgroundColor: colors.surface }]}>
                <View style={[styles.serverAvatar, { backgroundColor: colors.primary }]}>
                    {server.icon ? (
                        <Avatar size="lg" uri={server.icon} fallback={server.name} />
                    ) : (
                        <Text variant="h2" color="#000">{server.name.charAt(0)}</Text>
                    )}
                </View>
                {server.description && (
                    <Text variant="bodySmall" color={colors.textSecondary} align="center"
                        style={{ marginTop: Spacing.sm, paddingHorizontal: Spacing.xl }}>
                        {server.description}
                    </Text>
                )}

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <View style={[styles.dot, { backgroundColor: colors.success }]} />
                        <Text variant="caption" color={colors.textSecondary}>
                            {onlineMembers.length} Online
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
                        <Text variant="caption" color={colors.textSecondary}>
                            {server.memberCount?.toLocaleString() || 0} Members
                        </Text>
                    </View>
                </View>
            </View>

            {/* Channel List */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
                {sections.map((section) => {
                    const collapsed = collapsedCategories.has(section.catId);
                    return (
                        <View key={section.catId}>
                            <TouchableOpacity
                                style={styles.categoryHeader}
                                onPress={() => toggleCategory(section.catId)}
                            >
                                <Ionicons
                                    name={collapsed ? 'chevron-forward' : 'chevron-down'}
                                    size={12}
                                    color={colors.textSecondary}
                                />
                                <Text variant="caption" color={colors.textSecondary}
                                    style={{ marginLeft: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                    {section.title}
                                </Text>
                            </TouchableOpacity>

                            {!collapsed && section.data.map((channel) => (
                                <ChannelItem
                                    key={channel.id}
                                    channel={channel as any}
                                    isActive={false}
                                    onPress={() => handleChannelPress(channel.id)}
                                />
                            ))}
                        </View>
                    );
                })}

                {/* Members preview */}
                <View style={styles.membersPreview}>
                    <TouchableOpacity
                        style={styles.sectionHeader}
                        onPress={() => router.push({ pathname: '/server/members', params: { serverId } })}
                    >
                        <Text variant="subtitle1">Members</Text>
                        <Text variant="caption" color={colors.primary}>View All</Text>
                    </TouchableOpacity>

                    <Text variant="caption" color={colors.textSecondary}
                        style={{ fontWeight: '700', marginBottom: Spacing.sm }}>
                        ONLINE — {onlineMembers.length}
                    </Text>
                    {onlineMembers.slice(0, 5).map((m) => (
                        <TouchableOpacity key={m.id} style={styles.memberRow}>
                            <Avatar size="sm" uri={m.avatar} fallback={m.displayName} status={m.status as any} />
                            <Text variant="body" style={{ marginLeft: Spacing.sm, flex: 1 }}>{m.displayName}</Text>
                        </TouchableOpacity>
                    ))}

                    <Text variant="caption" color={colors.textSecondary}
                        style={{ fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.sm }}>
                        OFFLINE — {offlineMembers.length}
                    </Text>
                    {offlineMembers.slice(0, 3).map((m) => (
                        <TouchableOpacity key={m.id} style={[styles.memberRow, { opacity: 0.5 }]}>
                            <Avatar size="sm" uri={m.avatar} fallback={m.displayName} />
                            <Text variant="body" style={{ marginLeft: Spacing.sm, flex: 1 }}>{m.displayName}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Leave Server */}
                <TouchableOpacity
                    style={[styles.leaveBtn, { borderColor: colors.error }]}
                    onPress={handleLeave}
                >
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text variant="button" color={colors.error} style={{ marginLeft: Spacing.sm }}>
                        Leave Server
                    </Text>
                </TouchableOpacity>
            </ScrollView>
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
    iconBtn: { marginLeft: Spacing.md },
    banner: {
        alignItems: 'center', paddingVertical: Spacing.xl,
    },
    serverAvatar: {
        width: 64, height: 64, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
    },
    statsRow: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: Spacing.md, gap: Spacing.lg,
    },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    categoryHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
        marginTop: Spacing.sm,
    },
    membersPreview: {
        paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: Spacing.md,
    },
    memberRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 8,
    },
    center: { alignItems: 'center', justifyContent: 'center' },
    leaveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginHorizontal: Spacing.lg, marginTop: Spacing.xl,
        paddingVertical: Spacing.md, borderRadius: 16, borderWidth: 1,
    },
});
