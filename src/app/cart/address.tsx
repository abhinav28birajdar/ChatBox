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

export default function CheckoutAddress() {
    const { colors } = useTheme();
    const router = useRouter();
    const [selected, setSelected] = useState('1');

    const addresses = [
        { id: '1', label: 'Home', address: '123 Main St, Apartment 4B, New York, NY 10001' },
        { id: '2', label: 'Office', address: '456 Business Ave, Suite 200, Brooklyn, NY 11201' },
    ];

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3">Delivery Address</Text>
                <TouchableOpacity><Ionicons name="add" size={24} color={colors.primary} /></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {addresses.map((item) => (
                    <TouchableOpacity key={item.id} onPress={() => setSelected(item.id)}>
                        <Card style={[styles.addressCard, selected === item.id && { borderColor: colors.primary, borderWidth: 1 }]}>
                            <View style={styles.addressLeft}>
                                <Ionicons
                                    name={selected === item.id ? "radio-button-on" : "radio-button-off"}
                                    size={20}
                                    color={selected === item.id ? colors.primary : colors.textSecondary}
                                />
                                <View style={{ marginLeft: Spacing.md }}>
                                    <Text variant="bodyBold">{item.label}</Text>
                                    <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 4 }}>{item.address}</Text>
                                </View>
                            </View>
                            <TouchableOpacity><Ionicons name="create-outline" size={20} color={colors.textSecondary} /></TouchableOpacity>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Continue to Payment" onPress={() => router.push('/cart/payment')} />
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
    addressCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    addressLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    }
});
