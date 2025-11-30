import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: 'individual',
      title: 'Individual User',
      description: 'Personal account for messaging, shopping, and connecting',
      icon: '👤',
    },
    {
      id: 'creator',
      title: 'Content Creator',
      description: 'Share your skills, create courses, and build your audience',
      icon: '🎨',
    },
    {
      id: 'business',
      title: 'Business Owner',
      description: 'Sell products, manage your business, and reach customers',
      icon: '🏢',
    },
    {
      id: 'teacher',
      title: 'Teacher/Educator',
      description: 'Teach online courses and share knowledge with students',
      icon: '🎓',
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      router.push('/(auth)/sign-up');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Choose Your Role</ThemedText>
          <ThemedText style={styles.subtitle}>
            Help us personalize your experience
          </ThemedText>
        </View>

        <ScrollView style={styles.rolesContainer} showsVerticalScrollIndicator={false}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.selectedRoleCard,
              ]}
              onPress={() => setSelectedRole(role.id)}
            >
              <View style={styles.roleHeader}>
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <View style={styles.roleInfo}>
                  <ThemedText style={styles.roleTitle}>{role.title}</ThemedText>
                  <ThemedText style={styles.roleDescription}>
                    {role.description}
                  </ThemedText>
                </View>
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radio,
                      selectedRole === role.id && styles.selectedRadio,
                    ]}
                  >
                    {selectedRole === role.id && <View style={styles.radioInner} />}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedRole && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedRole}
          >
            <Text style={[
              styles.continueButtonText,
              !selectedRole && styles.disabledButtonText,
            ]}>
              Continue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <ThemedText style={styles.skipButtonText}>Skip for now</ThemedText>
          </TouchableOpacity>
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
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  rolesContainer: {
    flex: 1,
  },
  roleCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5E7',
    backgroundColor: '#FAFAFA',
  },
  selectedRoleCard: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  roleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  radioContainer: {
    marginLeft: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    borderColor: '#007AFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  bottomContainer: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#E5E5E7',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});