import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';

interface PlaceholderPageProps {
    title: string;
    icon?: string;
    description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
    title,
    icon = 'construct-outline',
    description = 'This feature is currently under construction for the 2026 production release.'
}) => {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name={icon as any} size={80} color={colors.primary} />
                </View>
                <Text variant="h2" style={styles.title}>{title}</Text>
                <Text variant="body" color={colors.textSecondary} style={styles.description}>
                    {description}
                </Text>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => router.back()}
                >
                    <Text variant="button" color={colors.background}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        marginBottom: Spacing.md,
    },
    description: {
        textAlign: 'center',
        marginBottom: Spacing.xxl,
        lineHeight: 24,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 28,
    }
});
