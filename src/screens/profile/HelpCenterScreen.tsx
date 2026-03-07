import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../constants/typography';
import { ROUTES } from '../../constants/routes';

export default function HelpCenterScreen({ navigation }: any) {
    const { colors } = useTheme();

    const ContactItem = ({ icon, title, subtitle, onPress }: any) => (
        <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.surface }]} onPress={onPress}>
            <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                <Ionicons name={icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
                <Text style={[styles.contactTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
    );

    const LinkItem = ({ title, onPress }: any) => (
        <TouchableOpacity style={styles.linkItem} onPress={onPress}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>{title}</Text>
            <Ionicons name="open-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
    );

    const handleEmailSupport = () => {
        Linking.openURL('mailto:abhinavbirajdar28@gmail.com?subject=ChatBox Support Request');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Help Center</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
                    <ContactItem
                        icon="mail"
                        title="Email Support"
                        subtitle="abhinavbirajdar28@gmail.com"
                        onPress={handleEmailSupport}
                    />
                    <ContactItem
                        icon="chatbubbles"
                        title="Live Chat"
                        subtitle="Typically replies in minutes"
                        onPress={() => alert('Live chat feature coming soon!')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>FAQ</Text>
                    <View style={[styles.faqCard, { backgroundColor: colors.surface }]}>
                        <TouchableOpacity style={styles.faqItem}>
                            <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I change my password?</Text>
                            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.faqItem}>
                            <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I add new friends?</Text>
                            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.faqItem}>
                            <Text style={[styles.faqQuestion, { color: colors.text }]}>How do I create a community?</Text>
                            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.faqItem, { borderBottomWidth: 0 }]}>
                            <Text style={[styles.faqQuestion, { color: colors.text }]}>Why is my profile picture not updating?</Text>
                            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.section, { marginBottom: 60 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal</Text>
                    <View style={[styles.legalCard, { backgroundColor: colors.surface }]}>
                        <LinkItem title="Community Guidelines" onPress={() => { }} />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <LinkItem title="Terms of Service" onPress={() => { }} />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <LinkItem title="Privacy Policy" onPress={() => navigation.navigate(ROUTES.MAIN.PRIVACY)} />
                    </View>
                </View>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Typography.fontFamily.bold,
    },
    content: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Typography.fontFamily.bold,
        marginBottom: 16,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.bold,
    },
    contactSubtitle: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.medium,
        marginTop: 4,
    },
    faqCard: {
        borderRadius: 20,
        paddingHorizontal: 16,
    },
    faqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    faqQuestion: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
    },
    legalCard: {
        borderRadius: 20,
        paddingHorizontal: 16,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    linkTitle: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.5,
    },
});
