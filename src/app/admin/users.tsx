import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { Card } from '@/components/ui/Card';
import { db } from '@/config/firebase';
import { UserProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsers() {
    const { colors } = useTheme();
    const router = useRouter();
    const { userProfile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Role guard
    useEffect(() => {
        if (userProfile && userProfile.role !== 'admin') {
            router.replace('/(tabs)/home');
        }
    }, [userProfile]);

    if (!userProfile || userProfile.role !== 'admin') return null;

    useEffect(() => {
        const unsubscribe = db.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as UserProfile[];
                setUsers(list);
                setLoading(false);
            }, err => {
                console.error('Admin users error:', err);
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }: { item: UserProfile }) => (
        <Card style={styles.userCard}>
            <View style={styles.userInfo}>
                {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person" size={20} color={colors.textSecondary} />
                    </View>
                )}
                <View style={{ marginLeft: Spacing.md }}>
                    <Text variant="bodyBold">{item.displayName}</Text>
                    <Text variant="caption" color={colors.textSecondary}>@{item.username} • {item.role}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => {/* Handle user actions - block, change role, etc */ }}>
                <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
            </TouchableOpacity>
        </Card>
    );

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h2" style={{ marginLeft: Spacing.md }}>User Management</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={item => item.uid}
                    contentContainerStyle={styles.list}
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    list: {
        padding: Spacing.lg,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
