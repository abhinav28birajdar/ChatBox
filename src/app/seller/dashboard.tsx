import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';

export default function SellerDashboard() {
    const { colors } = useTheme();
    const router = useRouter();
    const { userProfile } = useAuth();

    // Role guard — redirect non-sellers/non-admins away.
    useEffect(() => {
        if (userProfile && userProfile.role !== 'seller' && userProfile.role !== 'admin') {
            router.replace('/(tabs)/home');
        }
    }, [userProfile]);

    if (!userProfile || (userProfile.role !== 'seller' && userProfile.role !== 'admin')) return null;

    const stats = [
        { label: 'Revenue', value: '$12,840', icon: 'cash-outline', color: '#4ADE80' },
        { label: 'Orders', value: '154', icon: 'cart-outline', color: '#60A5FA' },
        { label: 'Products', value: '42', icon: 'cube-outline', color: colors.primary },
        { label: 'Rating', value: '4.8', icon: 'star-outline', color: '#FACC15' },
    ];

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text variant="h1">Dashboard</Text>
                        <Text variant="body" color={colors.textSecondary}>Welcome back, {userProfile?.displayName}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/settings')}>
                        <Ionicons name="notifications-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <Card key={index} style={styles.statCard}>
                            <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                            <Text variant="h3" style={{ marginTop: Spacing.sm }}>{stat.value}</Text>
                            <Text variant="caption" color={colors.textSecondary}>{stat.label}</Text>
                        </Card>
                    ))}
                </View>

                {/* Quick Actions */}
                <Text variant="h3" style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface }]} onPress={() => router.push('/seller/add-product')}>
                        <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
                        <Text variant="bodySmall" style={{ marginTop: 8 }}>Add Product</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface }]} onPress={() => router.push('/seller/inventory')}>
                        <Ionicons name="list-outline" size={32} color={colors.primary} />
                        <Text variant="bodySmall" style={{ marginTop: 8 }}>Inventory</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.surface }]} onPress={() => router.push('/seller/revenue')}>
                        <Ionicons name="trending-up-outline" size={32} color={colors.primary} />
                        <Text variant="bodySmall" style={{ marginTop: 8 }}>Revenue</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Orders */}
                <Text variant="h3" style={styles.sectionTitle}>Recent Orders</Text>
                {[1, 2, 3].map((order) => (
                    <Card key={order} style={styles.orderCard}>
                        <View style={styles.orderInfo}>
                            <Text variant="bodyBold">Order #1234{order}</Text>
                            <Text variant="caption" color={colors.textSecondary}>2 items • $84.00</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                            <Text variant="caption" color={colors.primary}>Processing</Text>
                        </View>
                    </Card>
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: Spacing.md,
        alignItems: 'center',
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    actionRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    actionBtn: {
        flex: 1,
        height: 100,
        borderRadius: Spacing.round.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    orderInfo: {
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    }
});
