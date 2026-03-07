import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';

export const ForgotPasswordScreen: React.FC<any> = ({ navigation }) => {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            await authService.sendPasswordReset(email);
            setSent(true);
        } catch (error: any) {
            Alert.alert('Reset Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            contentContainerStyle={styles.content}
        >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{sent ? "Check Email" : "Reset Password"}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {sent
                        ? `We've sent a password reset link to ${email}. Please check your inbox.`
                        : "Enter your email address and we'll send you a link to reset your password."}
                </Text>
            </View>

            {!sent && (
                <View style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="name@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="email-outline"
                    />

                    <Button
                        title="Send Reset Link"
                        onPress={handleReset}
                        loading={loading}
                        style={styles.button}
                    />
                </View>
            )}

            {sent && (
                <Button
                    title="Back to Login"
                    onPress={() => navigation.navigate(ROUTES.AUTH.LOGIN)}
                    style={styles.button}
                />
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingTop: 60,
        height: '100%',
    },
    backButton: {
        marginBottom: 32,
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
        lineHeight: 22,
    },
    form: {
        marginBottom: 40,
    },
    button: {
        marginTop: 32,
    },
});
