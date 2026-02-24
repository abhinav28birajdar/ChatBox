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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';
import { auth } from '@/config/firebase';

export default function ResetPasswordScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { oobCode } = useLocalSearchParams<{ oobCode: string }>();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleReset = async () => {
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!oobCode) {
            setError('Invalid or missing reset token. Please request a new line.');
            return;
        }

        setLoading(true);
        try {
            await auth.confirmPasswordReset(oobCode, password);
            setSuccess(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (err: any) {
            setError(err.message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.centerContent}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={60} color={colors.success} />
                    </View>
                    <Text variant="h2" style={styles.title}>Password Reset Success!</Text>
                    <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                        Your password has been successfully updated. You can now log in with your new password.
                    </Text>
                    <Button
                        title="Back to Login"
                        onPress={() => router.replace('/(auth)/login')}
                        style={styles.mainBtn}
                    />
                </View>
            </ScreenWrapper>
        );
    }

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
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text variant="h2" style={styles.title}>Reset Password</Text>
                        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                            Please enter your new password below.
                        </Text>
                    </View>

                    {error && (
                        <View style={[styles.errorBanner, { backgroundColor: colors.error + '20' }]}>
                            <Ionicons name="alert-circle" size={18} color={colors.error} />
                            <Text variant="bodySmall" color={colors.error} style={{ marginLeft: Spacing.sm }}>
                                {error}
                            </Text>
                        </View>
                    )}

                    <Input
                        label="NEW PASSWORD"
                        placeholder="Min. 6 characters"
                        value={password}
                        onChangeText={setPassword}
                        isPassword
                        leftIcon="lock-closed-outline"
                    />

                    <Input
                        label="CONFIRM PASSWORD"
                        placeholder="Repeat your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        isPassword
                        leftIcon="lock-closed-outline"
                    />

                    <Button
                        title="Reset Password"
                        onPress={handleReset}
                        loading={loading}
                        style={styles.mainBtn}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    keyboardView: { flex: 1 },
    scroll: {
        flexGrow: 1,
        padding: Spacing.lg,
    },
    backBtn: {
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
    },
    header: {
        marginBottom: Spacing.xxl,
    },
    title: {
        marginBottom: Spacing.sm,
    },
    subtitle: {
        lineHeight: 22,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: Spacing.round.md,
        marginBottom: Spacing.lg,
    },
    mainBtn: {
        height: 56,
        marginTop: Spacing.lg,
        width: '100%',
    },
});
