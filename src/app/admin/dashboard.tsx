import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
    const { colors } = useTheme();
    const router = useRouter();
    const { userProfile } = useAuth();

    // Role guard — redirect non-admins away immediately.
    useEffect(() => {
        if (userProfile && userProfile.role !== 'admin') {
            router.replace('/(tabs)/home');
        }
    }, [userProfile]);

    if (!userProfile || userProfile.role !== 'admin') {
        return null;
    }

    const stats = [
        { label: 'Total Users', value: '42,903', icon: 'people-outline', color: '#60A5FA' },
        { label: 'Active Sellers', value: '1,204', icon: 'storefront-outline', color: '#4ADE80' },
        { label: 'Daily Sales', value: '$245,000', icon: 'trending-up-outline', color: colors.primary },
        { label: 'Reports', value: '12', icon: 'flag-outline', color: '#FF453A' },
    ];

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text variant="h1">Admin Console</Text>
                        <Text variant="body" color={colors.textSecondary}>System Overview & Management</Text>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="shield-checkmark-outline" size={28} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <Card key={index} style={[styles.statCard, { backgroundColor: colors.surface }]}>
                            <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                            <Text variant="h2" style={{ marginTop: Spacing.sm }}>{stat.value}</Text>
                            <Text variant="caption" color={colors.textSecondary}>{stat.label}</Text>
                        </Card>
                    ))}
                </View>

                {/* Admin Sections */}
                <Text variant="h3" style={styles.sectionTitle}>Management</Text>

                <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => router.push('/admin/users')}>
                    <Ionicons name="people" size={24} color={colors.primary} />
                    <Text variant="body" style={styles.menuText}>User Management</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={() => router.push('/admin/sellers')}>
                    <Ionicons name="business" size={24} color={colors.primary} />
                    <Text variant="body" style={styles.menuText}>Seller Approval</Text>
                    <View style={styles.badge}><Text variant="captionSmall" color="#000">3 New</Text></View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
                    <Ionicons name="alert-circle" size={24} color={colors.primary} />
                    <Text variant="body" style={styles.menuText}>Content Reports</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
                    <Ionicons name="settings" size={24} color={colors.primary} />
                    <Text variant="body" style={styles.menuText}>Global System Settings</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
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
        padding: Spacing.lg,
        alignItems: 'center',
        borderRadius: 16,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: 12,
        marginBottom: Spacing.sm,
    },
    menuText: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    badge: {
        backgroundColor: '#D4FF00',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: Spacing.sm,
    }
});
