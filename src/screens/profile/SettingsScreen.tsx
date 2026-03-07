import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, TextInput, Share } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function SettingsScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<any>();
    const { user, firestoreUser } = useAuthStore();
    const { setMode } = useThemeStore();

    const [displayName, setDisplayName] = useState(firestoreUser?.displayName || '');
    const [username, setUsername] = useState(firestoreUser?.username || '');
    const [bio, setBio] = useState(firestoreUser?.bio || '');
    const [about, setAbout] = useState(firestoreUser?.about || '');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            await userService.updateProfile({
                displayName,
                username,
                bio,
                about,
            });
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: async () => await authService.signOut() }
        ]);
    };

    const handleShareProfile = async () => {
        try {
            await Share.share({
                message: `Check out my profile on ChatBox! @${firestoreUser?.username || 'user'}\nDownload the app to chat and explore our marketplace!`,
                title: 'ChatBox Profile',
            });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const SettingItem = ({ icon, label, value, onValueChange, type = 'switch', onPress }: any) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={onPress}
            disabled={type === 'switch'}
        >
            <View style={styles.settingIcon}>
                <Ionicons name={icon} size={22} color={colors.textSecondary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
            {type === 'switch' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ true: colors.primary, false: colors.border }}
                    thumbColor="#fff"
                />
            ) : (
                <View style={styles.settingRight}>
                    {value ? <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text> : null}
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Profile Edit Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT INFORMATION</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Full Name"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="@username"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Bio</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Describe yourself in one line"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>About</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={about}
                                onChangeText={setAbout}
                                placeholder="Detailed description about you"
                                multiline
                            />
                        </View>
                        <Button
                            title="Update Profile"
                            onPress={handleUpdateProfile}
                            loading={loading}
                            size="small"
                            style={styles.saveBtn}
                        />
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SettingItem
                            icon="moon-outline"
                            label="Dark Mode"
                            value={isDark}
                            onValueChange={(val: boolean) => setMode(val ? 'dark' : 'light')}
                        />
                        <SettingItem
                            icon="notifications-outline"
                            label="Push Notifications"
                            value={firestoreUser?.settings?.notifications ?? true}
                            onValueChange={(val: boolean) => userService.updateProfile({
                                settings: {
                                    theme: firestoreUser?.settings?.theme ?? 'system',
                                    notifications: val,
                                    pushNotifications: firestoreUser?.settings?.pushNotifications,
                                    locationSharing: firestoreUser?.settings?.locationSharing,
                                    darkMode: firestoreUser?.settings?.darkMode,
                                }
                            })}
                        />
                        <SettingItem
                            icon="eye-off-outline"
                            label="Presence (Show Online)"
                            value={firestoreUser?.isOnline ?? true}
                            onValueChange={(val: boolean) => userService.updateProfile({ isOnline: val })}
                        />
                    </View>
                </View>

                {/* Security Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SECURITY & SUPPORT</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SettingItem
                            icon="lock-closed-outline"
                            label="Change Password"
                            type="arrow"
                            onPress={() => navigation.navigate(ROUTES.MAIN.CHANGE_PASSWORD)}
                        />
                        <SettingItem
                            icon="help-circle-outline"
                            label="Help Center"
                            type="arrow"
                            onPress={() => navigation.navigate(ROUTES.MAIN.HELP_CENTER)}
                        />
                        <SettingItem
                            icon="document-text-outline"
                            label="Privacy Policy"
                            type="arrow"
                            onPress={() => navigation.navigate(ROUTES.MAIN.PRIVACY)}
                        />
                        <SettingItem
                            icon="share-social-outline"
                            label="Share Profile"
                            type="arrow"
                            onPress={handleShareProfile}
                        />
                    </View>
                </View>

                <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.error }]} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={24} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Typography.fontFamily.bold,
    },
    backBtn: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: Typography.fontFamily.bold,
        letterSpacing: 1,
        marginBottom: 16,
        marginLeft: 4,
    },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 0.5,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        flex: 1,
        fontSize: 15,
        fontFamily: Typography.fontFamily.medium,
        marginLeft: 12,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.regular,
        marginRight: 8,
    },
    inputGroup: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    label: {
        fontSize: 11,
        fontFamily: Typography.fontFamily.bold,
        marginBottom: 4,
    },
    input: {
        fontSize: 15,
        fontFamily: Typography.fontFamily.semiBold,
        padding: 0,
    },
    saveBtn: {
        margin: 16,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: 10,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.bold,
        marginLeft: 12,
    },
});
