import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
    StyleProp
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/Spacing';
import { Text } from './Text';

import { Ionicons } from '@expo/vector-icons';

interface Props {
    onPress: () => void;
    title?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    icon?: React.ReactNode;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
}

export const Button = ({
    onPress,
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon,
    leftIcon,
    rightIcon,
}: Props) => {
    const { colors } = useTheme();

    const handlePress = () => {
        if (!loading && !disabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
        }
    };

    const getVariantStyle = () => {
        switch (variant) {
            case 'primary':
                return { backgroundColor: colors.primary };
            case 'secondary':
                return { backgroundColor: colors.surface };
            case 'outline':
                return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
            case 'ghost':
                return { backgroundColor: 'transparent' };
            default:
                return { backgroundColor: colors.primary };
        }
    };

    const getTextColor = () => {
        if (variant === 'primary') return '#120C17';
        return colors.text;
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.base,
                styles[size],
                getVariantStyle(),
                disabled && { opacity: 0.5 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <View style={styles.content}>
                    {leftIcon && (
                        <Ionicons
                            name={leftIcon}
                            size={size === 'sm' ? 18 : 20}
                            color={getTextColor()}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    {icon}
                    {title && (
                        <Text
                            variant="button"
                            color={getTextColor()}
                            style={[(icon || leftIcon) ? { marginLeft: leftIcon ? 0 : 8 } : {}, textStyle]}
                        >
                            {title}
                        </Text>
                    )}
                    {rightIcon && (
                        <Ionicons
                            name={rightIcon}
                            size={size === 'sm' ? 18 : 20}
                            color={getTextColor()}
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: Spacing.round.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sm: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    md: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    lg: {
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
});
