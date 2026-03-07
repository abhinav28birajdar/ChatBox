import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { DIMENSIONS } from '../../constants/dimensions';

interface CardProps extends TouchableOpacityProps {
    children?: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    padding?: number;
    shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style, padding = DIMENSIONS.padding.md, shadow = true, ...props }) => {
    const { colors, isDark } = useTheme();

    const Wrapper = onPress ? TouchableOpacity : View;

    return (
        <Wrapper
            onPress={onPress}
            style={[
                styles.container,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: isDark ? 1 : 0,
                    padding,
                },
                shadow && !isDark && styles.shadow,
                style,
            ]}
            {...props}
        >
            {children}
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: DIMENSIONS.borderRadius.md,
        overflow: 'hidden',
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
});
