import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
    label?: string | number;
    variant?: 'primary' | 'error' | 'success' | 'surface';
    size?: 'sm' | 'md';
    style?: ViewStyle;
}

export const Badge = ({ label, variant = 'primary', size = 'md', style }: Props) => {
    const { colors } = useTheme();

    const getBgColor = () => {
        switch (variant) {
            case 'primary': return colors.primary;
            case 'error': return colors.error;
            case 'success': return colors.success;
            case 'surface': return colors.surface;
            default: return colors.primary;
        }
    };

    const getTextColor = () => {
        if (variant === 'primary') return '#000';
        if (variant === 'surface') return colors.text;
        return '#FFF';
    };

    return (
        <View
            style={[
                styles.base,
                { backgroundColor: getBgColor() },
                size === 'sm' ? styles.sm : styles.md,
                style
            ]}
        >
            <Text
                variant="caption"
                color={getTextColor()}
                style={{ fontWeight: '800', fontSize: size === 'sm' ? 10 : 12 }}
            >
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    sm: {
        height: 18,
        minWidth: 18,
    },
    md: {
        height: 24,
        minWidth: 24,
    }
});
