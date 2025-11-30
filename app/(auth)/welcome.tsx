import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/onboarding/slide-1');
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.appName}>ChatBox</ThemedText>
          <ThemedText style={styles.tagline}>Connect, Create, Communicate</ThemedText>
        </View>

        <View style={styles.featureList}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💬</Text>
            <ThemedText style={styles.featureText}>Real-time messaging</ThemedText>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎥</Text>
            <ThemedText style={styles.featureText}>Video & Voice calls</ThemedText>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📸</Text>
            <ThemedText style={styles.featureText}>Share moments</ThemedText>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🛒</Text>
            <ThemedText style={styles.featureText}>Buy & Sell</ThemedText>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
            <ThemedText style={styles.secondaryButtonText}>I already have an account</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.termsText}>
          By continuing, you agree to our{' '}
          <ThemedText style={styles.linkText}>Terms of Service</ThemedText>
          {' '}and{' '}
          <ThemedText style={styles.linkText}>Privacy Policy</ThemedText>
        </ThemedText>
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
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  featureList: {
    paddingVertical: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
  },
  buttonContainer: {
    gap: 16,
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
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    opacity: 0.7,
  },
  termsText: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#007AFF',
  },
});