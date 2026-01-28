import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function ProfileScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const MenuItem = ({ icon, title, subtitle, onPress, color = colors.textSecondary }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text variant="subtitle2">{title}</Text>
                {subtitle && <Text variant="caption" color={color}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]} onPress={() => router.push('/settings')}>
                            <Ionicons name="settings" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.profileInfo}>
                        <View style={styles.avatarWrapper}>
                            <Avatar size="xl" source="https://i.pravatar.cc/150?u=me" status="online" />
                            <TouchableOpacity style={[styles.editAvatar, { backgroundColor: colors.primary }]}>
                                <Ionicons name="camera" size={16} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <Text variant="h2" style={{ marginTop: 16 }}>Frank Vale <Ionicons name="chevron-down" size={20} /></Text>
                        <Text variant="bodySmall" color={colors.textSecondary}>@frank_dev • Active Now <MaterialCommunityIcons name="content-copy" size={14} /></Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text variant="subtitle2">1.2k</Text>
                            <Text variant="caption" color={colors.textSecondary}>Friends</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.stat}>
                            <Text variant="subtitle2">24</Text>
                            <Text variant="caption" color={colors.textSecondary}>Servers</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.stat}>
                            <Text variant="subtitle2">5y</Text>
                            <Text variant="caption" color={colors.textSecondary}>Member</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>ACCOUNT</Text>
                    <Card style={styles.menuCard}>
                        <MenuItem
                            icon="person-outline"
                            title="Personal Information"
                            subtitle="Edit your name, email, etc."
                            onPress={() => router.push('/settings/edit-profile')}
                        />
                        <MenuItem
                            icon="lock-closed-outline"
                            title="Security"
                            subtitle="Reset password, two-factor"
                            onPress={() => router.push('/settings/security')}
                        />
                        <MenuItem
                            icon="notifications-outline"
                            title="Notifications"
                            subtitle="Manage your alerts"
                            onPress={() => { }}
                        />
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>PREFERENCES</Text>
                    <Card style={styles.menuCard}>
                        <View style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: colors.surface }]}>
                                <Ionicons name="moon-outline" size={22} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text variant="subtitle2">Dark Mode</Text>
                            </View>
                            <Switch value={isDark} />
                        </View>
                        <MenuItem
                            icon="globe-outline"
                            title="Language"
                            subtitle="English (US)"
                            onPress={() => { }}
                        />
                    </Card>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/login')}>
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text variant="button" color={colors.error} style={{ marginLeft: 8 }}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        alignItems: 'center',
    },
    headerActions: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        alignItems: 'center',
        marginTop: 8,
    },
    avatarWrapper: {
        position: 'relative',
    },
    editAvatar: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#120C17',
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 32,
        width: '100%',
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontWeight: '800',
        marginBottom: 8,
        marginLeft: 4,
    },
    menuCard: {
        padding: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    }
});
