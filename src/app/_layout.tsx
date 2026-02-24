import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/hooks/useTheme';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ChatProvider } from '@/context/ChatContext';
import { ServerProvider } from '@/context/ServerContext';
import { FriendProvider } from '@/context/FriendContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { NetworkStatus } from '@/components/shared/NetworkStatus';
import { Colors } from '@/constants/Colors';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
    /* reloading the app might cause this to error, so we catch it */
});

function RootLayoutNav() {
    const { isDark, colors, onboardingComplete, isLoadingApp } = useApp();
    const { user, isLoading: isLoadingAuth, userProfile } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    const [isNavigationReady, setIsNavigationReady] = useState(false);

    // Centralized Navigation Logic
    useEffect(() => {
        if (!isNavigationReady || isLoadingApp || isLoadingAuth) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';
        const inOnboardingGroup = segments[0] === 'onboarding';

        if (!onboardingComplete && !inOnboardingGroup) {
            router.replace('/onboarding/welcome');
        } else if (!user) {
            if (!inAuthGroup && onboardingComplete) {
                router.replace('/(auth)/login');
            }
        } else if (user) {
            // Role-based redirection — only redirect when on auth/onboarding/root screens.
            const isAtAuthOrRoot = inAuthGroup || inOnboardingGroup || segments.length === 0;
            if (isAtAuthOrRoot) {
                if (userProfile?.role === 'admin') {
                    router.replace('/admin/dashboard');
                } else if (userProfile?.role === 'seller') {
                    router.replace('/seller/dashboard');
                } else {
                    router.replace('/(tabs)/home');
                }
            }
        }
    }, [user, userProfile, isLoadingAuth, isLoadingApp, onboardingComplete, segments, isNavigationReady, router]);

    return (
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        animation: 'fade',
                        contentStyle: { backgroundColor: colors.background }
                    }}
                    onNavigationReady={() => setIsNavigationReady(true)}
                >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                    <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="chat" />
                    <Stack.Screen name="friends/index" />
                    <Stack.Screen name="settings" />
                    <Stack.Screen name="server" />
                    <Stack.Screen name="search" />
                    <Stack.Screen name="discovery" />
                    <Stack.Screen name="product" />
                    <Stack.Screen name="cart" />
                    <Stack.Screen name="orders" />
                    <Stack.Screen name="seller" />
                    <Stack.Screen name="admin" />
                    <Stack.Screen name="modal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                    <Stack.Screen name="(modals)/create" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                    <Stack.Screen name="legal" />
                    <Stack.Screen name="utility/loading" options={{ animation: 'fade' }} />
                    <Stack.Screen name="+not-found" />
                </Stack>

                {/* Global Loading Gate */}
                {(isLoadingApp || isLoadingAuth || !isNavigationReady) && (
                    <View style={[StyleSheet.absoluteFill, styles.loadingOverlay, { backgroundColor: colors.background }]}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                )}
            </View>
        </ThemeProvider>
    );
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        // Add fonts here if needed
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync().catch(() => { });
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <ErrorBoundary>
            <AppProvider>
                <AuthProvider>
                    <NetworkStatus>
                        <ServerProvider>
                            <ChatProvider>
                                <FriendProvider>
                                    <NotificationProvider>
                                        <View style={{ flex: 1 }}>
                                            <RootLayoutNav />
                                        </View>
                                        <Toast />
                                    </NotificationProvider>
                                </FriendProvider>
                            </ChatProvider>
                        </ServerProvider>
                    </NetworkStatus>
                </AuthProvider>
            </AppProvider>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    loadingOverlay: {
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
