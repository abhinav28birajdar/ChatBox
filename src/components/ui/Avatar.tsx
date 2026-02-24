import React from 'react';
import { View, Image, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';
import { Spacing } from '@/constants/Spacing';
import { getInitials, getStatusColor as getStatusColorHex } from '@/utils/helpers';

interface Props {
    uri?: string;
    source?: any; // For local required images
    fallback?: string;
    name?: string; // Alias for fallback
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    status?: 'online' | 'offline' | 'busy' | 'away' | 'idle' | 'dnd';
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}

const SIZES = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
};

export const Avatar = ({
    uri,
    source,
    fallback,
    name,
    size = 'md',
    status,
    style,
    onPress
}: Props) => {
    const { colors } = useTheme();

    const dimension = typeof size === 'number' ? size : SIZES[size];
    const borderRadius = dimension / 2;

    const renderContent = () => {
        if (uri || source) {
            return (
                <Image
                    source={source || { uri }}
                    style={[styles.image, { borderRadius }]}
                />
            );
        }

        const displayFallback = fallback || name;
        return (
            <View style={[styles.placeholder, { borderRadius, backgroundColor: colors.surface }]}>
                <Text variant="caption" style={{ fontSize: dimension * 0.4 }} color={colors.textSecondary}>
                    {displayFallback ? getInitials(displayFallback) : '?'}
                </Text>
            </View>
        );
    };

    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[styles.container, { width: dimension, height: dimension }, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {renderContent()}

            {status && (
                <View
                    style={[
                        styles.status,
                        {
                            backgroundColor: getStatusColorHex(status),
                            borderColor: colors.background,
                            width: dimension * 0.28,
                            height: dimension * 0.28,
                            borderRadius: (dimension * 0.28) / 2,
                            borderWidth: dimension > 40 ? 2 : 1,
                        }
                    ]}
                />
            )}
        </Container>
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
    },
});
