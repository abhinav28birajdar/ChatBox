import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/context/AuthContext';

export default function EditProfileScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { userProfile, updateUser, updateAvatar } = useAuth();

    const [displayName, setDisplayName] = useState(userProfile?.displayName ?? '');
    const [username, setUsername] = useState(userProfile?.username ?? '');
    const [bio, setBio] = useState(userProfile?.bio ?? '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!displayName.trim() || !username.trim()) return;
        setSaving(true);
        try {
            await updateUser({
                displayName: displayName.trim(),
                username: username.trim(),
                bio: bio.trim()
            });
            router.back();
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const handlePickAvatar = async () => {
        try {
            const MediaService = (await import('@/services/MediaService')).default;
            const images = await MediaService.pickImageFromGallery(false);
            if (images.length > 0) {
                setSaving(true);
                await updateAvatar(images[0].uri);
                setSaving(false);
            }
        } catch (error) {
            console.error('Avatar pick failed:', error);
            setSaving(false);
        }
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={{ marginLeft: Spacing.md }}>Edit Profile</Text>
                <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleSave} disabled={saving}>
                    <Text variant="button" color={colors.primary}>{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Avatar size="xl" uri={userProfile?.avatar} fallback={userProfile?.displayName} />
                        <TouchableOpacity
                            style={[styles.changeAvatarBtn, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                            onPress={handlePickAvatar}
                            disabled={saving}
                        >
                            <Ionicons name="camera-outline" size={32} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text variant="bodySmall" color={colors.primary} style={{ marginTop: Spacing.md }}>Change Avatar</Text>
                </View>

                <Input
                    label="DISPLAY NAME"
                    value={displayName}
                    onChangeText={setDisplayName}
                    leftIcon="person-outline"
                />
                <Input
                    label="USERNAME"
                    value={username}
                    onChangeText={setUsername}
                    leftIcon="at-outline"
                    hint="3-20 chars, letters, numbers, underscores"
                />
                <Input
                    label="BIO"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    hint={`${bio.length}/190`}
                    style={{ height: 100, textAlignVertical: 'top' }}
                />
                <Input
                    label="EMAIL"
                    value={userProfile?.email ?? ''}
                    editable={false}
                    leftIcon="mail-outline"
                    hint="Contact support to change email"
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center',
        padding: Spacing.lg, borderBottomWidth: 1,
    },
    content: { padding: Spacing.lg },
    avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
    avatarWrapper: {
        position: 'relative', width: 80, height: 80,
        borderRadius: 40, overflow: 'hidden',
    },
    changeAvatarBtn: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center', justifyContent: 'center',
    },
});
