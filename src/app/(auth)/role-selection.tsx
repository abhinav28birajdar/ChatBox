import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function RoleSelectionScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { updateUser, userProfile } = useAuth();

    const handleRoleSelect = async (role: 'customer' | 'seller') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await updateUser({ role });
            router.replace('/(tabs)/home');
        } catch (error) {
            console.error('Error selecting role:', error);
        }
    };

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text variant="h1" style={styles.title}>Welcome!</Text>
                    <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                        How would you like to use ChatBox today?
                    </Text>
                </View>

                <View style={styles.cards}>
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: userProfile?.role === 'customer' ? 2 : 0 }]}
                        onPress={() => handleRoleSelect('customer')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="person" size={40} color={colors.primary} />
                        </View>
                        <View style={styles.cardText}>
                            <Text variant="h3">Customer</Text>
                            <Text variant="bodySmall" color={colors.textSecondary}>
                                Browse products, chat with sellers, and manage your orders.
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: userProfile?.role === 'seller' ? 2 : 0 }]}
                        onPress={() => handleRoleSelect('seller')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                            <Ionicons name="storefront" size={40} color={colors.secondary} />
                        </View>
                        <View style={styles.cardText}>
                            <Text variant="h3">Seller</Text>
                            <Text variant="bodySmall" color={colors.textSecondary}>
                                List products, manage inventory, and grow your business.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.xl,
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: Spacing.xxl,
        alignItems: 'center',
    },
    title: {
        marginBottom: Spacing.sm,
    },
    subtitle: {
        textAlign: 'center',
    },
    cards: {
        gap: Spacing.lg,
    },
    card: {
        flexDirection: 'row',
        padding: Spacing.lg,
        borderRadius: Spacing.round.lg,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.lg,
    },
    cardText: {
        flex: 1,
    }
});
