import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { PhoneAuthScreen } from '../screens/auth/PhoneAuthScreen';
import { OTPVerifyScreen } from '../screens/auth/OTPVerifyScreen';
import { EmailVerifyScreen } from '../screens/auth/EmailVerifyScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ProfileSetupScreen } from '../screens/auth/ProfileSetupScreen';
import { ROUTES } from '../constants/routes';

import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    const { user, firestoreUser } = useAuthStore();

    let initialRoute = ROUTES.AUTH.SPLASH;
    if (user) {
        if (!firestoreUser || !firestoreUser.username || !firestoreUser.onboardingComplete) {
            initialRoute = ROUTES.AUTH.ONBOARDING_STEPS;
        }
    }

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={initialRoute as any}
        >
            <Stack.Screen name={ROUTES.AUTH.SPLASH as any} component={SplashScreen} />
            <Stack.Screen name={ROUTES.AUTH.ONBOARDING as any} component={OnboardingScreen} />
            <Stack.Screen name={ROUTES.AUTH.LOGIN as any} component={LoginScreen} />
            <Stack.Screen name={ROUTES.AUTH.REGISTER as any} component={RegisterScreen} />
            <Stack.Screen name={ROUTES.AUTH.PHONE_AUTH as any} component={PhoneAuthScreen} />
            <Stack.Screen name={ROUTES.AUTH.OTP_VERIFY as any} component={OTPVerifyScreen} />
            <Stack.Screen name={ROUTES.AUTH.EMAIL_VERIFY as any} component={EmailVerifyScreen} />
            <Stack.Screen name={ROUTES.AUTH.FORGOT_PASSWORD as any} component={ForgotPasswordScreen} />
            <Stack.Screen name={ROUTES.AUTH.ONBOARDING_STEPS as any} component={ProfileSetupScreen} />
        </Stack.Navigator>
    );
}
