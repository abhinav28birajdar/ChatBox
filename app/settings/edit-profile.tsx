import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function EditProfileScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [name, setName] = useState('Frank Vale');
    const [username, setUsername] = useState('frank_dev');
    const [bio, setBio] = useState('Building things with React Native. 🚀');

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={{ marginLeft: 16 }}>Edit Profile</Text>
                <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => router.back()}>
                    <Text variant="button" color={colors.primary}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Avatar size="xl" source="https://i.pravatar.cc/150?u=me" />
                        <TouchableOpacity style={[styles.changeAvatarBtn, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                            <Ionicons name="camera-outline" size={32} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <Text variant="bodySmall" color={colors.primary} style={{ marginTop: 16 }}>Change Avatar</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text variant="caption" color={colors.textSecondary} style={styles.label}>DISPLAY NAME</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text variant="caption" color={colors.textSecondary} style={styles.label}>USERNAME</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text variant="caption" color={colors.textSecondary} style={styles.label}>BIO</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, height: 100, textAlignVertical: 'top' }]}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                        />
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    content: {
        padding: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarWrapper: {
        position: 'relative',
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
    },
    changeAvatarBtn: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        marginBottom: 8,
        fontWeight: '700',
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    }
});
