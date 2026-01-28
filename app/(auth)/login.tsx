import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';

export default function LoginScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('frank@chatbox.com');
    const [password, setPassword] = useState('password123');

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text variant="h1">Welcome Back</Text>
                    <Text variant="body" color={colors.textSecondary}>We've missed you! Log in to continue chatting.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text variant="caption" color={colors.textSecondary} style={styles.label}>EMAIL</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text variant="caption" color={colors.textSecondary} style={styles.label}>PASSWORD</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                        <Text variant="caption" color={colors.primary} style={styles.forgotPass}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <Button
                        title="Log In"
                        onPress={() => router.replace('/(tabs)/home')}
                        style={styles.loginBtn}
                    />

                    <View style={styles.footer}>
                        <Text variant="bodySmall" color={colors.textSecondary}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text variant="bodySmall" color={colors.primary}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        padding: 24,
    },
    backBtn: {
        marginBottom: 32,
    },
    header: {
        marginBottom: 40,
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
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
    forgotPass: {
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    loginBtn: {
        height: 56,
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    }
});
