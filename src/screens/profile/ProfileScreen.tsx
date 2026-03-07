import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Switch } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../../components/common/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

export default function ProfileScreen() {
    const { colors, isDark } = useTheme();
    const { mode, setMode } = useThemeStore();
    const navigation = useNavigation<any>();
    const { firestoreUser } = useAuthStore();

    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
    };

    const getMembershipDuration = () => {
        if (!firestoreUser?.joinedAt) return 'New Member';
        const date = new Date(firestoreUser.joinedAt.seconds * 1000);
        return formatDistanceToNow(date, { addSuffix: false });
    };

    const toggleTheme = () => {
        setMode(isDark ? 'light' : 'dark');
    };

    if (isLoading) return <LoadingSpinner fullScreen />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MAIN.SETTINGS)} style={styles.settingsIcon}>
                    <Ionicons name="settings" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.profileSection}>
                    <View style={styles.avatarMain}>
                        <Avatar uri={firestoreUser?.photoURL} name={firestoreUser?.displayName || 'U'} size={100} style={styles.avatar} />
                        <TouchableOpacity style={[styles.cameraBadge, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate(ROUTES.MAIN.SETTINGS)}>
                            <Ionicons name="camera" size={16} color="#110D18" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.nameRow}>
                        <Text style={[styles.name, { color: colors.text }]}>
                            {firestoreUser?.displayName || 'User'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={colors.text} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    <Text style={[styles.handleStatus, { color: colors.textSecondary }]}>
                        @{firestoreUser?.username || 'user'} • <Text style={{ color: firestoreUser?.isOnline ? colors.online : colors.textMuted }}>{firestoreUser?.isOnline ? 'Active Now' : 'Offline'}</Text>
                    </Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{firestoreUser?.friends?.length || 0}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Friends</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>0</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Chats</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{getMembershipDuration()}</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Member</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
                    <View style={[styles.cardGroup, { backgroundColor: colors.surface }]}>
                        <TouchableOpacity style={[styles.cardRow, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate(ROUTES.MAIN.SETTINGS)}>
                            <View style={styles.cardIcon}>
                                <Ionicons name="person-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>Personal Information</Text>
                                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Edit your name, email, etc.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.cardRow, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate(ROUTES.MAIN.CHANGE_PASSWORD)}>
                            <View style={styles.cardIcon}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>Security</Text>
                                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Reset password, two-factor</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cardRow}>
                            <View style={styles.cardIcon}>
                                <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>Notifications</Text>
                                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Manage your alerts</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
                    <View style={[styles.cardGroup, { backgroundColor: colors.surface }]}>
                        <View style={styles.cardRow}>
                            <View style={styles.cardIcon}>
                                <Ionicons name="moon-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: colors.text }]}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: colors.border, true: colors.info }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 8,
        borderRadius: 12,
    },
    settingsIcon: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 8,
        borderRadius: 12,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    avatarMain: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        borderWidth: 0,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#110D18',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontFamily: Typography.fontFamily.bold,
    },
    handleStatus: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
        marginTop: 4,
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 32,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontFamily: Typography.fontFamily.bold,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.regular,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.bold,
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    cardGroup: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    cardIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        marginLeft: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.bold,
    },
    cardSubtitle: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.regular,
        marginTop: 2,
    },
});
