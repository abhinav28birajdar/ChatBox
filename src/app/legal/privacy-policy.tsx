import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

const LAST_UPDATED = 'February 22, 2026';

export default function PrivacyPolicyScreen() {
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
                <Text variant="h3">Privacy Policy</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Text variant="caption" color={colors.textSecondary} style={styles.updated}>
                    Last updated: {LAST_UPDATED}
                </Text>

                <Section title="1. Information We Collect">
                    {`When you create an account, we collect your email address, display name, username, and optional profile information such as your bio and avatar. We also collect usage data including messages sent, servers joined, and interaction patterns to improve our service.`}
                </Section>

                <Section title="2. How We Use Your Information">
                    {`We use your information to provide, maintain, and improve ChatBox services. This includes enabling real-time messaging, managing your account, sending notifications, and personalizing your experience. We do not sell your personal information to third parties.`}
                </Section>

                <Section title="3. Data Storage & Security">
                    {`Your data is stored securely using Firebase services with encryption at rest and in transit. Messages are stored in Firestore with access controlled by security rules. We implement industry-standard security measures to protect your data from unauthorized access.`}
                </Section>

                <Section title="4. Data Sharing">
                    {`We share your public profile information (display name, avatar, username) with other ChatBox users as part of the messaging experience. Your messages are only visible to the intended recipients (DM participants or server members). We may share data with law enforcement when required by law.`}
                </Section>

                <Section title="5. Your Rights">
                    {`You have the right to access, modify, or delete your personal data at any time through the app settings. You can export your data, delete your account permanently, or request data removal by contacting our support team.`}
                </Section>

                <Section title="6. Cookies & Analytics">
                    {`We use Firebase Analytics to collect anonymized usage statistics to help improve our service. We do not use tracking cookies or share analytics data with advertising networks.`}
                </Section>

                <Section title="7. Children's Privacy">
                    {`ChatBox is not intended for use by individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.`}
                </Section>

                <Section title="8. Changes to This Policy">
                    {`We may update this Privacy Policy from time to time. We will notify you of any material changes through the app or via email. Continued use of ChatBox after changes constitutes acceptance of the updated policy.`}
                </Section>

                <Section title="9. Contact Us">
                    {`If you have questions about this Privacy Policy or your data, contact us at support@chatbox.app.`}
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
