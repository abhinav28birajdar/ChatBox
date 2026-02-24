import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { db, auth } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { formatRelativeTime } from '@/utils/helpers';

interface RevenueStats {
    totalRevenue: number;
    monthRevenue: number;
    totalOrders: number;
    pendingPayout: number;
}

interface OrderRecord {
    id: string;
    productName: string;
    amount: number;
    status: string;
    buyerName: string;
    createdAt: any;
}

export default function SellerRevenue() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user, userProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<RevenueStats>({
        totalRevenue: 0,
        monthRevenue: 0,
        totalOrders: 0,
        pendingPayout: 0,
    });
    const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
    const [activeRange, setActiveRange] = useState<'week' | 'month' | 'year'>('month');

    useEffect(() => {
        if (!user) return;

        const unsubscribe = db.collection('orders')
            .where('sellerId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .onSnapshot(snapshot => {
                const orders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as OrderRecord[];

                setRecentOrders(orders);

                // Compute stats from orders
                const total = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
                const now = new Date();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthOrders = orders.filter(o => {
                    const ts = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : new Date(o.createdAt);
                    return ts >= monthStart;
                });
                const monthTotal = monthOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
                const pending = orders
                    .filter(o => o.status === 'completed')
                    .reduce((sum, o) => sum + (o.amount || 0) * 0.9, 0); // 90% after platform fee

                setStats({
                    totalRevenue: total,
                    monthRevenue: monthTotal,
                    totalOrders: orders.length,
                    pendingPayout: pending,
                });
                setLoading(false);
            }, err => {
                console.error('Revenue error:', err);
                setLoading(false);
            });

        return () => unsubscribe();
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#4ADE80';
            case 'processing': return colors.primary;
            case 'cancelled': return '#FF453A';
            default: return colors.textSecondary;
        }
    };

    const StatCard = ({
        label,
        value,
        icon,
        color,
        prefix = '$',
    }: {
        label: string;
        value: number;
        icon: string;
        color: string;
        prefix?: string;
    }) => (
        <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon as any} size={22} color={color} />
            </View>
            <Text variant="h3" style={{ marginTop: Spacing.sm }}>
                {prefix}{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>{label}</Text>
        </Card>
    );

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h2" style={{ marginLeft: Spacing.md }}>Revenue</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {/* Range Tabs */}
                    <View style={styles.rangeRow}>
                        {(['week', 'month', 'year'] as const).map(range => (
                            <TouchableOpacity
                                key={range}
                                style={[
                                    styles.rangeTab,
                                    { backgroundColor: activeRange === range ? colors.primary : colors.surface }
                                ]}
                                onPress={() => setActiveRange(range)}
                            >
                                <Text
                                    variant="bodySmall"
                                    style={{
                                        fontWeight: '700',
                                        color: activeRange === range ? '#000' : colors.textSecondary,
                                        textTransform: 'capitalize',
                                    }}
                                >
                                    {range}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <StatCard label="Total Revenue" value={stats.totalRevenue} icon="cash-outline" color="#4ADE80" />
                        <StatCard label="This Month" value={stats.monthRevenue} icon="calendar-outline" color={colors.primary} />
                        <StatCard label="Pending Payout" value={stats.pendingPayout} icon="wallet-outline" color="#60A5FA" />
                        <StatCard label="Total Orders" value={stats.totalOrders} icon="cart-outline" color="#FACC15" prefix="" />
                    </View>

                    {/* Payout Info */}
                    <Card style={[styles.payoutCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.payoutRow}>
                            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                            <Text variant="bodySmall" color={colors.textSecondary} style={{ marginLeft: Spacing.sm, flex: 1 }}>
                                Payouts are processed weekly on Fridays. Platform fee: 10%.
                            </Text>
                        </View>
                    </Card>

                    {/* Recent Transactions */}
                    <Text variant="h3" style={styles.sectionTitle}>Recent Transactions</Text>

                    {recentOrders.length === 0 ? (
                        <View style={styles.emptyOrders}>
                            <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                            <Text variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.md }}>
                                No transactions yet
                            </Text>
                        </View>
                    ) : (
                        recentOrders.map(order => (
                            <Card key={order.id} style={[styles.orderCard, { backgroundColor: colors.surface }]}>
                                <View style={styles.orderRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text variant="bodyBold" numberOfLines={1}>{order.productName || 'Order'}</Text>
                                        <Text variant="caption" color={colors.textSecondary}>
                                            {order.buyerName || 'Customer'} · {formatRelativeTime(order.createdAt)}
                                        </Text>
                                    </View>
                                    <View style={styles.orderRight}>
                                        <Text variant="bodyBold" color="#4ADE80">
                                            +${(order.amount || 0).toFixed(2)}
                                        </Text>
                                        <View style={[styles.statusPill, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                                            <Text variant="caption" style={{ color: getStatusColor(order.status) }}>
                                                {order.status || 'pending'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </Card>
                        ))
                    )}
                </ScrollView>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    rangeRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    rangeTab: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: Spacing.lg,
        borderRadius: 16,
        alignItems: 'flex-start',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payoutCard: {
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.xl,
    },
    payoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    emptyOrders: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    orderCard: {
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.sm,
    },
    orderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    statusPill: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: 10,
    },
});
