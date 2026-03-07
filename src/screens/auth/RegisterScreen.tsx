import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';

export const RegisterScreen: React.FC<any> = ({ navigation }) => {
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords does not match');
            return;
        }

        if (!termsAccepted) {
            Alert.alert('Error', 'Please accept the Terms of Service');
            return;
        }

        try {
            setLoading(true);
            await authService.signUpWithEmail(email, password, name);
            await authService.sendVerificationEmail();
            // Navigation to EMAIL_VERIFY will be handled by RootNavigator automatically
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Join ChatBox today and connect</Text>
            </View>

            <View style={styles.form}>
                <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                    leftIcon="account-outline"
                />

                <Input
                    label="Email Address"
                    placeholder="name@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="email-outline"
                    containerStyle={styles.input}
                />

                <Input
                    label="Password"
                    placeholder="Create a strong password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    leftIcon="lock-outline"
                    containerStyle={styles.input}
                />

                <Input
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    leftIcon="lock-check-outline"
                    containerStyle={styles.input}
                />

                <TouchableOpacity
                    style={styles.termsRow}
                    onPress={() => setTermsAccepted(!termsAccepted)}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name={termsAccepted ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color={termsAccepted ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                        I agree to the <Text style={{ color: colors.primary }}>Terms of Service</Text> and <Text style={{ color: colors.primary }}>Privacy Policy</Text>
                    </Text>
                </TouchableOpacity>

                <Button
                    title="Sign Up"
                    onPress={handleRegister}
                    loading={loading}
                    style={styles.registerButton}
                />
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.AUTH.LOGIN)}>
                    <Text style={[styles.footerLink, { color: colors.primary }]}>Log In</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingTop: 60,
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
    },
    form: {
        marginBottom: 40,
    },
    input: {
        marginTop: 16,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    termsText: {
        marginLeft: 12,
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.regular,
        flex: 1,
    },
    registerButton: {
        marginTop: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    footerText: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.regular,
    },
    footerLink: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.bold,
    },
});
