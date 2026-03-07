import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { Typography } from '../../constants/typography';
import { Avatar } from '../../components/common/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../services/userService';
import { FirestoreUser } from '../../types/user';

export default function HomeScreen() {
    const { colors, isDark } = useTheme();
    const { firestoreUser, user } = useAuthStore();
    const navigation = useNavigation<any>();
    const [activeFriends, setActiveFriends] = useState<FirestoreUser[]>([]);

    useEffect(() => {
        const loadActiveFriends = async () => {
            if (!user?.uid) return;
            try {
                // Fetch friends to show some active status
                const friends = await userService.getFriends(user.uid);
                // Just mock the active status for dashboard UI or use actual isOnline
                setActiveFriends(friends.slice(0, 10));
            } catch (err) {
                // ignore
            }
        };
        loadActiveFriends();
    }, [user?.uid]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const QuickAction = ({ icon, label, onPress }: any) => (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface }]} onPress={onPress}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary }]}>
                <Ionicons name={icon} size={24} color={isDark ? '#000' : '#fff'} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()},</Text>
                    <Text style={[styles.name, { color: colors.text }]}>{firestoreUser?.displayName || 'Welcome'}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MAIN.PROFILE)}>
                    <Avatar uri={firestoreUser?.photoURL} name={firestoreUser?.displayName || 'User'} size={48} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <QuickAction
                        icon="chatbubble-ellipses"
                        label="New Chat"
                        onPress={() => navigation.navigate(ROUTES.MAIN.FRIENDS)}
                    />
                    <QuickAction
                        icon="people"
                        label="Add Friend"
                        onPress={() => navigation.navigate(ROUTES.MAIN.FRIENDS)}
                    />
                    <QuickAction
                        icon="qr-code"
                        label="Scan QR"
                        onPress={() => navigation.navigate(ROUTES.MAIN.QR_CODE)}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Friends</Text>
                    <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MAIN.FRIENDS)}>
                        <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
                    </TouchableOpacity>
                </View>

                {activeFriends.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                        {activeFriends.map((friend) => (
                            <TouchableOpacity
                                key={friend.uid}
                                style={styles.activeFriendCard}
                                onPress={() => navigation.navigate(ROUTES.MAIN.USER_DETAIL, { userId: friend.uid, user: friend })}
                            >
                                <Avatar uri={friend.photoURL} name={friend.displayName} size={64} showPresence isOnline={friend.isOnline || true} />
                                <Text style={[styles.friendName, { color: colors.text }]} numberOfLines={1}>{friend.displayName.split(' ')[0]}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                        <Ionicons name="people-circle-outline" size={48} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active friends right now.</Text>
                        <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate(ROUTES.MAIN.FRIENDS)}>
                            <Text style={[styles.emptyBtnText, { color: isDark ? '#000' : '#fff' }]}>Find Friends</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={[styles.section, { marginBottom: 120 }]}>
                <View style={[styles.banner, { backgroundColor: colors.primary + '20' }]}>
                    <View style={styles.bannerContent}>
                        <Text style={[styles.bannerTitle, { color: colors.text }]}>Complete Your Profile</Text>
                        <Text style={[styles.bannerDescription, { color: colors.textSecondary }]}>Add a bio and profile picture to help friends find you faster.</Text>
                        <TouchableOpacity style={[styles.bannerBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate(ROUTES.MAIN.PROFILE)}>
                            <Text style={[styles.bannerBtnText, { color: isDark ? '#000' : '#fff' }]}>Update Profile</Text>
                        </TouchableOpacity>
                    </View>
                    <Ionicons name="sparkles" size={64} color={colors.primary} style={styles.bannerIcon} />
                </View>
            </View>
        </ScrollView>
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
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
    },
    greeting: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
        marginBottom: 4,
    },
    name: {
        fontSize: 28,
        fontFamily: Typography.fontFamily.bold,
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Typography.fontFamily.bold,
    },
    seeAll: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.bold,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    actionBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 20,
        borderRadius: 24,
        marginHorizontal: 6,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionLabel: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.semiBold,
    },
    horizontalList: {
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    activeFriendCard: {
        alignItems: 'center',
        marginRight: 20,
        width: 72,
    },
    friendName: {
        marginTop: 8,
        fontSize: 13,
        fontFamily: Typography.fontFamily.medium,
        textAlign: 'center',
    },
    emptyCard: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 24,
    },
    emptyText: {
        marginTop: 12,
        marginBottom: 20,
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
    },
    emptyBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    emptyBtnText: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.bold,
    },
    banner: {
        flexDirection: 'row',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        overflow: 'hidden',
    },
    bannerContent: {
        flex: 1,
        zIndex: 1,
    },
    bannerTitle: {
        fontSize: 18,
        fontFamily: Typography.fontFamily.bold,
        marginBottom: 8,
    },
    bannerDescription: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.medium,
        lineHeight: 20,
        marginBottom: 20,
        paddingRight: 20,
    },
    bannerBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    bannerBtnText: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.bold,
    },
    bannerIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        opacity: 0.2,
        zIndex: 0,
    },
});
