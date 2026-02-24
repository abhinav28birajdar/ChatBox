import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function SettingsIndex() {
    const { colors } = useTheme();
    const router = useRouter();

    const SettingRow = ({ icon, title, onPress, color = colors.text }: any) => (
        <TouchableOpacity style={styles.row} onPress={onPress}>
            <View style={styles.left}>
                <Ionicons name={icon} size={24} color={color === colors.text ? colors.primary : color} />
                <Text variant="subtitle2" style={{ marginLeft: 16, color }}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={{ marginLeft: 16 }}>Settings</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>PREFERENCES</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <SettingRow icon="contrast" title="Appearance" onPress={() => router.push('/settings/theme')} />
                        <SettingRow icon="notifications-outline" title="Notifications" onPress={() => router.push('/settings/notifications')} />
                        <SettingRow icon="language-outline" title="Language" onPress={() => Alert.alert('Coming Soon', 'Multilingual support is coming in a future update.')} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <SettingRow icon="shield-outline" title="Privacy" onPress={() => router.push('/settings/privacy')} />
                        <SettingRow icon="lock-closed-outline" title="Security" onPress={() => router.push('/settings/security')} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>SUPPORT</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <SettingRow icon="help-circle-outline" title="Help & Support" onPress={() => router.push('/settings/help')} />
                        <SettingRow icon="information-circle-outline" title="About ChatBox" onPress={() => Alert.alert('ChatBox v1.0.0', 'The ultimate community platform for modern connection.')} />
                    </View>
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => router.push('/settings/security')}>
                    <Text variant="button" color={colors.error}>Account Management</Text>
                </TouchableOpacity>

                <View style={styles.versionInfo}>
                    <Text variant="caption" color={colors.textSecondary}>ChatBox v1.0.0</Text>
                    <Text variant="caption" color={colors.textSecondary}>Made with ❤️ for the community</Text>
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
    section: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    sectionTitle: {
        fontWeight: '800',
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteBtn: {
        alignItems: 'center',
        padding: 24,
    },
    versionInfo: {
        alignItems: 'center',
        paddingVertical: 20,
        opacity: 0.5,
    }
});
