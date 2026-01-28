import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function HelpSettings() {
    const { colors } = useTheme();
    const router = useRouter();

    const FAQS = [
        { q: 'How do I join a server?', a: 'Go to the Explore tab and click Join on any community.' },
        { q: 'Can I change my username?', a: 'Yes, go to Profile > Account Information to edit.' },
        { q: 'Is ChatBox free?', a: 'Absolutely! Our core features are free for everyone.' },
    ];

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={{ marginLeft: 16 }}>Help & Support</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search for help..."
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.input, { color: colors.text }]}
                    />
                </View>

                <Text variant="subtitle2" style={styles.sectionTitle}>Frequently Asked Questions</Text>
                {FAQS.map((item, i) => (
                    <TouchableOpacity key={i} style={[styles.faqCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.faqRow}>
                            <Text variant="bodySmall" style={{ fontWeight: '600', flex: 1 }}>{item.q}</Text>
                            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={styles.contactSection}>
                    <Text variant="subtitle2" style={styles.sectionTitle}>Still need help?</Text>
                    <Text variant="bodySmall" color={colors.textSecondary} style={{ marginBottom: 20 }}>
                        Our support team is available 24/7 to help you with any issues.
                    </Text>

                    <TouchableOpacity style={[styles.supportCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
                        <Ionicons name="mail-outline" size={32} color={colors.primary} />
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text variant="subtitle2">Email Support</Text>
                            <Text variant="caption" color={colors.textSecondary}>Response usually within 2h</Text>
                        </View>
                        <Ionicons name="open-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.supportCard, { backgroundColor: '#8A4FFF10', borderColor: '#8A4FFF', marginTop: 16 }]}>
                        <Ionicons name="chatbubbles-outline" size={32} color="#8A4FFF" />
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text variant="subtitle2">Community Help Server</Text>
                            <Text variant="caption" color={colors.textSecondary}>Chat with other users</Text>
                        </View>
                        <Ionicons name="open-outline" size={20} color="#8A4FFF" />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
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
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 52,
        borderRadius: 16,
        marginBottom: 32,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    sectionTitle: {
        fontWeight: '800',
        marginBottom: 16,
    },
    faqCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    faqRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contactSection: {
        marginTop: 24,
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    }
});
