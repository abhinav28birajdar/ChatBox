import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';

const FEATURES = [
    {
        icon: 'people',
        title: 'Join Communities',
        desc: 'Explore thousands of servers and find where you belong.'
    },
    {
        icon: 'flash',
        title: 'Real-time Chat',
        desc: 'Instant messaging with your friends and teammates.'
    },
    {
        icon: 'shield-checkmark',
        title: 'Safe & Secure',
        desc: 'End-to-end focus on your privacy and safety.'
    }
];

export default function FeaturesOnboarding() {
    const { colors } = useTheme();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);

    const handleNext = () => {
        if (activeStep < FEATURES.length - 1) {
            setActiveStep(activeStep + 1);
        } else {
            router.push('/onboarding/permissions');
        }
    };

    const feature = FEATURES[activeStep];

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={styles.stepIndicator}>
                    {FEATURES.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                { backgroundColor: i === activeStep ? colors.primary : colors.surface }
                            ]}
                        />
                    ))}
                </View>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                    <Text variant="button" color={colors.textSecondary}>Skip</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name={feature.icon as any} size={100} color={colors.primary} />
                </View>

                <Text variant="h1" align="center" style={styles.title}>{feature.title}</Text>
                <Text variant="body" align="center" color={colors.textSecondary}>{feature.desc}</Text>
            </View>

            <View style={styles.footer}>
                <Button
                    title={activeStep === FEATURES.length - 1 ? "Finish" : "Next"}
                    onPress={handleNext}
                    style={styles.button}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
    },
    stepIndicator: {
        flexDirection: 'row',
    },
    dot: {
        width: 24,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    title: {
        marginBottom: 16,
    },
    footer: {
        marginTop: 'auto',
    },
    button: {
        width: '100%',
    }
});
