import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';

export const LoginScreen: React.FC<any> = ({ navigation }) => {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        try {
            setLoading(true);
            await authService.signInWithEmail(email, password);
            // Auth listener will handle redirection
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        // In a real app, use expo-auth-session/providers/google
        Alert.alert('Feature', 'Google Login would be integrated here using expo-auth-session.');
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
                <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Log in to your ChatBox account</Text>
            </View>

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

                <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    leftIcon="lock-outline"
                    containerStyle={styles.input}
                />

                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate(ROUTES.AUTH.FORGOT_PASSWORD)}
                >
                    <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
                </TouchableOpacity>

                <Button
                    title="Log In"
                    onPress={handleLogin}
                    loading={loading}
                    style={styles.loginButton}
                />

                <View style={styles.dividerRow}>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR CONTINUE WITH</Text>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                </View>

                <View style={styles.socialRow}>
                    <TouchableOpacity style={[styles.socialBtn, { borderColor: colors.border }]} onPress={handleGoogleLogin}>
                        <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
                        <Text style={[styles.socialBtnText, { color: colors.text }]}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialBtn, { borderColor: colors.border, marginLeft: 16 }]}
                        onPress={() => navigation.navigate(ROUTES.AUTH.PHONE_AUTH)}
                    >
                        <MaterialCommunityIcons name="phone" size={24} color={colors.primary} />
                        <Text style={[styles.socialBtnText, { color: colors.text }]}>Phone</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.AUTH.REGISTER)}>
                    <Text style={[styles.footerLink, { color: colors.primary }]}>Sign Up</Text>
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
        paddingTop: 80,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: Typography.fontSize.xxl,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginVertical: 16,
    },
    forgotText: {
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.semiBold,
    },
    loginButton: {
        marginTop: 8,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 32,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: Typography.fontSize.xs,
        fontFamily: Typography.fontFamily.bold,
        letterSpacing: 0.5,
    },
    socialRow: {
        flexDirection: 'row',
    },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderWidth: 1,
        borderRadius: 12,
    },
    socialBtnText: {
        marginLeft: 12,
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.bold,
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
