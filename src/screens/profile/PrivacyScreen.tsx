import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();

    const sections = [
        {
            title: 'Data Collection',
            content: 'We collect minimal data to provide our services, including your username, email, and basic profile info. We do not sell your personal data to third parties.'
        },
        {
            title: 'Messaging Privacy',
            content: 'Your direct messages are stored securely. We use secure connections and encryption to ensure your conversations remain private.'
        },
        {
            title: 'Location Services',
            content: 'Location data is only used if you explicitly enable it for finding local marketplace items or nearby friends. You can disable this at any time in settings.'
        },
        {
            title: 'Your Choices',
            content: 'You can update your profile, change your visibility status, and even delete your account entirely through the app settings.'
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: March 2026</Text>

                <Text style={[styles.intro, { color: colors.text }]}>
                    At ChatBox, your privacy is our priority. This document explains how we handle your data and what controls you have.
                </Text>

                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>{section.title}</Text>
                        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.sectionContent, { color: colors.text }]}>{section.content}</Text>
                        </View>
                    </View>
                ))}

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Typography.fontFamily.bold,
    },
    backBtn: {
        padding: 4,
    },
    content: {
        padding: 24,
    },
    lastUpdated: {
        fontSize: 12,
        fontFamily: Typography.fontFamily.medium,
        marginBottom: 8,
    },
    intro: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.semiBold,
        lineHeight: 24,
        marginBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.bold,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
    },
    sectionContent: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.regular,
        lineHeight: 22,
    },
});
