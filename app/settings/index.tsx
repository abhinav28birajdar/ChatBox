/**
 * Settings Screen
 * App settings including theme, notifications, API keys, etc.
 */

import { SafeContainer } from '@/components/common/safe-container';
import { Button, Card } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { analyticsService } from '@/services';
import { useAuthStore } from '@/store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            analyticsService.trackSignOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const handleManageApiKeys = () => {
    router.push('/(auth)/supabase-config' as any);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cache clearing
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  return (
    <SafeContainer>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Profile Section */}
          <Card variant="outlined" padding="md" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Account
            </Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/profile/edit')}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name="person.circle" size={24} color={theme.colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                    Edit Profile
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    {user?.username || user?.email}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </Card>

          {/* Theme Section */}
          <Card variant="outlined" padding="md" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Appearance
            </Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                // TODO: Implement theme picker
                Alert.alert('Theme', 'Theme selection coming soon');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name="paintbrush" size={24} color={theme.colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                    Theme
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    {theme.isDark ? 'Dark' : 'Light'}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </Card>

          {/* Notifications Section */}
          <Card variant="outlined" padding="md" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Notifications
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <IconSymbol name="bell" size={24} color={theme.colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                    Push Notifications
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    Receive message alerts
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <IconSymbol name="speaker.wave.2" size={24} color={theme.colors.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Sound
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <IconSymbol name="iphone.radiowaves.left.and.right" size={24} color={theme.colors.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  Vibration
                </Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>

          {/* Advanced Section */}
          <Card variant="outlined" padding="md" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Advanced
            </Text>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleManageApiKeys}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name="key" size={24} color={theme.colors.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                    Manage API Keys
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    Configure Supabase credentials
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleClearCache}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <IconSymbol name="trash" size={24} color={theme.colors.warning} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                    Clear Cache
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                    Free up storage space
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </Card>

          {/* Sign Out Button */}
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            style={styles.signOutButton}
          />

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={[styles.appInfoText, { color: theme.colors.textMuted }]}>
              ChatBox v1.0.0
            </Text>
            <Text style={[styles.appInfoText, { color: theme.colors.textMuted }]}>
              Made with ❤️ using React Native + Expo
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  settingSubtitle: {
    fontSize: typography.fontSizes.sm,
    marginTop: 2,
  },
  signOutButton: {
    marginBottom: spacing.lg,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  appInfoText: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.xs,
  },
});
