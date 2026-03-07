import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { userService } from '../../services/userService';
import { FirestoreUser } from '../../types/user';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function UserDetailScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { userId, user: initialUser } = route.params as { userId: string, user?: FirestoreUser };

    const [user, setUser] = useState<FirestoreUser | null>(initialUser || null);
    const [isLoading, setIsLoading] = useState(!initialUser);

    useEffect(() => {
        if (!initialUser) {
            userService.getUser(userId).then(userData => {
                setUser(userData);
                setIsLoading(false);
            }).catch(error => {
                Alert.alert('Error', 'Could not load user profile');
                navigation.goBack();
            });
        }
    }, [userId]);

    const handleAction = (type: string) => {
        Alert.alert(type, `${type} functionality coming soon!`);
    };

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!user) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>User Info</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.profileHeader}>
                    <Avatar uri={user.photoURL} size={120} showPresence isOnline={user.isOnline} />
                    <Text style={[styles.name, { color: colors.text }]}>{user.displayName}</Text>
                    <Text style={[styles.username, { color: colors.textSecondary }]}>@{user.username || 'user'}</Text>

                    <View style={styles.quickActions}>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]} onPress={() => handleAction('Message')}>
                            <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
                            <Text style={[styles.actionLabel, { color: colors.primary }]}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4CAF5015' }]} onPress={() => handleAction('Call')}>
                            <Ionicons name="call-outline" size={24} color="#4CAF50" />
                            <Text style={[styles.actionLabel, { color: '#4CAF50' }]}>Call</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>BIO</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.bioText, { color: colors.text }]}>{user.bio || 'No bio provided'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ABOUT</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.aboutText, { color: colors.text }]}>
                            {user.about || 'No detailed information provided.'}
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.footerItem} onPress={() => handleAction('Block')}>
                        <Ionicons name="ban-outline" size={22} color={colors.error} />
                        <Text style={[styles.footerText, { color: colors.error }]}>Block User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerItem} onPress={() => handleAction('Report')}>
                        <Ionicons name="flag-outline" size={22} color={colors.error} />
                        <Text style={[styles.footerText, { color: colors.error }]}>Report User</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
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
    headerTitle: {
        fontSize: 18,
        fontFamily: Typography.fontFamily.bold,
    },
    backBtn: {
        padding: 4,
    },
    content: {
        paddingHorizontal: 24,
    },
    profileHeader: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 32,
    },
    name: {
        fontSize: 24,
        fontFamily: Typography.fontFamily.bold,
        marginTop: 16,
    },
    username: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.medium,
        marginTop: 2,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 24,
    },
    actionButton: {
        width: 100,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    actionLabel: {
        fontSize: 12,
        fontFamily: Typography.fontFamily.bold,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 10,
        fontFamily: Typography.fontFamily.bold,
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    bioText: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.medium,
    },
    aboutText: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.regular,
        lineHeight: 22,
    },
    footer: {
        marginTop: 10,
        gap: 16,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
    },
    footerText: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.bold,
    },
});
