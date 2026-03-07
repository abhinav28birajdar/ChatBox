import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Button } from './Button';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = 'tray-alert', actionLabel, onAction, style }) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, style]}>
            <MaterialCommunityIcons name={icon as any} size={80} color={colors.textMuted} />
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {description && (
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {description}
                </Text>
            )}
            {actionLabel && (
                <Button
                    title={actionLabel}
                    onPress={onAction!}
                    style={styles.button}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        height: '100%',
    },
    title: {
        fontSize: Typography.fontSize.xxl,
        fontFamily: Typography.fontFamily.bold,
        marginTop: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.regular,
        textAlign: 'center',
        marginTop: 10,
    },
    button: {
        marginTop: 30,
        minWidth: 150,
    },
});
