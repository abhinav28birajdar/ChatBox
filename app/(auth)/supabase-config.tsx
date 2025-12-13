/**
 * Supabase Configuration Screen
 * Secure API key input and storage
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { borderRadius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
    saveSupabaseConfig,
    validateSupabaseKey,
    validateSupabaseUrl,
} from '@/utils/secure-config';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupabaseConfigScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSave = async () => {
    // Validate inputs
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter your Supabase URL');
      return;
    }

    if (!anonKey.trim()) {
      Alert.alert('Error', 'Please enter your Supabase anon key');
      return;
    }

    if (!validateSupabaseUrl(url.trim())) {
      Alert.alert('Error', 'Invalid Supabase URL format. Should be like: https://xxxxx.supabase.co');
      return;
    }

    if (!validateSupabaseKey(anonKey.trim())) {
      Alert.alert('Error', 'Invalid anon key format. Please check your key.');
      return;
    }

    setIsLoading(true);

    try {
      await saveSupabaseConfig({
        url: url.trim(),
        anonKey: anonKey.trim(),
      });

      Alert.alert(
        'Success',
        'Configuration saved successfully!',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(auth)/welcome'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save configuration. Please try again.');
      console.error('Save config error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
            style={styles.header}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <IconSymbol name="server.rack" size={48} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Configure Supabase
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Enter your Supabase project credentials to get started
            </Text>
          </MotiView>

          {/* Form */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 200 }}
            style={styles.form}
          >
            {/* URL Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Supabase URL <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <IconSymbol name="link" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="https://xxxxx.supabase.co"
                  placeholderTextColor={theme.colors.textMuted}
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  returnKeyType="next"
                />
              </View>
              <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
                Find this in your Supabase project settings
              </Text>
            </View>

            {/* Anon Key Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Anon/Public Key <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <IconSymbol name="key" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={anonKey}
                  onChangeText={setAnonKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showKey}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
                <TouchableOpacity onPress={() => setShowKey(!showKey)}>
                  <IconSymbol
                    name={showKey ? 'eye.slash' : 'eye'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
                Your public API key (starts with "eyJ...")
              </Text>
            </View>

            {/* Info Box */}
            <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30' }]}>
              <IconSymbol name="info.circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                Your credentials are stored securely on your device using encrypted storage
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
                isLoading && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </Text>
            </TouchableOpacity>
          </MotiView>

          {/* Help Link */}
          <TouchableOpacity style={styles.helpLink}>
            <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
              Need help finding your credentials?
            </Text>
            <Text style={[styles.helpTextBold, { color: theme.colors.primary }]}>
              View Documentation
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.md,
    paddingHorizontal: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.md,
  },
  hint: {
    fontSize: typography.fontSizes.sm,
  },
  infoBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.sm,
  },
  saveButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
  },
  helpLink: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  helpText: {
    fontSize: typography.fontSizes.sm,
  },
  helpTextBold: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
});