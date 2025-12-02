/**
 * Sign In Screen
 * Modern sign-in interface with form validation and Supabase integration
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { KeyboardAwareContainer } from '@/components/common/keyboard-aware-container';
import { SafeContainer } from '@/components/common/safe-container';
import { Button, Card, Input } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store';
import { SignInData, signInSchema } from '@/utils/validation';

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInData) => {
    const result = await signIn(data.email, data.password);
    
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Sign In Failed', result.error || 'Please try again');
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/(auth)/sign-up');
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
            style={styles.headerContainer}
            animate={{ opacity: 1, translateY: 0 }}
            from={{ opacity: 0, translateY: -20 }}
            transition={{ type: 'timing', duration: 600 }}
          >
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
              <IconSymbol name="message.circle.fill" size={40} color={theme.colors.textInverse} />
            </View>
            
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Welcome Back
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Sign in to your ChatBox account
            </Text>
          </MotiView>

          {/* Sign In Form */}
          <MotiView
            animate={{ opacity: 1, translateY: 0 }}
            from={{ opacity: 0, translateY: 30 }}
            transition={{ type: 'timing', duration: 600, delay: 200 }}
          >
            <Card padding="lg" style={styles.formCard}>
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
                    leftIcon="envelope"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    isRequired
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    leftIcon="lock"
                    secureTextEntry={!showPassword}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    autoComplete="password"
                    textContentType="password"
                    isRequired
                  />
                )}
              />

              <Button
                title={isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
                onPress={handleSubmit(onSubmit)}
                isLoading={isSubmitting || isLoading}
                isFullWidth
                style={styles.signInButton}
              />

              <Button
                title="Forgot Password?"
                variant="ghost"
                size="sm"
                onPress={handleForgotPassword}
                style={styles.forgotButton}
              />
            </Card>
          </MotiView>

          {/* Sign Up Link */}
          <MotiView
            style={styles.signUpContainer}
            animate={{ opacity: 1 }}
            from={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 400 }}
          >
            <Text style={[styles.signUpText, { color: theme.colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <Button
              title="Sign Up"
              variant="ghost"
              size="sm"
              onPress={handleSignUp}
              textStyle={{ color: theme.colors.primary }}
            />
          </MotiView>

          {/* Footer */}
          <MotiView
            style={styles.footer}
            animate={{ opacity: 1 }}
            from={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 600 }}
          >
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </MotiView>
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
    marginBottom: spacing.xxl,
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
  signInButton: {
    marginTop: spacing.md,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  signUpText: {
    fontSize: typography.fontSizes.md,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSizes.xs,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.xs,
  },
});