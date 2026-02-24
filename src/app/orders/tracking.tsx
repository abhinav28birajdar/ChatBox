import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { Card } from '@/components/ui/Card';

export default function OrderTracking() {
    const { colors } = useTheme();
    const router = useRouter();
    const { id: orderId } = useLocalSearchParams<{ id: string }>();

    const steps = [
        { label: 'Order Placed', time: '10:30 AM', completed: true },
        { label: 'Order Confirmed', time: '10:35 AM', completed: true },
        { label: 'Preparing Order', time: '10:45 AM', current: true },
        { label: 'Out for Delivery', time: 'Expected 11:15 AM', upcoming: true },
        { label: 'Delivered', time: 'Expected 11:30 AM', upcoming: true },
    ];

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3">Track Order</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Card style={styles.mapPlaceholder}>
                    <Ionicons name="map-outline" size={48} color={colors.textSecondary} />
                    <Text variant="bodySmall" color={colors.textSecondary}>Live Tracking Map Placeholder</Text>
                </Card>

                <Card style={styles.trackingCard}>
                    <Text variant="h3" style={{ marginBottom: Spacing.lg }}>Order #{orderId ?? '------'}</Text>

                    {steps.map((item, index) => (
                        <View key={index} style={styles.stepRow}>
                            <View style={styles.stepLeft}>
                                <View style={[
                                    styles.dot,
                                    item.completed && { backgroundColor: colors.primary },
                                    item.current && { backgroundColor: colors.primary, borderColor: colors.primary + '40', borderWidth: 4 },
                                    item.upcoming && { backgroundColor: colors.surface }
                                ]} />
                                {index < steps.length - 1 && (
                                    <View style={[
                                        styles.line,
                                        item.completed && { backgroundColor: colors.primary },
                                        !item.completed && { backgroundColor: colors.surface }
                                    ]} />
                                )}
                            </View>
                            <View style={styles.stepInfo}>
                                <Text variant={item.current ? "bodyBold" : "body"}>{item.label}</Text>
                                <Text variant="caption" color={colors.textSecondary}>{item.time}</Text>
                            </View>
                        </View>
                    ))}
                </Card>

                <View style={[styles.driverCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.driverInfo}>
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={24} color={colors.textSecondary} />
                        </View>
                        <View style={{ marginLeft: Spacing.md }}>
                            <Text variant="bodyBold">John Doe</Text>
                            <Text variant="caption" color={colors.textSecondary}>Delivery Partner</Text>
                        </View>
                    </View>
                    <View style={styles.actionIcons}>
                        <TouchableOpacity style={styles.iconBtn}><Ionicons name="call" size={20} color={colors.primary} /></TouchableOpacity>
                        <TouchableOpacity style={[styles.iconBtn, { marginLeft: 12 }]}><Ionicons name="chatbubble" size={20} color={colors.primary} /></TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },
    container: {
        padding: Spacing.md,
    },
    mapPlaceholder: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    trackingCard: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    stepRow: {
        flexDirection: 'row',
        height: 60,
    },
    stepLeft: {
        alignItems: 'center',
        width: 20,
        marginRight: Spacing.lg,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        zIndex: 1,
    },
    line: {
        width: 2,
        height: '100%',
        position: 'absolute',
        top: 6,
    },
    stepInfo: {
        flex: 1,
    },
    driverCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: 16,
        marginTop: Spacing.lg,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIcons: {
        flexDirection: 'row',
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
