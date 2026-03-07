import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    loading?: boolean;
    disabled?: boolean;
    style?: any;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    style
}) => {
    const { colors } = useTheme();

    const getVariantStyle = () => {
        switch (variant) {
            case 'primary':
                return { backgroundColor: colors.primary };
            case 'secondary':
                return { backgroundColor: colors.secondary };
            case 'outline':
                return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary };
            case 'danger':
                return { backgroundColor: colors.error };
            default:
                return { backgroundColor: colors.primary };
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'outline':
                return { color: colors.primary };
            default:
                return { color: '#FFFFFF' };
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                getVariantStyle(),
                styles[size],
                (disabled || loading) && { opacity: 0.6 },
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : '#FFFFFF'} />
            ) : (
                <Text style={[styles.text, getTextStyle(), styles[`${size}Text`]]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    small: { paddingVertical: 8, paddingHorizontal: 16 },
    medium: { paddingVertical: 12, paddingHorizontal: 24, width: '100%' },
    large: { paddingVertical: 16, paddingHorizontal: 32, width: '100%' },
    text: { fontWeight: '600', textAlign: 'center' },
    smallText: { fontSize: 14 },
    mediumText: { fontSize: 16 },
    largeText: { fontSize: 18 },
});
