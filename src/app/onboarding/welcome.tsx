import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeOnboarding() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <ScreenWrapper style={styles.container}>
            <LinearGradient
                colors={['#2D1F35', '#120C17']}
                style={styles.gradient}
            />

            <View style={styles.content}>
                <View style={styles.logoCircle}>
                    <Ionicons name="chatbubbles" size={80} color={colors.primary} />
                </View>

                <View style={styles.textContainer}>
                    <Text variant="h1" align="center" style={styles.title}>
                        Welcome to ChatBox
                    </Text>
                    <Text variant="body" align="center" color={colors.textSecondary}>
                        The premium place to connect with your favorite communities and friends.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Let's Go"
                        onPress={() => router.push('/onboarding/features')}
                        style={styles.button}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 224, 49, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    textContainer: {
        marginBottom: 60,
    },
    title: {
        marginBottom: 16,
    },
    footer: {
        width: '100%',
    },
    button: {
        width: '100%',
    }
});
