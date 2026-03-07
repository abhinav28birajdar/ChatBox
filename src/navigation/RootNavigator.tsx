import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { DirectMessageScreen } from '../screens/chat/DirectMessageScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import HelpCenterScreen from '../screens/profile/HelpCenterScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import UserDetailScreen from '../screens/profile/UserDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import QRCodeScreen from '../screens/profile/QRCodeScreen';
import { EmailVerifyScreen } from '../screens/auth/EmailVerifyScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useTheme } from '../hooks/useTheme';
import { ROUTES } from '../constants/routes';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { user, firestoreUser, isLoading } = useAuthStore();
    const { colors } = useTheme();

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    const isEmailVerified = user?.emailVerified || false;
    const hasFirestoreDoc = !!firestoreUser;
    const isOnboardingComplete = firestoreUser?.onboardingComplete || false;

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: colors.background }
                }}
            >
                {!user ? (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : !isEmailVerified ? (
                    <Stack.Screen name={ROUTES.AUTH.EMAIL_VERIFY} component={EmailVerifyScreen} />
                ) : !hasFirestoreDoc || !isOnboardingComplete ? (
                    // We stay in AuthNavigator for Onboarding steps (ProfileSetup, Interests, etc.)
                    // but we need to make sure AuthNavigator starts at the right step
                    <Stack.Screen name="OnboardingFlow" component={AuthNavigator} initialParams={{ screen: ROUTES.AUTH.ONBOARDING_STEPS }} />
                ) : (
                    <>
                        <Stack.Screen name="MAIN" component={MainTabNavigator} />

                        {/* Deep Screens (Stacked above Tabs) */}
                        <Stack.Group>
                            <Stack.Screen name={ROUTES.CHAT.DIRECT} component={DirectMessageScreen} />

                            <Stack.Screen name={ROUTES.MAIN.SETTINGS} component={SettingsScreen} />
                            <Stack.Screen name={ROUTES.MAIN.CHANGE_PASSWORD} component={ChangePasswordScreen} />
                            <Stack.Screen name={ROUTES.MAIN.HELP_CENTER} component={HelpCenterScreen} />
                            <Stack.Screen name={ROUTES.MAIN.PRIVACY} component={PrivacyScreen} />
                            <Stack.Screen name={ROUTES.MAIN.USER_DETAIL} component={UserDetailScreen} />
                            <Stack.Screen name={ROUTES.MAIN.PROFILE} component={ProfileScreen} />
                            <Stack.Screen name={ROUTES.MAIN.QR_CODE} component={QRCodeScreen} />

                            {/* 404 Fallback */}
                            <Stack.Screen name="NotFound" component={NotFoundScreen} />
                        </Stack.Group>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
