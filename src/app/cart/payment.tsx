import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function CheckoutPayment() {
    const { colors } = useTheme();
    const router = useRouter();
    const [selected, setSelected] = useState('card');

    const methods = [
        { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline' },
        { id: 'apple', label: 'Apple Pay', icon: 'logo-apple' },
        { id: 'google', label: 'Google Pay', icon: 'logo-google' },
        { id: 'cash', label: 'Cash on Delivery', icon: 'cash-outline' },
    ];

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3">Payment Method</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text variant="bodyBold" style={{ marginBottom: Spacing.md }}>Select Payment Method</Text>
                {methods.map((item) => (
                    <TouchableOpacity key={item.id} onPress={() => setSelected(item.id)}>
                        <Card style={[styles.methodCard, selected === item.id && { borderColor: colors.primary, borderWidth: 1 }]}>
                            <View style={styles.methodLeft}>
                                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                                <Text variant="body" style={{ marginLeft: Spacing.md }}>{item.label}</Text>
                            </View>
                            <Ionicons 
                                name={selected === item.id ? "radio-button-on" : "radio-button-off"} 
                                size={20} 
                                color={selected === item.id ? colors.primary : colors.textSecondary} 
                            />
                        </Card>
                    </TouchableOpacity>
                ))}

                <Card style={styles.summaryCard}>
                    <Text variant="bodyBold" style={{ marginBottom: Spacing.md }}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text variant="bodySmall" color={colors.textSecondary}>Subtotal</Text>
                        <Text variant="bodySmall">$388.00</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text variant="bodySmall" color={colors.textSecondary}>Delivery</Text>
                        <Text variant="bodySmall">$12.00</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: colors.surface, paddingTop: Spacing.sm }]}>
                        <Text variant="bodyBold">Total</Text>
                        <Text variant="h3" color={colors.primary}>$400.00</Text>
                    </View>
                </Card>
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Place Order" onPress={() => router.push('/cart/success')} />
            </View>
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
    methodCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    methodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryCard: {
        padding: Spacing.lg,
        marginTop: Spacing.xl,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    }
});
