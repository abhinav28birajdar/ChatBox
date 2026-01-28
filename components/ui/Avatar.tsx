import React from 'react';
import { View, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { Spacing } from '@/constants/Spacing';

interface Props {
    source?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    status?: 'online' | 'offline' | 'busy' | 'away';
    style?: StyleProp<ViewStyle>;
}

const SIZES = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
};

export const Avatar = ({ source, name, size = 'md', status, style }: Props) => {
    const { colors } = useTheme();
    const dimension = SIZES[size];

    const getStatusColor = () => {
        switch (status) {
            case 'online': return '#4ADE80';
            case 'offline': return '#A198A7';
            case 'busy': return '#FF4B4B';
            case 'away': return '#FACC15';
            default: return 'transparent';
        }
    };

    return (
        <View style={[styles.container, { width: dimension, height: dimension }, style]}>
            {source ? (
                <Image
                    source={{ uri: source }}
                    style={[styles.image, { borderRadius: dimension / 2 }]}
                />
            ) : (
                <View style={[styles.placeholder, { borderRadius: dimension / 2, backgroundColor: colors.surface }]}>
                    <Text variant="caption" color={colors.textSecondary}>
                        {name ? name.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>
            )}
            {status && (
                <View
                    style={[
                        styles.status,
                        {
                            backgroundColor: getStatusColor(),
                            borderColor: colors.background,
                            width: dimension * 0.25,
                            height: dimension * 0.25,
                            borderRadius: (dimension * 0.25) / 2,
                        }
                    ]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    status: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderWidth: 2,
    },
});
