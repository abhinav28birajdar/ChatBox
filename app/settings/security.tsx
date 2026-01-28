import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function SecuritySettings() {
    const { colors } = useTheme();
    const router = useRouter();

    const SecurityRow = ({ title, subtitle, icon, color = colors.text }: any) => (
        <TouchableOpacity style={styles.row}>
            <View style={styles.left}>
                <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text variant="subtitle2" style={{ color }}>{title}</Text>
                    <Text variant="caption" color={colors.textSecondary}>{subtitle}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={{ marginLeft: 16 }}>Security</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.summaryCard}>
                    <View style={[styles.shieldContainer, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="shield-checkmark" size={40} color={colors.success} />
                    </View>
                    <Text variant="subtitle1" style={{ marginTop: 16 }}>Your account is secure</Text>
                    <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: 8 }}>
                        We recommend enabling Two-Factor Authentication for maximum security.
                    </Text>
                </View>

                <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>PROTECTION</Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <SecurityRow
                        icon="key-outline"
                        title="Change Password"
                        subtitle="Last changed 3 months ago"
                    />
                    <SecurityRow
                        icon="phone-portrait-outline"
                        title="Two-Factor Auth"
                        subtitle="Secure your account with a code"
                    />
                </View>

                <Text variant="caption" color={colors.textSecondary} style={[styles.sectionTitle, { marginTop: 32 }]}>DEVICES</Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <SecurityRow
                        icon="desktop-outline"
                        title="Windows PC • India"
                        subtitle="Active now"
                    />
                    <SecurityRow
                        icon="phone-portrait-outline"
                        title="iPhone 13 • India"
                        subtitle="Last active 2 days ago"
                    />
                </View>

                <Button title="Log Out of All Devices" onPress={() => { }} variant="outline" style={{ marginTop: 32 }} />
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
    summaryCard: {
        alignItems: 'center',
        marginBottom: 32,
    },
    shieldContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
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
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
