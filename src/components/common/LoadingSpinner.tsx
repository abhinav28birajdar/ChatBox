import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    message?: string;
    overlay?: boolean;
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    message,
    overlay = false,
    fullScreen = false
}) => {
    const { colors, isDark } = useTheme();

    return (
        <View style={[
            styles.container,
            fullScreen && styles.fullScreen,
            overlay && [styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }]
        ]}>
            <ActivityIndicator size={size} color={colors.primary} />
            {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreen: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    message: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '500',
    },
});
