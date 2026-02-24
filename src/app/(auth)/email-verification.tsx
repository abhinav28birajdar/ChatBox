import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';
import { auth } from '@/config/firebase';

export default function EmailVerificationScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const checkVerification = async () => {
        setLoading(true);
        try {
            await auth.currentUser?.reload();
            if (auth.currentUser?.emailVerified) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace('/(tabs)/home');
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                Alert.alert(
                    'Not Verified',
                    'Your email is not verified yet. Please check your inbox and click the link.'
                );
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;

        setLoading(true);
        try {
            await auth.currentUser?.sendEmailVerification();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Verification email sent!');
            setResendTimer(60); // 60 seconds cooldown
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        // logout() triggers auth state change → _layout.tsx redirects to login.
                        logout();
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="mail-unread" size={50} color={colors.primary} />
                    </View>
                    <Text variant="h2" style={styles.title}>
                        Verify Your Email
                    </Text>
                    <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                        We've sent a verification link to:{"\n"}
                        <Text variant="body" style={{ fontWeight: '600', color: colors.text }}>
                            {user?.email}
                        </Text>
                    </Text>
                </View>

                {/* Info Box */}
                <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                    <Text variant="bodySmall" color={colors.textSecondary} style={styles.infoText}>
                        Please check your spam folder if you don't see the email in your inbox.
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button
                        title="I've Verified My Email"
                        onPress={checkVerification}
                        loading={loading}
                        style={styles.mainBtn}
                    />

                    <TouchableOpacity
                        style={styles.resendBtn}
                        onPress={handleResend}
                        disabled={resendTimer > 0 || loading}
                    >
                        <Text
                            variant="body"
                            color={resendTimer > 0 ? colors.textSecondary : colors.primary}
                            style={styles.resendText}
                        >
                            {resendTimer > 0
                                ? `Resend Email in ${resendTimer}s`
                                : "Resend Verification Email"
                            }
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
    backBtn: {
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 24,
    },
    infoBox: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderRadius: Spacing.round.md,
        marginBottom: Spacing.xxl,
        alignItems: 'center',
    },
    infoText: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    actions: {
        gap: Spacing.md,
    },
    mainBtn: {
        height: 56,
    },
    resendBtn: {
        alignItems: 'center',
        padding: Spacing.md,
    },
    resendText: {
        fontWeight: '600',
    },
});
