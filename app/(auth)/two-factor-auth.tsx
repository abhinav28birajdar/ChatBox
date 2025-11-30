import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function TwoFactorAuthScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCodeChange = (value: string, index: number) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        // Focus next input logic would go here
      }
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete authentication code');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement actual 2FA verification logic
      console.log('Verifying 2FA code:', verificationCode);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Authentication successful!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)')
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Invalid authentication code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseBackupCode = () => {
    Alert.alert(
      'Backup Code', 
      'Please enter one of your backup codes',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Enter Backup Code',
          onPress: () => {
            // TODO: Navigate to backup code screen
            Alert.alert('Coming Soon', 'Backup code entry will be available soon!');
          }
        }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help with two-factor authentication?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Get Help',
          onPress: () => router.push('/support/help')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.iconText}>🔐</Text>
          <ThemedText style={styles.title}>Two-Factor Authentication</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter the 6-digit code from your authenticator app to complete sign in.
          </ThemedText>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.codeInput}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, isLoading && styles.disabledButton]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          <Text style={styles.verifyButtonText}>
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </Text>
        </TouchableOpacity>

        <View style={styles.alternativeOptions}>
          <TouchableOpacity 
            style={styles.backupCodeButton}
            onPress={handleUseBackupCode}
          >
            <ThemedText style={styles.backupCodeText}>
              Use backup code instead
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <ThemedText style={styles.supportText}>
              Having trouble? Contact Support
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🛡️</Text>
          <ThemedText style={styles.securityText}>
            This extra step helps keep your account secure
          </ThemedText>
        </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#F9F9FB',
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  disabledButton: {
    backgroundColor: '#E5E5E7',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  alternativeOptions: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backupCodeButton: {
    marginBottom: 16,
  },
  backupCodeText: {
    color: '#007AFF',
    fontSize: 16,
  },
  supportButton: {
    paddingVertical: 8,
  },
  supportText: {
    color: '#007AFF',
    fontSize: 14,
    opacity: 0.8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#1D4ED8',
    textAlign: 'center',
  },
});