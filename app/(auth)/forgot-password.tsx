import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>

                {setIsSent ? (
                    <View style={styles.header}>
                        <Text variant="h1">Forgot Password?</Text>
                        <Text variant="body" color={colors.textSecondary}>
                            Don't worry, it happens! Enter your email and we'll send you a reset link.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.success}>
                        <View style={[styles.successIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="mail" size={60} color={colors.primary} />
                        </View>
                        <Text variant="h1" align="center">Check Your Email</Text>
                        <Text variant="body" align="center" color={colors.textSecondary}>
                            We've sent a password reset link to {email}.
                        </Text>
                    </View>
                )}

                {!isSent && (
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text variant="caption" color={colors.textSecondary} style={styles.label}>EMAIL</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                                placeholder="Enter your registered email"
                                placeholderTextColor={colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <Button
                            title="Send Reset Link"
                            onPress={() => setIsSent(true)}
                            style={styles.btn}
                        />
                    </View>
                )}

                {isSent && (
                    <Button
                        title="Return to Login"
                        onPress={() => router.replace('/(auth)/login')}
                        variant="ghost"
                        style={{ marginTop: 40 }}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    backBtn: {
        marginBottom: 32,
    },
    header: {
        marginBottom: 40,
    },
    success: {
        alignItems: 'center',
        marginTop: 40,
    },
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    form: {
        marginTop: 20,
    },
    inputContainer: {
        marginBottom: 32,
    },
    label: {
        marginBottom: 8,
        fontWeight: '700',
    },
    input: {
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    btn: {
        height: 56,
    }
});
