import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import MediaService from '@/services/MediaService';
import * as Haptics from 'expo-haptics';
import { Avatar } from '@/components/ui/Avatar';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys', 'Food'];

export default function AddProductScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user, userProfile } = useAuth();

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: CATEGORIES[0],
        imageUri: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

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
        if (!form.description.trim()) e.description = 'Description is required';
        const price = parseFloat(form.price);
        if (isNaN(price) || price <= 0) e.price = 'Enter a valid price';
        const stock = parseInt(form.stock, 10);
        if (isNaN(stock) || stock < 0) e.stock = 'Enter a valid stock quantity';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        if (!user) return;

        setLoading(true);
        try {
            let imageUrl = '';
            if (form.imageUri) {
                imageUrl = await MediaService.uploadMedia(form.imageUri, `products/${user.uid}/${Date.now()}`);
            }

            await db.collection('products').add({
                sellerId: user.uid,
                sellerName: userProfile?.displayName || '',
                name: form.name.trim(),
                description: form.description.trim(),
                price: parseFloat(form.price),
                stock: parseInt(form.stock, 10),
                category: form.category,
                image: imageUrl,
                rating: 0,
                reviewCount: 0,
                isActive: true,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Product listed successfully!', [
                { text: 'View Inventory', onPress: () => router.replace('/seller/inventory') },
                { text: 'Add Another', onPress: () => setForm({ name: '', description: '', price: '', stock: '', category: CATEGORIES[0], imageUri: '' }) },
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to add product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                    <Text variant="h2" style={{ marginLeft: Spacing.md }}>Add Product</Text>
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
                        {form.imageUri ? (
                            <Avatar size={120} uri={form.imageUri} fallback="P" style={{ borderRadius: 12 }} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera-outline" size={40} color={colors.textSecondary} />
                                <Text variant="bodySmall" color={colors.textSecondary} style={{ marginTop: 8 }}>
                                    Tap to add photo
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Form Fields */}
                    <Input
                        label="PRODUCT NAME"
                        placeholder="e.g. Wireless Noise-Cancelling Headphones"
                        value={form.name}
                        onChangeText={t => updateField('name', t)}
                        error={errors.name}
                    />
                    <Input
                        label="DESCRIPTION"
                        placeholder="Describe your product..."
                        value={form.description}
                        onChangeText={t => updateField('description', t)}
                        multiline
                        numberOfLines={4}
                        error={errors.description}
                        style={{ height: 100, textAlignVertical: 'top' }}
                    />
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Input
                                label="PRICE ($)"
                                placeholder="0.00"
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
                                placeholder="0"
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
                                onPress={() => {
                                    updateField('category', cat);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
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
                        title={loading ? 'Listing Product...' : 'List Product'}
                        onPress={handleSubmit}
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
