import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

export default function PermissionsOnboarding() {
    const { colors } = useTheme();
    const router = useRouter();

    const handleFinish = () => {
        router.replace('/(auth)/login');
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Ionicons name="notifications-outline" size={80} color={colors.primary} style={styles.icon} />
                <Text variant="h2" align="center" style={styles.title}>Enable Notifications</Text>
                <Text variant="body" align="center" color={colors.textSecondary} style={styles.desc}>
                    Stay updated when friends message you or invite you to servers.
                    You can change this anytime in settings.
                </Text>

                <View style={styles.card}>
                    <View style={[styles.permissionRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.textSecondary} />
                        <Text variant="subtitle2" style={styles.rowText}>New Messages</Text>
                    </View>
                    <View style={styles.permissionRow}>
                        <Ionicons name="people-outline" size={24} color={colors.textSecondary} />
                        <Text variant="subtitle2" style={styles.rowText}>Server Invites</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Button title="Allow Access" onPress={handleFinish} style={styles.button} />
                <Button title="Maybe Later" onPress={handleFinish} variant="ghost" />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginBottom: 24,
    },
    title: {
        marginBottom: 16,
    },
    desc: {
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
    },
    permissionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    rowText: {
        marginLeft: 16,
    },
    footer: {
        marginTop: 'auto',
    },
    button: {
        width: '100%',
        marginBottom: 12,
    }
});
