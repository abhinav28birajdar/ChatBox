import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface DividerProps {
    text?: string;
    style?: ViewStyle;
}

export const Divider = ({ text, style }: DividerProps) => {
    const { colors } = useTheme();

    if (text) {
        return (
            <View style={[styles.container, style]}>
                <View style={[styles.line, { backgroundColor: colors.border }]} />
                <Text variant="caption" color={colors.textSecondary} style={styles.text}>
                    {text}
                </Text>
                <View style={[styles.line, { backgroundColor: colors.border }]} />
            </View>
        );
    }

    return <View style={[styles.simpleLine, { backgroundColor: colors.border }, style]} />;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    line: {
        flex: 1,
        height: 1,
    },
    text: {
        marginHorizontal: 16,
        fontWeight: '600',
    },
    simpleLine: {
        height: 1,
        width: '100%',
        marginVertical: 16,
    },
});
