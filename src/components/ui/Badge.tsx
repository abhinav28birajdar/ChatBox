import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
    label?: string | number;
    title?: string | number; // Alias
    count?: string | number; // Alias
    text?: string | number; // Alias
    variant?: 'primary' | 'error' | 'success' | 'surface' | 'outline';
    size?: 'sm' | 'md' | 'small';
    style?: ViewStyle;
}

export const Badge = ({ label, title, count, text, variant = 'primary', size = 'md', style }: Props) => {
    const { colors } = useTheme();
    const displayLabel = label ?? title ?? count ?? text;
    const resolvedSize = size === 'small' ? 'sm' : size;

    const getBgColor = () => {
        switch (variant) {
            case 'primary': return colors.primary;
            case 'error': return colors.error;
            case 'success': return colors.success;
            case 'surface': return colors.surface;
            case 'outline': return 'transparent';
            default: return colors.primary;
        }
    };

    const getTextColor = () => {
        if (variant === 'primary') return '#000';
        if (variant === 'surface') return colors.text;
        if (variant === 'outline') return colors.primary;
        return '#FFF';
    };

    return (
        <View
            style={[
                styles.base,
                {
                    backgroundColor: getBgColor(),
                    borderColor: variant === 'outline' ? colors.primary : 'transparent',
                    borderWidth: variant === 'outline' ? 1 : 0,
                },
                resolvedSize === 'sm' ? styles.sm : styles.md,
                style
            ]}
        >
            <Text
                variant="caption"
                color={getTextColor()}
                style={{ fontWeight: '800', fontSize: resolvedSize === 'sm' ? 10 : 12 }}
            >
                {displayLabel}
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
