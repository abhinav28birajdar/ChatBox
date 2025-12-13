import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HelpOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export default function AccountRecoveryHelpScreen() {
  const router = useRouter();

  const helpOptions: HelpOption[] = [
    {
      id: 'email',
      title: 'Try Different Email',
      description: 'Use another email address associated with your account',
      icon: '📧',
      action: () => router.push('/(auth)/forgot-password')
    },
    {
      id: 'phone',
      title: 'SMS Recovery',
      description: 'Get recovery code via SMS if you have phone verification enabled',
      icon: '📱',
      action: () => {
        // Feature not yet implemented
        alert('SMS recovery coming soon');
      }
    },
    {
      id: 'backup',
      title: 'Use Backup Codes',
      description: 'Enter one of your saved backup authentication codes',
      icon: '🔑',
      action: () => {
        // Feature not yet implemented
        alert('Backup codes feature coming soon');
      }
    },
    {
      id: 'social',
      title: 'Social Account Recovery',
      description: 'Sign in with Google or Apple if linked to your account',
      icon: '🔗',
      action: () => router.push('/(auth)/sign-in')
    },
    {
      id: 'support',
      title: 'Contact Support',
      description: 'Get help from our support team for manual account recovery',
      icon: '💬',
      action: () => {
        // Feature not yet implemented
        alert('Support contact feature coming soon');
      }
    },
    {
      id: 'documentation',
      title: 'View Help Documentation',
      description: 'Learn more about account recovery options',
      icon: '📚',
      action: () => {
        Linking.openURL('https://help.chatbox.com/account-recovery');
      }
    }
  ];

  const handleBackToSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  const handleCreateNewAccount = () => {
    router.push('/(auth)/sign-up');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.iconText}>🆘</Text>
            <ThemedText style={styles.title}>Account Recovery Help</ThemedText>
            <ThemedText style={styles.subtitle}>
              Can't access your account? Try one of these recovery options.
            </ThemedText>
          </View>

          <View style={styles.optionsContainer}>
            {helpOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={option.action}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <View style={styles.optionTextContainer}>
                    <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
                    <ThemedText style={styles.optionDescription}>{option.description}</ThemedText>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.emergencySection}>
            <View style={styles.emergencyCard}>
              <Text style={styles.emergencyIcon}>⚠️</Text>
              <ThemedText style={styles.emergencyTitle}>Account Compromised?</ThemedText>
              <ThemedText style={styles.emergencyDescription}>
                If you believe your account has been hacked or compromised, 
                contact our security team immediately.
              </ThemedText>
              <TouchableOpacity style={styles.emergencyButton}>
                <Text style={styles.emergencyButtonText}>Report Security Issue</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomActions}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleBackToSignIn}
            >
              <ThemedText style={styles.secondaryButtonText}>
                ← Back to Sign In
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleCreateNewAccount}
            >
              <Text style={styles.primaryButtonText}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  iconText: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9FB',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
  },
  chevron: {
    fontSize: 20,
    color: '#C7C7CC',
    fontWeight: 'bold',
  },
  emergencySection: {
    marginBottom: 32,
  },
  emergencyCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E53E3E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#C53030',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#E53E3E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    gap: 16,
    marginBottom: 32,
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});