import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { Button } from '@/components/ui/Button';
import firestore from '@react-native-firebase/firestore';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    rating?: number;
    reviewCount?: number;
    category?: string;
    stock?: number;
    sellerId?: string;
}

export default function ProductDetailScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('No product ID provided');
            setLoading(false);
            return;
        }

        const unsubscribe = firestore()
            .collection('products')
            .doc(id)
            .onSnapshot(
                (snap) => {
                    if (snap.exists) {
                        setProduct({ id: snap.id, ...snap.data() } as Product);
                    } else {
                        setError('Product not found');
                    }
                    setLoading(false);
                },
                (err) => {
                    console.error('Product fetch error:', err);
                    setError('Failed to load product');
                    setLoading(false);
                }
            );

        return unsubscribe;
    }, [id]);

    if (loading) {
        return (
            <ScreenWrapper style={{ backgroundColor: colors.background }}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    if (error || !product) {
        return (
            <ScreenWrapper style={{ backgroundColor: colors.background }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
                    <Text variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.md }}>
                        {error ?? 'Product not available'}
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionIcon}>
                        <Ionicons name="heart-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon}>
                        <Ionicons name="share-social-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name="image-outline" size={100} color={colors.border} />
                    <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 8 }}>
                        {product.category ?? 'Product'}
                    </Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text variant="h1" style={{ flex: 1, marginRight: Spacing.sm }}>{product.name}</Text>
                        <Text variant="h2" color={colors.primary}>${(product.price ?? 0).toFixed(2)}</Text>
                    </View>

                    {typeof product.rating === 'number' && (
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={16} color="#FACC15" />
                            <Text variant="bodySmall" style={{ marginLeft: 4 }}>
                                {product.rating.toFixed(1)}
                                {typeof product.reviewCount === 'number' ? ` (${product.reviewCount} reviews)` : ''}
                            </Text>
                        </View>
                    )}

                    {typeof product.stock === 'number' && (
                        <Text
                            variant="caption"
                            color={product.stock > 0 ? colors.success : colors.error}
                            style={{ marginBottom: Spacing.md }}
                        >
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Text>
                    )}

                    <Text variant="h3" style={styles.sectionTitle}>Description</Text>
                    <Text variant="body" color={colors.textSecondary} style={styles.description}>
                        {product.description || 'No description available.'}
                    </Text>

                    <View style={styles.specifications}>
                        <View style={[styles.specItem, { backgroundColor: colors.primary + '10' }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                            <Text variant="caption" style={{ marginLeft: 8 }}>Verified Seller</Text>
                        </View>
                        <View style={[styles.specItem, { backgroundColor: colors.primary + '10' }]}>
                            <Ionicons name="refresh-outline" size={20} color={colors.primary} />
                            <Text variant="caption" style={{ marginLeft: 8 }}>Easy Returns</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity style={[styles.cartBtn, { borderColor: colors.primary }]}>
                    <Ionicons name="cart-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Button
                    title="Buy Now"
                    style={styles.buyBtn}
                    onPress={() => router.push('/cart')}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionIcon: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: Spacing.lg,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        marginBottom: Spacing.sm,
    },
    description: {
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },
    specifications: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
    },
    footer: {
        flexDirection: 'row',
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
        borderTopWidth: 1,
        gap: Spacing.md,
    },
    cartBtn: {
        width: 56,
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyBtn: {
        flex: 1,
        height: 56,
    }
});


export default function ProductDetailScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams();

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionIcon}>
                        <Ionicons name="heart-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon}>
                        <Ionicons name="share-social-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name="image-outline" size={100} color={colors.border} />
                    <Text variant="caption" color={colors.textSecondary}>Product Image {id}</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text variant="h1">Premium Gadget Pro</Text>
                        <Text variant="h2" color={colors.primary}>$299.00</Text>
                    </View>

                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color="#FACC15" />
                        <Text variant="bodySmall" style={{ marginLeft: 4 }}>4.8 (124 reviews)</Text>
                    </View>

                    <Text variant="h3" style={styles.sectionTitle}>Description</Text>
                    <Text variant="body" color={colors.textSecondary} style={styles.description}>
                        Experience the state of the art technology in your hands. This premium product is designed for high performance and durability in the 2026 enterprise world.
                    </Text>

                    <View style={styles.specifications}>
                        <View style={styles.specItem}>
                            <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
                            <Text variant="caption" style={{ marginLeft: 8 }}>High Speed</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Ionicons name="battery-charging-outline" size={20} color={colors.primary} />
                            <Text variant="caption" style={{ marginLeft: 8 }}>24h Battery</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <TouchableOpacity style={[styles.cartBtn, { borderColor: colors.primary }]}>
                    <Ionicons name="cart-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Button
                    title="Buy Now"
                    style={styles.buyBtn}
                    onPress={() => router.push('/cart')}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionIcon: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: Spacing.lg,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        marginBottom: Spacing.sm,
    },
    description: {
        lineHeight: 22,
        marginBottom: Spacing.lg,
    },
    specifications: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(212, 255, 0, 0.05)',
        padding: 8,
        borderRadius: 8,
    },
    footer: {
        flexDirection: 'row',
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
        borderTopWidth: 1,
        gap: Spacing.md,
    },
    cartBtn: {
        width: 56,
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyBtn: {
        flex: 1,
        height: 56,
    }
});
