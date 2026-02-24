import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import * as Haptics from 'expo-haptics';

export default function NotificationsSettingsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { userProfile, user } = useAuth();

    // Notification settings state
    const [mentions, setMentions] = useState(true);
    const [directMessages, setDirectMessages] = useState(true);
    const [friendRequests, setFriendRequests] = useState(true);
    const [serverInvites, setServerInvites] = useState(true);
    const [newFollowers, setNewFollowers] = useState(true);
    const [systemUpdates, setSystemUpdates] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [pushEnabled, setPushEnabled] = useState(true);

    // Load settings from user profile — hydrate ALL toggles so they match saved prefs.
    useEffect(() => {
        if (userProfile?.settings?.notifications) {
            const n = userProfile.settings.notifications;
            setMentions(n.mentions ?? true);
            setDirectMessages(n.directMessages ?? true);
            setFriendRequests(n.friendRequests ?? true);
            setServerInvites((n as any).serverInvites ?? true);
            setNewFollowers((n as any).newFollowers ?? true);
            setSystemUpdates((n as any).systemUpdates ?? true);
            setSoundEnabled((n as any).soundEnabled ?? true);
            setVibrationEnabled((n as any).vibrationEnabled ?? true);
            setPushEnabled((n as any).pushEnabled ?? true);
        }
    }, [userProfile]);

    const updateNotificationSettings = async (key: string, value: boolean) => {
        if (!user) return;

        try {
            await db.collection('users').doc(user.uid).update({
                [`settings.notifications.${key}`]: value
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
            console.error('Error updating notification settings:', error);
            Alert.alert('Error', 'Failed to update settings');
        }
    };

    const handleToggle = (key: string, currentValue: boolean, setter: (val: boolean) => void) => {
        const newValue = !currentValue;
        setter(newValue);
        updateNotificationSettings(key, newValue);
    };

    const SettingRow = ({
        icon,
        title,
        subtitle,
        value,
        onToggle
    }: {
        icon: string;
        title: string;
        subtitle?: string;
        value: boolean;
        onToggle: () => void;
    }) => (
        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
                <Ionicons name={icon as any} size={22} color={colors.primary} />
                <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                    <Text variant="bodyBold">{title}</Text>
                    {subtitle && (
                        <Text variant="caption" color={colors.textSecondary}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: colors.surface, true: colors.primary }}
                thumbColor="#fff"
            />
        </View>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3">Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>
                        PUSH NOTIFICATIONS
                    </Text>
                    <Card style={styles.card}>
                        <SettingRow
                            icon="notifications"
                            title="Push Notifications"
                            subtitle="Receive notifications on this device"
                            value={pushEnabled}
                            onToggle={() => handleToggle('pushEnabled', pushEnabled, setPushEnabled)}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>
                        NOTIFICATION TYPES
                    </Text>
                    <Card style={styles.card}>
                        <SettingRow
                            icon="at"
                            title="Mentions"
                            subtitle="When someone mentions you"
                            value={mentions}
                            onToggle={() => handleToggle('mentions', mentions, setMentions)}
                        />
                        <SettingRow
                            icon="chatbubble"
                            title="Direct Messages"
                            subtitle="New messages in your DMs"
                            value={directMessages}
                            onToggle={() => handleToggle('directMessages', directMessages, setDirectMessages)}
                        />
                        <SettingRow
                            icon="person-add"
                            title="Friend Requests"
                            subtitle="New friend requests"
                            value={friendRequests}
                            onToggle={() => handleToggle('friendRequests', friendRequests, setFriendRequests)}
                        />
                        <SettingRow
                            icon="people"
                            title="Server Invites"
                            subtitle="Invitations to join servers"
                            value={serverInvites}
                            onToggle={() => handleToggle('serverInvites', serverInvites, setServerInvites)}
                        />
                        <SettingRow
                            icon="person"
                            title="New Followers"
                            subtitle="When someone follows you"
                            value={newFollowers}
                            onToggle={() => handleToggle('newFollowers', newFollowers, setNewFollowers)}
                        />
                        <SettingRow
                            icon="information-circle"
                            title="System Updates"
                            subtitle="App updates and announcements"
                            value={systemUpdates}
                            onToggle={() => handleToggle('systemUpdates', systemUpdates, setSystemUpdates)}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>
                        NOTIFICATION BEHAVIOR
                    </Text>
                    <Card style={styles.card}>
                        <SettingRow
                            icon="volume-high"
                            title="Sound"
                            subtitle="Play sound for notifications"
                            value={soundEnabled}
                            onToggle={() => handleToggle('soundEnabled', soundEnabled, setSoundEnabled)}
                        />
                        <SettingRow
                            icon="phone-portrait"
                            title="Vibration"
                            subtitle="Vibrate for notifications"
                            value={vibrationEnabled}
                            onToggle={() => handleToggle('vibrationEnabled', vibrationEnabled, setVibrationEnabled)}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>
                        QUIET HOURS
                    </Text>
                    <Card style={styles.card}>
                        <TouchableOpacity style={styles.actionRow}>
                            <View style={styles.settingLeft}>
                                <Ionicons name="moon" size={22} color={colors.primary} />
                                <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                                    <Text variant="bodyBold">Do Not Disturb</Text>
                                    <Text variant="caption" color={colors.textSecondary}>
                                        Set quiet hours schedule
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </Card>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: Spacing.sm, flex: 1 }}>
                        Some notifications may still come through even when disabled, such as security alerts.
                    </Text>
                </View>
            </ScrollView>
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
    scroll: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontWeight: '800',
        marginBottom: Spacing.md,
        opacity: 0.6,
    },
    card: {
        padding: 0,
        borderRadius: Spacing.round.lg,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
    },
    infoBox: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderRadius: Spacing.round.md,
        backgroundColor: 'rgba(100, 100, 255, 0.1)',
        marginTop: Spacing.md,
    },
});
