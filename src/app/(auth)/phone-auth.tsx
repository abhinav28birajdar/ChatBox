import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput as RNTextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useAuth } from '@/context/AuthContext';
import AuthService from '@/services/AuthService';
import * as Haptics from 'expo-haptics';

export default function PhoneAuthScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { signInWithPhone, isLoading, error, clearError } = useAuth();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [code, setCode] = useState('');
    const [confirm, setConfirm] = useState<any>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const shakeAnimation = useRef(new Animated.Value(0)).current;

    const handleSendCode = async () => {
        clearError();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (!phoneNumber || phoneNumber.length < 10) {
            setErrors({ phoneNumber: 'Invalid phone number' });
            shakeError();
            return;
        }

        const confirmation = await signInWithPhone(phoneNumber);
        if (confirmation) {
            setConfirm(confirmation);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            shakeError();
        }
    };

    const handleVerifyCode = async () => {
        clearError();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (!code || code.length < 6) {
            setErrors({ code: 'Invalid verification code' });
            shakeError();
            return;
        }

        try {
            // Use AuthService to confirm code AND create profile if new user
            await AuthService.confirmPhoneCode(confirm, code);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(tabs)/home');
        } catch (err: any) {
            shakeError();
        }
    };

    const shakeError = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
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
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <Text variant="h1">Phone Sign In</Text>
                        <Text variant="body" color={colors.textSecondary} style={styles.tagline}>
                            {confirm ? 'Enter the 6-digit code we sent you' : 'Enter your phone number to continue'}
                        </Text>
                    </View>

                    {error && (
                        <Animated.View
                            style={[
                                styles.errorBanner,
                                { backgroundColor: colors.error + '20', transform: [{ translateX: shakeAnimation }] },
                            ]}
                        >
                            <Ionicons name="alert-circle" size={18} color={colors.error} />
                            <Text variant="bodySmall" color={colors.error} style={{ marginLeft: Spacing.sm }}>
                                {error}
                            </Text>
                        </Animated.View>
                    )}

                    <View style={styles.form}>
                        {!confirm ? (
                            <>
                                <Input
                                    label="PHONE NUMBER"
                                    placeholder="+1 123 456 7890"
                                    value={phoneNumber}
                                    onChangeText={(t) => {
                                        setPhoneNumber(t);
                                        setErrors({});
                                    }}
                                    keyboardType="phone-pad"
                                    leftIcon="call-outline"
                                    error={errors.phoneNumber}
                                />
                                <Button
                                    title="Send Code"
                                    onPress={handleSendCode}
                                    loading={isLoading}
                                    style={styles.submitBtn}
                                />
                            </>
                        ) : (
                            <>
                                <Input
                                    label="VERIFICATION CODE"
                                    placeholder="123456"
                                    value={code}
                                    onChangeText={(t) => {
                                        setCode(t);
                                        setErrors({});
                                    }}
                                    keyboardType="number-pad"
                                    leftIcon="key-outline"
                                    error={errors.code}
                                    maxLength={6}
                                />
                                <Button
                                    title="Verify & Continue"
                                    onPress={handleVerifyCode}
                                    loading={isLoading}
                                    style={styles.submitBtn}
                                />
                                <TouchableOpacity
                                    onPress={() => setConfirm(null)}
                                    style={styles.resendBtn}
                                >
                                    <Text variant="bodySmall" color={colors.primary}>
                                        Change phone number
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
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
    },
    backBtn: {
        marginBottom: Spacing.xl,
        marginLeft: -Spacing.xs,
    },
    headerContainer: {
        marginBottom: Spacing.xxl,
    },
    tagline: {
        marginTop: Spacing.xs,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: Spacing.round.md,
        marginBottom: Spacing.md,
    },
    form: {
        width: '100%',
    },
    submitBtn: {
        height: 52,
        marginTop: Spacing.md,
    },
    resendBtn: {
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
});
