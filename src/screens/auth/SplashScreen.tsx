import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { ROUTES } from '../../constants/routes';

export const SplashScreen: React.FC<any> = ({ navigation }) => {
    const { user, firestoreUser, isLoading } = useAuthStore();
    const { colors } = useTheme();

    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                if (!user) {
                    navigation.replace(ROUTES.AUTH.LOGIN);
                } else if (!user.emailVerified) {
                    navigation.replace(ROUTES.AUTH.EMAIL_VERIFY);
                } else if (!firestoreUser?.onboardingComplete) {
                    navigation.replace(ROUTES.AUTH.ONBOARDING_STEPS);
                }
                // If user is fully authenticated, RootNavigator automatically
                // transitions to the main stack — no explicit navigation needed here.
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [user, firestoreUser, isLoading, navigation]);

    return (
        <View style={[styles.container, { backgroundColor: colors.primary }]}>
            <Image
                source={require('../../assets/images/logo.png')}
                style={styles.animation}
                contentFit="contain"
            />
            <Text style={styles.title}>ChatBox</Text>
            <Text style={styles.subtitle}>Connect and Community</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animation: {
        width: 200,
        height: 200,
    },
    title: {
        fontSize: Typography.fontSize.xxxl,
        fontFamily: Typography.fontFamily.bold,
        color: '#fff',
        marginTop: 20,
    },
    subtitle: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.medium,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 8,
    },
});
