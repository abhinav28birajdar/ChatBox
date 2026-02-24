import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import MediaService from '@/services/MediaService';
import * as Haptics from 'expo-haptics';
import { Avatar } from '@/components/ui/Avatar';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys', 'Food'];

export default function EditProductScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: CATEGORIES[0],
        imageUri: '',
        imageUrl: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Load existing product data
    useEffect(() => {
        if (!id) {
            setFetching(false);
            return;
        }
        const unsubscribe = db.collection('products').doc(id).onSnapshot(snap => {
            if (snap.exists) {
                const data = snap.data()!;
                setForm({
                    name: data.name || '',
                    description: data.description || '',
                    price: String(data.price || ''),
                    stock: String(data.stock || ''),
                    category: data.category || CATEGORIES[0],
                    imageUri: '',
                    imageUrl: data.image || '',
                });
            }
            setFetching(false);
        }, err => {
            console.error('Edit product error:', err);
            setFetching(false);
        });
        return () => unsubscribe();
    }, [id]);

    const updateField = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
    };

    const handlePickImage = async () => {
        try {
            const results = await MediaService.pickImageFromGallery(false);
            if (results.length > 0) updateField('imageUri', results[0].uri);
        } catch (err) {
            console.error(err);
        }
    };

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = 'Product name is required';
        const price = parseFloat(form.price);
        if (isNaN(price) || price <= 0) e.price = 'Enter a valid price';
        const stock = parseInt(form.stock, 10);
        if (isNaN(stock) || stock < 0) e.stock = 'Enter a valid stock quantity';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleUpdate = async () => {
        if (!validate()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        if (!user || !id) return;

        setLoading(true);
        try {
            let imageUrl = form.imageUrl;
            if (form.imageUri) {
                imageUrl = await MediaService.uploadMedia(form.imageUri, `products/${user.uid}/${Date.now()}`);
            }

            await db.collection('products').doc(id).update({
                name: form.name.trim(),
                description: form.description.trim(),
                price: parseFloat(form.price),
                stock: parseInt(form.stock, 10),
                category: form.category,
                image: imageUrl,
                updatedAt: new Date(),
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Updated', 'Product updated successfully.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update product.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await db.collection('products').doc(id).delete();
                            router.replace('/seller/inventory');
                        } catch (err: any) {
                            Alert.alert('Error', 'Failed to delete product.');
                        }
                    }
                }
            ]
        );
    };

    if (fetching) {
        return (
            <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text variant="h2" style={{ marginLeft: Spacing.md }}>Edit Product</Text>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={22} color="#FF453A" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Image Picker */}
                    <TouchableOpacity
                        style={[styles.imagePicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={handlePickImage}
                    >
                        {(form.imageUri || form.imageUrl) ? (
                            <Avatar
                                size={120}
                                uri={form.imageUri || form.imageUrl}
                                fallback="P"
                                style={{ borderRadius: 12 }}
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera-outline" size={40} color={colors.textSecondary} />
                                <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 8 }}>
                                    Tap to change photo
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Input
                        label="PRODUCT NAME"
                        value={form.name}
                        onChangeText={t => updateField('name', t)}
                        error={errors.name}
                    />
                    <Input
                        label="DESCRIPTION"
                        value={form.description}
                        onChangeText={t => updateField('description', t)}
                        multiline
                        numberOfLines={4}
                        style={{ height: 100, textAlignVertical: 'top' }}
                    />
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="PRICE ($)"
                                value={form.price}
                                onChangeText={t => updateField('price', t)}
                                keyboardType="decimal-pad"
                                error={errors.price}
                            />
                        </View>
                        <View style={{ width: Spacing.md }} />
                        <View style={{ flex: 1 }}>
                            <Input
                                label="STOCK"
                                value={form.stock}
                                onChangeText={t => updateField('stock', t)}
                                keyboardType="number-pad"
                                error={errors.stock}
                            />
                        </View>
                    </View>

                    {/* Category Selector */}
                    <Text variant="caption" style={styles.fieldLabel}>CATEGORY</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    {
                                        backgroundColor: form.category === cat ? colors.primary : colors.surface,
                                        borderColor: form.category === cat ? colors.primary : colors.border,
                                    }
                                ]}
                                onPress={() => updateField('category', cat)}
                            >
                                <Text
                                    variant="bodySmall"
                                    style={{ color: form.category === cat ? '#000' : colors.text, fontWeight: '600' }}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Button
                        title={loading ? 'Saving...' : 'Save Changes'}
                        onPress={handleUpdate}
                        loading={loading}
                        style={styles.submitBtn}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    scroll: {
        padding: Spacing.lg,
        paddingBottom: 40,
    },
    imagePicker: {
        height: 160,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
    },
    fieldLabel: {
        fontWeight: '800',
        opacity: 0.6,
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
    },
    categories: {
        marginBottom: Spacing.xl,
    },
    categoryChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: Spacing.sm,
    },
    submitBtn: {
        marginTop: Spacing.xl,
        height: 56,
    },
});
