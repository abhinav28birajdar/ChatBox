import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput as RNTextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Divider } from '@/components/ui/Divider';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useAuth } from '@/context/AuthContext';
import { validateEmail } from '@/utils/helpers';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { login, signInWithGoogle, isLoading, error, clearError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const passwordRef = useRef<RNTextInput>(null);
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    // Load remembered email
    useEffect(() => {
        loadRememberedEmail();
    }, []);

    const loadRememberedEmail = async () => {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const remembered = await AsyncStorage.getItem('rememberMe');
            const savedEmail = await AsyncStorage.getItem('userEmail');

            if (remembered === 'true' && savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
            }
        } catch (error) {
            console.error('Error loading remembered email:', error);
        }
    };

    const handleLogin = async () => {
        clearError();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const newErrors: Record<string, string> = {};

        if (!validateEmail(email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            shakeError();
            return;
        }

        const success = await login(email, password, rememberMe);

        if (success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Navigation is handled centrally by _layout.tsx when auth state changes.
        } else {
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
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
                            <Ionicons name="chatbubbles" size={60} color={colors.background} />
                        </View>
                        <Text variant="h1" style={styles.logoText}>
                            ChatBox
                        </Text>
                        <Text variant="body" color={colors.textSecondary} style={styles.tagline}>
                            Connect. Chat. Belong.
                        </Text>
                    </View>

                    {/* Error Banner */}
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

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="EMAIL"
                            placeholder="Enter your email address"
                            value={email}
                            onChangeText={(t) => {
                                setEmail(t);
                                setErrors((e) => ({ ...e, email: '' }));
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="mail-outline"
                            error={errors.email}
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                            autoFocus
                        />

                        <Input
                            ref={passwordRef}
                            label="PASSWORD"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(t) => {
                                setPassword(t);
                                setErrors((e) => ({ ...e, password: '' }));
                            }}
                            isPassword
                            leftIcon="lock-closed-outline"
                            error={errors.password}
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                        />

                        {/* Remember Me & Forgot Password */}
                        <View style={styles.optionsRow}>
                            <TouchableOpacity
                                style={styles.rememberRow}
                                onPress={() => {
                                    setRememberMe(!rememberMe);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                            >
                                <Ionicons
                                    name={rememberMe ? 'checkbox' : 'square-outline'}
                                    size={22}
                                    color={rememberMe ? colors.primary : colors.textSecondary}
                                />
                                <Text variant="bodySmall" color={colors.textSecondary} style={styles.rememberText}>
                                    Remember me
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push('/(auth)/forgot-password');
                                }}
                            >
                                <Text variant="bodySmall" color={colors.primary}>
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign In Button */}
                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={styles.signInBtn}
                        />

                        <Divider text="OR" />

                        {/* Social Auth */}
                        <View style={styles.socialRow}>
                            <TouchableOpacity
                                style={[styles.socialBtn, { backgroundColor: colors.surface }]}
                                onPress={async () => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    await signInWithGoogle();
                                    // Navigation handled centrally by _layout.tsx.
                                }}
                            >
                                <Ionicons name="logo-google" size={22} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.socialBtn, { backgroundColor: colors.surface }]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push('/(auth)/phone-auth' as any);
                                }}
                            >
                                <Ionicons name="call" size={22} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Link */}
                        <View style={styles.footer}>
                            <Text variant="bodySmall" color={colors.textSecondary}>
                                Don't have an account?{' '}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push('/(auth)/register');
                                }}
                            >
                                <Text variant="bodySmall" color={colors.primary} style={styles.signUpText}>
                                    Create Account
                                </Text>
                            </TouchableOpacity>
                        </View>
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
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    logoText: {
        marginBottom: Spacing.xs,
    },
    tagline: {
        textAlign: 'center',
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
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        marginTop: Spacing.sm,
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberText: {
        marginLeft: Spacing.sm,
    },
    signInBtn: {
        height: 52,
        marginBottom: Spacing.md,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginVertical: Spacing.md,
    },
    socialBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: Spacing.lg,
    },
    signUpText: {
        fontWeight: '600',
    },
});
