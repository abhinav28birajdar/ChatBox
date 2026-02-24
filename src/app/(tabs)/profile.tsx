import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Share,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useFriends } from '@/context/FriendContext';
import { useServers } from '@/context/ServerContext';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
    const { colors, isDark } = useTheme();
    const { themeMode, setThemeMode } = useApp();
    const router = useRouter();
    const { userProfile, logout } = useAuth();
    const { friends } = useFriends();
    const { servers } = useServers();

    const handleLogout = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out of ChatBox?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        // Navigation is handled centrally by _layout.tsx when auth state clears.
                    }
                },
            ]
        );
    };

    const handleShareProfile = async () => {
        try {
            if (!userProfile) return;
            await Share.share({
                message: `Add me on ChatBox! My username is @${userProfile.username}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const toggleDark = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setThemeMode(isDark ? 'light' : 'dark');
    };

    const MenuItem = ({ icon, title, subtitle, onPress, color = colors.textSecondary, rightContent }: any) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress?.();
            }}
        >
            <View style={[styles.menuIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.menuText}>
                <Text variant="bodyBold">{title}</Text>
                {subtitle && <Text variant="caption" color={color}>{subtitle}</Text>}
            </View>
            {rightContent || <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
        </TouchableOpacity>
    );

    if (!userProfile) return null;

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.iconBtn, { backgroundColor: colors.surface }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/settings');
                            }}
                        >
                            <Ionicons name="settings-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileInfo}>
                        <View style={styles.avatarWrapper}>
                            <Avatar
                                size={110}
                                uri={userProfile.avatar}
                                fallback={userProfile.displayName}
                                status={userProfile.status as any || 'online'}
                            />
                            <TouchableOpacity
                                style={[styles.editAvatar, { backgroundColor: colors.primary, borderColor: colors.background }]}
                                onPress={() => router.push('/settings/edit-profile')}
                            >
                                <Ionicons name="camera" size={16} color={colors.background} />
                            </TouchableOpacity>
                        </View>

                        <Text variant="h2" style={{ marginTop: Spacing.md }}>
                            {userProfile.displayName}
                        </Text>

                        <View style={styles.usernameRow}>
                            <Text variant="body" color={colors.textSecondary}>
                                @{userProfile.username}
                            </Text>
                            <TouchableOpacity style={{ marginLeft: 6 }} onPress={handleShareProfile}>
                                <Ionicons name="share-outline" size={14} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {userProfile.bio && (
                            <Text variant="bodySmall" color={colors.textSecondary} style={styles.bio}>
                                {userProfile.bio}
                            </Text>
                        )}

                        <View style={styles.badgesRow}>
                            <Badge title="Early Adopter" variant="primary" />
                            <Badge title="Developer" variant="outline" style={{ marginLeft: 6 }} />
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <TouchableOpacity
                            style={styles.stat}
                            onPress={() => router.push('/friends')}
                        >
                            <Text variant="h3">{friends.length}</Text>
                            <Text variant="caption" color={colors.textSecondary}>Friends</Text>
                        </TouchableOpacity>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <TouchableOpacity style={styles.stat} onPress={() => { }}>
                            <Text variant="h3">{servers.length}</Text>
                            <Text variant="caption" color={colors.textSecondary}>Servers</Text>
                        </TouchableOpacity>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.stat}>
                            <Text variant="h3">{userProfile.interests?.length || 0}</Text>
                            <Text variant="caption" color={colors.textSecondary}>Interests</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>ACCOUNT</Text>
                    <Card style={styles.menuCard}>
                        <MenuItem
                            icon="person-outline"
                            title="Edit Profile"
                            subtitle="Update your name, bio and avatar"
                            onPress={() => router.push('/settings/edit-profile')}
                        />
                        <MenuItem
                            icon="mail-outline"
                            title="Email Settings"
                            subtitle={userProfile.email}
                            onPress={() => router.push('/settings/privacy')}
                        />
                        <MenuItem
                            icon="shield-checkmark-outline"
                            title="Security & Privacy"
                            subtitle="2FA, blocked users, visibility"
                            onPress={() => router.push('/settings/security')}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>APPEARANCE</Text>
                    <Card style={styles.menuCard}>
                        <MenuItem
                            icon="moon-outline"
                            title="Dark Mode"
                            subtitle="Toggle between light and dark"
                            onPress={toggleDark}
                            rightContent={
                                <Switch
                                    value={isDark}
                                    onValueChange={toggleDark}
                                    trackColor={{ false: colors.surface, true: colors.primary }}
                                    thumbColor="#fff"
                                />
                            }
                        />
                        <MenuItem
                            icon="color-palette-outline"
                            title="Theme Color"
                            subtitle="Customize accent color"
                            onPress={() => router.push('/settings/theme')}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>OTHERS</Text>
                    <Card style={styles.menuCard}>
                        <MenuItem
                            icon="notifications-outline"
                            title="Notifications"
                            onPress={() => router.push('/settings/notifications')}
                        />
                        <MenuItem
                            icon="help-circle-outline"
                            title="Help & Feedback"
                            onPress={() => router.push('/settings/help')}
                        />
                        <MenuItem
                            icon="information-circle-outline"
                            title="About ChatBox"
                            subtitle="Version, legal, contact"
                            onPress={() => router.push('/legal/about')}
                        />
                    </Card>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text variant="bodyBold" color={colors.error} style={{ marginLeft: Spacing.sm }}>Log Out</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text variant="caption" color={colors.textSecondary}>ChatBox v1.2.4</Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: Spacing.xxl },
    header: {
        padding: Spacing.lg,
        alignItems: 'center',
        paddingBottom: Spacing.xl,
    },
    headerActions: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: Spacing.md,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        alignItems: 'center',
        width: '100%',
    },
    avatarWrapper: {
        position: 'relative',
    },
    editAvatar: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
    },
    usernameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        opacity: 0.8,
    },
    bio: {
        marginTop: Spacing.md,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
        lineHeight: 18,
    },
    badgesRow: {
        flexDirection: 'row',
        marginTop: Spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: Spacing.xl,
        width: '100%',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Spacing.round.lg,
        paddingVertical: Spacing.md,
    },
    stat: { alignItems: 'center' },
    statDivider: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
        opacity: 0.2,
    },
    section: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl
    },
    sectionTitle: {
        fontWeight: '800',
        marginBottom: Spacing.sm,
        marginLeft: 4,
        opacity: 0.6,
    },
    menuCard: {
        padding: 2,
        borderRadius: Spacing.round.lg,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    menuIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        flex: 1,
        marginLeft: Spacing.md
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
        marginTop: Spacing.md,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: Spacing.xl,
        opacity: 0.4,
    },
});
