import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text variant="h1">Join Us</Text>
                        <Text variant="body" color={colors.textSecondary}>Create an account to start your journey with ChatBox.</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text variant="caption" color={colors.textSecondary} style={styles.label}>USERNAME</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                                placeholder="Choose a unique username"
                                placeholderTextColor={colors.textSecondary}
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text variant="caption" color={colors.textSecondary} style={styles.label}>EMAIL</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                                placeholder="Enter your email address"
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
                                placeholder="Create a strong password"
                                placeholderTextColor={colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <Text variant="caption" color={colors.textSecondary} style={styles.terms}>
                            By registering, you agree to ChatBox's Terms of Service and Privacy Policy.
                        </Text>

                        <Button
                            title="Register"
                            onPress={() => router.replace('/(tabs)/home')}
                            style={styles.btn}
                        />

                        <View style={styles.footer}>
                            <Text variant="bodySmall" color={colors.textSecondary}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                <Text variant="bodySmall" color={colors.primary}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
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
    terms: {
        marginBottom: 32,
        lineHeight: 18,
    },
    btn: {
        height: 56,
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: 40,
    }
});
