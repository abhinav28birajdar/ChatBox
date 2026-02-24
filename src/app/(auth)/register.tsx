import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput as RNTextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Divider } from '@/components/ui/Divider';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword, validateUsername } from '@/utils/helpers';
import MediaService from '@/services/MediaService';
import * as Haptics from 'expo-haptics';
import { interestTags } from '@/constants/Config';

const { width } = Dimensions.get('window');



export default function RegisterScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { register, isLoading, error, clearError } = useAuth();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        displayName: '',
        bio: '',
        avatarUri: '',
        interests: [] as string[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [agreeTerms, setAgreeTerms] = useState(false);

    const passwordRef = useRef<RNTextInput>(null);
    const confirmRef = useRef<RNTextInput>(null);
    const displayNameRef = useRef<RNTextInput>(null);
    const bioRef = useRef<RNTextInput>(null);

    const passwordValidation = validatePassword(formData.password);

    const slideAnim = useRef(new Animated.Value(0)).current;

    const updateFormData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors(prev => {
                const newErrs = { ...prev };
                delete newErrs[key];
                return newErrs;
            });
        }
    };

    const nextStep = () => {
        clearError();
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
            if (!passwordValidation.isValid) newErrors.password = 'Password is too weak';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        } else if (step === 2) {
            const usernameCheck = validateUsername(formData.username);
            if (!usernameCheck.isValid) newErrors.username = usernameCheck.error!;
            if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStep(prev => prev - 1);
    };

    const toggleInterest = (interest: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newInterests = formData.interests.includes(interest)
            ? formData.interests.filter(i => i !== interest)
            : [...formData.interests, interest];
        updateFormData('interests', newInterests);
    };

    const handlePickAvatar = async () => {
        try {
            const results = await MediaService.pickImageFromGallery(false);
            if (results.length > 0) {
                updateFormData('avatarUri', results[0].uri);
            }
        } catch (err) {
            console.error('Error picking avatar:', err);
        }
    };

    const handleRegister = async () => {
        if (!agreeTerms) {
            setErrors(prev => ({ ...prev, terms: 'Required' }));
            return;
        }

        const success = await register({
            email: formData.email.trim(),
            password: formData.password,
            username: formData.username.trim(),
            displayName: formData.displayName.trim(),
            bio: formData.bio.trim(),
            avatar: formData.avatarUri,
            interests: formData.interests,
        });

        if (success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Navigation is handled centrally by _layout.tsx when auth state changes.
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {[1, 2, 3].map(i => (
                <View
                    key={i}
                    style={[
                        styles.stepDot,
                        { backgroundColor: i <= step ? colors.primary : colors.surface }
                    ]}
                />
            ))}
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text variant="h2" style={styles.title}>Join ChatBox</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                Enter your credentials to get started
            </Text>

            <Input
                label="EMAIL"
                placeholder="your@email.com"
                value={formData.email}
                onChangeText={t => updateFormData('email', t)}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
                error={errors.email}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Input
                ref={passwordRef}
                label="PASSWORD"
                placeholder="Choose a strong password"
                value={formData.password}
                onChangeText={t => updateFormData('password', t)}
                isPassword
                leftIcon="lock-closed-outline"
                error={errors.password}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
            />
            {formData.password.length > 0 && (
                <PasswordStrength strength={passwordValidation.strength} />
            )}

            <Input
                ref={confirmRef}
                label="CONFIRM PASSWORD"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChangeText={t => updateFormData('confirmPassword', t)}
                isPassword
                leftIcon="lock-closed-outline"
                error={errors.confirmPassword}
                returnKeyType="done"
            />

            <Button
                title="Continue"
                onPress={nextStep}
                style={styles.mainBtn}
                rightIcon="arrow-forward"
            />

            <Divider text="OR" />

            <View style={styles.socialRow}>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: colors.surface }]}>
                    <Ionicons name="logo-google" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialBtn, { backgroundColor: colors.surface }]}>
                    <Ionicons name="logo-apple" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text variant="h2" style={styles.title}>Perfect Your Profile</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                Tell everyone who you are
            </Text>

            <View style={styles.avatarPicker}>
                <TouchableOpacity onPress={handlePickAvatar}>
                    <Avatar
                        size={100}
                        uri={formData.avatarUri}
                        fallback={formData.username || formData.displayName || 'User'}
                    />
                    <View style={[styles.avatarEdit, { backgroundColor: colors.primary }]}>
                        <Ionicons name="camera" size={16} color={colors.background} />
                    </View>
                </TouchableOpacity>
            </View>

            <Input
                label="USERNAME"
                placeholder="Choose a unique username"
                value={formData.username}
                onChangeText={t => updateFormData('username', t)}
                leftIcon="at-outline"
                error={errors.username}
                hint="3-20 chars, letters, numbers, underscores"
                autoCapitalize="none"
            />

            <Input
                ref={displayNameRef}
                label="DISPLAY NAME"
                placeholder="Your friendly name"
                value={formData.displayName}
                onChangeText={t => updateFormData('displayName', t)}
                leftIcon="person-outline"
                error={errors.displayName}
            />

            <Input
                ref={bioRef}
                label="BIO (OPTIONAL)"
                placeholder="A little bit about yourself"
                value={formData.bio}
                onChangeText={t => updateFormData('bio', t)}
                multiline
                numberOfLines={3}
                style={{ height: 100 }}
            />

            <View style={styles.stepBtnRow}>
                <Button
                    title="Back"
                    onPress={prevStep}
                    variant="outline"
                    style={styles.halfBtn}
                />
                <Button
                    title="Continue"
                    onPress={nextStep}
                    style={styles.halfBtn}
                />
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text variant="h2" style={styles.title}>Your Interests</Text>
            <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                Select topics you love to help us find communities for you
            </Text>

            <View style={styles.interestsContainer}>
                {interestTags.map(tag => {
                    const isSelected = formData.interests.includes(tag.label);
                    return (
                        <TouchableOpacity
                            key={tag.id}
                            onPress={() => toggleInterest(tag.label)}
                            style={[
                                styles.interestChip,
                                { backgroundColor: isSelected ? colors.primary : colors.surface }
                            ]}
                        >
                            <Text
                                variant="bodySmall"
                                color={isSelected ? colors.background : colors.text}
                            >
                                {tag.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
            >
                <Ionicons
                    name={agreeTerms ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={agreeTerms ? colors.primary : colors.textSecondary}
                />
                <Text
                    variant="caption"
                    color={errors.terms ? colors.error : colors.textSecondary}
                    style={styles.termsText}
                >
                    I agree to ChatBox's Terms of Service and Privacy Policy
                </Text>
            </TouchableOpacity>

            <View style={styles.stepBtnRow}>
                <Button
                    title="Back"
                    onPress={prevStep}
                    variant="outline"
                    style={styles.halfBtn}
                />
                <Button
                    title="Finish"
                    onPress={handleRegister}
                    loading={isLoading}
                    style={styles.halfBtn}
                />
            </View>
        </View>
    );

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
                    <View style={styles.navHeader}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        {renderStepIndicator()}
                        <View style={{ width: 24 }} />
                    </View>

                    {error && (
                        <View style={[styles.errorBanner, { backgroundColor: colors.error + '20' }]}>
                            <Ionicons name="alert-circle" size={18} color={colors.error} />
                            <Text variant="bodySmall" color={colors.error} style={{ marginLeft: Spacing.sm }}>
                                {error}
                            </Text>
                        </View>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    <View style={styles.footerLnk}>
                        <Text variant="bodySmall" color={colors.textSecondary}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text variant="bodySmall" color={colors.primary}>Log In</Text>
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
        paddingBottom: Spacing.xxl
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    stepIndicator: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    stepDot: {
        width: 24,
        height: 6,
        borderRadius: 3,
    },
    stepContainer: {
        flex: 1,
    },
    title: {
        marginBottom: Spacing.xs,
    },
    subtitle: {
        marginBottom: Spacing.xl,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: Spacing.round.md,
        marginBottom: Spacing.md,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginVertical: Spacing.md,
    },
    socialBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPicker: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    avatarEdit: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    interestChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Spacing.round.full,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.xl,
        marginTop: Spacing.sm,
    },
    termsText: {
        marginLeft: Spacing.sm,
        flex: 1,
        lineHeight: 18,
    },
    mainBtn: {
        height: 56,
        marginTop: Spacing.lg,
    },
    stepBtnRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    halfBtn: {
        flex: 1,
        height: 56,
    },
    footerLnk: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: Spacing.xxl,
        paddingBottom: Spacing.xl,
    },
});
