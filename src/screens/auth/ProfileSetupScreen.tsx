import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import { storageService } from '../../services/storageService';
import { ROUTES } from '../../constants/routes';

export const ProfileSetupScreen: React.FC<any> = ({ navigation }) => {
    const { colors } = useTheme();
    const { user } = useAuthStore();
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleContinue = async () => {
        if (!username) {
            Alert.alert('Error', 'Please choose a username');
            return;
        }

        try {
            setLoading(true);
            let photoURL = avatar;
            if (avatar && (avatar.startsWith('file://') || avatar.startsWith('content://'))) {
                try {
                    photoURL = await storageService.uploadProfilePhoto(avatar, user?.uid || '');
                } catch (uploadError) {
                    console.warn('Avatar upload failed, continuing without it:', uploadError);
                    photoURL = ''; // Reset to empty if upload fails
                }
            }

            // Update profile with both username and displayName for consistency
            await userService.updateProfile({
                username,
                displayName: username,
                bio,
                photoURL: photoURL || '',
                onboardingComplete: true,
            });

            console.log('Profile updated successfully, onboarding complete');
            // RootNavigator will automatically switch to MAIN
        } catch (error: any) {
            console.error('Profile transition error:', error);
            Alert.alert('Error', 'Could not save profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Set Up Profile</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Add a photo and choose a unique username.</Text>
                </View>

                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage}>
                        <Avatar uri={avatar || undefined} size={120} />
                        <View style={[styles.editIcon, { backgroundColor: colors.primary }]}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>+</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Username"
                        placeholder="@username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        leftIcon="at"
                    />

                    <Input
                        label="Bio"
                        placeholder="Tell us a bit about yourself"
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        containerStyle={styles.bioInput}
                    />

                    <View style={styles.footer}>
                        <Button
                            title="Continue"
                            onPress={handleContinue}
                            loading={loading}
                            style={styles.button}
                        />

                        <TouchableOpacity
                            onPress={() => {
                                setAvatar(null);
                                handleContinue();
                            }}
                            disabled={loading}
                            style={styles.skipBtn}
                        >
                            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                                Skip for now
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingTop: 80,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: Typography.fontSize.xxxl,
        fontFamily: Typography.fontFamily.bold,
    },
    subtitle: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.regular,
        marginTop: 8,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    form: {
        marginBottom: 40,
    },
    bioInput: {
        marginTop: 16,
    },
    button: {
        marginTop: 48,
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    skipBtn: {
        marginTop: 16,
        padding: 8,
    },
    skipText: {
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.medium,
        textDecorationLine: 'underline',
    },
});
