import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import * as Haptics from 'expo-haptics';

interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
}

export default function CartScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [cartItems, setCartItems] = useState<CartItem[]>([
        { id: '1', name: 'Premium Gadget Pro', price: 299, qty: 1 },
        { id: '2', name: 'Wireless Headphones', price: 89, qty: 2 },
    ]);

    const total = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

    const updateQty = (id: string, delta: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCartItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, qty: Math.max(1, item.qty + delta) }
                    : item
            )
        );
    };

    const removeItem = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert('Remove Item', 'Remove this item from your cart?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => setCartItems(prev => prev.filter(item => item.id !== id)),
            },
        ]);
    };

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3">My Cart</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Card style={styles.itemCard}>
                        <View style={[styles.itemImage, { backgroundColor: colors.surface }]}>
                            <Ionicons name="cube-outline" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.itemInfo}>
                            <Text variant="bodyBold" numberOfLines={2}>{item.name}</Text>
                            <Text variant="bodySmall" color={colors.primary}>${item.price.toFixed(2)}</Text>
                            <View style={styles.qtyRow}>
                                <TouchableOpacity
                                    style={[styles.qtyBtn, { backgroundColor: colors.surface }]}
                                    onPress={() => updateQty(item.id, -1)}
                                >
                                    <Ionicons name="remove" size={16} color={colors.text} />
                                </TouchableOpacity>
                                <Text variant="bodyBold" style={{ marginHorizontal: 12 }}>{item.qty}</Text>
                                <TouchableOpacity
                                    style={[styles.qtyBtn, { backgroundColor: colors.surface }]}
                                    onPress={() => updateQty(item.id, 1)}
                                >
                                    <Ionicons name="add" size={16} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => removeItem(item.id)}>
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </Card>
                )}
                ListEmptyComponent={
                    <EmptyState
                        icon="cart-outline"
                        title="Your cart is empty"
                        subtitle="Browse products and add items to your cart"
                    />
                }
            />

            {cartItems.length > 0 && (
                <View style={[styles.footer, { backgroundColor: colors.surface }]}>
                    <View style={styles.totalRow}>
                        <Text variant="body" color={colors.textSecondary}>
                            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                        </Text>
                        <Text variant="h2">${total.toFixed(2)}</Text>
                    </View>
                    <Button
                        title="Proceed to Checkout"
                        onPress={() => router.push('/cart/address')}
                        style={{ height: 52 }}
                    />
                </View>
            )}
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
    list: {
        padding: Spacing.md,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    itemImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    }
});
