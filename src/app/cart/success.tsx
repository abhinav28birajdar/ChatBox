import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { Button } from '@/components/ui/Button';

export default function OrderSuccess() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.container}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
                </View>

                <Text variant="h1" style={styles.title}>Order Placed!</Text>
                <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                    Your order #123456 has been successfully placed and is being processed.
                </Text>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Track Order"
                        onPress={() => router.replace('/orders/tracking')}
                        style={{ marginBottom: Spacing.md }}
                    />
                    <Button
                        title="Back to Shopping"
                        variant="secondary"
                        onPress={() => router.replace('/(tabs)/home')}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    iconCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        marginBottom: Spacing.md,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: Spacing.xxl,
    },
    buttonContainer: {
        width: '100%',
    }
});
