import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useApp } from '@/context/AppContext';

export default function ThemeSettings() {
    const { colors } = useTheme();
    const router = useRouter();
    const { themeMode, setThemeMode } = useApp();

    const ThemeOption = ({ title, value, icon, desc }: any) => (
        <TouchableOpacity
            style={[
                styles.option,
                { borderColor: themeMode === value ? colors.primary : colors.border }
            ]}
            onPress={() => setThemeMode(value)}
        >
            <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                <Ionicons name={icon} size={28} color={themeMode === value ? colors.primary : colors.textSecondary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text variant="subtitle2" color={themeMode === value ? colors.primary : colors.text}>{title}</Text>
                <Text variant="caption" color={colors.textSecondary}>{desc}</Text>
            </View>
            {themeMode === value && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={{ marginLeft: 16 }}>Appearance</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>SELECT MODE</Text>

                <ThemeOption
                    title="System Default"
                    value="system"
                    icon="settings-outline"
                    desc="Match your device's system appearance settings."
                />
                <ThemeOption
                    title="Dark Mode"
                    value="dark"
                    icon="moon-outline"
                    desc="Sleek, battery-saving dark interface (Recommended)."
                />
                <ThemeOption
                    title="Light Mode"
                    value="light"
                    icon="sunny-outline"
                    desc="Bright and clean interface for high visibility."
                />

                <View style={styles.preview}>
                    <Text variant="caption" color={colors.textSecondary} style={[styles.sectionTitle, { marginLeft: 0 }]}>PREVIEW</Text>
                    <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.previewHeader}>
                            <View style={[styles.previewAvatar, { backgroundColor: colors.primary }]} />
                            <View style={styles.previewLines}>
                                <View style={[styles.previewLine, { width: 100, backgroundColor: colors.text, opacity: 0.1 }]} />
                                <View style={[styles.previewLine, { width: 60, backgroundColor: colors.text, opacity: 0.05 }]} />
                            </View>
                        </View>
                        <View style={[styles.previewBubble, { backgroundColor: colors.primary }]}>
                            <View style={[styles.previewLine, { width: 80, backgroundColor: '#000', opacity: 0.1 }]} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontWeight: '800',
        marginBottom: 16,
        marginLeft: 4,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        marginBottom: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    preview: {
        marginTop: 32,
    },
    previewCard: {
        padding: 16,
        borderRadius: 16,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    previewAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    previewLines: {
        marginLeft: 12,
    },
    previewLine: {
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    previewBubble: {
        alignSelf: 'flex-start',
        padding: 12,
        borderRadius: 12,
        borderBottomLeftRadius: 4,
    }
});
