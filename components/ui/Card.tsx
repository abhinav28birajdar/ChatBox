import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/Spacing';

interface Props {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card = ({ children, style, variant = 'flat' }: Props) => {
    const { colors } = useTheme();

    return (
        <View
            style={[
                styles.base,
                { backgroundColor: colors.card },
                variant === 'outlined' && { borderWidth: 1, borderColor: colors.border },
                variant === 'elevated' && styles.elevated,
                style
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        padding: Spacing.md,
        borderRadius: Spacing.round.lg,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    }
});
