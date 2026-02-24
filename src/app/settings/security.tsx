import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/context/AuthContext';
import { Spacing } from '@/constants/Spacing';

export default function SecuritySettings() {
    const { colors } = useTheme();
    const router = useRouter();
    const { logout, userProfile, deleteAccount, resetPassword } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!userProfile?.email) return;
        try {
            const success = await resetPassword(userProfile.email);
            if (success) {
                Alert.alert(
                    'Password Reset',
                    'A password reset link has been sent to your email.'
                );
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleLogoutAll = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out of all devices?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = async () => {
        if (Platform.OS === 'ios') {
            Alert.prompt(
                'Delete Account',
                'Please enter your password to confirm account deletion.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Confirm',
                        style: 'destructive',
                        onPress: async (password?: string) => {
                            if (!password) return;
                            try {
                                const success = await deleteAccount(password);
                                if (success) router.replace('/(auth)/login');
                            } catch (error: any) {
                                Alert.alert('Error', error.message);
                            }
                        }
                    }
                ],
                'secure-text'
            );
        } else {
            setDeletePassword('');
            setShowDeleteModal(true);
        }
    };

    const confirmDeleteAccount = async () => {
        if (!deletePassword) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }
        setDeleteLoading(true);
        try {
            const success = await deleteAccount(deletePassword);
            if (success) {
                setShowDeleteModal(false);
                router.replace('/(auth)/login');
            } else {
                Alert.alert('Error', 'Incorrect password. Please try again.');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete account');
        } finally {
            setDeleteLoading(false);
        }
    };

    const SecurityRow = ({ title, subtitle, icon, onPress, color = colors.text }: any) => (
        <TouchableOpacity style={styles.row} onPress={onPress}>
            <View style={styles.left}>
                <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text variant="subtitle2" style={{ color }}>{title}</Text>
                    <Text variant="caption" color={colors.textSecondary}>{subtitle}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={{ marginLeft: 16 }}>Security</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.summaryCard}>
                    <View style={[styles.shieldContainer, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="shield-checkmark" size={40} color={colors.success} />
                    </View>
                    <Text variant="subtitle1" style={{ marginTop: 16 }}>Your account is secure</Text>
                    <Text variant="caption" color={colors.textSecondary} align="center" style={{ marginTop: 8 }}>
                        We recommend enabling Two-Factor Authentication for maximum security.
                    </Text>
                </View>

                <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>PROTECTION</Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <SecurityRow
                        icon="key-outline"
                        title="Change Password"
                        subtitle="Update your security credentials"
                        onPress={handleChangePassword}
                    />
                    <SecurityRow
                        icon="phone-portrait-outline"
                        title="Two-Factor Auth"
                        subtitle="Extra layer of protection (Coming Soon)"
                        onPress={() => Alert.alert('Coming Soon', 'Two-Factor Authentication will be available in the next update.')}
                    />
                </View>

                <Text variant="caption" color={colors.textSecondary} style={[styles.sectionTitle, { marginTop: 32 }]}>DEVICES</Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <SecurityRow
                        icon="desktop-outline"
                        title="Current Session"
                        subtitle="This device"
                        onPress={() => { }}
                    />
                </View>

                <Text variant="caption" color={colors.textSecondary} style={[styles.sectionTitle, { marginTop: 32 }]}>DANGER ZONE</Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <SecurityRow
                        icon="trash-outline"
                        title="Delete Account"
                        subtitle="Permanently remove your account"
                        color={colors.error}
                        onPress={handleDeleteAccount}
                    />
                </View>

                <Button title="Log Out from All Devices" onPress={handleLogoutAll} variant="outline" style={{ marginTop: 32 }} />
            </ScrollView>

            {/* Android Delete Account Modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text variant="h4" style={{ marginBottom: 8 }}>Delete Account</Text>
                        <Text variant="body2" color={colors.textSecondary} style={{ marginBottom: Spacing.lg }}>
                            This action is permanent. Enter your password to confirm.
                        </Text>
                        <TextInput
                            style={[styles.modalInput, {
                                backgroundColor: colors.background,
                                color: colors.text,
                                borderColor: colors.border,
                            }]}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry
                            value={deletePassword}
                            onChangeText={setDeletePassword}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.background }]}
                                onPress={() => setShowDeleteModal(false)}
                                disabled={deleteLoading}
                            >
                                <Text variant="subtitle2">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.error }]}
                                onPress={confirmDeleteAccount}
                                disabled={deleteLoading}
                            >
                                <Text variant="subtitle2" style={{ color: '#fff' }}>
                                    {deleteLoading ? 'Deleting...' : 'Delete Account'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    },
    content: {
        padding: 20,
    },
    summaryCard: {
        alignItems: 'center',
        marginBottom: 32,
    },
    shieldContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontWeight: '800',
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    left: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        borderRadius: 16,
        padding: 24,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
});
