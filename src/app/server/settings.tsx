import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useServers } from '@/context/ServerContext';

export default function ServerSettingsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { serverId } = useLocalSearchParams<{ serverId: string }>();
    const { servers, updateServer, deleteServer, leaveServer } = useServers();

    const server = useMemo(() => servers.find((s) => s.id === serverId), [servers, serverId]);

    const [name, setName] = useState(server?.name || '');
    const [description, setDescription] = useState(server?.description || '');

    // Toggle states
    const [invitesEnabled, setInvitesEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [explicitFilter, setExplicitFilter] = useState(true);

    if (!server) {
        return (
            <ScreenWrapper>
                <View style={[styles.center, { flex: 1 }]}>
                    <Text variant="subtitle1" color={colors.textSecondary}>Server not found</Text>
                </View>
            </ScreenWrapper>
        );
    }

    const handleSave = () => {
        updateServer(serverId!, { name: name.trim(), description: description.trim() });
        Alert.alert('Saved', 'Server settings updated.');
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Server',
            'This action cannot be undone. All channels and data will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        if (deleteServer) deleteServer(serverId!);
                        router.push('/(tabs)/home');
                    },
                },
            ]
        );
    };

    const SettingRow = ({ icon, title, subtitle, right, onPress }: any) => (
        <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.6 : 1}
        >
            <View style={[styles.settingIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text variant="subtitle2">{title}</Text>
                {subtitle && (
                    <Text variant="caption" color={colors.textSecondary}>{subtitle}</Text>
                )}
            </View>
            {right || <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={{ flex: 1 }}>Server Settings</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text variant="button" color={colors.primary}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Server Identity */}
                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary}
                        style={{ fontWeight: '700', letterSpacing: 0.6, marginBottom: Spacing.md }}>
                        SERVER IDENTITY
                    </Text>

                    <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
                        <TouchableOpacity style={[styles.avatarPicker, { borderColor: colors.border }]}>
                            {server.icon ? (
                                <Avatar size="lg" uri={server.icon} fallback={server.name} />
                            ) : (
                                <>
                                    <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                                    <Text variant="caption" color={colors.textSecondary}>Change</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Input label="SERVER NAME" value={name} onChangeText={setName} />
                    <Input
                        label="DESCRIPTION"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="What's this server about?"
                        multiline
                    />
                </View>

                {/* Management */}
                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary}
                        style={{ fontWeight: '700', letterSpacing: 0.6, marginBottom: Spacing.md }}>
                        MANAGEMENT
                    </Text>

                    <SettingRow
                        icon="people-outline"
                        title="Members"
                        subtitle={`${server.memberCount || 0} members`}
                        onPress={() => router.push({ pathname: '/server/members', params: { serverId } })}
                    />
                    <SettingRow
                        icon="shield-outline"
                        title="Roles"
                        subtitle="Manage roles and permissions"
                        onPress={() => {}}
                    />
                    <SettingRow
                        icon="list-outline"
                        title="Channels"
                        subtitle={`${server.channelCount || 0} channels`}
                        onPress={() => {}}
                    />
                    <SettingRow
                        icon="document-text-outline"
                        title="Audit Log"
                        subtitle="View server activity"
                        onPress={() => {}}
                    />
                </View>

                {/* Moderation */}
                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary}
                        style={{ fontWeight: '700', letterSpacing: 0.6, marginBottom: Spacing.md }}>
                        MODERATION
                    </Text>

                    <SettingRow
                        icon="link-outline"
                        title="Invites"
                        subtitle="Allow invite links"
                        right={
                            <Switch
                                value={invitesEnabled}
                                onValueChange={setInvitesEnabled}
                                trackColor={{ false: colors.border, true: colors.primary + '66' }}
                                thumbColor={invitesEnabled ? colors.primary : colors.textSecondary}
                            />
                        }
                    />
                    <SettingRow
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Server notification defaults"
                        right={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: colors.border, true: colors.primary + '66' }}
                                thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
                            />
                        }
                    />
                    <SettingRow
                        icon="eye-off-outline"
                        title="Explicit Content Filter"
                        subtitle="Filter inappropriate media"
                        right={
                            <Switch
                                value={explicitFilter}
                                onValueChange={setExplicitFilter}
                                trackColor={{ false: colors.border, true: colors.primary + '66' }}
                                thumbColor={explicitFilter ? colors.primary : colors.textSecondary}
                            />
                        }
                    />
                    <SettingRow
                        icon="ban"
                        title="Bans"
                        subtitle="Manage banned users"
                        onPress={() => {}}
                    />
                </View>

                {/* Danger Zone */}
                <View style={[styles.section, {
                    borderWidth: 1, borderColor: colors.error + '33', borderRadius: 16, marginHorizontal: Spacing.lg
                }]}>
                    <Text variant="caption" color={colors.error}
                        style={{ fontWeight: '700', letterSpacing: 0.6, marginBottom: Spacing.md }}>
                        DANGER ZONE
                    </Text>

                    <TouchableOpacity
                        style={[styles.dangerBtn, { borderColor: colors.error }]}
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                        <Text variant="button" color={colors.error} style={{ marginLeft: Spacing.sm }}>
                            Delete Server
                        </Text>
                    </TouchableOpacity>
                </View>
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
    center: { alignItems: 'center', justifyContent: 'center' },
    section: { padding: Spacing.lg },
    avatarPicker: {
        width: 72, height: 72, borderRadius: 22,
        borderWidth: 2, borderStyle: 'dashed',
        alignItems: 'center', justifyContent: 'center',
    },
    settingRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth,
    },
    settingIcon: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    dangerBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md, borderRadius: 12, borderWidth: 1,
    },
});
