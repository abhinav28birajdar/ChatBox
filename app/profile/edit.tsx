import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    bio: 'Software Developer | Tech Enthusiast | Coffee Lover ☕\n\nBuilding amazing mobile experiences with React Native. Always learning something new!',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    gender: 'Male'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const updateFormData = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual profile update logic
      console.log('Updating profile with:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUnsavedChanges(false);
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (unsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel'
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleChangePhoto = () => {
    router.push('/profile/change-photo' as any);
  };

  const handleIdVerification = () => {
    router.push('/profile/id-verification' as any);
  };

  const handleInterestsSkills = () => {
    router.push('/profile/interests-skills' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ThemedView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.disabledButton]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile Photo Section */}
            <TouchableOpacity style={styles.photoSection} onPress={handleChangePhoto}>
              <View style={styles.profilePhoto}>
                <Text style={styles.photoPlaceholder}>👤</Text>
              </View>
              <ThemedText style={styles.changePhotoText}>Change Profile Photo</ThemedText>
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Name Fields */}
              <View style={styles.nameContainer}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <ThemedText style={styles.label}>First Name</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => updateFormData('firstName', text)}
                    placeholder="First name"
                    placeholderTextColor="#8E8E93"
                    autoCapitalize="words"
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <ThemedText style={styles.label}>Last Name</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => updateFormData('lastName', text)}
                    placeholder="Last name"
                    placeholderTextColor="#8E8E93"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Username */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Username</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.username}
                  onChangeText={(text) => updateFormData('username', text)}
                  placeholder="Username"
                  placeholderTextColor="#8E8E93"
                  autoCapitalize="none"
                />
                <ThemedText style={styles.helpText}>
                  This is how others will find you on ChatBox
                </ThemedText>
              </View>

              {/* Bio */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Bio</ThemedText>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={formData.bio}
                  onChangeText={(text) => updateFormData('bio', text)}
                  placeholder="Tell people about yourself..."
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <ThemedText style={styles.helpText}>
                  {formData.bio.length}/500
                </ThemedText>
              </View>

              {/* Location */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Location</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) => updateFormData('location', text)}
                  placeholder="City, Country"
                  placeholderTextColor="#8E8E93"
                />
              </View>

              {/* Website */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Website</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.website}
                  onChangeText={(text) => updateFormData('website', text)}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor="#8E8E93"
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              {/* Phone */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Phone Number</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => updateFormData('phone', text)}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor="#8E8E93"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Date of Birth */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Date of Birth</ThemedText>
                <TouchableOpacity style={styles.dateButton}>
                  <ThemedText style={styles.dateText}>
                    {formData.dateOfBirth || 'Select date'}
                  </ThemedText>
                  <Text style={styles.chevron}>📅</Text>
                </TouchableOpacity>
                <ThemedText style={styles.helpText}>
                  Your age will not be shown publicly
                </ThemedText>
              </View>

              {/* Gender */}
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Gender</ThemedText>
                <TouchableOpacity style={styles.selectButton}>
                  <ThemedText style={styles.selectText}>
                    {formData.gender || 'Select gender'}
                  </ThemedText>
                  <Text style={styles.chevron}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Additional Options */}
            <View style={styles.additionalOptions}>
              <TouchableOpacity style={styles.optionButton} onPress={handleIdVerification}>
                <View style={styles.optionLeft}>
                  <Text style={styles.optionIcon}>✅</Text>
                  <View>
                    <ThemedText style={styles.optionTitle}>Verify Account</ThemedText>
                    <ThemedText style={styles.optionSubtitle}>Get verified badge</ThemedText>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton} onPress={handleInterestsSkills}>
                <View style={styles.optionLeft}>
                  <Text style={styles.optionIcon}>🎯</Text>
                  <View>
                    <ThemedText style={styles.optionTitle}>Interests & Skills</ThemedText>
                    <ThemedText style={styles.optionSubtitle}>Help others find you</ThemedText>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  disabledButton: {
    backgroundColor: '#E5E5E7',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5E7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPlaceholder: {
    fontSize: 40,
    opacity: 0.6,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
  },
  form: {
    paddingHorizontal: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 24,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9F9FB',
  },
  bioInput: {
    height: 100,
    paddingTop: 12,
  },
  helpText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9FB',
  },
  dateText: {
    fontSize: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9FB',
  },
  selectText: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 16,
    color: '#8E8E93',
  },
  additionalOptions: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 32,
  },
  optionButton: {
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
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
});