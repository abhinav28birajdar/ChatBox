import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function AboutScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3">About ChatBox</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.logoSection}>
                    <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
                        <Ionicons name="chatbubbles" size={48} color={colors.background} />
                    </View>
                    <Text variant="h2" style={{ marginTop: Spacing.md }}>ChatBox</Text>
                    <Text variant="body" color={colors.textSecondary}>Version 1.2.4</Text>
                </View>

                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text variant="bodyBold" style={styles.sectionTitle}>About</Text>
                    <Text variant="body" color={colors.textSecondary} style={styles.paragraph}>
                        ChatBox is a modern messaging platform designed to bring people together through
                        real-time communication. Whether you're chatting with friends, or building communities
                        in servers, ChatBox provides a seamless experience.
                    </Text>
                </View>

                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text variant="bodyBold" style={styles.sectionTitle}>Features</Text>
                    {[
                        { icon: 'chatbubble', label: 'Real-time messaging' },
                        { icon: 'people', label: 'Servers & channels' },
                        { icon: 'person-add', label: 'Friend system' },
                        { icon: 'notifications', label: 'Push notifications' },
                        { icon: 'moon', label: 'Dark & light theme' },
                        { icon: 'shield-checkmark', label: 'End-to-end security' },
                    ].map((item, idx) => (
                        <View key={idx} style={styles.featureRow}>
                            <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                            <Text variant="body" color={colors.textSecondary} style={{ marginLeft: Spacing.md }}>
                                {item.label}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text variant="bodyBold" style={styles.sectionTitle}>Legal</Text>
                    <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/legal/privacy-policy' as any)}>
                        <Text variant="body" color={colors.primary}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/legal/terms' as any)}>
                        <Text variant="body" color={colors.primary}>Terms of Service</Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <Text variant="bodyBold" style={styles.sectionTitle}>Contact</Text>
                    <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('mailto:support@chatbox.app')}>
                        <Ionicons name="mail-outline" size={20} color={colors.primary} />
                        <Text variant="body" color={colors.textSecondary} style={{ marginLeft: Spacing.md }}>
                            support@chatbox.app
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text variant="caption" color={colors.textSecondary}>
                        © {new Date().getFullYear()} ChatBox. All rights reserved.
                    </Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    },
    scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
    logoSection: { alignItems: 'center', paddingVertical: Spacing.xxl },
    logoCircle: {
        width: 96, height: 96, borderRadius: 48,
        justifyContent: 'center', alignItems: 'center',
    },
    section: {
        borderRadius: 16, padding: Spacing.lg, marginBottom: Spacing.lg,
    },
    sectionTitle: { marginBottom: Spacing.md },
    paragraph: { lineHeight: 22 },
    featureRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    linkRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    footer: { alignItems: 'center', paddingVertical: Spacing.xxl, opacity: 0.5 },
});
