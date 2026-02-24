import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { Button } from './Button';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    subtitle?: string; // Alias for description
    actionTitle?: string;
    onAction?: () => void;
}

export const EmptyState = ({ icon, title, description, subtitle, actionTitle, onAction }: Props) => {
    const { colors } = useTheme();
    const displayDesc = description ?? subtitle ?? '';

    return (
        <View style={styles.container}>
            <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                <Ionicons name={icon} size={64} color={colors.textSecondary} />
            </View>
            <Text variant="h3" align="center" style={styles.title}>{title}</Text>
            <Text variant="body" align="center" color={colors.textSecondary} style={styles.desc}>
                {displayDesc}
            </Text>

            {actionTitle && onAction && (
                <Button title={actionTitle} onPress={onAction} style={styles.btn} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    iconBox: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        marginBottom: 12,
    },
    desc: {
        marginBottom: 32,
    },
    btn: {
        minWidth: 160,
    }
});
