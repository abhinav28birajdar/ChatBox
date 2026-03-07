import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export const EmailVerifyScreen: React.FC<any> = ({ navigation }) => {
    const { colors } = useTheme();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [resent, setResent] = useState(false);

    useEffect(() => {
        // Poll for verification status
        const interval = setInterval(async () => {
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    clearInterval(interval);
                    // Navigation handled by Auth listener
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [user]);

    const handleResend = async () => {
        try {
            setLoading(true);
            await authService.sendVerificationEmail();
            setResent(true);
            setTimeout(() => setResent(false), 30000);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.signOut();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <MaterialCommunityIcons name="email-check-outline" size={60} color={colors.primary} />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Verify your Email</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    We've sent a verification link to <Text style={{ color: colors.text, fontWeight: 'bold' }}>{user?.email}</Text>. Please check your inbox and click the link.
                </Text>

                <View style={styles.footer}>
                    <Button
                        title="Check Verification Status"
                        onPress={async () => {
                            setLoading(true);
                            await user?.reload();
                            if (user?.emailVerified) {
                                // Redirection handled by RootNavigator
                            } else {
                                Alert.alert('Not Verified', 'Your email is not yet verified. Please check your inbox.');
                            }
                            setLoading(false);
                        }}
                        loading={loading}
                        style={{ marginBottom: 12 }}
                    />

                    <Button
                        title={resent ? "Email Resent!" : "Resend Verification Email"}
                        onPress={handleResend}
                        loading={loading}
                        disabled={resent}
                        variant={resent ? "outline" : "primary"}
                        style={styles.button}
                    />

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: Typography.fontSize.xxl,
        fontFamily: Typography.fontFamily.bold,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.regular,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    footer: {
        width: '100%',
        marginTop: 48,
    },
    button: {
        width: '100%',
    },
    logoutBtn: {
        marginTop: 24,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.bold,
    },
});
