import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { db } from '@/config/firebase';
import { UserProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

type SellerStatus = 'pending' | 'approved' | 'rejected';

interface SellerRequest extends UserProfile {
    sellerStatus: SellerStatus;
    businessName?: string;
    requestedAt?: any;
}

export default function AdminSellers() {
    const { colors } = useTheme();
    const router = useRouter();
    const { userProfile } = useAuth();
    const [sellers, setSellers] = useState<SellerRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<SellerStatus>('pending');

    // Role guard
    useEffect(() => {
        if (userProfile && userProfile.role !== 'admin') {
            router.replace('/(tabs)/home');
        }
    }, [userProfile]);

    useEffect(() => {
        if (!userProfile || userProfile.role !== 'admin') return;

        const unsubscribe = db.collection('users')
            .where('sellerStatus', '==', filter)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as SellerRequest[];
                setSellers(list);
                setLoading(false);
            }, err => {
                console.error('Sellers error:', err);
                setLoading(false);
            });

        return () => unsubscribe();
    }, [filter, userProfile]);

    const handleApprove = async (seller: SellerRequest) => {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await db.collection('users').doc(seller.uid).update({
                role: 'seller',
                sellerStatus: 'approved',
            });
            Alert.alert('Approved', `${seller.displayName} is now a seller.`);
        } catch (err) {
            Alert.alert('Error', 'Failed to approve seller.');
        }
    };

    const handleReject = async (seller: SellerRequest) => {
        Alert.alert(
            'Reject Request',
            `Reject seller application from ${seller.displayName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await db.collection('users').doc(seller.uid).update({
                                sellerStatus: 'rejected',
                            });
                        } catch (err) {
                            Alert.alert('Error', 'Failed to reject seller.');
                        }
                    },
                },
            ]
        );
    };

    if (!userProfile || userProfile.role !== 'admin') return null;

    const renderItem = ({ item }: { item: SellerRequest }) => (
        <Card style={[styles.sellerCard, { backgroundColor: colors.surface }]}>
            <View style={styles.sellerInfo}>
                <Avatar size={48} uri={item.avatar} fallback={item.displayName} />
                <View style={styles.sellerDetails}>
                    <Text variant="bodyBold">{item.displayName}</Text>
                    <Text variant="caption" color={colors.textSecondary}>@{item.username}</Text>
                    {item.businessName && (
                        <Text variant="caption" color={colors.primary}>{item.businessName}</Text>
                    )}
                </View>
            </View>

            {filter === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#4ADE80' }]}
                        onPress={() => handleApprove(item)}
                    >
                        <Ionicons name="checkmark" size={18} color="#000" />
                        <Text variant="bodySmall" style={{ color: '#000', marginLeft: 4, fontWeight: '700' }}>
                            Approve
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#FF453A' }]}
                        onPress={() => handleReject(item)}
                    >
                        <Ionicons name="close" size={18} color="#fff" />
                        <Text variant="bodySmall" style={{ color: '#fff', marginLeft: 4, fontWeight: '700' }}>
                            Reject
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {filter !== 'pending' && (
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: filter === 'approved' ? '#4ADE8020' : '#FF453A20' }
                ]}>
                    <Text variant="caption" color={filter === 'approved' ? '#4ADE80' : '#FF453A'}>
                        {filter === 'approved' ? 'Approved' : 'Rejected'}
                    </Text>
                </View>
            )}
        </Card>
    );

    const FilterTab = ({ status, label }: { status: SellerStatus; label: string }) => (
        <TouchableOpacity
            style={[styles.filterTab, { backgroundColor: filter === status ? colors.primary : colors.surface }]}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(status);
            }}
        >
            <Text
                variant="bodySmall"
                style={{ fontWeight: '700', color: filter === status ? '#000' : colors.textSecondary }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h2" style={{ marginLeft: Spacing.md }}>Seller Approval</Text>
            </View>

            <View style={styles.filterRow}>
                <FilterTab status="pending" label="Pending" />
                <FilterTab status="approved" label="Approved" />
                <FilterTab status="rejected" label="Rejected" />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : sellers.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="business-outline" size={64} color={colors.textSecondary} />
                    <Text variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.md }}>
                        No {filter} seller requests
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sellers}
                    renderItem={renderItem}
                    keyExtractor={item => item.uid || item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
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
        paddingTop: Spacing.xl,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    filterTab: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
    },
    list: {
        padding: Spacing.lg,
        gap: Spacing.sm,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sellerCard: {
        padding: Spacing.md,
        borderRadius: 16,
        marginBottom: Spacing.sm,
    },
    sellerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sellerDetails: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        borderRadius: 10,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: 20,
    },
});
