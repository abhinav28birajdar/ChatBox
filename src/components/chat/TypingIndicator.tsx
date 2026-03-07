import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    Easing
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';

export const TypingIndicator: React.FC<{ users?: string[] }> = ({ users = [] }) => {
    const { colors } = useTheme();

    const label = users.length > 0
        ? (users.length === 1 ? `${users[0]} is typing...` : `${users.length} users are typing...`)
        : "Someone is typing...";

    return (
        <View style={styles.container}>
            <View style={styles.dotsRow}>
                <TypingDot index={0} color={colors.primary} />
                <TypingDot index={1} color={colors.primary} />
                <TypingDot index={2} color={colors.primary} />
            </View>
            <Text style={[styles.text, { color: colors.textSecondary }]}>{label}</Text>
        </View>
    );
};

const TypingDot = ({ index, color }: { index: number, color: string }) => {
    const scale = useSharedValue(0.4);

    useEffect(() => {
        scale.value = withDelay(
            index * 200,
            withRepeat(
                withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View
            style={[
                styles.dot,
                { backgroundColor: color },
                animatedStyle
            ]}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    dotsRow: {
        flexDirection: 'row',
        marginRight: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 2,
    },
    text: {
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.regular,
    },
});
