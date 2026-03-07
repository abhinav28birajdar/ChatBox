import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { AuthProvider } from './src/hooks/useAuth';
import RootNavigator from './src/navigation/RootNavigator';
import { OfflineOverlay } from './src/components/common/OfflineOverlay';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from './src/hooks/useTheme';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { useFirestoreNotifications } from './src/hooks/useFirestoreNotifications';

function AppContent() {
    const { isDark } = useTheme();
    // Start real-time notification sync for the authenticated user
    useFirestoreNotifications();

    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <OfflineOverlay />
            <RootNavigator />
        </View>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaProvider>
                    <AuthProvider>
                        <AppContent />
                    </AuthProvider>
                </SafeAreaProvider>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
