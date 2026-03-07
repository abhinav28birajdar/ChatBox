import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';

interface StatBadgeProps {
    label: string;
    value: number | string;
    onPress?: () => void;
}

export const StatBadge: React.FC<StatBadgeProps> = ({ label, value, onPress }) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
            <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    value: {
        fontSize: Typography.fontSize.xl,
        fontFamily: Typography.fontFamily.bold,
    },
    label: {
        fontSize: Typography.fontSize.xs,
        fontFamily: Typography.fontFamily.bold,
        marginTop: 4,
        letterSpacing: 0.5,
    },
});
