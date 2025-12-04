/**
 * Sign Up Screen
 * Modern registration interface with form validation and Supabase integration
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';

import { KeyboardAwareContainer } from '@/components/common/keyboard-aware-container';
import { SafeContainer } from '@/components/common/safe-container';
import { Button, Card, Input } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpData = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signUp, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      fullName: '',
    },
  });

  const onSubmit = async (data: SignUpData) => {
    const result = await signUp(data.email, data.password, data.username, data.fullName);
    
    if (result.success) {
      Alert.alert(
        'Account Created!',
        'Your account has been created successfully. Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.push('/(auth)/verify-email') }]
      );
    } else {
      Alert.alert('Registration Failed', result.error || 'An error occurred during registration');
    }
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <SafeContainer>
      <KeyboardAwareContainer>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.headerContainer}
          >
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <IconSymbol name="person.badge.plus" size={40} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Join our community and start chatting
            </Text>
          </MotiView>

          {/* Form */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
          >
            <Card style={styles.formCard}>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.fullName?.message}
                    autoCapitalize="words"
                    leftIcon="person"
                  />
                )}
              />

              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Username"
                    placeholder="Choose a username"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.username?.message}
                    autoCapitalize="none"
                    leftIcon="at"
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    leftIcon="envelope"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Create a password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    secureTextEntry={!showPassword}
                    leftIcon="lock"
                    rightIcon={showPassword ? "eye.slash" : "eye"}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    secureTextEntry={!showConfirmPassword}
                    leftIcon="lock"
                    rightIcon={showConfirmPassword ? "eye.slash" : "eye"}
                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                )}
              />

              <Button
                title="Create Account"
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading || isSubmitting}
                style={styles.signUpButton}
              />
            </Card>
          </MotiView>

          {/* Social Login */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.socialContainer}
          >
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            <Button
              title="Continue with Google"
              variant="outline"
              leftIcon="logo.google"
              onPress={() => Alert.alert('Coming Soon', 'Google sign-in will be available soon!')}
              style={styles.socialButton}
            />
          </MotiView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={handleSignIn} style={styles.signInContainer}>
              <Text style={[styles.signInText, { color: theme.colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <Text style={[styles.signInText, { color: theme.colors.primary, fontWeight: '600' }]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAwareContainer>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.lg,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.lg,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  signUpButton: {
    marginTop: spacing.md,
  },
  socialContainer: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  socialButton: {
    marginBottom: spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  signInText: {
    fontSize: typography.fontSizes.md,
  },
  footerText: {
    fontSize: typography.fontSizes.xs,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.xs,
  },
});