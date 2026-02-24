import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Spacing } from '@/constants/Spacing';

export default function LoadingScreen() {
    const { colors } = useTheme();

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text variant="body" color={colors.textSecondary} style={styles.text}>
                    Loading...
                </Text>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: Spacing.lg,
        fontWeight: '500',
    },
});
