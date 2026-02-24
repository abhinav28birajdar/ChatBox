import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { validateEmail } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function ForgotPasswordScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleResetPassword = async () => {
        setError('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setLoading(true);

        try {
            const success = await resetPassword(email);
            if (!success) throw new Error('Failed to send reset link');

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                'Email Sent',
                `Password reset link has been sent to ${email}. Please check your inbox.`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (err: any) {
            setError(err.message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.back();
                        }}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="lock-closed" size={40} color={colors.primary} />
                        </View>
                        <Text variant="h2" style={styles.title}>
                            Forgot Password?
                        </Text>
                        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                            No worries! Enter your email address and we'll send you a link to reset your password.
                        </Text>
                    </View>

                    {/* Error Message */}
                    {error && (
                        <View style={[styles.errorBanner, { backgroundColor: colors.error + '20' }]}>
                            <Ionicons name="alert-circle" size={18} color={colors.error} />
                            <Text variant="bodySmall" color={colors.error} style={{ marginLeft: Spacing.sm }}>
                                {error}
                            </Text>
                        </View>
                    )}

                    {/* Form */}
                    <Input
                        label="EMAIL ADDRESS"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={(t) => {
                            setEmail(t);
                            setError('');
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="mail-outline"
                        returnKeyType="done"
                        onSubmitEditing={handleResetPassword}
                        autoFocus
                    />

                    <Button
                        title="Send Reset Link"
                        onPress={handleResetPassword}
                        loading={loading}
                        style={styles.btn}
                    />

                    {/* Back to Login */}
                    <View style={styles.footer}>
                        <Text variant="bodySmall" color={colors.textSecondary}>
                            Remembered your password?{' '}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.back();
                            }}
                        >
                            <Text variant="bodySmall" color={colors.primary} style={styles.linkText}>
                                Back to Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scroll: {
        flexGrow: 1,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    backBtn: {
        marginBottom: Spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 22,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: Spacing.round.md,
        marginBottom: Spacing.md,
    },
    btn: {
        height: 52,
        marginTop: Spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
    linkText: {
        fontWeight: '600',
    },
});
