import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { Card } from '@/components/ui/Card';
import { db, auth } from '@/config/firebase';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image: string;
}

export default function SellerInventory() {
    const { colors } = useTheme();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const unsubscribe = db.collection('products')
            .where('sellerId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Product[];
                setProducts(list);
                setLoading(false);
            }, err => {
                console.error('Inventory error:', err);
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }: { item: Product }) => (
        <Card style={styles.productCard}>
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
                <Ionicons name="cube-outline" size={32} color={colors.textSecondary} />
            </View>
            <View style={styles.productDetails}>
                <Text variant="bodyBold">{item.name}</Text>
                <Text variant="caption" color={colors.textSecondary}>{item.category}</Text>
                <View style={styles.priceRow}>
                    <Text variant="bodyBold" color={colors.primary}>${item.price}</Text>
                    <Text variant="caption" color={item.stock > 10 ? '#4ADE80' : '#F87171'}>
                        {item.stock} in stock
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => router.push(`/seller/edit-product?id=${item.id}`)}>
                <Ionicons name="pencil-outline" size={20} color={colors.text} />
            </TouchableOpacity>
        </Card>
    );

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h2" style={{ marginLeft: Spacing.md }}>Inventory</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => router.push('/seller/add-product')}>
                    <Ionicons name="add-circle" size={32} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : products.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
                    <Text variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.md }}>
                        No products found
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
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
    productCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productDetails: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        marginRight: Spacing.md,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
