import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

const LAST_UPDATED = 'February 22, 2026';

export default function TermsScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const Section = ({ title, children }: { title: string; children: string }) => (
        <View style={styles.section}>
            <Text variant="subtitle2" style={styles.sectionTitle}>{title}</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.paragraph}>{children}</Text>
        </View>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3">Terms of Service</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Text variant="caption" color={colors.textSecondary} style={styles.updated}>
                    Last updated: {LAST_UPDATED}
                </Text>

                <Section title="1. Acceptance of Terms">
                    {`By accessing or using ChatBox, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the application. We reserve the right to update these terms at any time, and your continued use constitutes acceptance of any changes.`}
                </Section>

                <Section title="2. Account Registration">
                    {`You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 13 years old to use ChatBox.`}
                </Section>

                <Section title="3. Acceptable Use">
                    {`You agree to use ChatBox only for lawful purposes. You may not use the service to: send spam or unsolicited messages, harass or threaten other users, distribute malware or harmful content, impersonate other users or entities, violate any applicable laws or regulations, or attempt to gain unauthorized access to our systems.`}
                </Section>

                <Section title="4. User Content">
                    {`You retain ownership of content you create and share through ChatBox. By posting content, you grant us a non-exclusive, royalty-free license to use, store, and display your content as necessary to operate the service. You are solely responsible for the content you share.`}
                </Section>

                <Section title="5. Server & Community Guidelines">
                    {`Server owners and moderators are responsible for enforcing community standards within their servers. ChatBox reserves the right to remove servers or content that violates these terms or our community guidelines. Servers must not be used to promote illegal activities, hate speech, or harmful content.`}
                </Section>

                <Section title="6. Intellectual Property">
                    {`ChatBox and its original content, features, and functionality are owned by ChatBox and protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our proprietary materials without written permission.`}
                </Section>

                <Section title="7. Termination">
                    {`We may terminate or suspend your account at any time, with or without cause, with or without notice. Upon termination, your right to use the service will cease immediately. You may also delete your account at any time through the app settings.`}
                </Section>

                <Section title="8. Limitation of Liability">
                    {`ChatBox is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.`}
                </Section>

                <Section title="9. Dispute Resolution">
                    {`Any disputes arising from these terms or the use of ChatBox shall be resolved through binding arbitration in accordance with applicable laws. You agree to resolve disputes individually and waive any right to participate in class action lawsuits.`}
                </Section>

                <Section title="10. Contact">
                    {`For questions about these Terms of Service, contact us at legal@chatbox.app.`}
                </Section>
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
    updated: { marginBottom: Spacing.xl, fontStyle: 'italic' },
    section: { marginBottom: Spacing.xl },
    sectionTitle: { marginBottom: Spacing.sm },
    paragraph: { lineHeight: 22 },
});
