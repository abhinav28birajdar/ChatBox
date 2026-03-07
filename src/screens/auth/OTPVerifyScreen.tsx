import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';

export const OTPVerifyScreen: React.FC<any> = ({ navigation, route }) => {
    const { colors } = useTheme();
    const { confirmation, phoneNumber } = route.params;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (timer > 0) setTimer(timer - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < 6) {
            Alert.alert('Error', 'Please enter all 6 digits');
            return;
        }

        try {
            setLoading(true);
            await authService.verifyOTP(confirmation, code);
            // Redirection handled by Auth listener
        } catch (error: any) {
            Alert.alert('Verification Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < otp.length - 1) {
            inputs.current[index + 1]?.focus();
        } else if (!text && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setTimer(60);
        // Implement resend logic if necessary, or go back to phone screen
        Alert.alert('Resent', 'Verification code has been resent to ' + phoneNumber);
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
                <Text style={[styles.title, { color: colors.text }]}>Enter Code</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>We've sent a 6-digit verification code to <Text style={{ color: colors.text }}>{phoneNumber}</Text></Text>
            </View>

            <View style={styles.otpRow}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        style={[
                            styles.otpBox,
                            {
                                backgroundColor: colors.surface,
                                borderColor: digit ? colors.primary : colors.border,
                                color: colors.text
                            }
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        ref={(ref) => {
                            inputs.current[index] = ref;
                        }}
                        autoFocus={index === 0}
                    />
                ))}
            </View>

            <View style={styles.footer}>
                <Button
                    title="Verify & Continue"
                    onPress={handleVerify}
                    loading={loading}
                    style={styles.verifyButton}
                />

                <TouchableOpacity
                    style={styles.resend}
                    onPress={handleResend}
                    disabled={timer > 0}
                >
                    <Text style={[styles.resendText, { color: timer > 0 ? colors.textMuted : colors.primary }]}>
                        {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                    </Text>
                </TouchableOpacity>
            </View>
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
        marginBottom: 48,
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
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 48,
    },
    otpBox: {
        width: 48,
        height: 56,
        borderWidth: 2,
        borderRadius: 12,
        textAlign: 'center',
        fontSize: Typography.fontSize.xl,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'center',
    },
    verifyButton: {
        width: '100%',
    },
    resend: {
        marginTop: 32,
    },
    resendText: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.bold,
    },
});
