import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface BadgeProps {
    count?: number;
    size?: number;
    style?: ViewStyle;
    dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ count, size = 20, style, dot }) => {
    const { colors } = useTheme();

    if (count === 0 && !dot) return null;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.error,
                    minWidth: dot ? 10 : size,
                    height: dot ? 10 : size,
                    borderRadius: size / 2,
                    paddingHorizontal: dot ? 0 : 4,
                },
                style,
            ]}
        >
            {!dot && count !== undefined && (
                <Text style={[styles.text, { fontSize: size * 0.6 }]}>
                    {count > 99 ? '99+' : count}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: -5,
        right: -5,
        borderWidth: 2,
        borderColor: '#fff',
        zIndex: 10,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
