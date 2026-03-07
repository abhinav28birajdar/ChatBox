import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import app from '../../config/firebase';

export const PhoneAuthScreen: React.FC<any> = ({ navigation }) => {
    const { colors } = useTheme();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const recaptchaVerifier = useRef<any>(null);

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number with country code');
            return;
        }

        try {
            setLoading(true);
            const confirmation = await authService.signInWithPhone(phoneNumber, recaptchaVerifier.current);
            navigation.navigate(ROUTES.AUTH.OTP_VERIFY, { confirmation, phoneNumber });
        } catch (error: any) {
            Alert.alert('Verification Failed', 'Failed to send OTP. Please check your number and try again. ' + error.message);
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
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={app.options}
            />

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={28} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Verify Phone</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enter your phone number to receive a 6-digit verification code.</Text>
            </View>

            <View style={styles.form}>
                <Input
                    label="Phone Number"
                    placeholder="+1 234 567 8900"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    leftIcon="phone-outline"
                />

                <Button
                    title="Send Verification Code"
                    onPress={handleSendOTP}
                    loading={loading}
                    style={styles.button}
                />
            </View>

            <Text style={[styles.infoText, { color: colors.textMuted }]}>
                By tapping "Send Verification Code", you may receive an SMS for verification. Message and data rates may apply.
            </Text>
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
    infoText: {
        fontSize: Typography.fontSize.xs,
        fontFamily: Typography.fontFamily.regular,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 18,
    },
});
